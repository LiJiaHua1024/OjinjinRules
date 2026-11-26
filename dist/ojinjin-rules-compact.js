/* OjinjinRules (ojinjin-rules-compact) v2.0 — Pure ES5 JS Distilled Rule Engine
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

  var NG_SCALE = 0.01381799;
  var LIN_BIAS = -3.654161;
  var STYLE_W = [0.866907, -0.126342, 0.039055, -0.274642, 0.097129, 0.207006, 0.018331, -0.533501, -0.179671, 0.659779, 0.118728, 0.063905, -0.263395, 0.301112, -0.204761, 0.011122, 0.101831, 0.365368, -0.035469, 0.296299, 0.057704, 0.035424, 0.070807, -0.469293, -1.627051, -0.841894, -1.064769, 1.355611, -0.59266, 0.73595, 0.906137, 0.208671, -0.375783, 0.34484, 0.222388, 0.069298, -0.035844, -0.671101];
  var META_LIN_W = null;
  var META_LIN_B = 0;
  var TEXT_TREES_RAW = [[[0,-0.3203,1,4,0,-1.36911,2,3,0,-2.10868,-1,-2,0,-0.91103,-3,-4,0,0.28153,5,-7,30,0.71064,-5,-6],[-1.50159,-1.46844,-1.4182,-1.36072,-1.37491,-1.24348,-1.07076]],[[1,4.04618,1,3,1,2.93362,-1,2,2,-1.27536,-2,-3,2,-2.27283,4,5,1,5.5955,-4,-5,1,4.9199,-6,-7],[-0.06847,-0.06089,0.09862,-0.0478,0.1128,0.18259,0.27222]],[[0,-0.62225,1,4,0,-1.58494,2,3,0,-2.2696,-1,-2,0,-1.10302,-3,-4,0,0.14801,5,-7,30,0.97333,-5,-6],[-0.07655,-0.05133,-0.01746,0.02617,0.1106,0.01489,0.21964]],[[0,-0.62225,1,4,0,-1.61834,2,3,0,-2.33939,-1,-2,3,0.66013,-3,-4,0,0.14801,5,-7,27,0.94719,-5,-6],[-0.07434,-0.0485,0.01639,-0.03166,0.09837,0.0162,0.18808]],[[0,-0.62225,1,4,0,-1.54493,2,3,0,-2.10868,-1,-2,3,0.66013,-3,-4,0,0.40217,5,-7,27,0.94754,-5,-6],[-0.07169,-0.04076,0.02066,-0.02666,0.09906,0.00919,0.16653]],[[0,-0.77883,1,3,0,-2.00552,-1,2,0,-1.36911,-2,-3,0,0.0,4,5,30,0.78521,-4,-5,30,0.99038,-6,-7],[-0.06873,-0.03191,0.00618,0.01895,0.07367,0.14762,0.04559]],[[0,-0.77883,1,3,0,-1.89466,-1,2,0,-1.21327,-2,-3,0,0.28153,4,5,30,0.77431,-4,-5,30,0.99038,-6,-7],[-0.06589,-0.02498,0.00899,0.01638,0.07144,0.1353,0.04615]],[[0,-0.77883,1,4,0,-1.83827,2,3,0,-2.65602,-1,-2,3,0.66327,-3,-4,0,0.53398,5,-7,27,0.95472,-5,-6],[-0.0674,-0.04862,-0.00098,-0.04137,0.06887,-0.00714,0.12657]],[[0,-0.91103,1,3,0,-2.00552,-1,2,32,0.0,-2,-3,0,0.0,4,5,30,0.76948,-4,-5,3,0.5696,-6,-7],[-0.06228,-0.0212,0.0447,0.00186,0.05208,0.06687,0.11716]],[[0,-0.77883,1,4,0,-1.83827,2,3,0,-2.73658,-1,-2,0,-1.36911,-3,-4,0,0.8145,5,-7,30,0.99038,-5,-6],[-0.06393,-0.04448,-0.02394,0.00617,0.06193,-0.00244,0.11159]],[[0,-0.77883,1,3,0,-1.97693,-1,2,3,0.66013,-2,-3,0,0.53398,4,5,0,-0.3203,-4,-5,3,0.5696,-6,-7],[-0.05808,-0.0018,-0.04134,0.02388,0.06106,0.05856,0.10702]],[[1,3.9779,1,3,1,2.51354,-1,2,2,-1.17026,-2,-3,2,-2.15453,4,5,1,6.00207,-4,-5,1,5.11125,-6,-7],[-0.05078,-0.04486,0.03281,-0.03261,0.05406,0.06678,0.10006]],[[0,-1.10302,1,4,0,-2.48345,2,3,29,0.77925,-1,-2,0,-1.36911,-3,-4,0,0.53398,5,-7,27,0.95472,-5,-6],[-0.05772,0.00785,-0.02928,0.00498,0.04194,-0.03066,0.09241]],[[0,-0.91103,1,3,0,-2.31878,-1,2,0,-1.36911,-2,-3,0,0.6842,4,5,27,0.95472,-4,-5,30,0.96039,-6,-7],[-0.05462,-0.02579,0.00013,0.0396,-0.02203,0.08992,0.02849]],[[1,3.86549,1,3,1,2.24217,-1,2,2,-1.1785,-2,-3,2,-2.15453,4,5,1,6.00207,-4,-5,1,4.83276,-6,-7],[-0.04665,-0.04137,0.02242,-0.03684,0.04516,0.04781,0.0852]],[[0,-0.3203,1,4,0,-2.10868,2,3,0,-2.73658,-1,-2,8,1.30208,-3,-4,0,1.04565,5,-7,30,0.99038,-5,-6],[-0.05313,-0.03464,0.00087,-0.04106,0.05463,-0.01028,0.08347]],[[0,-0.77883,1,4,0,-1.61834,2,3,0,-3.15122,-1,-2,3,0.66013,-3,-4,0,0.8145,5,-7,3,0.55234,-5,-6],[-0.05323,-0.03422,0.01165,-0.02524,0.00587,0.04093,0.07724]],[[0,-0.3203,1,4,0,-2.22521,2,3,0,-3.41229,-1,-2,3,0.66636,-3,-4,0,1.26953,5,-7,30,0.65174,-5,-6],[-0.05283,-0.03924,0.00274,-0.03151,-0.02213,0.04579,0.07794]],[[0,-1.10302,1,3,0,-2.51971,-1,2,8,0.93417,-2,-3,0,0.8145,4,5,3,0.48623,-4,-5,3,0.5696,-6,-7],[-0.04655,-0.01012,-0.03904,-0.02052,0.02775,0.03383,0.07415]],[[0,-0.3203,1,4,0,-2.22521,2,3,0,-3.38857,-1,-2,30,0.82274,-3,-4,0,1.26953,5,-7,30,0.65174,-5,-6],[-0.04863,-0.03582,-0.0245,0.00526,-0.0264,0.04306,0.07113]],[[0,-0.23107,1,4,0,-1.58494,2,3,0,-2.65602,-1,-2,30,0.83399,-3,-4,3,0.5696,-5,5,3,0.86127,-6,-7],[-0.04342,-0.02302,-0.01424,0.01368,0.01819,0.06456,-0.00517]],[[0,-1.36911,1,3,0,-2.51971,-1,2,8,0.93417,-2,-3,0,0.8145,4,5,27,0.95472,-4,-5,30,0.94936,-6,-7],[-0.04149,-0.01188,-0.0381,0.01933,-0.0303,0.06535,0.0182]],[[0,-0.3203,1,4,0,-2.10868,2,3,0,-3.15122,-1,-2,3,0.66636,-3,-4,0,1.04565,5,-7,3,0.53975,-5,-6],[-0.0424,-0.02562,0.00428,-0.02495,-0.0061,0.03363,0.06116]],[[1,4.35224,1,4,1,2.24217,2,3,3,0.83895,-1,-2,2,-1.15019,-3,-4,2,-2.01196,-5,5,3,0.5696,-6,-7],[-0.03199,0.03566,-0.02459,0.01826,-0.00227,0.01073,0.05633]],[[1,4.29822,1,4,2,-1.28642,2,3,19,0.0,-1,-2,1,1.61705,-3,-4,1,5.49778,5,-7,2,-1.49193,-5,-6],[-0.03578,0.00566,-0.03011,0.00687,-0.00525,0.03712,0.05781]],[[0,-0.3203,1,4,0,-2.40481,2,3,29,0.77925,-1,-2,27,0.95261,-3,-4,0,1.63496,5,-7,30,0.62056,-5,-6],[-0.0346,0.02276,0.00014,-0.03777,-0.03154,0.03015,0.05852]],[[0,-1.21327,1,3,0,-3.12233,-1,2,3,1.00591,-2,-3,0,0.93195,4,5,40,0.0,-4,-5,3,0.58524,-6,-7],[-0.03668,-0.01744,0.03697,0.04947,0.01037,0.01673,0.05455]],[[3,0.50335,1,3,17,0.52559,2,-3,9,0.49959,-1,-2,2,-1.94522,4,5,19,0.0,-4,-5,16,0.13029,-6,-7],[-0.03354,0.00911,-0.01116,-0.03231,0.01488,0.00636,0.03186]],[[0,-0.23107,1,4,0,-2.65602,2,3,29,0.77925,-1,-2,27,0.9646,-3,-4,30,0.95061,5,-7,30,0.57977,-5,-6],[-0.03193,0.02391,-0.00239,-0.0399,-0.02588,0.04369,-0.01168]],[[0,-0.12302,1,3,0,-2.10868,-1,2,32,0.0,-2,-3,3,0.64692,4,5,30,0.99038,-4,-5,3,0.92837,-6,-7],[-0.027,-0.00537,0.04612,0.02296,-0.01692,0.05135,-0.0174]],[[1,4.83276,1,3,3,0.46715,-1,2,2,-1.28642,-2,-3,16,0.12526,4,5,2,-1.19784,-4,-5,3,0.86316,-6,-7],[-0.02671,-0.02293,0.00994,-0.00534,0.03172,0.05037,0.00961]],[[0,-1.21327,1,3,0,-3.40089,-1,2,30,0.32467,-2,-3,0,1.51263,4,5,27,0.9513,-4,-5,3,0.6127,-6,-7],[-0.03098,0.03432,-0.01446,0.01594,-0.02477,0.02221,0.04952]],[[0,-1.36911,1,3,0,-3.15122,-1,2,10,0.41415,-2,-3,0,1.51263,4,5,40,0.0,-4,-5,5,0.0,-6,-7],[-0.02791,-0.01372,0.02662,0.03915,0.00555,0.023,0.04729]],[[0,-0.23107,1,3,0,-2.65602,-1,2,3,0.66636,-2,-3,3,0.5696,4,5,0,1.63496,-4,-5,30,0.57382,-6,-7],[-0.0236,0.00453,-0.02385,-0.00655,0.02039,-0.02653,0.03827]],[[0,-0.77883,1,3,0,-3.12233,-1,2,32,0.0,-2,-3,0,1.26953,4,5,27,0.94754,-4,-5,23,0.41667,-6,-7],[-0.0257,-0.0101,0.03278,0.01465,-0.02366,0.0405,-0.0031]],[[0,-1.21327,1,3,0,-3.41229,-1,2,1,2.80808,-2,-3,0,1.26953,4,5,27,0.95355,-4,-5,23,0.41667,-6,-7],[-0.02556,-0.00506,-0.02455,0.01299,-0.03003,0.03871,-0.00586]],[[0,0.14801,1,4,0,-1.86586,2,3,29,0.77925,-1,-2,3,0.66013,-3,-4,3,0.64345,-5,5,3,0.86127,-6,-7],[-0.01823,0.03808,0.00687,-0.021,0.01082,0.04066,-0.01161]],[[1,5.31231,1,4,2,-2.15453,2,3,27,0.64312,-1,-2,27,0.96319,-3,-4,2,-2.74553,-5,5,23,0.41667,-6,-7],[0.01223,-0.02946,0.00061,-0.02315,-0.00725,0.03547,-0.00453]],[[0,-1.10302,1,3,10,0.56687,2,-3,3,0.66013,-1,-2,3,0.56404,4,5,37,0.0,-4,-5,10,0.0,-6,-7],[-0.0108,-0.03028,0.03254,-0.01541,0.01664,0.02684,-0.02381]],[[0,0.14801,1,4,0,-2.10868,2,3,29,0.77925,-1,-2,8,1.30208,-3,-4,3,0.5696,-5,5,3,0.92837,-6,-7],[-0.01593,0.03445,0.00548,-0.02731,-0.00691,0.03049,-0.02097]]];
  var META_TREES_RAW = [[[1,-0.39325,1,3,11,0.0,-1,2,0,-2.42984,-2,-3,16,0.0,-4,4,0,1.20786,-5,-6],[-1.47317,-1.32963,-1.14789,-1.03451,-1.35459,-1.12144]],[[9,0.0,1,3,1,0.20357,2,-3,11,0.0,-1,-2,1,-2.80874,4,-6,11,0.0,-4,-5],[-0.08297,0.02117,0.2122,-0.04793,0.12757,0.26926]],[[9,0.0,1,3,0,-0.07974,2,-3,11,0.0,-1,-2,0,-2.96513,4,-6,16,0.0,-4,-5],[-0.08201,0.00225,0.1596,0.10679,-0.05708,0.22383]],[[9,0.0,1,4,0,-0.2175,2,3,16,-0.0,-1,-2,16,0.0,-3,-4,0,-3.06959,-5,-6],[-0.00138,-0.08003,0.17858,0.06378,-0.0042,0.18711]],[[11,0.0,1,3,1,-0.08092,2,-3,9,0.52727,-1,-2,0,-2.19809,4,-6,9,0.2,-4,-5],[-0.07667,0.06783,0.1247,-0.03867,0.14589,0.17177]],[[0,-1.08173,1,3,16,-0.0,2,-3,1,-2.53604,-1,-2,16,0.5,-4,4,1,0.42151,-5,-6],[0.01152,0.09442,-0.0748,0.15502,-0.0254,0.11857]],[[9,0.0,1,3,0,-0.07974,2,-3,11,0.0,-1,-2,16,0.5,-4,4,0,-1.08173,-5,-6],[-0.07385,-0.00974,0.09517,0.14276,-0.04737,0.12106]],[[0,-1.35467,1,3,9,0.52727,2,-3,11,0.0,-1,-2,16,0.5,-4,4,1,0.77145,-5,-6],[-0.07452,-0.0094,0.09463,0.13036,-0.02657,0.11029]],[[0,-1.35467,1,3,9,0.52727,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,0.99909,-4,-5],[-0.07225,-0.01034,0.08617,-0.00261,0.10158,0.12855]],[[0,-1.82302,1,3,9,0.45455,-1,2,16,0.5,-2,-3,16,0.0,-4,4,0,1.44864,-5,-6],[-0.06836,0.09537,-0.02296,0.11476,-0.01835,0.09828]],[[9,0.0,1,4,0,-0.15542,2,3,11,0.0,-1,-2,16,0.0,-3,-4,0,-3.13532,-5,-6],[-0.06736,-0.00501,0.10032,0.02241,-0.02241,0.10504]],[[0,-1.82302,1,3,9,0.52727,-1,2,16,0.5,-2,-3,16,0.0,-4,4,0,1.44864,-5,-6],[-0.06445,0.08253,-0.01832,0.10154,-0.01817,0.0914]],[[0,-1.35467,1,3,9,0.2,-1,2,16,0.0,-2,-3,16,0.5,-4,4,0,1.20786,-5,-6],[-0.06144,0.08463,-0.02766,0.09565,-0.02139,0.07293]],[[16,0.0,1,3,1,-2.33956,2,-3,9,0.61818,-1,-2,1,0.30895,4,-6,9,0.80909,-4,-5],[-0.04341,0.0764,0.08649,-0.06218,0.05235,0.0624]],[[0,-1.08173,1,2,11,0.0,-1,-2,15,0.0,3,4,0,0.99909,-3,-4,1,0.53733,-5,-6],[-0.06006,0.03853,0.0574,0.09704,-0.02591,0.05692]],[[9,0.0,1,3,0,-0.78006,-1,2,0,1.81358,-2,-3,0,-2.82779,4,-6,11,0.0,-4,-5],[-0.05511,0.00756,0.08353,-0.0395,0.05965,0.08794]],[[9,0.0,1,3,0,0.51225,2,-3,11,0.0,-1,-2,1,-1.94658,4,-6,16,0.0,-4,-5],[-0.05733,-0.00253,0.05472,0.05407,-0.04253,0.08644]],[[0,-1.82302,1,3,9,0.76364,2,-3,16,-0.0,-1,-2,9,0.0,4,-6,0,1.66802,-4,-5],[-0.00947,-0.05929,0.06019,-0.00257,0.07381,0.08501]],[[16,0.0,1,3,0,-2.19809,2,-3,1,-3.09012,-1,-2,1,-0.95652,-4,4,0,1.44864,-5,-6],[-0.02731,0.02433,0.07126,-0.05565,-0.00107,0.05851]],[[11,0.0,1,3,1,-1.04041,-1,2,9,0.0,-2,-3,1,-2.35572,4,-6,9,0.0,-4,-5],[-0.05211,-0.00383,0.07381,-0.04438,0.05202,0.07148]],[[9,0.0,1,3,0,-1.85013,-1,2,0,1.81358,-2,-3,0,-2.83629,4,-6,11,0.0,-4,-5],[-0.0516,-0.00076,0.06855,-0.03612,0.04328,0.07356]],[[16,0.0,1,3,1,-1.24434,2,-3,9,0.0,-1,-2,1,0.77145,4,-6,9,0.80909,-4,-5],[-0.02724,0.0511,0.06933,-0.04845,0.04296,0.04942]],[[9,0.0,1,4,0,-0.78006,2,3,0,-2.63512,-1,-2,0,1.81358,-3,-4,0,-3.15202,-5,-6],[-0.05317,-0.02186,0.00209,0.06295,-0.02664,0.06308]],[[16,0.0,1,3,1,-1.87423,2,-3,9,0.0,-1,-2,1,-0.95652,-4,4,9,0.0,-5,-6],[-0.03782,0.03961,0.06015,-0.04791,-0.00623,0.06549]],[[11,0.0,1,3,1,-0.95652,-1,2,9,0.0,-2,-3,0,-2.63512,4,-6,9,0.0,-4,-5],[-0.04447,-3e-05,0.06279,-0.03663,0.03981,0.05938]]];
  var THRESHOLDS = {"text":{"strict":0.859,"balanced":0.7157,"aggressive":0.7157},"reply":{"strict":0.7638,"balanced":0.6334,"aggressive":0.5263}};
  var NG_RAW = "本鱼\t127\n本鲸\t118\n尾巴\t91\n主人\t90\n但是\t-89\n喵\t88\n——\t82\n。。\t-82\n「\t73\n比较\t-72\n—\t69\n且\t-68\n白饭\t66\n让人\t63\n喊\t63\n拆\t62\n啦\t59\n帧\t58\n真是\t-58\n省\t56\n却\t56\n然后\t-56\n女\t-55\n这里\t-55\n应该\t-54\n牛\t-54\n挺\t53\n工具\t53\n感觉\t-53\n可能\t-53\n顺\t52\n劲\t52\n不错\t-52\n句\t51\n而是\t51\n~\t51\n稳\t48\n梗\t48\n狠\t48\n替\t47\n,他\t-47\n留\t46\n账\t46\n这期\t46\n可以\t-46\n收\t45\n,本\t45\n地方\t45\n记得\t-45\n民\t-45\n聊\t44\n;\t44\n如\t-44\n搞\t-44\n开始\t-44\n补\t43\n跳\t43\n扎\t43\n真的\t-43\n完全\t-43\n只有\t-43\n\u0002其实\t-43\n、\t42\n串\t42\n\u0003\t41\n」\t41\n还有\t-41\n\u0002其\t-41\n场\t40\n刷\t40\n挑\t40\n些\t-40\n你的\t-40\n鱼\t39\n确实\t39\n饭\t39\n现在\t-39\n鲸\t38\n透\t38\n\t-38\n,有\t-38\n或者\t-38\n至\t-38\n先\t37\n不过\t37\n排\t37\n都是\t-37\n,是\t36\n十\t36\n名\t36\n来的\t36\n啊\t-36\n国\t-36\n把\t35\n整\t35\n标\t35\n倒\t35\n落\t35\n秒\t35\n转\t35\n\u0002我\t-35\n没有\t-35\n底\t34\n以为\t34\n无\t-34\n真\t33\n讲\t33\n记\t33\n份\t33\n猫\t33\n这样\t-33\n,在\t-33\n条\t32\n头\t32\n失\t32\n参\t32\n的不是\t32\n左\t-32\n那么\t-32\n着\t31\n反\t31\n心\t31\n压\t31\n....\t31\n,但是\t-31\n也是\t-31\n感\t30\n靠\t30\n的那\t30\n为\t-30\n部\t-30\n利\t-30\n本\t29\n的是\t29\n越\t29\n硬\t29\n,比\t29\n这条\t29\n便\t-29\n它\t28\n笑\t28\n认\t28\nk\t28\n其实\t28\n满\t28\n层\t28\n算\t27\n听\t27\n值\t27\n服\t27\n翻\t27\n反而\t27\n\u0002\t-27\n手机\t-27\n得\t26\n住\t26\n配\t26\n路\t26\n切\t26\n们\t-26\n,就\t-26\n台\t25\n怕\t25\n他\t-25\n肥鱼\t-25\n持\t-25\n,你\t-25\n这\t24\n只\t24\n才\t24\n:\t24\n连\t24\n从\t24\n谁\t24\n刚\t24\n气\t24\n \t-24\n吧\t-24\n视频\t-24\n0\t-24\n问题\t-24\n的话\t-24\n啥\t-24\n比\t23\n里\t23\n被\t23\n数\t23\n段\t23\n热\t23\n清\t23\n乐\t23\n之\t-23\n4\t-23\n的。\t-23\n时候\t-23\n分\t22\n手\t22\n号\t22\n声\t22\n就是\t-22\n\u0002你\t-22\n同\t21\n尾\t21\n门\t21\n吗\t-21\n那\t20\n于\t-20\n中\t-20\n一直\t-20\n看\t19\n还\t19\n哪\t19\n写\t19\n懂\t19\n总\t19\n真正\t19\n原\t19\n要\t-19\n玩\t-19\n开\t18\n,这\t18\n点\t18\n全\t18\n推\t18\n等\t18\n进\t18\n改\t18\n可\t17\n换\t17\n件\t17\n还是\t-17\n所\t-17\n。\t16\n但\t16\n别\t16\n个\t-16\n因为\t-16\n最\t15\n变\t15\n重\t15\n的,\t-15\n力\t-15\n在\t14\n巴\t14\n去\t-14\n高\t-14\n,\t13\n成\t13\n说\t13\n当\t13\n了\u0003\t-13\n作\t-13\n者\t-13\n应\t-13\n地\t-13\n思\t-13\n。\u0003\t12\n不是\t12\n实\t12\n评\t12\n两\t12\n以\t-12\n觉\t-12\n?\t-12\n这个\t-12\n,还\t-12\n自\t11\n子\t11\n观\t11\n么\t-11\n起\t10\n很\t-10\nd\t-10\n也\t9\n想\t9\n话\t9\n出\t9\n度\t9\n的\t-9\na\t-9\n,我\t-9\n我\t8\n是\t8\n少\t8\n下\t8\n了,\t-8\n死\t-8\n!\t7\n.\t7\n到\t7\n题\t7\n有\t-7\n工\t6\n人\t5\n没\t5\n大\t-5\n理\t4\n了\t3\n一\t3\n就\t3";

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
