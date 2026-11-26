/* OjinjinRules (ojinjin-rules-pro) v2.0 — Pure ES5 JS Distilled Rule Engine
 * Zero dependencies, zero WASM, zero network, flat-string zero-slice V8 fast path.
 * Distilled from OjinjinNet v1.3 Super-Teacher on 30,347 Bilibili comments.
 * API:
 *   OjinjinRules.scoreText(message)         -> probability in [0, 1]
 *   OjinjinRules.scoreReply(replyObj)       -> probability in [0, 1] (uses message + uname + level)
 *   OjinjinRules.isAiText(message, level)   -> boolean ('strict' | 'balanced' | 'aggressive')
 *   OjinjinRules.isAiReply(replyObj, level) -> boolean ('strict' | 'balanced' | 'aggressive')
 */
var OjinjinRules = (function () {
  'use strict';

  var NG_SCALE = 0.01041248;
  var LIN_BIAS = -3.533549;
  var STYLE_W = [0.276631, -0.131945, -0.006295, -0.337952, -0.081964, 0.203172, 0.055574, -0.278537, -0.0687, 0.487432, 0.078202, 0.052122, -0.175836, 0.133831, -0.245158, -0.020105, 0.011946, 0.229182, 0.15363, 0.263936, -0.080613, 0.009544, 0.034929, -0.16258, -0.874869, -0.233126, -0.353934, 0.730646, -0.404628, 0.523878, 0.758289, 0.264498, -0.270335, 0.050728, 0.397539, 0.059493, -0.109297, -0.367193];
  var META_LIN_W = null;
  var META_LIN_B = 0;
  var TEXT_TREES_RAW = [[[0,-0.26403,1,4,0,-1.33714,2,3,0,-1.89503,-1,-2,0,-0.67824,-3,-4,0,0.57054,-5,-6],[-1.50156,-1.46045,-1.40575,-1.31994,-1.19242,-1.06213]],[[1,4.63169,1,4,1,3.38256,2,3,1,2.37489,-1,-2,2,-1.42451,-3,-4,2,-2.71019,5,-7,1,6.27067,-5,-6],[-0.07609,-0.04922,-0.05846,0.14644,-0.05571,0.08987,0.26204]],[[0,-0.57633,1,4,0,-1.49636,2,3,0,-2.47981,-1,-2,0,-0.86642,-3,-4,0,0.0,5,-7,30,0.77114,-5,-6],[-0.07799,-0.05564,-0.00236,0.04601,0.04587,0.11498,0.21933]],[[0,-0.57633,1,4,0,-1.68919,2,3,0,-2.47981,-1,-2,0,-1.23042,-3,-4,0,0.0,5,-7,3,0.66636,-5,-6],[-0.07569,-0.05493,-0.01983,0.02119,0.10801,0.0396,0.18726]],[[0,-0.67824,1,4,0,-1.49636,2,3,0,-2.11526,-1,-2,3,0.66327,-3,-4,0,0.28434,5,-7,27,0.94881,-5,-6],[-0.07262,-0.0428,0.02232,-0.02611,0.09917,0.01534,0.16594]],[[0,-0.86642,1,3,0,-1.89503,-1,2,0,-1.49636,-2,-3,0,-0.12151,4,5,30,0.77738,-4,-5,30,0.99038,-6,-7],[-0.06915,-0.03324,-0.00263,0.01405,0.07113,0.14662,0.04908]],[[0,-0.86642,1,4,0,-1.89503,2,3,0,-2.5523,-1,-2,8,1.19844,-3,-4,0,0.57054,5,-7,27,0.94754,-5,-6],[-0.06978,-0.05255,-0.01128,-0.05436,0.07694,0.00996,0.13714]],[[0,-0.86642,1,3,0,-1.95748,-1,2,3,0.66013,-2,-3,0,0.4227,4,5,27,0.94881,-4,-5,3,0.56404,-6,-7],[-0.06518,-0.00824,-0.04383,0.06799,0.00538,0.07401,0.12901]],[[0,-0.86642,1,4,0,-1.89503,2,3,0,-2.47981,-1,-2,3,0.64692,-3,-4,0,0.57054,5,-7,27,0.94754,-5,-6],[-0.06578,-0.04606,-0.00171,-0.03612,0.06615,0.00376,0.11789]],[[0,-0.67824,1,4,0,-1.72906,2,3,0,-2.47981,-1,-2,8,1.19844,-3,-4,0,0.57054,5,-7,30,0.99038,-5,-6],[-0.06356,-0.0435,0.00364,-0.03806,0.06438,0.00967,0.10996]],[[0,-0.67824,1,4,0,-1.49636,2,3,0,-2.40793,-1,-2,3,0.66013,-3,-4,0,0.96285,5,-7,0,-0.26403,-5,-6],[-0.06114,-0.03749,0.0164,-0.0226,0.03163,0.0704,0.10637]],[[1,4.37131,1,3,1,2.86955,-1,2,2,-1.37672,-2,-3,2,-2.71019,4,5,26,0.22616,-4,-5,1,5.41026,-6,-7],[-0.05109,-0.04689,0.03553,-0.04734,0.02444,0.0627,0.10185]],[[0,-0.57633,1,4,0,-1.89503,2,3,0,-2.5523,-1,-2,0,-1.33714,-3,-4,0,1.19504,5,-7,3,0.55234,-5,-6],[-0.05841,-0.03932,-0.02044,0.01117,0.02741,0.06958,0.09706]],[[0,-0.45913,1,4,0,-1.72906,2,3,0,-2.5523,-1,-2,5,0.0,-3,-4,0,1.53107,5,-7,30,0.99038,-5,-6],[-0.0567,-0.03666,0.01292,-0.0169,0.06239,0.00158,0.09406]],[[1,4.25172,1,3,1,2.51639,-1,2,2,-1.28357,-2,-3,2,-2.50101,4,5,1,6.04691,-4,-5,1,5.41026,-6,-7],[-0.04709,-0.04161,0.02667,-0.04733,0.03953,0.05089,0.088]],[[0,-0.57633,1,3,0,-1.95748,-1,2,32,0.0,-2,-3,0,0.28434,4,5,30,0.99038,-4,-5,5,0.0,-6,-7],[-0.04966,-0.00818,0.05567,0.04013,-0.01288,0.05622,0.08462]],[[0,-0.57633,1,4,0,-1.92635,2,3,29,0.77925,-1,-2,3,0.60843,-3,-4,0,1.19504,5,-7,10,0.0,-5,-6],[-0.04839,0.02027,0.00752,-0.02214,0.04799,-0.00358,0.08026]],[[0,-0.9451,1,3,0,-2.25926,-1,2,3,0.64692,-2,-3,0,0.13862,4,5,3,0.66636,-4,-5,3,0.5696,-6,-7],[-0.04783,-0.00615,-0.0349,0.02878,-0.0128,0.02751,0.07454]],[[0,-0.86642,1,3,0,-2.42771,-1,2,0,-1.49636,-2,-3,0,0.96285,4,5,40,0.0,-4,-5,3,0.5696,-6,-7],[-0.04687,-0.02335,0.00259,0.06468,0.02414,0.03227,0.07554]],[[0,-0.35997,1,4,0,-1.89503,2,3,0,-3.02624,-1,-2,3,0.66636,-3,-4,3,0.5696,-5,5,3,0.86316,-6,-7],[-0.04766,-0.03154,0.00709,-0.02716,0.01777,0.06702,0.00762]],[[0,-1.23042,1,3,0,-2.47981,-1,2,7,0.71278,-2,-3,0,0.57054,4,5,3,0.66636,-4,-5,3,0.63257,-6,-7],[-0.04336,-0.02093,0.03251,0.02549,-0.00233,0.04519,0.07105]],[[0,-1.33714,1,3,0,-2.49795,-1,2,1,2.92479,-2,-3,0,0.0,4,5,8,1.30208,-4,-5,3,0.5696,-6,-7],[-0.04229,-0.00962,-0.03076,0.01559,-0.03771,0.01996,0.06275]],[[0,-0.26403,1,4,0,-1.68919,2,3,0,-2.86592,-1,-2,8,1.30208,-3,-4,3,0.5696,-5,5,17,0.71504,-6,-7],[-0.04168,-0.02275,0.0069,-0.03616,0.01475,0.05982,0.00567]],[[1,4.25172,1,3,1,2.14385,-1,2,2,-1.27541,-2,-3,2,-2.50101,4,5,1,6.27067,-4,-5,1,5.93478,-6,-7],[-0.03364,-0.02784,0.01179,-0.03661,0.02004,0.02997,0.06477]],[[1,5.13178,1,4,1,2.86955,2,3,2,-0.56483,-1,-2,2,-1.54993,-3,-4,2,-2.71019,-5,5,1,6.04691,-6,-7],[-0.03118,-0.01122,-0.02811,0.01696,-0.00292,0.03785,0.06297]],[[0,-1.01964,1,3,0,-2.86592,-1,2,30,0.39191,-2,-3,0,0.96285,4,5,40,0.0,-4,-5,30,0.96825,-6,-7],[-0.03705,0.04903,-0.01533,0.04566,0.01116,0.05673,0.00116]],[[0,-1.28055,1,3,0,-2.74789,-1,2,30,0.51469,-2,-3,0,0.13862,4,5,40,0.0,-4,-5,0,1.78157,-6,-7],[-0.03554,0.03462,-0.01661,0.04243,0.00379,0.03261,0.0577]],[[16,0.12841,1,4,3,0.46715,2,3,17,0.66146,-1,-2,2,-1.73175,-3,-4,21,0.0,5,-7,8,0.76375,-5,-6],[-0.03274,-0.01241,-0.02987,0.00929,-0.00062,0.0268,0.05391]],[[0,-0.26403,1,4,0,-2.18952,2,3,29,0.77925,-1,-2,32,0.0,-3,-4,0,1.53107,5,-7,3,0.5696,-5,-6],[-0.03022,0.02538,-0.00598,0.04356,-0.00051,0.03072,0.05332]],[[0,-0.45913,1,4,0,-2.01041,2,3,2,-2.23307,-1,-2,32,0.0,-3,-4,3,0.5696,-5,5,17,0.70752,-6,-7],[-0.0397,-0.02316,-0.00615,0.05075,0.00377,0.04437,-0.00464]],[[1,5.41026,1,4,2,-1.75812,2,3,26,0.18363,-1,-2,1,1.84497,-3,-4,3,0.86316,-5,5,10,0.56687,-6,-7],[-0.03421,-0.00459,-0.02347,0.00867,0.04762,-0.02392,0.02892]],[[0,0.0,1,4,0,-2.5523,2,3,0,-3.1795,-1,-2,3,0.66636,-3,-4,0,1.78157,5,-7,8,1.04844,-5,-6],[-0.03056,-0.01814,0.00409,-0.02372,0.01441,0.03918,0.04801]],[[0,-1.49636,1,4,0,-2.40793,2,3,29,0.77058,-1,-2,1,2.92479,-3,-4,0,1.53107,5,-7,27,0.95261,-5,-6],[-0.02625,0.01972,0.00077,-0.02132,0.01438,-0.0247,0.04511]],[[0,-0.26403,1,4,0,-1.49636,2,3,2,-2.27979,-1,-2,27,0.95261,-3,-4,3,0.5696,-5,5,30,0.62971,-6,-7],[-0.03327,-0.01544,0.00945,-0.03698,0.00422,-0.01307,0.03922]],[[0,-0.26403,1,4,0,-1.95748,2,3,0,-3.43072,-1,-2,27,0.95862,-3,-4,3,0.63628,-5,5,23,0.41667,-6,-7],[-0.028,-0.01516,0.00264,-0.03642,0.01278,0.04127,-0.01035]],[[0,-1.33714,1,3,0,-3.0856,-1,2,2,-1.29082,-2,-3,0,1.78157,4,5,27,0.9513,-4,-5,30,0.94313,-6,-7],[-0.02479,-0.0179,-0.00218,0.01475,-0.02569,0.04286,0.00739]],[[0,0.28434,1,4,0,-2.96079,2,3,3,0.6127,-1,-2,3,0.66636,-3,-4,30,0.6006,-5,5,3,0.62878,-6,-7],[-0.01932,-0.02997,0.00175,-0.01946,-0.02299,0.01591,0.03835]],[[1,5.41026,1,4,2,-2.17387,2,3,27,0.82624,-1,-2,1,3.63473,-3,-4,2,-2.97953,-5,5,17,0.54584,-6,-7],[-0.0067,-0.03197,-0.0088,0.01041,-0.00875,0.0371,0.01218]],[[0,0.7179,1,4,0,-1.49636,2,3,30,0.86132,-1,-2,40,0.0,-3,-4,1,6.27067,5,-7,3,0.56404,-5,-6],[-0.02157,-0.009,0.03108,-0.00181,-0.00099,0.02235,0.03909]],[[0,-1.49636,1,3,29,0.77925,2,-3,3,0.6127,-1,-2,0,1.78157,4,5,30,0.99038,-4,-5,30,0.94313,-6,-7],[-0.00974,-0.0247,0.03643,0.01081,-0.018,0.03622,0.0025]]];
  var META_TREES_RAW = [[[0,-0.63258,1,3,11,0.0,-1,2,0,-2.63149,-2,-3,16,0.0,-4,4,1,0.08023,-5,-6],[-1.4753,-1.35321,-1.16493,-1.03551,-1.3761,-1.13597]],[[0,-0.81014,1,3,9,0.52727,-1,2,16,0.0,-2,-3,16,0.0,-4,4,1,0.08023,-5,-6],[-0.07848,0.24903,0.00634,0.26974,0.00202,0.19917]],[[0,-1.449,1,3,9,0.2,-1,2,16,0.0,-2,-3,9,0.0,4,-6,0,1.18021,-4,-5],[-0.08061,0.19851,-0.03093,0.00953,0.19722,0.23557]],[[9,0.0,1,4,0,0.0,2,3,16,-0.0,-1,-2,0,1.18021,-3,-4,0,-3.07933,-5,-6],[0.00978,-0.08073,0.05908,0.16765,-0.00655,0.19559]],[[0,-1.51111,1,3,9,0.52727,2,-3,11,0.0,-1,-2,16,0.5,-4,4,1,0.54073,-5,-6],[-0.08004,0.00377,0.11909,0.16635,-0.02481,0.13716]],[[0,-1.449,1,3,16,-0.0,2,-3,1,-2.54895,-1,-2,16,0.0,-4,4,0,0.93589,-5,-6],[-0.0022,0.09871,-0.07593,0.15341,-0.01598,0.12479]],[[9,0.0,1,4,0,0.10462,2,3,11,0.0,-1,-2,15,0.0,-3,-4,0,-3.17003,-5,-6],[-0.07471,-0.00303,0.12022,0.0329,-0.04152,0.14094]],[[9,0.0,1,4,0,0.0,2,3,11,0.0,-1,-2,1,0.54073,-3,-4,0,-3.07933,-5,-6],[-0.07354,0.00199,0.03691,0.11386,-0.01525,0.13321]],[[0,-1.77898,1,3,9,0.76364,2,-3,11,0.0,-1,-2,9,0.0,4,-6,11,0.0,-4,-5],[-0.0732,-0.00443,0.09873,-0.00283,0.11038,0.12812]],[[0,-1.40313,1,3,9,0.0,-1,2,16,0.0,-2,-3,16,0.5,-4,4,0,1.18021,-5,-6],[-0.06902,0.10125,-0.03779,0.11201,-0.01449,0.09286]],[[0,-1.65241,1,3,9,0.2,-1,2,16,0.5,-2,-3,16,0.0,-4,4,9,0.0,-5,-6],[-0.0664,0.09181,-0.03707,0.10786,-0.00687,0.10949]],[[0,-1.77898,1,3,9,0.52727,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,1.18021,-4,-5],[-0.06922,-0.0078,0.06341,-0.00709,0.09423,0.10821]],[[0,-1.65241,1,3,16,-0.0,2,-3,9,0.0,-1,-2,16,0.0,-4,4,0,-0.17416,-5,-6],[-0.01394,0.08469,-0.0648,0.09639,-0.03375,0.05972]],[[16,0.0,1,3,1,-2.41992,2,-3,9,0.61818,-1,-2,1,-0.41185,4,-6,9,0.80909,-4,-5],[-0.04695,0.06929,0.08707,-0.06462,0.03974,0.05214]],[[1,-0.92636,1,3,11,0.0,-1,2,1,-2.54895,-2,-3,11,0.0,4,-6,1,0.78111,-4,-5],[-0.05987,-0.00648,0.05725,0.00362,0.0853,0.09423]],[[9,0.0,1,4,0,0.0,2,3,11,0.0,-1,-2,0,1.70097,-3,-4,0,-3.17003,-5,-6],[-0.06025,-0.0022,0.02093,0.0832,-0.02856,0.08511]],[[9,0.0,1,3,0,0.46881,2,-3,11,0.0,-1,-2,0,-3.16569,-4,4,16,0.5,-5,-6],[-0.05855,-0.00108,0.0589,-0.03288,0.08666,0.03603]],[[0,-2.27047,1,3,9,0.76364,2,-3,16,-0.0,-1,-2,9,0.0,4,-6,0,1.39986,-4,-5],[-0.02249,-0.06032,0.04958,-0.01096,0.06967,0.08361]],[[0,-2.27047,1,2,11,0.0,-1,-2,16,0.0,3,4,5,0.0639,-3,-4,1,0.08023,-5,-6],[-0.05699,0.01119,0.05023,0.08157,-0.02336,0.05263]],[[11,0.0,1,3,1,-0.77032,-1,2,9,0.0,-2,-3,0,-2.32852,4,-6,9,0.0,-4,-5],[-0.05109,0.00574,0.07675,-0.0371,0.0601,0.07522]],[[0,-2.27047,1,3,9,0.76364,2,-3,11,0.0,-1,-2,9,0.0,4,-6,11,0.0,-4,-5],[-0.05539,-0.01673,0.04789,-0.01204,0.05932,0.0769]],[[9,0.0,1,3,1,0.0,2,-3,11,0.0,-1,-2,1,-2.41992,4,-6,16,0.0,-4,-5],[-0.04937,-0.00078,0.04613,0.0318,-0.03956,0.07105]],[[9,0.0,1,4,0,0.0,2,3,0,-2.32852,-1,-2,1,1.52357,-3,-4,0,-3.16569,-5,-6],[-0.0515,-0.0192,0.01501,0.06918,-0.02687,0.06501]],[[1,-0.88951,1,3,9,0.2,-1,2,16,0.0,-2,-3,16,-0.0,-4,4,9,0.0,-5,-6],[-0.04342,0.05167,-0.0198,0.06987,0.00235,0.06568]],[[0,-2.27047,1,3,9,0.76364,2,-3,11,0.0,-1,-2,16,0.0,-4,4,0,1.70097,-5,-6],[-0.04986,-0.01385,0.04016,0.05972,-0.01448,0.05975]]];
  var THRESHOLDS = {"text":{"strict":0.8433,"balanced":0.7107,"aggressive":0.7107},"reply":{"strict":0.66,"balanced":0.62,"aggressive":0.5}};
  var NG_RAW = "本鱼\t127\n本鲸\t112\n主人\t100\n喵\t94\n——\t91\n但是\t-86\n尾巴\t83\n—\t81\n「\t75\n句\t70\n~\t64\n啦\t64\n挺\t62\nω\t62\n。。\t-61\n省\t60\n喊\t60\n白饭\t60\n感觉\t-59\n而是\t59\nil\t59\n才不\t59\n劲\t58\n三百\t58\n收\t57\n却\t57\n狠\t57\n框\t56\n这份\t55\n哼\t55\n梗\t54\n让人\t53\n」\t52\n且\t-52\n替\t52\n真是\t-52\n账\t51\n应该\t-51\n这里\t-51\n帧\t51\n比如\t-51\n留\t50\n聊\t50\n,本\t50\n恶\t-50\n暖\t50\n嫌\t50\n鱼\t49\n饭\t49\n拆\t49\n工具\t49\n可以\t-48\n可能\t-48\n扎\t48\n比较\t-48\n焦虑\t48\nsee\t-48\n确实\t47\n;\t47\n不错\t-47\n小说\t-47\n感谢\t-47\n场\t46\n稳\t46\n平时\t46\n堂\t46\n之后,\t46\n、\t45\n往往\t45\n句话\t-45\n克制\t45\n诚\t45\n饿\t45\n\u0002(\t45\n啊\t-44\n顺\t44\n鲸\t44\n女\t-44\n挑\t44\n地方\t44\n整活\t44\nke\t44\n笑死\t44\n\u0002笑\t44\n\t-43\n本\t43\n秒\t43\n搞\t-43\n跳\t43\n,他\t-43\n记得\t-43\n,看完\t43\n反倒\t43\n心。\t43\n刷\t42\n才能\t-42\n横\t42\n甩\t42\n\u0002我\t-41\n真的\t-41\n串\t41\n或者\t-41\n跨\t41\ner\t41\n三连\t-41\n一切\t-41\n\u0003\t40\n这期\t40\n转\t40\n\u0002其实\t-40\n牛\t-40\n不用\t40\n松\t40\n就一\t40\n玩家\t40\n圣\t40\n挺好\t-40\n这套\t40\n先\t39\n些\t-39\n然后\t-39\n完全\t-39\n左\t-39\n只有\t-39\n般\t-39\n细节\t39\n听完\t39\n麻\t-39\n\u0002学\t39\n真\t38\n无\t-38\n底\t38\n还有\t-38\n这条\t38\n\u0002其\t-38\n一直\t-38\n呼\t38\n烂\t-38\n获\t-38\n稿\t38\n算\t37\n讲\t37\n,是\t37\n \t-37\n它\t37\n记\t37\n标\t37\n失\t37\n补\t37\n,有\t-37\n的不是\t37\n,在\t-37\n你的\t-37\n猫\t37\n民\t-37\n蓝\t37\n负\t37\n离谱\t37\n),\t-37\n漏\t37\n哪里\t-37\n把\t36\n着\t36\n条\t36\n没有\t-36\n现在\t-36\n透\t36\n”,\t36\n下,\t-36\n就会\t-36\n不少\t36\n还不\t-36\n\u0002想\t-36\n不得\t-36\n政\t-36\n耐\t36\n壳\t36\n武\t-36\n形象\t-36\n[\t-36\n,但是\t-35\n这样\t-35\n落\t35\n排\t35\n名字\t35\nap\t-35\n慢慢\t35\n视角\t35\n的就是\t35\n得\t34\n头\t34\n如\t-34\n哪\t34\n肥鱼\t-34\n压\t34\n问题\t-34\n原来\t34\n香\t34\nb站\t-34\n当时\t-34\n送\t-34\n心,\t34\n在我\t-34\n上头\t34\n边界\t34\n几天\t-34\n我真\t-34\n这\t33\n:\t33\n都是\t-33\n十\t33\n连\t33\n硬\t33\n切\t33\n,比\t33\n便\t-33\n答\t33\n奏\t33\n里面\t-33\n就算\t-33\n反\t32\n比\t32\n的是\t32\n国\t-32\n倒\t32\n值\t32\n那么\t-32\n静\t32\n过的\t32\n甚\t-32\n责\t32\n德\t-32\n哈哈哈\t-32\n\u0002最\t-32\nme\t32\n感\t31\n整\t31\n认\t31\n,就\t-31\n也是\t-31\n手机\t-31\n刚\t31\n....\t31\n反而\t31\n我这\t31\n基本\t-31\n看的\t-31\n停\t31\n部分\t-31\n特别\t-31\n日常\t31\n右\t-31\n除了\t-31\n成一\t31\n一般\t-31\nco\t31\n参数\t31\n门槛\t31\n槛\t31\n之间\t31\n那\t30\n靠\t30\n以为\t30\n参\t30\n味\t30\n模型\t30\n\u0002真\t-30\n据\t-30\n。你\t30\n滑\t30\n戳\t30\n问题,\t-30\n事情\t-30\n狂\t-30\n一旦\t30\n。不过\t30\n他\t-29\n为\t-29\n于\t-29\n不过\t29\n热\t29\n亮\t29\n飞\t-29\n七\t29\n将\t-29\n论区\t29\n一定\t-29\n。。\u0003\t-29\n,每\t-29\n哈哈\t29\n上一\t29\n来说\t-29\n进来\t29\n。\u0003\t28\n只\t28\n分\t28\n别\t28\n们\t-28\n号\t28\n视频\t-28\n台\t28\n越\t28\n满\t28\n翻\t28\n的那\t28\n看完\t28\n验\t28\n谱\t28\n喜欢\t-28\n近\t-28\n初\t-28\n不出\t-28\n取\t-28\n顺着\t28\n愿意\t28\n暴\t-28\n根本\t-28\n,结\t28\n旦\t28\n第一次\t-28\n心\t27\n数\t27\n吧\t-27\n其实\t27\n服\t27\n巴\t27\n的话\t-27\n站\t27\n之前\t-27\n非\t-27\n我不\t27\n要是\t27\n一路\t27\n群\t-27\n,能\t27\n搭\t27\n得很\t27\n甚至\t-27\n感,\t27\n别人\t-27\n铺\t27\n引\t-27\n炸\t-27\n科普\t27\n看见\t27\n就是\t-26\n\u0002\t-26\n名\t26\n层\t26\n声\t26\n掉\t26\n都在\t26\n好像\t-26\n..\u0003\t-26\n请\t-26\n画面\t26\n理论\t-26\n,所以\t-26\n从来\t26\n十年\t26\n隔\t26\n录\t26\n不在\t26\n最\t25\n里\t25\n才\t25\n被\t25\n之\t-25\n总\t25\n改\t25\n至\t-25\n利\t-25\n准\t25\n言\t-25\n只能\t-25\n世界\t-25\n顶\t25\n温\t25\n\u0002把\t25\n逻\t25\n偏\t25\n屏\t25\n。。。\t-25\n,先\t25\n从来不\t25\n继\t-25\n算是\t-25\n手\t24\n住\t24\n听\t24\n谁\t24\n乐\t24\n来的\t24\n真正\t24\n较\t-24\n除\t-24\n是有\t-24\n战\t-24\n多少\t-24\n容易\t24\n...\u0003\t-24\n客\t24\n背后\t24\n存在\t-24\n刀\t-24\n兴\t24\n夸\t24\n上了\t24\n插件\t24\n既\t24\n可爱\t-24\n不是\t23\n清\t23\n同\t23\n怕\t23\n气\t23\n开始\t-23\n份\t23\n往\t23\n按\t23\n测\t23\n源\t23\n,然后\t-23\n查\t23\n何\t-23\n人\u0003\t23\n)\u0003\t23\n不知道\t-23\n我都\t-23\n\u0002从\t23\n捏\t23\n密\t23\n系统\t23\n希\t-23\n个\t-22\n笑\t22\n段\t22\n写\t22\n懂\t22\n部\t-22\n尾\t22\n推\t22\n.\t22\n位\t22\n遍\t22\n立\t22\n并\t-22\n交\t22\n风\t22\n报\t22\n的一\t-22\n,然\t-22\n一些\t-22\n呀\t22\n居然\t22\n围\t22\n贴\t22\n竟\t22\n不行\t-22\n爆\t-22\n久\t22\n\u0002小\t22\n\u0002哈\t22\n。不\t22\n那条\t22\n,这\t21\n全\t21\n中\t-21\n去\t-21\n配\t21\nk\t21\n4\t-21\n啥\t-21\n持\t-21\n始\t-21\n半\t21\n到了\t-21\n\u0002\u0003\t-21\n书\t-21\n\u0002那\t-21\n背\t21\n及\t-21\n敢\t21\n曲\t21\n么多\t-21\n不住\t21\n。\t20\n要\t-20\n吗\t-20\n还是\t-20\n0\t-20\n等\t20\n玩\t-20\n\u0002你\t-20\n的。\t-20\n影\t-20\n走\t20\n居\t20\n核\t20\n念\t20\n小时\t20\n,别\t20\n归\t20\n致\t-20\n逻辑\t20\n质\t-20\n页\t20\n分钟\t20\n这是\t-20\n下去\t20\n20\t20\n古\t-20\n业\t-20\n说话\t20\n看\t19\n还\t19\n但\t19\n开\t19\n了\u0003\t-19\n可\t19\n从\t19\n死\t-19\n卡\t19\n买\t-19\n啊\u0003\t19\n导\t-19\n破\t19\n你们\t19\n你这\t-19\n帮\t-19\n我觉\t-19\n我觉得\t-19\n鱼,\t19\n丢\t19\n实\t18\n在\t18\n说\t18\n很\t-18\n路\t18\n力\t-18\n因为\t-18\n,你\t-18\n克\t18\n步\t18\n干\t18\n区\t-18\n看看\t-18\n一样\t-18\n沉\t18\n脑\t18\nde\t18\n,\t17\n成\t17\n高\t-17\n门\t17\n拿\t17\n一点\t-17\n图\t17\n她\t-17\n剩\t17\n冷\t17\n一条\t17\n面的\t-17\n米\t17\n,这个\t-17\n终\t17\n嘴\t17\n内\t-17\n以前\t17\n编\t17\n顺手\t17\n了,\t-16\n的,\t-16\n换\t16\n地\t-16\n三\t16\n零\t16\n是不是\t-16\n儿\t16\n友\t16\n追\t16\np\t-16\n那一\t16\n插\t16\n里,\t16\n害\t-16\n微\t-16\n象\t16\n那个\t-16\n+\t-16\n本身\t16\n以\t-15\n点\t15\n当\t15\n变\t15\n两\t15\n人类\t15\n词\t15\n第\t15\n证\t15\n够\t15\n出来的\t15\n愿\t15\n字\t15\n历\t-15\n,只是\t15\nup\t-15\n,没\t-15\n叫\t15\n不好\t-15\n给我\t-15\n来不\t15\n想到\t-15\n级\t-15\n我\t14\n子\t14\n起\t14\n进\t14\n作\t-14\n重\t14\n观\t14\n时候\t-14\n思\t-14\n放\t-14\n加\t-14\n性\t-14\n代\t14\n紧\t14\n戏\t14\n,那\t-14\n限\t14\n带\t14\n西\t-14\n影响\t-14\n自\t13\n话\t13\n!\t13\n理\t13\n,我\t-13\n件\t13\n口\t13\n应\t-13\n,还\t-13\n画\t13\n候\t-13\n1\t-13\n外\t13\n相\t-13\n吗?\t-13\n神\t-13\n8\t13\n直\t13\n早\t13\n觉得\t-13\n有点\t13\n基\t-13\n使\t-13\n安\t13\n第一\t-13\n己的\t-13\n自己的\t-13\n算力\t13\n么\t-12\n出\t12\n题\t12\n少\t12\n这个\t-12\n者\t-12\n片\t12\n线\t12\n\u0002这\t-12\n光\t12\n世\t-12\n未\t12\n慢\t12\n二\t-12\n是最\t-12\n注\t12\n节奏\t12\n语\t12\n东西\t12\n极\t-12\n大家\t12\n刻\t12\n\u0002看\t12\n也\t11\n想\t11\n所\t-11\n度\t11\n原\t11\n肥\t-11\n是不\t-11\n单\t11\n而且\t-11\n次\t11\n见\t11\n节\t11\n特\t-11\n间\t11\n这些\t-11\n也不\t-11\n格\t11\n包\t-11\n是一\t-11\n,而且\t-11\n望\t-11\n看着\t11\n差\t11\n了\t10\n是\t10\n的\t-10\n觉\t-10\n?\t-10\n到\t10\n我们\t-10\n了\t-10\n知\t-10\n界\t10\n张\t10\n事\t10\n价\t10\n2\t-10\n色\t10\n欢\t10\n文\t-10\nep\t10\n用\t-10\n板\t10\n了。\u0003\t-10\n有\t-9\n人\t9\n下\t9\n多\t-9\n3\t-9\n与\t9\n新\t9\n套\t9\n知道\t9\n白\t9\n\u0003\t9\n工\t8\n评\t8\n和\t8\n像\t8\n方\t8\n电\t-8\n轻\t8\n息\t8\n问\t8\n视\t7\n大\t-7\n了。\t-7\n边\t7\n容\t7\n果\t-7\n\t-7\nl\t-7\n具\t7\n)\t7\n自己\t7\n一\t6\n动\t6\nb\t-6\n模\t6\n细\t6\n你\t-6\n公\t6\n日\t6\ng\t-6\n经\t6\n科\t6\nd\t-5\n接\t5\n行\t5\n难\t5\nai\t-5\n再\t5\n强\t-5\n肯\t5\n一个\t5\ndee\t5\nu\t5\n达\t-5\n了一\t-5\na\t-4\n没\t4\n后\t4\n而\t-4\n小\t-4\n确\t-4\n回\t4\n会\t-4\n太\t4\n过\t4\n就\t3\n不\t-3\n结\t3\n预\t3\n更\t-2\nt\t-1";

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

  return { version: 'ojinjin-rules-pro', thresholds: THRESHOLDS, scoreText: scoreText, scoreReply: scoreReply, isAiText: isAiText, isAiReply: isAiReply };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = OjinjinRules; }
