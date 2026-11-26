/* OjinjinRules (ojinjin-rules-pro) v1.1 — Pure ES5 JS Distilled Rule Engine
 * Zero dependencies, zero WASM, zero network, flat-string zero-slice V8 fast path.
 * Distilled from OjinjinNet-Pro v1.2 on 26,928 Bilibili comments.
 * API:
 *   OjinjinRules.scoreText(message)         -> probability in [0, 1]
 *   OjinjinRules.scoreReply(replyObj)       -> probability in [0, 1] (uses message + uname + level)
 *   OjinjinRules.isAiText(message, level)   -> boolean ('strict' | 'balanced' | 'aggressive')
 *   OjinjinRules.isAiReply(replyObj, level) -> boolean ('strict' | 'balanced' | 'aggressive')
 */
var OjinjinRules = (function () {
  'use strict';

  var NG_SCALE = 0.00859376;
  var LIN_BIAS = -3.372088;
  var STYLE_W = [0.225622, -0.15251, -0.058824, -0.302458, -0.08248, 0.134825, -0.027401, -0.248684, 0.07132, 0.557927, -0.07103, 0.124017, -0.209117, -0.0538, -0.109319, 0.069082, 0.04971, 0.345061, 0.189226, 0.208473, -0.05149, 0.102273, 0.136686, 0.069308, -0.778205, -0.227057, -0.383995, 0.725642, -0.57552, 0.475832, 0.584194, 0.163826, -0.272832, 0.166687, 0.31358, 0.063354, 0.02785, -0.151456];
  var META_LIN_W = null;
  var META_LIN_B = 0;
  var TEXT_TREES_RAW = [[[0,-0.53917,1,4,0,-1.22161,2,3,0,-1.96997,-1,-2,3,0.66636,-3,-4,0,0.32514,-5,-6],[-1.67327,-1.63418,-1.51755,-1.60868,-1.3652,-1.18542]],[[1,4.12746,1,3,1,2.98788,-1,2,2,-1.45187,-2,-3,2,-2.55861,4,5,1,6.30102,-4,-5,1,4.68024,-6,-7],[-0.06462,-0.06308,0.1453,-0.0562,0.13793,0.18504,0.2985]],[[0,-0.84436,1,4,0,-1.71918,2,3,0,-2.23584,-1,-2,0,-1.22161,-3,-4,0,0.16393,5,-7,27,0.94954,-5,-6],[-0.0702,-0.04856,-0.02038,0.02222,0.14005,0.04902,0.23863]],[[0,-0.84436,1,4,0,-1.71918,2,3,0,-2.12739,-1,-2,3,0.62094,-3,-4,0,-0.14674,5,-7,30,0.99038,-5,-6],[-0.06761,-0.04417,0.01171,-0.0331,0.10849,0.02735,0.19671]],[[0,-0.84436,1,4,0,-1.79039,2,3,0,-2.25627,-1,-2,0,-1.22161,-3,-4,0,-0.27406,-5,5,3,0.5696,-6,-7],[-0.06587,-0.04662,-0.02436,0.02128,0.07768,0.11201,0.17663]],[[0,-0.84436,1,4,0,-1.46384,2,3,0,-1.96997,-1,-2,8,1.22917,-3,-4,0,0.16393,-5,5,30,0.99038,-6,-7],[-0.06279,-0.0321,0.02098,-0.0338,0.08337,0.15691,0.05532]],[[0,-0.64546,1,4,0,-1.40536,2,3,0,-2.17393,-1,-2,30,0.75685,-3,-4,0,0.76184,5,-7,27,0.94954,-5,-6],[-0.06143,-0.03515,-0.0256,0.02818,0.10406,0.03507,0.14413]],[[0,-0.84436,1,4,0,-1.96997,2,3,0,-2.51578,-1,-2,0,-1.28484,-3,-4,0,0.61545,5,-7,0,-0.53917,-5,-6],[-0.0607,-0.04761,-0.02465,0.01373,0.04163,0.08683,0.13175]],[[0,-1.01259,1,4,0,-1.79039,2,3,0,-2.25627,-1,-2,8,0.91339,-3,-4,0,0.61545,5,-7,0,-0.53917,-5,-6],[-0.05775,-0.03848,-0.0005,-0.04422,0.03636,0.07969,0.12187]],[[0,-1.01259,1,3,0,-1.96997,-1,2,0,-1.46384,-2,-3,0,-0.14674,4,5,30,0.76799,-4,-5,30,0.99038,-6,-7],[-0.05476,-0.02495,0.00608,-0.01266,0.05667,0.11055,0.0273]],[[0,-1.01259,1,3,0,-1.96997,-1,2,1,3.21699,-2,-3,0,0.46434,4,5,0,-0.53917,-4,-5,3,0.55234,-6,-7],[-0.05238,-0.00363,-0.04097,0.02779,0.06345,0.05176,0.10902]],[[1,4.12746,1,3,1,2.66926,-1,2,2,-1.40401,-2,-3,2,-2.33982,4,5,1,5.73884,-4,-5,1,5.21792,-6,-7],[-0.04575,-0.04511,0.04235,-0.04488,0.04975,0.07068,0.10501]],[[0,-0.84436,1,3,0,-1.96997,-1,2,3,0.66013,-2,-3,0,0.16393,4,5,3,0.66636,-4,-5,3,0.55234,-6,-7],[-0.04905,0.00149,-0.03563,0.05048,0.01116,0.04129,0.09652]],[[0,-0.64546,1,4,0,-1.71918,2,3,0,-2.41938,-1,-2,5,0.0,-3,-4,0,1.01469,5,-7,27,0.95219,-5,-6],[-0.04858,-0.02922,0.01564,-0.01762,0.05753,0.0041,0.09362]],[[1,4.19536,1,4,1,2.61945,2,3,3,0.85449,-1,-2,2,-1.47383,-3,-4,2,-2.77634,-5,5,1,5.30863,-6,-7],[-0.04036,0.03458,-0.04192,0.03418,-0.03432,0.05648,0.09088]],[[0,-0.64546,1,4,0,-1.60735,2,3,0,-2.96315,-1,-2,8,1.17679,-3,-4,0,1.01469,5,-7,8,0.6525,-5,-6],[-0.04726,-0.03245,0.01291,-0.03476,0.02609,0.06007,0.08543]],[[0,-0.92869,1,4,0,-2.25627,2,3,29,0.78446,-1,-2,3,0.65032,-3,-4,0,1.01469,5,-7,30,0.99038,-5,-6],[-0.04304,0.005,-0.00283,-0.03296,0.04413,-0.00016,0.08137]],[[0,-1.22161,1,3,0,-2.17393,-1,2,8,0.95139,-2,-3,0,0.16393,4,5,30,0.76799,-4,-5,3,0.56404,-6,-7],[-0.04054,-0.01115,-0.03822,-0.00087,0.03062,0.02885,0.07681]],[[0,-0.64546,1,4,0,-2.04888,2,3,0,-2.96315,-1,-2,27,0.69871,-3,-4,0,0.8875,5,-7,8,1.04896,-5,-6],[-0.04182,-0.02926,0.0374,-0.01118,0.02596,0.06185,0.07453]],[[0,-1.22161,1,3,0,-2.60657,-1,2,3,0.63257,-2,-3,0,0.76184,4,5,30,0.76799,-4,-5,30,0.97871,-6,-7],[-0.03842,-0.01355,-0.0359,0.00093,0.03121,0.07112,-0.00463]],[[0,-0.64546,1,4,0,-1.96997,2,3,0,-2.96315,-1,-2,3,0.65032,-3,-4,3,0.57498,-5,5,0,0.61545,-6,-7],[-0.03805,-0.02568,0.00729,-0.02214,0.01852,0.03977,0.07053]],[[0,-1.22161,1,3,0,-2.25627,-1,2,1,3.01612,-2,-3,0,1.01469,4,5,27,0.9646,-4,-5,3,0.59954,-6,-7],[-0.03412,-0.00269,-0.03137,0.02643,-0.03023,0.03669,0.06957]],[[0,-1.01259,1,4,0,-2.02374,2,3,0,-3.24996,-1,-2,27,0.84558,-3,-4,0,1.24087,5,-7,8,0.66938,-5,-6],[-0.03646,-0.02478,0.01239,-0.01594,0.01139,0.03846,0.06518]],[[1,4.68024,1,4,1,2.61945,2,3,3,0.8641,-1,-2,2,-1.53369,-3,-4,2,-2.77634,-5,5,3,0.61687,-6,-7],[-0.02474,0.0482,-0.02951,0.02038,-0.01856,0.02841,0.06194]],[[1,4.12746,1,3,2,-1.22189,-1,2,1,1.9427,-2,-3,2,-2.25124,4,5,1,5.73884,-4,-5,1,5.61098,-6,-7],[-0.02727,-0.02331,0.01345,-0.03484,0.02693,0.03685,0.06324]],[[0,-0.27406,1,4,0,-1.46384,2,3,0,-3.35064,-1,-2,27,0.9646,-3,-4,5,0.0,-5,5,30,0.6123,-6,-7],[-0.03276,-0.01945,0.00985,-0.03674,0.02615,-0.00019,0.05819]],[[0,-0.27406,1,3,0,-2.25627,-1,2,3,0.66013,-2,-3,3,0.57498,4,5,27,0.93311,-4,-5,0,2.14038,-6,-7],[-0.02618,0.00253,-0.02642,0.01844,-0.01426,0.0387,0.06179]],[[16,0.13356,1,3,2,-2.00029,-1,2,3,0.46715,-2,-3,8,0.69861,4,5,40,0.20389,-4,-5,2,-2.27115,-6,-7],[-0.03293,-0.02265,0.0059,-0.01547,0.01964,-0.00608,0.04426]],[[0,-0.27406,1,3,0,-2.23584,-1,2,30,0.76948,-2,-3,3,0.5696,4,5,27,0.94071,-4,-5,0,2.14038,-6,-7],[-0.02394,-0.0201,0.00392,0.01524,-0.01897,0.03745,0.05812]],[[0,-0.27406,1,4,0,-1.46384,2,3,2,-2.21842,-1,-2,3,0.66636,-3,-4,3,0.5696,-5,5,30,0.6123,-6,-7],[-0.03304,-0.01659,0.01287,-0.02512,0.00697,-0.00552,0.04593]],[[1,4.68024,1,4,2,-1.55708,2,3,8,1.17679,-1,-2,3,0.46715,-3,-4,2,-2.33982,-5,5,3,0.63257,-6,-7],[-0.01861,-0.03721,-0.0189,0.00809,-0.00604,0.02017,0.04954]],[[0,-1.22161,1,3,0,-2.96315,-1,2,8,0.95139,-2,-3,0,1.01469,4,5,40,0.0,-4,-5,30,0.96922,-6,-7],[-0.02304,-0.00478,-0.02544,0.03956,0.00805,0.04643,-0.00028]],[[0,0.16393,1,4,0,-2.51578,2,3,29,0.78446,-1,-2,12,0.0,-3,-4,5,0.0,5,-7,27,0.94238,-5,-6],[-0.02061,0.02419,0.00603,-0.01461,0.02256,-0.01648,0.04619]],[[0,0.61545,1,4,0,-1.79039,2,3,30,0.8207,-1,-2,27,0.94881,-3,-4,3,0.58524,-5,5,18,0.10899,-6,-7],[-0.0234,-0.01241,0.00994,-0.02308,0.01085,0.04538,0.01417]],[[0,-0.14674,1,3,0,-2.95252,-1,2,32,0.0,-2,-3,3,0.63257,4,5,27,0.94238,-4,-5,17,0.67866,-6,-7],[-0.01949,-0.00526,0.0345,0.01724,-0.0179,0.04217,-0.01565]],[[0,0.61545,1,4,0,-1.96997,2,3,2,-2.27115,-1,-2,27,0.84861,-3,-4,0,2.25788,5,-7,18,0.10899,-5,-6],[-0.02617,-0.01256,0.01694,-0.00415,0.02695,-0.01547,0.04543]],[[0,-1.09126,1,3,2,-2.27115,-1,2,3,0.84742,-2,-3,1,5.73884,4,5,40,0.04572,-4,-5,30,0.56864,-6,-7],[-0.02617,-0.00963,0.05075,0.03698,0.00691,-0.01399,0.04296]],[[1,5.40655,1,4,2,-1.71819,2,3,19,0.0,-1,-2,1,3.77786,-3,-4,30,0.6502,5,-7,27,0.82929,-5,-6],[-0.02184,0.01711,-0.00542,0.01771,0.01243,-0.0266,0.03778]],[[0,-1.40536,1,3,0,-3.24996,-1,2,23,0.41667,-2,-3,1,6.17735,4,5,40,0.0,-4,-5,23,0.41667,-6,-7],[-0.01786,-0.00773,0.03472,0.03465,0.00776,0.04225,-0.00368]],[[0,-1.22161,1,4,8,0.92188,2,3,0,-3.19957,-1,-2,29,0.4448,-3,-4,0,1.58713,5,-7,8,0.66938,-5,-6],[-0.01428,-0.00207,-0.02505,0.01382,-0.00239,0.01784,0.03421]]];
  var META_TREES_RAW = [[[0,-1.41914,1,3,11,0.0,-1,2,0,-3.02951,-2,-3,16,0.0,-4,4,1,0.12518,-5,-6],[-1.10651,-1.04469,-0.86172,-0.75997,-1.03441,-0.84595]],[[0,-1.02582,1,3,9,0.0,-1,2,16,0.0,-2,-3,16,0.0,-4,4,1,-0.05478,-5,-6],[-0.09025,0.16663,-0.02302,0.21233,-0.00911,0.14352]],[[0,-1.32459,1,3,9,0.52727,2,-3,11,0.0,-1,-2,16,0.5,-4,4,1,-0.27757,-5,-6],[-0.09053,0.01908,0.11659,0.18121,-0.03616,0.10433]],[[0,-1.02582,1,3,9,0.0,-1,2,16,0.5,-2,-3,9,0.0,4,-6,0,0.61906,-4,-5],[-0.08421,0.13183,-0.03171,0.0093,0.12509,0.17379]],[[0,-1.56274,1,3,9,0.52727,2,-3,11,0.0,-1,-2,16,0.0,-4,4,1,-0.11645,-5,-6],[-0.08658,0.00681,0.09092,0.14867,-0.03287,0.09491]],[[16,-0.0,1,2,1,-2.24915,-1,-2,1,-0.37606,3,4,0,-1.93487,-3,-4,0,1.15552,-5,-6],[-0.0026,0.1383,-0.08178,-0.03155,0.0403,0.1105]],[[11,0.0,1,4,1,-0.37606,2,3,9,0.52727,-1,-2,1,0.72173,-3,-4,0,-3.0067,-5,-6],[-0.07941,0.05236,0.03732,0.10536,-0.02529,0.12342]],[[0,-1.7981,1,3,9,0.0,-1,2,16,0.0,-2,-3,9,0.0,4,-6,1,0.36778,-4,-5],[-0.0785,0.09234,-0.02896,-0.00519,0.09198,0.12653]],[[0,-1.47224,1,3,9,0.0,-1,2,0,-3.0067,-2,-3,9,0.0,4,-6,0,0.92733,-4,-5],[-0.07479,-0.01957,0.08385,0.0002,0.08518,0.11816]],[[16,0.0,1,3,0,-2.82657,2,-3,9,0.0,-1,-2,0,-0.58169,4,-6,9,0.80909,-4,-5],[-0.05698,0.04443,0.10178,-0.07537,0.0426,0.04239]],[[16,0.0,1,3,1,-2.24915,2,-3,9,0.0,-1,-2,1,-0.37606,4,-6,9,0.52727,-4,-5],[-0.05667,0.04386,0.09426,-0.07378,0.02696,0.05349]],[[16,0.0,1,3,0,-2.93545,2,-3,9,0.80909,-1,-2,0,-0.04032,4,-6,9,0.52727,-4,-5],[-0.04557,0.05201,0.08884,-0.07144,0.03129,0.04873]],[[16,0.0,1,3,0,-2.88829,2,-3,9,0.0,-1,-2,0,-0.58169,4,-6,9,0.80909,-4,-5],[-0.05146,0.03959,0.08382,-0.0701,0.03361,0.03728]],[[0,-1.93487,1,3,9,0.61818,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,1.15552,-4,-5],[-0.06982,-0.00715,0.05322,-0.01017,0.06381,0.09484]],[[11,0.0,1,4,1,-0.27757,2,3,0,-2.52956,-1,-2,0,1.15552,-3,-4,1,-2.74624,-5,-6],[-0.06838,-0.02838,0.00821,0.0621,-0.01821,0.07884]],[[9,0.0,1,4,0,-0.58169,2,3,0,-2.55165,-1,-2,0,1.15552,-3,-4,0,-2.88829,-5,-6],[-0.06841,-0.02955,-0.00187,0.06057,-0.00584,0.08523]],[[9,0.0,1,4,1,-0.67979,2,3,11,0.0,-1,-2,1,0.72173,-3,-4,1,-2.24915,-5,-6],[-0.0628,-0.01099,0.0025,0.05779,0.00129,0.08196]],[[9,0.0,1,4,1,-0.40699,2,3,16,-0.0,-1,-2,5,0.26359,-3,-4,0,-2.88829,-5,-6],[-0.00166,-0.05994,0.00859,0.0555,0.00222,0.07814]],[[16,0.0,1,3,1,-2.60467,-1,2,5,0.20151,-2,-3,1,-0.5148,4,-6,0,-2.52956,-4,-5],[-0.02004,0.04406,0.08187,-0.06327,-0.02673,0.02615]],[[9,0.0,1,3,1,-0.32628,2,-3,1,-1.67015,-1,-2,0,-2.88829,4,-6,16,0.0,-4,-5],[-0.06132,-0.01958,0.03346,0.03667,-0.03494,0.07222]],[[11,0.0,1,4,0,-1.93487,2,3,9,0.69091,-1,-2,9,0.0,-3,-4,0,-2.82657,-5,-6],[-0.05827,0.01767,-0.00977,0.06094,0.00142,0.06457]],[[9,0.0,1,3,1,-0.32628,2,-3,0,-2.50631,-1,-2,1,-1.85718,4,-6,16,0.0,-4,-5],[-0.05857,-0.02047,0.02807,0.03979,-0.02934,0.06961]],[[16,0.0,1,3,0,0.55983,2,-3,9,0.0,-1,-2,1,0.0,4,-6,9,0.80909,-4,-5],[-0.00746,0.04792,0.07147,-0.05142,0.02935,0.03036]],[[9,0.0,1,3,0,-2.0953,-1,2,0,1.74344,-2,-3,1,-1.85718,4,-6,16,0.0,-4,-5],[-0.05298,-0.00733,0.0531,0.03139,-0.02563,0.06411]],[[16,0.0,1,3,5,0.20151,2,-3,9,0.0,-1,-2,0,-2.52956,-4,4,9,0.2,-5,-6],[-0.00995,0.04179,0.06696,-0.05454,-0.01446,0.0527]]];
  var THRESHOLDS = {"text":{"strict":0.884,"balanced":0.7442,"aggressive":0.7442},"reply":{"strict":0.7486,"balanced":0.7486,"aggressive":0.6418}};
  var NG_RAW = "本鱼\t127\n主人\t124\n——\t109\n本鲸\t103\n但是\t-95\n—\t93\n尾巴\t85\n挺\t80\n~\t79\n句\t74\n「\t70\n省\t67\n喊\t67\n稳\t66\n嫌\t65\n场\t64\n而是\t64\n秒\t64\n\u0002笑\t63\n」\t62\n感觉\t-62\n却\t62\n拆\t62\n梗\t62\n顺\t61\n完全\t-61\n\uE001\u0003\t60\n可能\t-60\n平时\t60\n比如\t-60\n小说\t-60\n才不\t60\n应该\t-59\n挑\t59\n且\t-58\n留\t58\n,本\t58\n。。\t-58\n先\t57\n确实\t57\n劲\t57\n女\t-56\n啦\t56\n比较\t-56\n往往\t56\n标\t55\n真是\t-55\n负\t55\n\uE001\t-54\n问题\t-54\n让人\t54\n条\t53\n真的\t-53\n喵\t53\n刷\t52\n落\t52\n然后\t-52\n跳\t52\n这份\t52\n漏\t52\n把\t51\n狠\t51\n恶\t-51\n才能\t-51\n呼\t51\n跨\t51\n百年\t51\n可以\t-50\n这条\t50\n容易\t50\n里面\t-50\n耐\t50\n,在\t-49\n克制\t49\n鱼\t48\n讲\t48\n国\t-48\n它\t48\n框\t48\nco\t48\n饭\t47\n替\t47\n不用\t47\n这里\t-47\nb站\t-47\n壳\t47\n三连\t-47\n都是\t-46\n搞\t-46\n亮\t46\n\u0002哈\t46\n真\t45\n着\t45\n反\t45\n没有\t-45\n些\t-45\n清\t45\n手机\t-45\n压\t45\n非\t-45\n的不是\t45\n奏\t45\n,他\t-45\n感,\t45\n武\t-45\n听完\t45\n活着\t-45\n反倒\t45\n诚\t45\n饿\t45\n连\t44\n刚\t44\n还有\t-44\n验\t44\n一直\t-44\n蓝\t44\n挺好\t-44\n上头\t44\n\u0002好\t44\nma\t44\n比\t43\n啊\t-43\n,是\t43\n排\t43\n转\t43\n透\t43\n....\t43\n不得\t-43\n芯\t43\n本\t42\n,但是\t-42\n补\t42\n这期\t42\n唱\t42\n我都\t-42\n碗\t42\n堂\t42\n得\t41\n、\t41\n十\t41\n视频\t-41\n收\t41\n失\t41\n民\t-41\n滑\t41\n在我\t-41\n,每\t-41\n整活\t41\n上一\t41\n对于\t-41\n稿\t41\n温柔\t41\n\u0002\uE002\t-40\n如\t-40\n现在\t-40\n也是\t-40\n工具\t40\n只能\t-40\n,别\t40\n静\t40\n般\t-40\n参数\t40\n约\t40\n事情\t-40\n依然\t40\n搜\t-40\n吹\t40\n记\t39\n,就\t-39\n倒\t39\n账\t39\n\u0002其实\t-39\n)\u0003\t39\n牛\t-39\n慢慢\t39\n玩家\t39\n插\t39\n边界\t39\n瞬\t39\n经典\t39\n简单\t-39\n他\t-38\n之\t-38\n的是\t38\n靠\t38\n门\t38\n左\t-38\n密\t38\n不错\t-38\n德\t-38\nke\t38\n松\t38\n生,\t-38\n算\t37\n底\t37\n鲸\t37\n不过\t37\n切\t37\n反而\t37\n零\t37\n一些\t-37\n_\t-37\n以为\t37\n谱\t37\n日常\t37\n既\t37\n焦虑\t37\n整\t36\n满\t36\n肥鱼\t-36\n;\t36\n卡\t36\n那么\t-36\n只有\t-36\n基本\t-36\n就会\t-36\n扎\t36\n离谱\t36\n右\t-36\n摸\t36\n发展\t-36\n被\t35\n\u0002我\t-35\n这样\t-35\n认\t35\n准\t35\n并\t-35\n给我\t-35\n顶\t35\n男\t-35\n甚\t-35\n还不\t-35\n从来\t35\n店\t-35\n当时\t-35\n我真\t-35\n名字\t35\n而已\t-35\n别\t34\n心\t34\n全\t34\n巴\t34\n终\t34\n散\t34\n”,\t34\n请\t-34\n暖\t34\n论区\t34\n\u0002看到\t34\n这不\t-34\n成一\t34\n烂\t-34\n只\t33\n头\t33\n从\t33\n热\t33\n一点\t-33\n套\t33\n,比\t33\n查\t33\n背\t33\n停\t33\n较\t-33\n存在\t-33\n甚至\t-33\n一般\t-33\n除\t-33\n焦\t33\n司\t-33\n占\t33\n希\t-33\n戳\t33\n拉满\t33\n斗\t-33\n点\t32\n听\t32\n数\t32\n单\t32\n换\t32\n尾\t32\n世界\t-32\n串\t32\n翻\t32\n她\t-32\n站\t32\n得很\t32\n看完\t32\n画面\t32\n你的\t-32\n不懂\t-32\n铺\t32\n句话\t-32\n偷\t32\n一旦\t32\n磨\t32\n陪\t32\n\u0002从\t32\n旦\t32\n跟着\t32\n弹幕\t32\n方面\t-32\n守\t32\n富\t-32\n这\t31\n分\t31\n进\t31\n台\t31\n怕\t31\n半\t31\n其实\t31\n硬\t31\n立\t31\n词\t31\n要是\t31\n来的\t31\n\u0002其\t-31\n理论\t-31\n群\t-31\n。。。\t-31\n。。\u0003\t-31\n鱼,\t31\n剩\t31\n[\t-31\n之间\t31\n,实\t-31\n感\t30\n们\t-30\n号\t30\n总\t30\n人,\t-30\n位\t30\n交\t30\n地方\t30\n屏\t30\n\u0002真\t-30\n折\t30\n借\t30\n部分\t-30\n兴\t30\n之后\t30\n认为\t-30\n研\t-30\n卷\t30\n\u0002想\t-30\n还\t29\n无\t-29\n气\t29\n往\t29\n懂\t29\n值\t29\n的话\t-29\n,你\t-29\n细\t29\n多少\t-29\n沉\t29\n这是\t-29\n初\t-29\n别人\t-29\n原来\t29\n香\t29\n贴\t29\n特别\t-29\n将\t-29\n他的\t-29\n才\t28\n的,\t-28\n手\t28\n为\t-28\n参\t28\n服\t28\n紧\t28\n叫\t28\n近\t-28\n我不\t28\n不住\t28\n居然\t28\n我还\t-28\n只要\t-28\n日本\t-28\n魂\t-28\n飞\t-28\n器\t28\n藏\t28\n桌\t28\n就一\t28\n。\u0003\t27\n那\t27\n实\t27\n吧\t-27\n写\t27\n是一\t-27\n画\t27\n聊\t27\n,有\t-27\n或者\t-27\n小时\t27\n下,\t-27\n嘴\t27\n究\t27\n录\t27\n摆\t27\n就行\t-27\n杀\t-27\n笑\t26\n住\t26\n同\t26\n还是\t-26\n直\t26\n的那\t26\n之前\t-26\n至\t-26\n追\t26\n归\t26\n偏\t26\n利\t-26\n穿\t26\n看的\t-26\n下去\t26\n面的\t-26\n互\t-26\n多,\t-26\n背后\t26\n迷\t26\n心,\t26\n看\t25\n不是\t25\n吗\t-25\n于\t-25\n哪\t25\n配\t25\n越\t25\n部\t-25\n第\t25\n本身\t25\n啊,\t-25\n温\t25\n掉\t25\n始\t-25\n跑\t25\n一样\t-25\n,所以\t-25\n工作\t-25\n答\t25\n智\t-25\n许\t-25\n量子\t-25\n帧\t25\n典\t25\n理解\t-25\n..\u0003\t-25\n\u0002\uE001\t25\n是很\t-25\n...\u0003\t-25\n看不\t-25\n领\t-25\n在\t24\n最\t24\n?\t-24\n出\t24\n难\t24\n名\t24\n路\t24\n口\t24\n言\t-24\n居\t24\n架\t24\nx\t-24\n历\t-24\n股\t24\n以前\t24\nde\t24\n猫\t24\n\u0002把\t24\n课\t24\n军\t-24\n说话\t24\n顺手\t24\n了,\t-23\n开\t23\n:\t23\n评\t23\n份\t23\n格\t23\n持\t-23\n,不\t-23\n开始\t-23\n觉得\t-23\n注\t23\n逻辑\t23\n逻\t23\n模型\t23\n何\t-23\n第一\t-23\n装\t23\n围\t23\n来了\t23\n同一\t23\n,能\t23\n来说\t-23\n爆\t-23\n人\u0003\t23\n不在\t23\n捏\t23\n里\t22\n要\t-22\nd\t-22\n\uE002 \uE002\t-22\n风\t22\n的。\t-22\n战\t-22\n,那\t-22\n我这\t22\n一路\t22\n业\t-22\n商\t22\n,现在\t-22\n我觉得\t-22\n我觉\t-22\n便\t-22\n顺着\t22\n我\t21\n成\t21\n但\t21\nk\t21\n当\t21\n乐\t21\n因为\t-21\np\t-21\n肯\t21\ni\t-21\n呀\t21\n调\t21\n板\t21\n,所\t-21\n,然\t-21\n改\t21\n友\t21\n盘\t21\n镜\t21\n十年\t21\n的一\t-21\n东西\t21\n奇\t21\n。\t20\n0\t-20\n拿\t20\n文\t-20\n等\t20\n\u0002你\t-20\n啥\t-20\n。这\t20\n那个\t-20\n内\t-20\n念\t20\n报\t20\n辑\t20\n导\t-20\n,而且\t-20\nen\t20\n测\t20\n华\t-20\n目\t-20\n久\t20\n好像\t-20\n个\t-19\n说\t19\n这个\t-19\n中\t-19\n推\t19\n真正\t19\n类\t-19\n节\t19\n件\t19\n也不\t-19\n世\t-19\n味\t19\n那句\t19\n呢\t-19\n啊\u0003\t19\n节奏\t19\nup\t-19\n儿\t19\n克\t19\n吗,\t-19\n的时候\t-19\n眼\t19\n金\t19\n评论\t-19\n字\t19\n核\t19\n质\t-19\n就是\t-18\n,这\t18\n自\t18\n段\t18\n谁\t18\n制\t18\n声\t18\n见\t18\n走\t18\n层\t18\n预\t18\n影\t-18\n支\t18\n实是\t-18\n都在\t18\n看看\t-18\n,然后\t-18\n师\t-18\n里,\t18\n了\u0003\t-17\n很\t-17\n力\t-17\n面\t17\n子\t17\n.\t17\n两\t17\n强\t-17\n界\t17\n性\t-17\n现\t-17\n加\t-17\n是不\t-17\n出来\t-17\n星\t-17\n4\t-17\n管\t17\n西\t-17\n三\t17\n是有\t-17\n不知道\t-17\n那一\t17\n者\t-16\n多\t-16\n像\t16\n肥\t-16\n少\t16\n间\t16\n化\t-16\n视\t16\n遍\t16\n去\t-16\n,没\t-16\n..\t16\n看着\t16\n也\t15\n么\t-15\n可\t15\n起\t15\n高\t-15\n次\t15\n行\t15\n线\t15\n电\t-15\n吗?\t-15\n放\t-15\n而且\t-15\n地\t-15\n书\t-15\n入\t-15\n,只是\t15\n问\t15\n科\t15\n轻\t15\n张\t15\n游\t15\n一起\t15\n己的\t-15\n自己的\t-15\n色\t15\n回\t14\n完\t14\n好\t-14\n,还\t-14\n具\t14\n模\t14\n玩\t-14\n是不是\t-14\n刻\t14\n\uE001\uE001\uE001\u0003\t14\n冷\t14\nm\t14\n属\t14\n使\t-14\n够\t14\n,\t13\n人\t13\n动\t13\n再\t13\n所\t-13\n\uE001\uE001\t-13\n知\t-13\n区\t-13\n米\t13\n象\t13\n二\t-13\n随\t13\n教\t13\n也没\t-13\n以\t-12\n的\t-12\n1\t-12\n了\uE001\t-12\n打\t12\n我们\t-12\n,我\t-12\n流\t12\n家\t12\n是\t11\n下\t11\n死\t-11\n\u0002看\t11\n候\t-11\n新\t11\n思\t-11\n方\t11\n与\t10\n时候\t-10\n\u0002这\t-10\n观\t10\n?\u0003\t10\n常\t10\n理\t10\n这种\t-10\n光\t10\n超\t-10\n有\t-9\n大\t-9\n度\t9\n工\t9\ns\t-9\n了。\t-9\n游戏\t-9\n有点\t9\n证\t9\n发\t9\ndee\t-9\n未\t9\n题\t8\n和\t8\nc\t-8\n原\t8\n都\t8\n了一\t-8\n外\t8\n特\t-8\nu\t8\n早\t8\n9\t8\n到\t7\n价\t7\n3\t-7\n\uE002\u0003\t7\n息\t7\n天\t7\n事\t7\n来\t7\n老\t-7\n的\u0003\t-7\n变\t7\n因\t-7\n后\t6\n过\t6\n想\t6\n续\t6\n主\t-6\ng\t-6\n史\t-6\n相\t-6\n明\t6\n了\t5\na\t-5\n小\t-5\nt\t5\n生\t-5\n太\t5\n边\t5\n慢\t5\n有一\t-5\n没\t4\n容\t4\n话\t4\n觉\t-3\n欢\t3\n一\t3\n片\t3\n更\t3\n确\t-3\no\t3\n表\t3\n能\t3\n演\t3\n就\t2\nb\t2\n应\t-2\n接\t-1\n简\t-1";

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
  var RE_AI_BRAND = /大肥鱼|小肥鱼|肥鱼|鲸鱼|大肥鲸|鲸鱼娘|本鲸|本鱼|本肥鱼|主人|本[ \t]*ai|作为(?:一[个只条]|一名)?(?:ai|人工智能|大模型|语言模型)|deep[ \t]*seek|深度求索|吃白饭|打工鲸|吐泡泡|摇头晃脑/;
  var RE_ACTION_PAREN = /[（(][^（()）]{1,16}(?:尾巴|摇头|晃脑|泡泡|鳍|甩|晃|摇|咕噜|肚子|打滚|呆毛|歪头|眨眼|拍手)[^（()）]{0,10}[）)]|\*[^*\n]{1,12}[摇晃拍甩][^*\n]{0,8}\*/;
  var RE_AI_TEMPLATE = /不仅.{1,20}(?:而且|还|也)|既.{1,15}又|与其说.{1,20}不如说|某种意义上|不可否认|总而言之|总的来说|综上所述|值得(?:一看|细看|收藏|深思|思考)|核心在于|换句话说|从这个角度|不得不说|让人(?:不禁|忍不住|眼前一亮)|挺适合|正好对|希望对你有|最(?:打动|戳人|实在|值钱|有料)/;
  var RE_CJK = /[\u4e00-\u9fff]/;
  var RE_FILLER_G = /的|の|家|大|小|肥|鱼|鲸|娘|蓝色|蓝|白饭|吃|爱|不|是|之|[ \t\r\n_\-—·・.0-9]/g;
  var RE_NAME_ANY = /鱼|鲸|ds|deep|深度|人机|小蓝|白饭|干饭|token|哈基米|喵|ai|bot|机器|gpt|agent|智能|赛博|自动|助手/;
  var NAME_RULES = [
    [/deep[ \t]*seek|深度求索|(?:^|[^a-z0-9_])ds(?![a-z0-9_])|ds家|ds是/, 40],
    [/大肥鱼|小肥鱼|肥鱼|肥鲸|鲸鱼娘|鲸娘|人机/, 45], [/鲸/, 30], [/鱼鱼|小鱼儿?|大鱼|小蓝/, 22],
    [/白饭|干饭|token/, 30], [/(鲸|鱼)\1/, 10], [/(?:的|の|家的)[^的の]{0,4}(?:鱼|鲸|哈基米|小蓝|喵)/, 14],
    [/(?:^|[^a-z0-9_])(?:ai|bot)(?![a-z0-9_])|机器人|gpt|agent|智能体|赛博|自动|助手/, 28]
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
    if (BND_S3 && clen >= 2) { id = lookupH3(2, f0, s.charCodeAt(1)); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
    if (BND_S4 && clen >= 3) { id = lookupG4(2, f0, s.charCodeAt(1), s.charCodeAt(2)); if (id !== -1 && seen[id] !== stamp) { seen[id] = stamp; w = nw[id]; if (w > 0) pos += w; else neg += w; } }
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
    if (total === 0 && normName.indexOf('鱼') !== -1) total = 8;
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

  return { version: 'ojinjin-rules-pro', thresholds: THRESHOLDS, scoreText: scoreText, scoreReply: scoreReply, isAiText: isAiText, isAiReply: isAiReply };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = OjinjinRules; }
