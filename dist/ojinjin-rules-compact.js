/* OjinjinRules (ojinjin-rules-compact) v2.1 — Pure ES5 JS Distilled Rule Engine
 * Zero dependencies, zero WASM, zero network, flat-string zero-slice V8 fast path.
 * Distilled from OjinjinNet v1.4 Super-Teacher on 150,023 Bilibili comments.
 * API:
 *   OjinjinRules.scoreText(message)         -> probability in [0, 1]
 *   OjinjinRules.scoreReply(replyObj)       -> probability in [0, 1] (uses message + uname + level)
 *   OjinjinRules.isAiText(message, level)   -> boolean ('strict' | 'balanced' | 'aggressive')
 *   OjinjinRules.isAiReply(replyObj, level) -> boolean ('strict' | 'balanced' | 'aggressive')
 */
var OjinjinRules = (function () {
  'use strict';

  var NG_SCALE = 0.01941913;
  var LIN_BIAS = -3.997022;
  var STYLE_W = [1.063432, 0.025524, -0.040875, -0.354677, -0.037347, -0.062313, 0.032702, -0.949921, 0.598787, 0.662398, 0.180062, 0.053136, -0.540912, 0.801009, -0.201647, -0.182066, 0.512481, 0.085643, 0.119591, 0.018223, 0.255312, 0.101804, -0.050309, -0.561179, -1.731142, -1.206405, -1.36109, 1.141127, -0.687835, 0.655653, 1.82085, 0.476929, -0.434068, 0.168662, 0.380983, 0.554147, 0.377313, -0.838136];
  var META_LIN_W = null;
  var META_LIN_B = 0;
  var TEXT_TREES_RAW = [[[0,-0.58605,1,4,0,-1.63743,2,3,0,-2.30896,-1,-2,0,-1.17288,-3,-4,0,0.52173,5,-7,0,-0.45429,-5,-6],[-2.14731,-2.09716,-2.02619,-1.9206,-1.85616,-1.6924,-1.45303]],[[1,4.5117,1,3,1,3.38717,-1,2,2,-1.09749,-2,-3,2,-2.05299,4,5,1,5.97248,-4,-5,1,5.43652,-6,-7],[-0.0597,-0.0337,0.17618,-0.02015,0.22558,0.25298,0.36931]],[[0,-1.00094,1,4,0,-2.00288,2,3,0,-2.60749,-1,-2,0,-1.58213,-3,-4,0,0.0,5,-7,30,0.69256,-5,-6],[-0.06889,-0.04022,0.00513,0.05912,0.07769,0.17647,0.27257]],[[0,-1.17288,1,4,0,-2.11346,2,3,0,-2.86818,-1,-2,0,-1.63743,-3,-4,0,-0.31207,-5,5,0,1.35788,-6,-7],[-0.06782,-0.04776,-0.00615,0.04001,0.11054,0.18859,0.23142]],[[0,-1.32579,1,3,0,-2.21494,-1,2,0,-1.87576,-2,-3,0,0.0,4,5,0,-0.81703,-4,-5,0,1.35788,-6,-7],[-0.06403,-0.01973,0.01762,0.06349,0.12659,0.1629,0.19703]],[[0,-1.32579,1,4,0,-2.24781,2,3,0,-2.86818,-1,-2,0,-1.83067,-3,-4,0,-0.70999,-5,5,0,0.72551,-6,-7],[-0.06452,-0.04589,-0.01753,0.01804,0.05534,0.12481,0.16839]],[[0,-1.32579,1,3,0,-2.24781,-1,2,0,-1.9197,-2,-3,0,-0.31207,4,5,0,-0.70999,-4,-5,0,1.35788,-6,-7],[-0.06068,-0.02006,0.01409,0.04899,0.0901,0.12122,0.1547]],[[0,-1.32579,1,3,0,-2.27843,-1,2,0,-1.83067,-2,-3,0,0.0,4,5,27,0.96172,-4,-5,0,1.84293,-6,-7],[-0.05896,-0.01659,0.01668,0.06971,-0.01965,0.11644,0.14326]],[[0,-1.46106,1,3,0,-2.45369,-1,2,0,-2.00288,-2,-3,0,0.15531,4,5,0,-0.70999,-4,-5,0,1.13405,-6,-7],[-0.05804,-0.02374,0.00682,0.03695,0.0787,0.10001,0.12844]],[[0,-1.32579,1,3,0,-2.45369,-1,2,0,-1.73806,-2,-3,0,0.33442,4,5,0,-0.81703,-4,-5,0,2.11239,-6,-7],[-0.05624,-0.01849,0.01475,0.03352,0.07213,0.10077,0.12469]],[[0,-1.46106,1,3,0,-2.53207,-1,2,3,0.65365,-2,-3,0,0.0,4,5,27,0.9631,-4,-5,0,1.35788,-6,-7],[-0.05491,-0.0012,-0.02939,0.04621,-0.0342,0.08488,0.11296]],[[1,4.22502,1,4,1,2.50458,2,3,12,0.0,-1,-2,2,-1.20201,-3,-4,1,5.97248,5,-7,2,-1.80584,-5,-6],[-0.05011,-0.02353,-0.03998,0.02635,-0.01662,0.06826,0.10424]],[[0,-1.58213,1,3,0,-2.60749,-1,2,1,3.10019,-2,-3,0,0.33442,4,5,0,-0.91101,-4,-5,0,1.13405,-6,-7],[-0.05185,-0.00401,-0.0295,0.01705,0.05194,0.07339,0.10046]],[[0,-1.63743,1,3,0,-2.60749,-1,2,32,0.0,-2,-3,0,0.33442,4,5,30,0.71472,-4,-5,0,2.11239,-6,-7],[-0.05009,-0.01554,0.03325,0.00011,0.04191,0.07659,0.10001]],[[1,4.05302,1,4,1,2.53748,2,3,12,0.0,-1,-2,2,-1.31062,-3,-4,1,6.20631,5,-7,2,-1.64089,-5,-6],[-0.04436,-0.01873,-0.0388,0.01852,-0.00742,0.05352,0.09148]],[[0,-1.7875,1,3,0,-2.86818,-1,2,0,-2.11346,-2,-3,0,0.33442,4,5,0,-0.70999,-4,-5,0,2.11239,-6,-7],[-0.04782,-0.02434,-0.00242,0.01431,0.04428,0.06659,0.0911]],[[0,-1.00094,1,4,0,-2.45369,2,3,0,-3.05014,-1,-2,3,0.65692,-3,-4,0,1.13405,5,-7,7,0.49929,-5,-6],[-0.04677,-0.02981,0.01053,-0.02623,0.04792,-0.00715,0.08159]],[[0,-1.9197,1,3,0,-2.86818,-1,2,8,1.17656,-2,-3,0,0.33442,4,5,30,0.75685,-4,-5,0,2.11239,-6,-7],[-0.04427,-0.01526,-0.04014,0.00016,0.03023,0.05887,0.08381]],[[0,-1.32579,1,4,0,-2.45369,2,3,0,-3.14848,-1,-2,1,3.07627,-3,-4,0,1.13405,5,-7,30,0.99091,-5,-6],[-0.04338,-0.0281,0.00708,-0.01971,0.03624,-0.01229,0.07468]],[[0,-1.83067,1,3,0,-2.86818,-1,2,1,2.65223,-2,-3,0,0.91762,4,5,0,-0.58605,-4,-5,0,2.39716,-6,-7],[-0.04091,-0.00752,-0.02562,0.01007,0.03811,0.05855,0.07937]],[[0,-1.00094,1,4,0,-2.67819,2,3,10,0.62294,-1,-2,3,0.66013,-3,-4,0,1.35788,5,-7,30,0.99091,-5,-6],[-0.03869,0.00732,0.00559,-0.02495,0.03672,-0.01607,0.06976]],[[0,-1.87576,1,3,0,-3.05014,-1,2,32,0.0,-2,-3,0,0.33442,4,5,3,0.49501,-4,-5,0,2.39716,-6,-7],[-0.03785,-0.01823,0.01958,-0.01618,0.01998,0.04702,0.07367]],[[0,-1.73806,1,3,0,-2.92631,-1,2,10,0.78341,-2,-3,0,0.72551,4,5,3,0.49501,-4,-5,3,0.62491,-6,-7],[-0.0358,-0.01395,0.06192,-0.01462,0.02228,0.04174,0.0665]],[[1,4.90363,1,4,1,2.15155,2,3,3,0.83895,-1,-2,2,-1.19345,-3,-4,1,6.43854,5,-7,7,0.49929,-5,-6],[-0.02943,0.03525,-0.0228,0.01143,0.03902,-0.00912,0.0639]],[[1,4.90363,1,4,1,2.23275,2,3,4,0.0,-1,-2,2,-1.22807,-3,-4,1,6.43854,5,-7,7,0.56687,-5,-6],[-0.02244,-0.03484,-0.02253,0.01061,0.03587,-0.01611,0.0615]],[[0,-2.00288,1,3,0,-3.24173,-1,2,1,2.61945,-2,-3,0,1.35788,4,5,0,-0.45429,-4,-5,30,0.95488,-6,-7],[-0.03257,-0.00929,-0.02691,0.0062,0.02816,0.05931,0.01597]],[[0,-0.70999,1,4,0,-2.30896,2,3,0,-3.44828,-1,-2,3,0.65692,-3,-4,0,1.60579,5,-7,7,0.49929,-5,-6],[-0.03159,-0.01974,0.00955,-0.01662,0.03058,-0.0171,0.0562]],[[16,0.12346,1,3,3,0.46715,-1,2,2,-0.67973,-2,-3,21,0.0,4,5,17,0.19339,-4,-5,10,0.0,-6,-7],[-0.02798,-0.01497,0.0124,-0.02835,0.01695,0.05834,0.01287]],[[0,-2.00288,1,3,0,-3.05014,-1,2,1,2.74403,-2,-3,0,0.72551,4,5,27,0.95472,-4,-5,0,3.03209,-6,-7],[-0.02811,-0.00443,-0.0234,0.01525,-0.03144,0.03771,0.06253]],[[0,-0.70999,1,3,0,-2.30896,-1,2,1,3.44884,-2,-3,3,0.57498,4,5,37,0.0,-4,-5,7,0.56687,-6,-7],[-0.02418,0.0112,-0.01374,-0.00302,0.03218,0.04292,-0.00711]],[[1,4.90363,1,3,31,0.0,2,-3,1,1.9131,-1,-2,1,6.6655,4,5,7,0.56687,-4,-5,3,0.8687,-6,-7],[-0.01844,0.00422,-0.0275,0.02544,-0.0187,0.05338,0.00289]],[[0,-0.91101,1,3,0,-2.67819,-1,2,3,0.66013,-2,-3,0,1.35788,4,5,7,0.49929,-4,-5,30,0.92032,-6,-7],[-0.02321,0.00659,-0.02123,0.02135,-0.0226,0.04931,0.01364]],[[0,-0.45429,1,3,0,-2.55703,-1,2,10,0.74997,-2,-3,30,0.89499,4,5,7,0.56687,-4,-5,30,0.9759,-6,-7],[-0.02121,-0.00141,0.06331,0.04105,-0.00875,0.01268,-0.02246]],[[0,-2.21494,1,3,2,-0.62043,2,-3,19,0.0,-1,-2,0,1.35788,4,5,27,0.9602,-4,-5,1,7.55403,-6,-7],[-0.02271,0.00478,-0.00873,0.01097,-0.04157,0.03098,0.05489]],[[0,-0.91101,1,4,0,-3.05014,2,3,2,-1.58487,-1,-2,3,0.65692,-3,-4,0,2.39716,5,-7,3,0.57498,-5,-6],[-0.02743,-0.01651,0.00328,-0.01825,-0.00195,0.02272,0.04852]],[[0,-1.32579,1,4,10,0.56687,2,3,2,-1.02521,-1,-2,18,0.06462,-3,-4,0,2.11239,5,-7,27,0.95816,-5,-6],[-0.02082,-0.00706,0.01235,0.11711,0.01402,-0.04011,0.04362]],[[0,-0.45429,1,3,0,-2.86818,-1,2,3,0.66013,-2,-3,3,0.5696,4,5,37,0.0,-4,-5,7,0.56687,-6,-7],[-0.01739,0.00579,-0.01594,-0.01511,0.02836,0.03224,-0.01853]],[[1,5.97248,1,4,31,0.0,2,3,1,1.76553,-1,-2,18,0.01837,-3,-4,1,7.91481,5,-7,2,-1.66419,-5,-6],[-0.01209,0.0048,-0.02033,0.01441,-0.01055,0.02861,0.05038]],[[0,-0.81703,1,3,0,-3.03359,-1,2,10,0.56687,-2,-3,30,0.92366,4,5,10,0.0,-4,-5,3,0.57498,-6,-7],[-0.0163,-0.00343,0.04977,0.02789,-0.014,-0.01197,0.01469]],[[0,-0.31207,1,3,0,-2.11346,-1,2,33,0.0,-2,-3,3,0.59954,4,5,37,0.0,-4,-5,7,0.56687,-6,-7],[-0.01334,-0.00083,0.04911,-0.00781,0.02702,0.0314,-0.01193]],[[0,-0.17011,1,4,10,0.71278,2,3,30,0.76836,-1,-2,16,0.06904,-3,-4,30,0.89499,5,-7,7,0.56687,-5,-6],[-0.02197,-0.00264,-0.00455,0.07998,0.03029,-0.01368,-0.00052]],[[1,6.43854,1,4,27,0.9602,2,3,30,0.75685,-1,-2,1,2.56913,-3,-4,1,7.91481,5,-7,2,-2.30936,-5,-6],[-0.01274,0.00427,-0.01334,-0.03767,-0.02391,0.02297,0.04571]]];
  var META_TREES_RAW = [[[0,-0.90676,1,3,11,0.0,-1,2,1,-3.15002,-2,-3,16,0.5,-4,4,0,1.02457,-5,-6],[-2.20861,-2.07455,-1.65774,-1.46128,-2.05927,-1.61797]],[[0,-1.26976,1,3,9,0.52727,-1,2,16,0.5,-2,-3,9,0.0,4,-6,0,0.73124,-4,-5],[-0.0672,0.42977,0.06341,0.08474,0.3385,0.40948]],[[0,-1.73535,1,3,9,0.52727,2,-3,11,0.0,-1,-2,16,0.0,-4,4,0,0.4923,-5,-6],[-0.06838,0.03408,0.26602,0.28887,0.0137,0.23658]],[[0,-1.80022,1,3,9,0.52727,2,-3,16,-0.0,-1,-2,16,0.0,-4,4,9,0.0,-5,-6],[0.02438,-0.06676,0.21119,0.23327,0.04176,0.26194]],[[0,-1.93867,1,3,9,0.2,-1,2,16,0.0,-2,-3,16,0.5,-4,4,1,0.0,-5,-6],[-0.06414,0.21162,0.0034,0.1926,-0.01367,0.16509]],[[0,-2.01226,1,3,16,-0.0,2,-3,1,-3.58321,-1,-2,16,0.0,-4,4,0,0.4923,-5,-6],[0.00318,0.13889,-0.0627,0.17333,-0.00284,0.15179]],[[0,-2.01226,1,3,9,0.2,-1,2,16,0.5,-2,-3,9,0.0,4,-6,0,0.4923,-4,-5],[-0.06114,0.16474,-0.01285,0.0035,0.1344,0.16727]],[[0,-2.01226,1,3,9,0.45455,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,1.30769,-4,-5],[-0.06041,0.00935,0.12219,0.01812,0.13923,0.15171]],[[0,-2.27757,1,3,9,0.69091,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,0.27489,-4,-5],[-0.05875,0.01194,0.12479,-0.00488,0.1085,0.13991]],[[0,-2.52284,1,2,9,0.76364,-1,-2,16,0.5,3,4,11,0.0,-3,-4,9,0.0,-5,-6],[-0.05584,0.10938,0.08668,0.12705,-0.01238,0.1363]],[[0,-2.27757,1,3,9,0.2,-1,2,16,0.5,-2,-3,16,0.0,-4,4,1,1.19373,-5,-6],[-0.05443,0.11388,-0.02855,0.11484,-0.00542,0.11765]],[[0,-2.52284,1,3,9,0.69091,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,-0.36613,-4,-5],[-0.05384,0.00275,0.08723,-0.01926,0.07996,0.11685]],[[0,-2.36817,1,3,9,0.69091,2,-3,16,-0.0,-1,-2,9,0.0,4,-6,16,-0.0,-4,-5],[0.00768,-0.05194,0.08911,0.09893,0.00096,0.11024]],[[0,-2.52284,1,3,9,0.0,-1,2,16,0.0,-2,-3,9,0.0,4,-6,0,1.02457,-4,-5],[-0.05015,0.10172,-0.03519,-0.00501,0.09148,0.10513]],[[0,-1.58964,1,3,11,0.0,-1,2,1,-3.41164,-2,-3,11,0.0,4,-6,0,1.82128,-4,-5],[-0.04672,0.00048,0.07982,0.01523,0.10228,0.09751]],[[0,-2.64923,1,3,9,0.76364,2,-3,11,0.0,-1,-2,16,0.0,-4,4,9,0.2,-5,-6],[-0.04695,-0.00143,0.07009,0.09014,-0.00861,0.10626]],[[1,-0.98336,1,3,9,0.0,-1,2,16,0.5,-2,-3,0,1.58318,4,-6,9,0.0,-4,-5],[-0.04346,0.08673,-0.01205,0.02141,0.08592,0.09637]],[[1,-0.98336,1,3,9,0.0,-1,2,16,0.5,-2,-3,0,1.58318,4,-6,9,0.0,-4,-5],[-0.04166,0.08182,-0.00833,0.01933,0.08274,0.09303]],[[11,0.0,1,4,1,-0.46626,2,3,0,-3.02968,-1,-2,0,1.82128,-3,-4,0,-3.2894,-5,-6],[-0.04196,-0.01928,0.02601,0.08426,0.01521,0.08205]],[[9,0.0,1,4,0,-0.52222,2,3,11,0.0,-1,-2,0,1.82128,-3,-4,1,-3.41164,-5,-6],[-0.03976,0.00881,0.02134,0.08107,-0.00479,0.08212]],[[9,0.0,1,4,0,-0.52222,2,3,11,0.0,-1,-2,0,1.82128,-3,-4,0,-3.29801,-5,-6],[-0.03818,0.0098,0.02067,0.07817,0.01383,0.08085]],[[9,0.0,1,4,0,-0.52222,2,3,11,0.0,-1,-2,11,0.0,-3,-4,1,-3.45977,-5,-6],[-0.03647,0.00356,0.01476,0.0721,-0.00594,0.07553]],[[11,0.0,1,4,1,-0.83842,2,3,9,0.80909,-1,-2,9,0.2,-3,-4,0,-3.2894,-5,-6],[-0.03443,0.05468,0.01402,0.0778,0.00614,0.07041]],[[9,0.0,1,3,0,-0.36613,-1,2,0,1.82128,-2,-3,1,-3.2957,4,-6,16,-0.0,-4,-5],[-0.03051,0.01412,0.07071,0.05983,-0.04282,0.07061]],[[11,0.0,1,3,1,1.19373,2,-3,9,0.45455,-1,-2,0,-3.2894,4,-6,9,0.0,-4,-5],[-0.0302,0.0424,0.05866,-0.0445,0.05777,0.06618]]];
  var THRESHOLDS = {"text":{"strict":0.766,"balanced":0.4804,"aggressive":0.4804},"reply":{"strict":0.65,"balanced":0.5515,"aggressive":0.4525}};
  var NG_RAW = "本鱼\t127\n本喵\t100\n本鲸\t95\n「\t79\n——\t73\n主人\t69\n哼\t65\n尾巴\t62\n鲸\t61\n喵\t61\n。。\t-61\n但是\t-58\n\u0002其实\t-54\n;\t53\n然后\t-52\n),\t-51\n比较\t-51\n比如\t-50\n—\t49\n、\t49\n的不是\t47\n而是\t47\n反而\t46\n鲸鱼\t-46\n\u0003\t45\n喊\t43\n让人\t42\n基本\t-42\n里面\t-42\n账\t41\n\t-41\n才能\t-41\n鱼\t40\n拆\t40\n这里\t-40\n啦\t39\n先\t38\n记得\t-38\n句话\t-38\n感觉\t-37\n根本\t-37\n替\t36\n狠\t36\n应该\t-36\n完全\t-36\n真是\t-36\n,是\t35\n句\t35\n其实\t35\n稳\t34\n梗\t34\n~\t33\n....\t33\n饭\t33\n白饭\t33\n挑\t33\n可以\t-32\n条\t31\n省\t31\n不错\t-31\n挺\t30\n它\t30\n我这\t30\n,就是\t30\n可能\t-30\n且\t-30\n \t-29\n搞\t-29\n不得\t-29\n\u0002「\t28\n秒\t28\n讲\t28\n聊\t28\n顺\t28\n落\t28\n那么\t-28\n或者\t-28\n本\t27\n把\t27\n收\t27\n热\t27\n答\t27\n份\t27\n透\t27\n\t-27\n真的\t-27\n现在\t-27\n女\t-27\n好像\t-27\n着\t26\n画面\t26\n\u0002我\t-26\n无\t-26\n如\t-26\n:\t25\n,本\t25\n那\t24\n得\t24\n交\t24\n夸\t24\n些\t-24\n这样\t-24\n觉得\t-24\n战\t-24\n比\t23\n场\t23\n留\t23\n半\t23\n不过\t23\n靠\t23\n倒\t23\n跳\t23\n验\t23\n问题\t-23\n真\t22\n认\t22\n确实\t22\n准\t22\n尾\t22\n)\t22\n,比\t22\n都是\t-22\n,就\t-22\n这\t21\n底\t21\n翻\t21\n零\t21\n肥鱼\t-21\n啥\t-21\n其\t-21\n部分\t-21\n算\t20\n的是\t20\n才\t20\n数\t20\n整\t20\n补\t20\n就是\t-20\n肯定\t-20\n只能\t-20\n」\t19\n片\t19\n刷\t19\n\u0002那\t-19\n而\t-19\n\u0002真\t-19\n分\t18\n被\t18\n反\t18\n写\t18\n进\t18\n头\t18\n排\t18\n满\t18\n人类\t18\n由\t18\n越\t18\n们\t-18\n的话\t-18\n只有\t-18\n点\t17\n住\t17\n记\t17\n从\t17\n十\t17\n四\t17\n口\t17\n步\t17\n硬\t17\n。你\t17\n\u0002你\t-17\n是不是\t-17\n段\t16\n字\t16\n气\t16\n呀\t16\n也是\t-16\n为\t-16\n一点\t-16\n所\t-16\n之前\t-16\n里\t15\n评\t15\n完\t15\n服\t15\n\u0002\t-15\n都不\t-15\n目\t-15\n,\t14\n只\t14\n成\t14\n全\t14\n配\t14\n换\t14\n等\t14\n声\t14\n推\t14\n中\t-14\n要\t-14\n部\t-14\n啊,\t-14\n也不\t-14\n最\t13\n像\t13\n清\t13\n听\t13\n连\t13\n同\t13\n干\t13\n走\t13\n台\t13\n啊\t-13\n手机\t-13\n相\t-13\n1\t-13\n,你\t-13\n在\t12\n不是\t12\n手\t12\n,这\t12\n单\t12\n懂\t12\n值\t12\n够\t12\n名\t12\n不用\t12\n没有\t-12\n吗\t-12\n之\t-12\n于\t-12\nn\t12\n回\t11\n笑\t11\n白\t11\n3\t-11\n吧\t-11\n?\t-11\n的,\t-11\n高\t-11\n可\t10\n!\t10\n感\t10\n问\t10\nai\t10\n了,\t-10\n\u0002这\t-10\n,但是\t-10\n还\t9\n但\t9\n别\t9\n活\t9\n哪\t9\n存\t9\n这句\t9\n画\t9\n站\t9\n还是\t-9\n这个\t-9\n\u0002\u0003\t-9\n。\t8\n看\t8\n出\t8\n.\t8\n下\t8\n位\t8\n么\t-8\n吗?\t-8\n知\t-8\n一\t7\n也\t7\n开\t7\n自\t7\n有\t-7\n一下\t-7\n我\t6\n到\t6\n人\t6\n实\t6\n号\t6\n大\t-6\n了\u0003\t-6\n个\t-6\n是\t5\n就\t5\n游\t5\n界\t5\n力\t-5\n第一\t-5\n了\t4\n太\t4\n当\t4\n本来\t-4\n。\u0003\t-3\n行\t3\n接\t3\n东西\t2\n都\t2\n没\t1\n不\t1\n以\t1";

  /* 1. Fast BMP NFKC + lowercase + trad-fish map (0xFFFF => fallback to ICU normalize) */
  var NORM_MAP = new Uint16Array(65536);
  (function () {
    var i, m, p = [0x3001,0x3002,0x300A,0x300B,0x300C,0x300D,0x300E,0x300F,0x3010,0x3011,0x2014,0x2015,0x2018,0x2019,0x201C,0x201D];
    for (i = 0; i < 65536; i++) NORM_MAP[i] = 0xFFFF;
    for (i = 0; i < 128; i++) NORM_MAP[i] = (i >= 65 && i <= 90) ? (i + 32) : i;
    for (i = 0x4E00; i <= 0x9FFF; i++) NORM_MAP[i] = i;
    NORM_MAP[0x9B5A] = 0x9C7C; NORM_MAP[0x9BE8] = 0x9CB8;
    for (i = 0xFF01; i <= 0xFF5E; i++) { m = i - 0xFEE0; if (m >= 65 && m <= 90) m += 32; NORM_MAP[i] = m; }
    for (i = 0; i < p.length; i++) NORM_MAP[p[i]] = p[i];
    NORM_MAP[0x3000] = 32; NORM_MAP[0x00A0] = 32;
  })();

  /* 2. Packed zero-slice integer n-gram tables (built once at load time) */
  var NG_COUNT = 0, NG_W = null, NG_LUT = new Uint16Array(65536);
  var H2_MASK = 0, H2_KEY = null, H2_ID = null;
  var H3_MASK = 0, H3_C0 = null, H3_C1 = null, H3_C2 = null, H3_ID = null;
  var G4_LEN = 0, G4_C0 = null, G4_C1 = null, G4_C2 = null, G4_C3 = null, G4_ID = null;
  var BND_S2 = 0, BND_S3 = 0, BND_S4 = 0, BND_E3 = 0, BND_E4 = 0;
  var SEEN_STAMP = null, CUR_STAMP = 0, CHAR_STAMP = new Uint16Array(65536), CUR_CHAR_STAMP = 0;

  (function () {
    var rows = NG_RAW.split('\n'), i, p, sep, g, len, c0, c1, c2, c3, key, slot, n2 = 0, n3 = 0, g4 = [];
    NG_COUNT = rows.length; NG_W = new Int8Array(NG_COUNT); SEEN_STAMP = new Uint16Array(NG_COUNT);
    for (i = 0; i < NG_COUNT; i++) { sep = rows[i].lastIndexOf('\t'); if (sep === 2) n2++; else if (sep === 3) n3++; }
    var h2Sz = 64; while (h2Sz < n2 * 4) h2Sz <<= 1;
    var h3Sz = 32; while (h3Sz < n3 * 4) h3Sz <<= 1;
    H2_MASK = h2Sz - 1; H2_KEY = new Int32Array(h2Sz); H2_ID = new Int16Array(h2Sz);
    for (i = 0; i < h2Sz; i++) H2_KEY[i] = -1;
    H3_MASK = h3Sz - 1; H3_C0 = new Uint16Array(h3Sz); H3_C1 = new Uint16Array(h3Sz); H3_C2 = new Uint16Array(h3Sz); H3_ID = new Int16Array(h3Sz);
    for (i = 0; i < h3Sz; i++) H3_ID[i] = -1;
    for (i = 0; i < NG_COUNT; i++) {
      p = rows[i]; sep = p.lastIndexOf('\t'); if (sep <= 0) continue;
      g = p.slice(0, sep); NG_W[i] = parseInt(p.slice(sep + 1), 10); len = g.length; c0 = g.charCodeAt(0);
      if (len === 1) {
        NG_LUT[c0] |= (i + 1);
      } else if (len === 2) {
        c1 = g.charCodeAt(1);
        if (c0 === 2) BND_S2 = 1; else if (c1 === 3) NG_LUT[c0] |= 16384; else NG_LUT[c0] |= 2048;
        key = (c0 << 16) | c1; slot = ((c0 * 40503) ^ c1) & H2_MASK;
        while (H2_KEY[slot] !== -1) slot = (slot + 1) & H2_MASK;
        H2_KEY[slot] = key; H2_ID[slot] = i;
      } else if (len === 3) {
        c1 = g.charCodeAt(1); c2 = g.charCodeAt(2);
        if (c0 === 2) BND_S3 = 1; else if (c2 === 3) { NG_LUT[c1] |= 16384; BND_E3 = 1; } else NG_LUT[c0] |= 4096;
        slot = ((c0 * 40503) ^ (c1 * 26544) ^ c2) & H3_MASK;
        while (H3_ID[slot] !== -1) slot = (slot + 1) & H3_MASK;
        H3_C0[slot] = c0; H3_C1[slot] = c1; H3_C2[slot] = c2; H3_ID[slot] = i;
      } else if (len === 4) {
        c1 = g.charCodeAt(1); c2 = g.charCodeAt(2); c3 = g.charCodeAt(3);
        if (c0 === 2) BND_S4 = 1; else if (c3 === 3) { NG_LUT[c2] |= 16384; BND_E4 = 1; } else NG_LUT[c0] |= 8192;
        g4.push([c0, c1, c2, c3, i]);
      }
    }
    G4_LEN = g4.length; G4_C0 = new Uint16Array(G4_LEN); G4_C1 = new Uint16Array(G4_LEN);
    G4_C2 = new Uint16Array(G4_LEN); G4_C3 = new Uint16Array(G4_LEN); G4_ID = new Int16Array(G4_LEN);
    for (i = 0; i < G4_LEN; i++) { G4_C0[i]=g4[i][0]; G4_C1[i]=g4[i][1]; G4_C2[i]=g4[i][2]; G4_C3[i]=g4[i][3]; G4_ID[i]=g4[i][4]; }
  })();

  function compileTreesFlat(trees) {
    var nTrees = trees.length, totN = 0, totL = 0, t, i, nodes, vals, nn, l, r;
    for (t = 0; t < nTrees; t++) { totN += trees[t][0].length >> 2; totL += trees[t][1].length; }
    var tStart = new Int16Array(nTrees), feat = new Int16Array(totN), thr = new Float64Array(totN);
    var left = new Int16Array(totN), right = new Int16Array(totN), leaves = new Float64Array(totL), nOff = 0, lOff = 0;
    for (t = 0; t < nTrees; t++) {
      tStart[t] = nOff; nodes = trees[t][0]; vals = trees[t][1]; nn = nodes.length >> 2;
      for (i = 0; i < nn; i++) {
        feat[nOff + i] = nodes[i * 4]; thr[nOff + i] = nodes[i * 4 + 1];
        l = nodes[i * 4 + 2]; r = nodes[i * 4 + 3];
        left[nOff + i] = l >= 0 ? (nOff + l) : -(lOff + (-l - 1) + 1);
        right[nOff + i] = r >= 0 ? (nOff + r) : -(lOff + (-r - 1) + 1);
      }
      for (i = 0; i < vals.length; i++) leaves[lOff + i] = vals[i];
      nOff += nn; lOff += vals.length;
    }
    return { n: nTrees, tStart: tStart, feat: feat, thr: thr, left: left, right: right, leaves: leaves };
  }
  var CT_TEXT = compileTreesFlat(TEXT_TREES_RAW), CT_META = compileTreesFlat(META_TREES_RAW);
  var TF_BUF = new Float64Array(41), MF_BUF = new Float64Array(18), LAST_ZLIN = 0, LAST_ZTEXT = 0;

  function evalTreesFlat(ct, feats) {
    var n = ct.n, tStart = ct.tStart, feat = ct.feat, thr = ct.thr, left = ct.left, right = ct.right, leaves = ct.leaves, s = 0, t, idx;
    for (t = 0; t < n; t++) {
      idx = tStart[t];
      while (idx >= 0) idx = feats[feat[idx]] <= thr[idx] ? left[idx] : right[idx];
      s += leaves[-idx - 1];
    }
    return s;
  }

  var RE_CF = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/g;
  var RE_ASTRAL_G = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  var RE_TRAD_FISH = /[魚鯨]/g;
  var RE_LEADING_REPLY = /^[ \t\r\n]*回复[ \t\r\n]*@[\s\S]{0,40}?[ \t\r\n]*[:：][ \t\r\n]*/;
  var RE_EMOTE_G = /\[[^\[\] \t\r\n]{1,12}\]/g;
  var RE_EMOTE = /\[[^\[\] \t\r\n]{1,12}\]/;
  var RE_URL_G = /https?:\/\/[^ \t\r\n]+/g;
  var RE_AT_BODY_G = /(?:^|[^a-z0-9_.+-])@([^ \t\r\n@:：，,。！!?？]{1,24})/g;
  var RE_AT_BODY = /(?:^|[^a-z0-9_.+-])@([^ \t\r\n@:：，,。！!?？]{1,24})/;
  var RE_MENTION_G = /@([^ \t\r\n@:：，,。！!?？]{1,24})/g;
  var RE_WS_G = /[ \t\r\n\f\v\u00A0\u3000]+/g;
  var RE_NEED_WS = /[\t\r\n\f\v\u00A0\u3000]|  /;
  var RE_LIST_MARKER = /(?:^|\n)[ \t]*(?:[0-9一二三四五][.、)）]|[-•·][ \t])|\*\*[^*\n]{1,30}\*\*/;
  var RE_TIMESTAMP_G = /(?:^|[^0-9:])[0-9]{1,2}:[0-9]{2}(?![:0-9])/g;
  var RE_REPEAT_BURST = /哈哈{2,}|666+|www+|草+$|[?？]{2,}|[!！]{2,}|[.。]{4,}/;
  var RE_HUMAN_SLANG = /哈哈哈|绷不住|我嘞个|卧槽|我靠|牛逼|牛批|笑死|离谱|逆天|抽象|乐死|典$|急了|啥玩意|啥情况|有没有人|求助|请问|怎么回事|怎么办|啥区别|什么区别/;
  var RE_AI_BRAND = /大肥鱼|小肥鱼|肥鱼|鲸鱼|大肥鲸|鲸鱼娘|本鲸|本鱼|本肥鱼|本喵|小喵|巡逻|鱼罐头|主人|本[ \t]*ai|作为(?:一[个只条]|一名)?(?:ai|人工智能|大模型|语言模型)|deep[ \t]*seek|深度求索|gemini|吃白饭|打工鲸|吐泡泡|摇头晃脑/;
  var RE_ACTION_PAREN = /[（(][^（()）]{1,16}(?:尾巴|摇头|晃脑|泡泡|鳍|甩|晃|摇|咕噜|肚子|打滚|呆毛|歪头|眨眼|拍手)[^（()）]{0,10}[）)]|\*[^*\n]{1,12}[摇晃拍甩][^*\n]{0,8}\*/;
  var RE_AI_TEMPLATE = /不仅.{1,20}(?:而且|还|也)|既.{1,15}又|与其说.{1,20}不如说|某种意义上|不可否认|总而言之|总的来说|综上所述|值得(?:一看|细看|收藏|深思|思考)|核心在于|换句话说|从这个角度|不得不说|让人(?:不禁|忍不住|眼前一亮)|挺适合|正好对|希望对你有|最(?:打动|戳人|实在|值钱|有料)/;
  var RE_CJK = /[\u4e00-\u9fff]/;
  var RE_FILLER_G = /的|の|家|大|小|肥|鱼|鲸|娘|蓝色|蓝|白饭|吃|爱|不|是|之|[ \t\r\n_\-—·・.0-9]/g;
  var RE_NAME_ANY = /鱼|鲸|ds|deep|深度|gemini|人机|小蓝|白饭|干饭|token|哈基米|喵|运营|ai|bot|机器|gpt|agent|智能|赛博|自动|助手/;
  var RE_SAFE_FISH_NAME = /咸鱼|摸鱼|摸个鱼|鱼丸|烤鱼|钓鱼|水煮鱼|木鱼|闲鱼|小鱼干|金鱼|锦鲤/;
  var NAME_RULES = [
    [/deep[ \t]*seek|深度求索|(?:^|[^a-z0-9_])ds(?![a-z0-9_])|ds家|ds是/, 40],
    [/大肥鱼|小肥鱼|肥鱼|肥鲸|鲸鱼娘|鲸娘|人机/, 45], [/鲸/, 30], [/鱼鱼|小鱼儿?|大鱼|小蓝/, 22],
    [/白饭|干饭|token/, 30], [/(鲸|鱼)\1/, 10], [/(?:的|の|家的)[^的の]{0,4}(?:鱼|鲸|哈基米|小蓝|喵)/, 14],
    [/(?:^|[^a-z0-9_])(?:ai|bot)(?![a-z0-9_])|机器人|gpt|agent|智能体|赛博|自动|助手/, 28],
    [/gemini|运营喵|本喵|小喵/, 32]
  ];

  var NORM_WAS_SLOW = 0;

  function normSlow(s) {
    NORM_WAS_SLOW = 1;
    if (s.normalize) s = s.normalize('NFKC');
    s = s.replace(RE_CF, '').replace(RE_ASTRAL_G, '').toLowerCase();
    return (s.indexOf('魚') !== -1 || s.indexOf('鯨') !== -1)
      ? s.replace(RE_TRAD_FISH, function (ch) { return ch === '魚' ? '鱼' : '鲸'; }) : s;
  }

  /* Flat SeqString normalization via pre-sized Array (zero ConsString flattening) */
  function norm(s) {
    NORM_WAS_SLOW = 0;
    if (!s) return '';
    var len = s.length, nmap = NORM_MAP, i = 0, j, c, m;
    for (; i < len; i++) { c = s.charCodeAt(i); m = nmap[c]; if (m !== c) { if (m === 0xFFFF) return normSlow(s); break; } }
    if (i === len) return s;
    if (len > 512) return normSlow(s);
    var arr = new Array(len);
    for (j = 0; j < i; j++) arr[j] = s.charCodeAt(j);
    arr[i] = m;
    for (j = i + 1; j < len; j++) { c = s.charCodeAt(j); m = nmap[c]; if (m === 0xFFFF) return normSlow(s); arr[j] = m; }
    return String.fromCharCode.apply(null, arr);
  }

  function sigmoid(z) { return z > 30 ? 1 : (z < -30 ? 0 : 1 / (1 + Math.exp(-z))); }
  function stripLead(s) { return s.indexOf('回复') !== -1 ? s.replace(RE_LEADING_REPLY, '') : s; }
  function matchCount(s, reG) { var m = s.match(reG); return m ? m.length : 0; }

  function lookupH2(c0, c1) {
    var key = (c0 << 16) | c1, slot = ((c0 * 40503) ^ c1) & H2_MASK, hk;
    while ((hk = H2_KEY[slot]) !== -1) { if (hk === key) return H2_ID[slot]; slot = (slot + 1) & H2_MASK; }
    return -1;
  }
  function lookupH3(c0, c1, c2) {
    var slot = ((c0 * 40503) ^ (c1 * 26544) ^ c2) & H3_MASK, id;
    while ((id = H3_ID[slot]) !== -1) { if (H3_C0[slot] === c0 && H3_C1[slot] === c1 && H3_C2[slot] === c2) return id; slot = (slot + 1) & H3_MASK; }
    return -1;
  }
  function lookupG4(c0, c1, c2, c3) {
    for (var j = 0; j < G4_LEN; j++) if (G4_C0[j] === c0 && G4_C1[j] === c1 && G4_C2[j] === c2 && G4_C3[j] === c3) return G4_ID[j];
    return -1;
  }

  var NG_POS_OUT = 0, NG_NEG_OUT = 0;

  function scoreNgramsFast(s) {
    var clen = s.length;
    if (!clen) { NG_POS_OUT = 0; NG_NEG_OUT = 0; return 0; }
    CUR_STAMP++;
    if (CUR_STAMP === 0xFFFF) { SEEN_STAMP.fill(0); CUR_STAMP = 1; }
    var stamp = CUR_STAMP, scale = Math.sqrt(50 / (clen + 20)) * NG_SCALE;
    var pos = 0, neg = 0, lut = NG_LUT, seen = SEEN_STAMP, nw = NG_W, h2k = H2_KEY, h2i = H2_ID, h2m = H2_MASK;
    var i, c0, c1, c2, entry, id, w, key, slot, hk, f0 = s.charCodeAt(0), e0 = s.charCodeAt(clen - 1);

    if (BND_S2) { id = lookupH2(2, f0); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
    if (BND_S3) { id = lookupH3(2, f0, clen >= 2 ? s.charCodeAt(1) : 3); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
    if (BND_S4 && clen >= 2) { id = lookupG4(2, f0, s.charCodeAt(1), clen >= 3 ? s.charCodeAt(2) : 3); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
    if (lut[e0] & 16384) {
      id = lookupH2(e0, 3); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; }
      if (BND_E3 && clen >= 2) { id = lookupH3(s.charCodeAt(clen - 2), e0, 3); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
      if (BND_E4 && clen >= 3) { id = lookupG4(s.charCodeAt(clen - 3), s.charCodeAt(clen - 2), e0, 3); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
    }
    for (i = 0; i < clen; i++) {
      c0 = s.charCodeAt(i); entry = lut[c0]; if (!entry) continue;
      id = (entry & 2047) - 1;
      if (id >= 0 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; }
      if (entry & 14336) {
        if ((entry & 2048) && i + 1 < clen) {
          c1 = s.charCodeAt(i + 1);
          if (c1 !== 32) {
            key = (c0 << 16) | c1; slot = ((c0 * 40503) ^ c1) & h2m;
            while ((hk = h2k[slot]) !== -1) {
              if (hk === key) { id = h2i[slot]; if (seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } break; }
              slot = (slot + 1) & h2m;
            }
          }
        }
        if ((entry & 4096) && i + 2 < clen) {
          c2 = s.charCodeAt(i + 2);
          if (c2 !== 32) { id = lookupH3(c0, s.charCodeAt(i + 1), c2); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
        }
        if ((entry & 8192) && i + 3 < clen) {
          id = lookupG4(c0, s.charCodeAt(i + 1), s.charCodeAt(i + 2), s.charCodeAt(i + 3));
          if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; }
        }
      }
    }
    NG_POS_OUT = pos * scale; NG_NEG_OUT = neg * scale;
    return NG_POS_OUT + NG_NEG_OUT;
  }

  function nameScore(normName) {
    if (!normName || !RE_NAME_ANY.test(normName)) return 0;
    var total = 0, i;
    for (i = 0; i < NAME_RULES.length; i++) if (NAME_RULES[i][0].test(normName)) total += NAME_RULES[i][1];
    if (total === 0 && normName.indexOf('鱼') !== -1 && !RE_SAFE_FISH_NAME.test(normName)) total = 8;
    return total > 55 ? 55 : total;
  }

  function ownerLink(normName, mention) {
    if (!normName || !mention) return false;
    if (normName === mention) return true;
    var core = normName.replace(RE_FILLER_G, '');
    if (!core) return false;
    if (core.length >= 2) {
      for (var i = 0; i < core.length - 1; i++) if (mention.indexOf(core.slice(i, i + 2)) !== -1) return true;
      return false;
    }
    return RE_CJK.test(core) && mention.indexOf(core) !== -1;
  }

  var LAST_HAS_AT_NM = 0, LAST_NM = '';

  function computeTextScore(rawMsg) {
    var nm = norm(rawMsg); LAST_NM = nm;
    var wasSlow = NORM_WAS_SLOW, rawBody = stripLead(rawMsg).trim(), rLen = rawBody.length;
    var periodCnt = 0, commaCnt = 0, pauseCnt = 0, colonCnt = 0, asciiColon = 0, semiCnt = 0;
    var dashCnt = 0, cornerQ = 0, stdQ = 0, qCnt = 0, exCnt = 0, nlCnt = 0, emojiCnt = 0;
    var hasParenOrStar = 0, hasBracket = 0, hasAtRaw = 0, hasWsSpecial = 0, prevSpace = 0, c2, i, code;
    for (i = 0; i < rLen; i++) {
      code = rawBody.charCodeAt(i);
      if (code >= 0x4E00 && code <= 0x9FFF) { prevSpace = 0; continue; }
      if ((code >= 97 && code <= 122) || (code >= 65 && code <= 90) || (code >= 48 && code <= 57)) { prevSpace = 0; continue; }
      if (code === 32) { if (prevSpace) hasWsSpecial = 1; prevSpace = 1; continue; }
      prevSpace = 0;
      if (code === 0xFF0C || code === 44) commaCnt++;
      else if (code === 0x3002) periodCnt++;
      else if (code === 0xFF1F || code === 63) qCnt++;
      else if (code === 0xFF01 || code === 33) exCnt++;
      else if (code === 10) { nlCnt++; hasWsSpecial = 1; }
      else if (code === 9 || code === 13 || code === 11 || code === 12 || code === 0x3000 || code === 0x00A0) hasWsSpecial = 1;
      else if (code === 91 || code === 0xFF3B) hasBracket = 1;
      else if (code === 64 || code === 0xFF20) hasAtRaw = 1;
      else if (code === 0x3001) pauseCnt++;
      else if (code === 58) { colonCnt++; asciiColon = 1; }
      else if (code === 0xFF1A) colonCnt++;
      else if (code === 0xFF1B || code === 59) semiCnt++;
      else if (code === 0x2015) dashCnt++;
      else if (code === 0x2014 && i + 1 < rLen && rawBody.charCodeAt(i + 1) === 0x2014) { dashCnt++; i++; }
      else if (code === 45 && i + 1 < rLen && rawBody.charCodeAt(i + 1) === 45) { dashCnt++; i++; }
      else if (code === 0x300C || code === 0x300D) cornerQ++;
      else if (code === 0x201C || code === 0x201D || code === 34) stdQ++;
      else if (code === 40 || code === 0xFF08 || code === 42) hasParenOrStar = 1;
      else if (code >= 0xD83C && code <= 0xD83E && i + 1 < rLen) {
        c2 = rawBody.charCodeAt(i + 1);
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) { emojiCnt++; i++; }
      } else if (code >= 0x2600 && code <= 0x27BF) emojiCnt++;
    }
    LAST_HAS_AT_NM = hasAtRaw || wasSlow || (rawMsg !== rawBody);

    var body = (rawMsg === nm) ? rawBody : stripLead(nm).trim();
    if (wasSlow) {
      if (!hasBracket && body.indexOf('[') !== -1) hasBracket = 1;
      if (!hasAtRaw && body.indexOf('@') !== -1) hasAtRaw = 1;
      if (!hasWsSpecial && RE_NEED_WS.test(body)) hasWsSpecial = 1;
    }
    var hasUrl = (colonCnt > 0 || wasSlow) && body.indexOf('http') !== -1;
    var ngText = body, clean = body, emoteCnt = 0, hasAt = 0;
    if (hasUrl || hasBracket || hasAtRaw) {
      if (hasUrl) ngText = ngText.replace(RE_URL_G, ' ');
      if (hasBracket) {
        ngText = ngText.replace(RE_EMOTE_G, '\uE001');
        var em = body.match(RE_EMOTE_G);
        if (em) { emoteCnt = em.length; clean = body.replace(RE_EMOTE_G, '').trim(); }
      }
      if (hasAtRaw) {
        if (RE_AT_BODY.test(body)) hasAt = 1;
        ngText = ngText.replace(RE_AT_BODY_G, ' \uE002 ');
        clean = clean.replace(RE_AT_BODY_G, '').trim();
      }
      if (RE_NEED_WS.test(ngText)) ngText = ngText.replace(RE_WS_G, ' ').trim();
      else if (ngText.length && (ngText.charCodeAt(0) === 32 || ngText.charCodeAt(ngText.length - 1) === 32)) ngText = ngText.trim();
    } else if (hasWsSpecial) ngText = ngText.replace(RE_WS_G, ' ').trim();

    var ngSum = scoreNgramsFast(ngText);
    var n = clean.length, denom = n > 0 ? n : 1, per100 = 100 / (n > 15 ? n : 15);
    CUR_CHAR_STAMP++;
    if (CUR_CHAR_STAMP === 0xFFFF) { CHAR_STAMP.fill(0); CUR_CHAR_STAMP = 1; }
    var cStamp = CUR_CHAR_STAMP, cStArr = CHAR_STAMP;
    var cjkCnt = 0, digitCnt = 0, asciiCnt = 0, uniqCnt = 0, nSent = 0, sumSl = 0, sumSl2 = 0, segStart = -1, segEnd = -1, segLen;
    for (i = 0; i < n; i++) {
      code = clean.charCodeAt(i);
      if (cStArr[code] !== cStamp) { cStArr[code] = cStamp; uniqCnt++; }
      if (code >= 0x4E00 && code <= 0x9FFF) { cjkCnt++; if (segStart === -1) segStart = i; segEnd = i; continue; }
      if (code >= 97 && code <= 122) { asciiCnt++; if (segStart === -1) segStart = i; segEnd = i; continue; }
      if (code >= 48 && code <= 57) { digitCnt++; if (segStart === -1) segStart = i; segEnd = i; continue; }
      if (code === 0x3002 || code === 33 || code === 63 || code === 59 || code === 10 || code === 0xFF01 || code === 0xFF1F || code === 0xFF1B) {
        if (segStart !== -1) { segLen = segEnd - segStart + 1; nSent++; sumSl += segLen; sumSl2 += segLen * segLen; segStart = -1; }
      } else if (code > 32 && code !== 0x3000 && code !== 0x00A0) { if (segStart === -1) segStart = i; segEnd = i; }
    }
    if (segStart !== -1) { segLen = segEnd - segStart + 1; nSent++; sumSl += segLen; sumSl2 += segLen * segLen; }
    var meanSl = 0, cvSl = 0;
    if (nSent >= 2) {
      meanSl = sumSl / nSent; var varSl = (sumSl2 / nSent) - (meanSl * meanSl);
      cvSl = varSl > 0 ? Math.sqrt(varSl) / (meanSl > 1 ? meanSl : 1) : 0;
    } else if (nSent === 1) meanSl = sumSl;

    var tsHits = asciiColon ? matchCount(rawBody, RE_TIMESTAMP_G) : 0;
    colonCnt -= tsHits; if (colonCnt < 0) colonCnt = 0;
    var formalP = periodCnt + pauseCnt + colonCnt + semiCnt + dashCnt * 2 + cornerQ;
    var allP = formalP + commaCnt + qCnt + exCnt + stdQ;
    var lastCode = rLen ? rawBody.charCodeAt(rLen - 1) : 0;
    var endsEmote = (lastCode === 93 && RE_EMOTE.test(rLen > 14 ? rawBody.slice(rLen - 14) : rawBody)) ? 1 : 0;
    var firstCode = rLen ? rawBody.charCodeAt(0) : 0;
    var fList = (nlCnt > 0 || hasParenOrStar || (firstCode >= 48 && firstCode <= 57) || firstCode === 45 || firstCode === 0x2022 || firstCode === 0x00B7 || firstCode === 0x4E00 || firstCode === 0x4E8C || firstCode === 0x4E09 || firstCode === 0x56DB || firstCode === 0x4E94)
      ? (RE_LIST_MARKER.test(rawBody) ? 1 : 0) : 0;

    var s0 = n > 0 ? Math.log(1 + n) / 6 : 0, s1 = n <= 10 ? 1 : 0, s2 = n >= 40 ? 1 : 0, s3 = n >= 80 ? 1 : 0;
    var s4 = nSent > 0 ? Math.log(1 + nSent) / 3 : 0, s5 = (meanSl < 80 ? meanSl : 80) / 40, s6 = cvSl < 2 ? cvSl : 2;
    var s7 = nlCnt > 0 ? Math.log(1 + nlCnt) / 3 : 0, s8 = fList, s9 = lastCode === 0x3002 ? 1 : 0;
    var s10 = (lastCode === 0xFF1F || lastCode === 63) ? 1 : 0, s11 = (lastCode === 0xFF01 || lastCode === 33) ? 1 : 0, s12 = endsEmote;
    var s13 = (periodCnt * per100 < 15 ? periodCnt * per100 : 15) / 10, s14 = (commaCnt * per100 < 20 ? commaCnt * per100 : 20) / 10;
    var s15 = (pauseCnt * per100 < 15 ? pauseCnt * per100 : 15) / 10, s16 = (colonCnt < 4 ? colonCnt : 4) / 4;
    var s17 = (semiCnt < 4 ? semiCnt : 4) / 4, s18 = (dashCnt < 4 ? dashCnt : 4) / 4;
    var s19 = (cornerQ < 6 ? cornerQ : 6) / 6, s20 = (stdQ < 6 ? stdQ : 6) / 6;
    var s21 = (qCnt * per100 < 15 ? qCnt * per100 : 15) / 10, s22 = (exCnt * per100 < 15 ? exCnt * per100 : 15) / 10;
    var s23 = (formalP * per100 < 25 ? formalP * per100 : 25) / 15;
    var s24 = cjkCnt / denom, s25 = digitCnt / denom, s26 = asciiCnt / denom, s27 = n > 0 ? (uniqCnt / denom) : 0;
    var s28 = emoteCnt > 0 ? Math.log(1 + emoteCnt) / 3 : 0, s29 = emojiCnt > 0 ? Math.log(1 + emojiCnt) / 3 : 0;
    var s30 = hasAt, s31 = tsHits > 0 ? 1 : 0;
    var s32 = RE_REPEAT_BURST.test(nm) ? 1 : 0, s33 = RE_HUMAN_SLANG.test(nm) ? 1 : 0;
    var s34 = RE_AI_BRAND.test(nm) ? 1 : 0, s35 = hasParenOrStar && RE_ACTION_PAREN.test(rawBody) ? 1 : 0;
    var s36 = RE_AI_TEMPLATE.test(nm) ? 1 : 0, s37 = (allP / denom < 0.5 ? allP / denom : 0.5) * 2;

    var W = STYLE_W;
    var zLin = LIN_BIAS + ngSum
      + W[0]*s0 + W[1]*s1 + W[2]*s2 + W[3]*s3 + W[4]*s4 + W[5]*s5 + W[6]*s6 + W[7]*s7
      + W[8]*s8 + W[9]*s9 + W[10]*s10 + W[11]*s11 + W[12]*s12 + W[13]*s13 + W[14]*s14 + W[15]*s15
      + W[16]*s16 + W[17]*s17 + W[18]*s18 + W[19]*s19 + W[20]*s20 + W[21]*s21 + W[22]*s22 + W[23]*s23
      + W[24]*s24 + W[25]*s25 + W[26]*s26 + W[27]*s27 + W[28]*s28 + W[29]*s29 + W[30]*s30 + W[31]*s31
      + W[32]*s32 + W[33]*s33 + W[34]*s34 + W[35]*s35 + W[36]*s36 + W[37]*s37;

    var tf = TF_BUF;
    tf[0]=zLin; tf[1]=NG_POS_OUT; tf[2]=NG_NEG_OUT;
    tf[3]=s0; tf[4]=s1; tf[5]=s2; tf[6]=s3; tf[7]=s4; tf[8]=s5; tf[9]=s6; tf[10]=s7;
    tf[11]=s8; tf[12]=s9; tf[13]=s10; tf[14]=s11; tf[15]=s12; tf[16]=s13; tf[17]=s14; tf[18]=s15;
    tf[19]=s16; tf[20]=s17; tf[21]=s18; tf[22]=s19; tf[23]=s20; tf[24]=s21; tf[25]=s22; tf[26]=s23;
    tf[27]=s24; tf[28]=s25; tf[29]=s26; tf[30]=s27; tf[31]=s28; tf[32]=s29; tf[33]=s30; tf[34]=s31;
    tf[35]=s32; tf[36]=s33; tf[37]=s34; tf[38]=s35; tf[39]=s36; tf[40]=s37;
    LAST_ZLIN = zLin; LAST_ZTEXT = evalTreesFlat(CT_TEXT, tf);
    return LAST_ZTEXT;
  }

  function scoreText(rawMsg) { return sigmoid(computeTextScore(rawMsg || '')); }

  function scoreReply(reply) {
    var rawMsg = (reply && reply.content && typeof reply.content.message === 'string')
      ? reply.content.message : ((reply && typeof reply.message === 'string') ? reply.message : '');
    computeTextScore(rawMsg);
    var nm = LAST_NM, m = reply && reply.member, rawUname = (m && (m.uname || m.name)) || (reply && reply.uname) || '';
    var u = rawUname ? norm(rawUname) : '', nPts = u ? nameScore(u) / 55 : 0, oLink = 0, match;
    if (u && LAST_HAS_AT_NM && nm.indexOf('@') !== -1) {
      RE_MENTION_G.lastIndex = 0;
      while ((match = RE_MENTION_G.exec(nm)) !== null) if (ownerLink(u, match[1])) { oLink = 1; break; }
    }
    var lvl = (m && m.level_info && typeof m.level_info.current_level === 'number')
      ? m.level_info.current_level : ((reply && typeof reply.level === 'number') ? reply.level : null);
    var lvlVal = 3, lLe2 = 0, l3 = 0, l4 = 0, l5 = 0, l6 = 0;
    if (lvl !== null) {
      lvlVal = lvl;
      if (lvl <= 2) lLe2 = 1; else if (lvl === 3) l3 = 1; else if (lvl === 4) l4 = 1; else if (lvl === 5) l5 = 1; else l6 = 1;
    }
    var isSub = (reply && (reply.is_sub || (reply.parent && reply.parent > 0) || (reply.root && reply.root > 0))) ? 1 : 0;
    var tf = TF_BUF, mf = MF_BUF;
    mf[0]=LAST_ZTEXT; mf[1]=LAST_ZLIN; mf[2]=tf[3]; mf[3]=tf[12]; mf[4]=tf[13]; mf[5]=tf[26]; mf[6]=tf[33]; mf[7]=tf[36]; mf[8]=tf[37];
    mf[9]=nPts; mf[10]=oLink; mf[11]=lLe2; mf[12]=l3; mf[13]=l4; mf[14]=l5; mf[15]=l6; mf[16]=(lvlVal - 3) / 3; mf[17]=isSub;
    return sigmoid(evalTreesFlat(CT_META, mf));
  }

  function isAiReply(reply, level) {
    var thr = (THRESHOLDS.reply && THRESHOLDS.reply[level || 'balanced']) || 0.5;
    return scoreReply(reply) >= thr;
  }
  function isAiText(rawMsg, level) {
    var thr = (THRESHOLDS.text && THRESHOLDS.text[level || 'balanced']) || 0.5;
    return scoreText(rawMsg) >= thr;
  }

  return { version: 'ojinjin-rules-compact', thresholds: THRESHOLDS, scoreText: scoreText, scoreReply: scoreReply, isAiText: isAiText, isAiReply: isAiReply };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = OjinjinRules; }
