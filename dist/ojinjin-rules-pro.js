/* OjinjinRules (ojinjin-rules-pro) v2.1 — Pure ES5 JS Distilled Rule Engine
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

  var NG_SCALE = 0.01634106;
  var LIN_BIAS = -3.938262;
  var STYLE_W = [0.357798, 0.026365, -0.088523, -0.390092, -0.077839, -0.074754, 0.057111, -0.658176, 0.571495, 0.539283, 0.043877, 0.03449, -0.410301, 0.594485, -0.111864, -0.174127, 0.374387, 0.116661, 0.184034, -0.03513, 0.107417, 0.073136, -0.053787, -0.285597, -0.952763, -0.257244, -0.679493, 0.522849, -0.515218, 0.543937, 1.685651, 0.433049, -0.404125, 0.029301, 0.405644, 0.388392, 0.269564, -0.522386];
  var META_LIN_W = null;
  var META_LIN_B = 0;
  var TEXT_TREES_RAW = [[[0,-0.62958,1,4,0,-1.59656,2,3,0,-2.42691,-1,-2,0,-0.97599,-3,-4,0,0.36192,5,-7,0,-0.33796,-5,-6],[-2.14822,-2.10733,-2.0133,-1.87024,-1.83305,-1.69627,-1.45473]],[[1,4.90479,1,3,1,3.56284,-1,2,2,-1.4532,-2,-3,2,-2.2071,4,5,1,6.49816,-4,-5,1,5.64917,-6,-7],[-0.0626,-0.05321,0.17156,-0.02308,0.21416,0.26088,0.37059]],[[0,-0.97599,1,4,0,-1.96469,2,3,0,-2.64438,-1,-2,0,-1.52991,-3,-4,0,0.0,5,-7,27,0.95354,-5,-6],[-0.06928,-0.04458,-0.00098,0.06264,0.17697,0.0495,0.27235]],[[0,-1.16632,1,4,0,-2.00398,2,3,0,-2.71556,-1,-2,0,-1.59656,-3,-4,0,-0.17964,-5,5,0,1.64368,-6,-7],[-0.06773,-0.04613,-0.00782,0.03966,0.1235,0.19335,0.2349]],[[0,-1.16632,1,4,0,-2.08444,2,3,0,-2.82758,-1,-2,0,-1.59656,-3,-4,0,0.763,5,-7,0,-0.75241,-5,-6],[-0.06632,-0.04774,-0.01214,0.03227,0.0772,0.14135,0.19438]],[[0,-1.24693,1,3,0,-2.16005,-1,2,0,-1.76769,-2,-3,0,-0.17964,4,5,0,-0.97599,-4,-5,0,1.16438,-6,-7],[-0.06267,-0.01787,0.01939,0.04595,0.09548,0.13766,0.17276]],[[0,-1.32271,1,3,0,-2.16005,2,-3,0,-2.98672,-1,-2,0,0.17229,4,5,0,-0.86738,-4,-5,0,1.64368,-6,-7],[-0.06335,-0.04693,-0.00236,0.04994,0.09346,0.1291,0.15739]],[[0,-1.39734,1,3,0,-2.16005,2,-3,0,-2.82758,-1,-2,0,0.17229,4,5,0,-0.62958,-4,-5,0,1.64368,-6,-7],[-0.06125,-0.04207,-0.00398,0.05163,0.0897,0.11643,0.14318]],[[0,-1.39734,1,3,0,-2.48609,-1,2,0,-1.96469,-2,-3,0,0.53935,4,5,0,-0.49502,-4,-5,0,2.14031,-6,-7],[-0.05864,-0.02995,0.00475,0.04677,0.08579,0.11367,0.13406]],[[0,-1.32271,1,3,0,-2.48609,-1,2,0,-1.76769,-2,-3,0,0.17229,4,5,0,-0.62958,-4,-5,0,1.39921,-6,-7],[-0.05698,-0.02347,0.01211,0.04089,0.07275,0.0954,0.12172]],[[0,-1.39734,1,4,0,-2.39706,2,3,0,-3.02123,-1,-2,3,0.60404,-3,-4,0,0.53935,5,-7,0,-0.33796,-5,-6],[-0.05662,-0.04247,0.00437,-0.02796,0.03947,0.07297,0.10864]],[[1,4.31478,1,3,1,2.90335,-1,2,2,-1.31446,-2,-3,2,-2.37454,4,5,1,7.17255,-4,-5,1,6.1214,-6,-7],[-0.04868,-0.04353,0.03262,-0.03524,0.05867,0.06035,0.10577]],[[0,-1.52991,1,3,0,-2.5143,-1,2,3,0.65032,-2,-3,0,0.53935,4,5,0,-0.97599,-4,-5,0,2.14031,-6,-7],[-0.05192,-0.00545,-0.03581,0.01892,0.05282,0.08559,0.10579]],[[0,-1.46273,1,3,0,-2.48609,-1,2,2,-0.93529,-2,-3,0,0.763,4,5,0,-0.49502,-4,-5,1,6.70278,-6,-7],[-0.04999,-0.02291,0.00496,0.02736,0.05739,0.08012,0.09988]],[[1,4.42239,1,3,1,2.64235,-1,2,2,-1.12718,-2,-3,2,-2.2071,4,5,1,5.79911,-4,-5,1,6.1214,-6,-7],[-0.04488,-0.03482,0.02869,-0.03574,0.0328,0.05057,0.09077]],[[0,-1.59656,1,3,0,-2.59565,-1,2,5,0.0,-2,-3,0,0.53935,4,5,0,-0.33796,-4,-5,0,2.14031,-6,-7],[-0.04696,-0.0038,-0.03049,0.02169,0.04807,0.07023,0.09217]],[[0,-1.59656,1,3,0,-2.61936,-1,2,0,-2.00398,-2,-3,0,0.763,4,5,7,0.49929,-4,-5,0,1.64368,-6,-7],[-0.0454,-0.02241,0.00189,0.03583,-0.00727,0.06375,0.08619]],[[0,-1.76769,1,3,0,-2.98672,-1,2,8,0.9378,-2,-3,0,0.763,4,5,0,-0.97599,-4,-5,0,2.14031,-6,-7],[-0.04469,-0.01648,-0.03753,0.01064,0.03744,0.06474,0.08484]],[[0,-0.97599,1,4,0,-2.39706,2,3,0,-3.05614,-1,-2,3,0.65692,-3,-4,0,0.95325,5,-7,7,0.49929,-5,-6],[-0.04315,-0.02766,0.00862,-0.0247,0.039,-0.00477,0.07465]],[[0,-1.91898,1,3,0,-3.02123,-1,2,3,0.6127,-2,-3,0,0.17229,4,5,3,0.66636,-4,-5,0,1.64368,-6,-7],[-0.04149,-0.01557,-0.03336,0.02627,-0.00319,0.04958,0.07637]],[[0,-1.52991,1,3,0,-2.73811,-1,2,2,-0.91905,-2,-3,0,0.95325,4,5,0,-0.33796,-4,-5,0,2.40768,-6,-7],[-0.0386,-0.02065,2e-05,0.01431,0.03763,0.05618,0.07742]],[[0,-1.24693,1,4,0,-2.5143,2,3,0,-3.33134,-1,-2,3,0.6127,-3,-4,0,1.16438,5,-7,30,0.9759,-5,-6],[-0.03862,-0.02687,0.00456,-0.01938,0.03023,-0.01213,0.06677]],[[0,-1.16632,1,3,0,-2.64438,-1,2,3,0.65692,-2,-3,0,0.53935,4,5,33,0.0,-4,-5,0,2.40768,-6,-7],[-0.03502,0.00192,-0.02418,0.01849,0.05901,0.04794,0.07225]],[[1,5.1861,1,3,1,2.64235,-1,2,2,-1.52018,-2,-3,1,7.17255,4,5,3,0.83676,-4,-5,3,0.8843,-6,-7],[-0.02916,-0.02839,0.01365,0.03955,-0.01061,0.07001,0.01422]],[[1,4.99745,1,3,1,2.64235,-1,2,2,-1.53999,-2,-3,1,7.17255,4,5,2,-1.64448,-4,-5,2,-2.64789,-6,-7],[-0.02797,-0.02863,0.01151,-0.00051,0.03894,0.00962,0.0662]],[[0,-1.76769,1,3,0,-3.05614,-1,2,2,-0.49294,-2,-3,0,0.95325,4,5,27,0.96172,-4,-5,0,2.40768,-6,-7],[-0.03176,-0.01893,0.00413,0.01795,-0.03708,0.04291,0.0646]],[[0,-0.97599,1,4,0,-2.08444,2,3,0,-3.34469,-1,-2,1,3.72168,-3,-4,0,1.64368,5,-7,7,0.49929,-5,-6],[-0.03105,-0.01843,0.01257,-0.01378,0.02717,-0.00988,0.05772]],[[16,0.12346,1,3,3,0.45672,-1,2,2,-1.00559,-2,-3,21,0.0,4,5,2,-1.88047,-4,-5,10,0.0,-6,-7],[-0.02765,-0.0177,0.00996,-0.0157,0.01853,0.05782,0.02021]],[[0,-1.96469,1,3,0,-3.05614,-1,2,32,0.0,-2,-3,0,0.763,4,5,27,0.95472,-4,-5,30,0.92032,-6,-7],[-0.02779,-0.01522,0.02448,0.01478,-0.02525,0.05219,0.01749]],[[0,-0.75241,1,4,0,-2.26779,2,3,0,-3.7853,-1,-2,33,0.0,-3,-4,0,1.64368,5,-7,30,0.94619,-5,-6],[-0.02834,-0.01924,-0.00217,0.05379,0.02587,-0.00319,0.05294]],[[1,5.52049,1,4,1,2.55453,2,3,3,0.78863,-1,-2,2,-0.93529,-3,-4,3,0.84638,5,-7,1,6.70278,-5,-6],[-0.02045,0.04096,-0.01206,0.01458,0.02399,0.05312,-0.00371]],[[0,-0.62958,1,4,0,-2.26779,2,3,2,-1.52018,-1,-2,3,0.66013,-3,-4,0,2.14031,5,-7,7,0.56687,-5,-6],[-0.02758,-0.018,0.0088,-0.01852,0.02413,-0.02164,0.05128]],[[0,-0.33796,1,3,0,-2.66864,-1,2,33,0.0,-2,-3,30,0.89499,4,5,7,0.62294,-4,-5,30,0.9759,-6,-7],[-0.02146,-0.0025,0.04023,0.04164,-0.00915,0.01527,-0.01859]],[[0,-2.0437,1,3,0,-3.54529,-1,2,3,0.89703,-2,-3,0,1.64368,4,5,27,0.96172,-4,-5,1,7.17255,-6,-7],[-0.02252,-0.01336,0.02577,0.01155,-0.03501,0.0302,0.05114]],[[0,-0.62958,1,3,0,-2.82758,-1,2,8,1.34438,-2,-3,0,1.64368,4,5,30,0.89499,-4,-5,1,7.41709,-6,-7],[-0.01939,0.00137,-0.03117,0.02344,0.00354,0.02928,0.05063]],[[0,-0.17964,1,4,0,-2.19763,2,3,10,0.62294,-1,-2,8,1.34438,-3,-4,30,0.94313,5,-7,0,2.40768,-5,-6],[-0.01705,0.02839,0.00516,-0.02827,0.0254,0.0471,-0.0049]],[[0,-0.33796,1,4,0,-3.18679,2,3,29,0.75072,-1,-2,10,0.62294,-3,-4,0,1.64368,5,-7,7,0.56687,-5,-6],[-0.01844,0.02859,-0.00285,0.04438,0.01868,-0.04021,0.03926]],[[1,6.30477,1,4,2,-1.52018,2,3,10,0.56687,-1,-2,1,2.19486,-3,-4,2,-2.64789,-5,5,1,7.69372,-6,-7],[-0.01921,0.04764,-0.01132,0.00702,-0.01104,0.02455,0.0452]],[[0,-0.33796,1,3,0,-2.82758,-1,2,3,0.66013,-2,-3,30,0.92366,4,5,7,0.62294,-4,-5,37,0.0,-6,-7],[-0.01539,0.00532,-0.0134,0.03008,-0.01713,-0.00715,0.02283]],[[0,0.0,1,3,0,-2.00398,-1,2,33,0.0,-2,-3,3,0.59954,4,5,37,0.0,-4,-5,7,0.56687,-6,-7],[-0.01308,7e-05,0.04358,-0.00948,0.03199,0.03244,-0.01257]],[[0,0.0,1,4,0,-2.48609,2,3,2,-1.60009,-1,-2,27,0.96172,-3,-4,0,2.69561,5,-7,30,0.95293,-5,-6],[-0.01858,-0.00916,0.00301,-0.03439,0.01746,-0.01457,0.04069]],[[1,6.93154,1,4,15,0.0,2,3,2,-1.60009,-1,-2,10,0.62294,-3,-4,2,-2.64789,-5,5,1,8.29594,-6,-7],[-0.01125,0.00355,-0.01626,0.02758,-0.01165,0.0243,0.0442]]];
  var META_TREES_RAW = [[[0,-1.00938,1,3,11,0.0,-1,2,0,-3.46376,-2,-3,16,0.0,-4,4,1,0.50357,-5,-6],[-2.20941,-2.08305,-1.64874,-1.44787,-2.02584,-1.58133]],[[0,-1.36967,1,3,9,0.52727,-1,2,16,0.5,-2,-3,9,0.0,4,-6,1,0.24379,-4,-5],[-0.06801,0.42029,0.04097,0.07978,0.33604,0.40669]],[[0,-1.82149,1,3,9,0.52727,-1,2,16,0.5,-2,-3,16,0.5,-4,4,0,0.8886,-5,-6],[-0.06697,0.29122,0.02942,0.28158,0.01349,0.23814]],[[0,-2.00604,1,3,9,0.52727,2,-3,16,-0.0,-1,-2,16,0.5,-4,4,0,0.0,-5,-6],[0.01692,-0.06705,0.20618,0.22738,-0.01462,0.18043]],[[0,-2.21005,1,3,9,0.45455,-1,2,16,0.0,-2,-3,9,0.0,4,-6,0,0.32636,-4,-5],[-0.06435,0.19974,0.01501,0.01124,0.16903,0.2102]],[[0,-2.14044,1,3,16,-0.0,2,-3,1,-3.38824,-1,-2,16,0.5,-4,4,1,-0.25835,-5,-6],[0.0056,0.14339,-0.06299,0.17007,-0.01801,0.13063]],[[0,-2.14044,1,3,9,0.45455,-1,2,16,0.5,-2,-3,9,0.0,4,-6,0,0.57493,-4,-5],[-0.06092,0.15642,0.00375,0.00912,0.13539,0.16572]],[[0,-2.21005,1,3,9,0.45455,2,-3,11,0.0,-1,-2,9,0.0,4,-6,11,0.0,-4,-5],[-0.06053,0.0043,0.11714,0.01986,0.14098,0.1508]],[[0,-2.49216,1,3,9,0.76364,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,0.0,-4,-5],[-0.05893,0.00259,0.12464,-0.00979,0.10895,0.1392]],[[0,-2.49216,1,3,9,0.69091,2,-3,11,0.0,-1,-2,16,0.5,-4,4,9,0.0,-5,-6],[-0.05715,-0.0003,0.10854,0.11932,-0.00473,0.13593]],[[0,-2.44322,1,3,9,0.69091,2,-3,11,0.0,-1,-2,16,0.0,-4,4,1,0.79595,-5,-6],[-0.05546,0.00464,0.10071,0.11499,-0.00807,0.1092]],[[0,-1.92488,1,3,9,0.0,-1,2,16,0.0,-2,-3,9,0.0,4,-6,0,1.17714,-4,-5],[-0.05284,0.11588,-0.02235,0.00912,0.10355,0.11537]],[[0,-2.49216,1,3,9,0.76364,2,-3,16,-0.0,-1,-2,9,0.0,4,-6,0,0.8886,-4,-5],[0.00477,-0.05193,0.08769,-0.00304,0.09156,0.10963]],[[0,-2.58468,1,3,9,0.2,-1,2,16,0.0,-2,-3,16,0.0,-4,4,9,0.0,-5,-6],[-0.04975,0.09525,-0.0264,0.09834,-0.00597,0.10767]],[[0,-1.68775,1,3,11,0.0,-1,2,1,-3.38824,-2,-3,11,0.0,4,-6,0,1.86406,-4,-5],[-0.04715,-0.00548,0.08129,0.01655,0.10297,0.09662]],[[0,-1.1374,1,3,9,0.0,-1,2,16,0.5,-2,-3,9,0.0,4,-6,0,1.86406,-4,-5],[-0.04524,0.08952,-0.01229,0.02373,0.09779,0.09752]],[[1,-1.0297,1,3,9,0.0,-1,2,16,0.5,-2,-3,9,0.0,4,-6,0,1.86406,-4,-5],[-0.04366,0.08253,-0.01044,0.0243,0.09311,0.0931]],[[1,-0.85521,1,3,9,0.0,-1,2,1,-3.28206,-2,-3,16,-0.0,-4,4,0,1.86406,-5,-6],[-0.04161,-0.00794,0.07766,0.08949,0.02379,0.08947]],[[0,-2.7055,1,3,11,0.0,-1,2,1,-3.42346,-2,-3,16,0.0,-4,4,0,1.64648,-5,-6],[-0.04137,-0.00719,0.05552,0.07974,-0.00875,0.07707]],[[0,-2.7055,1,3,9,0.76364,2,-3,11,0.0,-1,-2,9,0.0,4,-6,11,0.0,-4,-5],[-0.04008,-0.00662,0.0556,-0.00764,0.07278,0.08328]],[[0,-2.73605,1,3,9,0.76364,-1,2,16,0.5,-2,-3,9,0.0,4,-6,11,0.0,-4,-5],[-0.03738,0.0657,-0.01259,-0.0069,0.06905,0.08097]],[[1,-0.85521,1,3,9,0.2,2,-3,11,0.0,-1,-2,9,0.0,4,-6,0,2.03905,-4,-5],[-0.03705,0.01333,0.0542,0.01773,0.08212,0.08039]],[[1,-0.85521,1,3,9,0.0,-1,2,16,0.83333,-2,-3,9,0.0,4,-6,0,2.03905,-4,-5],[-0.03316,0.05738,-0.02488,0.01609,0.07842,0.07761]],[[16,-0.0,1,2,1,-3.04903,-1,-2,1,-0.67324,3,4,9,0.80909,-3,-4,9,0.0,-5,-6],[-0.00064,0.0677,-0.03312,0.05449,0.01587,0.07471]],[[11,0.0,1,4,1,-0.67324,2,3,9,0.80909,-1,-2,1,1.73377,-3,-4,1,-3.04903,-5,-6],[-0.03167,0.04835,0.01237,0.07032,-0.00217,0.06576]]];
  var THRESHOLDS = {"text":{"strict":0.7956,"balanced":0.6083,"aggressive":0.5898},"reply":{"strict":0.65,"balanced":0.5787,"aggressive":0.45}};
  var NG_RAW = "本鱼\t127\n本鲸\t92\n本喵\t79\n主人\t76\n——\t73\n「\t67\n鲸\t67\n尾巴\t65\n喵\t64\n往往\t59\n—\t57\n喵!\t55\n但是\t-52\n;\t51\n▽\t51\n的不是\t49\n鲸鱼\t-47\n哼\t47\n。。\t-46\n,鱼\t46\n鳍\t46\n、\t45\n鱼\t43\n完成\t-43\n温柔\t43\n才不\t42\n\u0003\t41\n账\t41\n喊\t41\n而是\t41\n白饭\t41\n整活\t41\ń\t41\n先\t40\n~\t40\n....\t40\n应该\t-40\n根本\t-40\n记得\t-40\n\u0002(\t40\n笔记本\t-40\n里面\t-39\n狠\t39\n句话\t-39\n肯定\t-39\nme\t39\n\"\t39\n哼,\t39\n,是\t38\n感觉\t-38\n啦\t38\n反而\t38\n这里\t-38\n比如\t-38\n让人\t37\n\t-36\n),\t-36\n梗\t36\n嫌\t36\n然后\t-35\n替\t35\n事情\t-35\n顺着\t35\n」\t34\n \t-34\n句\t34\n\u0002「\t34\n真是\t-34\n诚\t34\n这份\t34\n摊\t34\n有意思\t34\n本\t33\n基本\t-33\n拆\t33\n扎\t33\n玩意\t-33\n:“\t-33\n饭\t32\n我这\t32\n比较\t-32\n挑\t32\n才能\t-32\n不错\t-32\n妙\t32\n各种\t-32\n挺好\t-32\nω\t32\n离谱\t32\n老大\t32\n下次\t32\n一切\t-32\n那一下\t32\n那里\t-32\n挺\t31\n秒\t31\n完全\t-31\n壳\t31\n会儿\t31\n视角\t31\n进行\t-31\n各位\t-31\n从来\t31\n它\t30\n收\t30\n算是\t-30\n认为\t-30\n凑\t30\n一路\t30\n哪里\t-30\n介\t30\n真的是\t-30\n按照\t-30\n条\t29\n搞\t-29\n问题\t-29\n稳\t29\n那么\t-29\n劲\t29\n日常\t29\n简单\t-29\n最近\t-29\n细节\t29\n实话\t-29\n感谢\t-29\n耐\t29\n事实\t-29\n\t-28\n夸\t28\n帧\t28\n当时\t-28\n日本\t-28\n平时\t28\n愿意\t28\n小姐\t28\n了:\t28\n:\t27\n算\t27\n省\t27\n热\t27\n落\t27\n\u0002其实\t-27\n暖\t27\n框\t27\n漏\t27\n铺\t27\n奏\t27\n那\t26\n比\t26\n\u0002我\t-26\n真的\t-26\n认\t26\n可能\t-26\n好像\t-26\n答\t26\n,就是\t26\n居然\t26\n不得\t-26\n泡\t26\n工具\t26\n武\t-26\n静\t26\n一定\t-26\n陪\t26\n即\t-26\n其实是\t26\n经常\t-26\n28\t26\n况\t-26\n只能说\t-26\n讲\t25\n交\t25\n画面\t25\n不懂\t-25\n滑\t25\nen\t25\n就行\t-25\n插件\t25\n撞\t25\n这话\t25\n换成\t-25\n攒\t25\n顺手\t25\n技能\t25\nmer\t25\n导致\t-25\n得\t24\n把\t24\n就是\t-24\n的是\t24\n现在\t-24\n,本\t24\n留\t24\n聊\t24\n跳\t24\n\u0002其\t-24\n。。\u0003\t-24\n哈哈\t24\n就一\t24\n恶\t-24\n目前\t-24\n是很\t-24\n偶\t24\n烂\t-24\n就像\t-24\n,开\t-24\n里那\t24\n着\t23\n无\t-23\n可以\t-23\n记\t23\n且\t-23\n由\t23\n得很\t23\n杀\t-23\n借\t23\n本质\t-23\n反正\t-23\n代表\t-23\n将\t-23\n戳\t23\n同一\t23\n毕\t-23\n是真的\t23\n\u0002只\t-23\n一堆\t-23\n是太\t-23\n最难\t23\n的地方\t23\n这\t22\n真\t22\n\u0002\t-22\n肥鱼\t-22\n些\t-22\n确实\t22\n场\t22\n反\t22\n半\t22\n不过\t22\n倒\t22\n翻\t22\n,比\t22\n验\t22\n救\t22\n左\t-22\n-\t22\n是,\t-22\n就会\t-22\n撑\t22\n,结\t22\n偏\t22\n亚\t-22\n前面\t22\n喂\t22\n都是\t-21\n准\t21\n这样\t-21\n字\t21\n女\t-21\n透\t21\n。你\t21\n却\t21\n般\t-21\n请\t-21\n你的\t-21\n甚\t-21\n串\t21\n碗\t21\n剩\t21\n在我\t-21\n弹幕\t21\n容易\t21\n内容\t21\n大概\t21\n死了\t-21\n的就是\t21\n慢慢\t21\n如\t-20\n靠\t20\n人类\t20\n其实\t20\n东西\t20\n零\t20\n或者\t-20\n,都\t-20\n」,\t20\n醒\t20\n牛\t-20\n搭\t20\n蓝\t20\n缩\t20\ner\t20\n看一\t-20\n,最后\t20\n也就\t-20\n摆\t20\n生成\t20\n啊。\t-20\n回复\t-20\n 你\t-20\n,比如\t-20\n二十\t20\n解决\t-20\n三连\t-20\n数\t19\n整\t19\n进\t19\n底\t19\n尾\t19\n评\t19\n排\t19\n四\t19\n战\t-19\n界\t19\n不用\t19\n\u0002真\t-19\n以为\t19\n还不\t-19\n七\t19\n\u0002把\t19\n了这\t-19\n忙\t19\n参\t19\n的这\t-19\n本身\t19\n,看完\t19\n被\t18\n头\t18\n\u0002你\t-18\n也是\t-18\n片\t18\n顺\t18\n,就\t-18\n呀\t18\n满\t18\n补\t18\n份\t18\n之前\t-18\n是不是\t-18\n的一\t-18\n,最\t-18\n视频\t-18\n亮\t18\n..\u0003\t-18\n吗,\t-18\n摸\t18\n切\t18\n非常\t-18\n啦,\t18\n就算\t-18\n除了\t-18\n成功\t-18\n广\t-18\n\u0002想\t-18\n最好\t-18\n,自\t-18\n只\t17\n吗?\t-17\n啥\t-17\n等\t17\n懂\t17\n\u0002那\t-17\n步\t17\n刷\t17\n小时\t17\n立\t17\n这条\t17\n我觉得\t-17\n...\u0003\t-17\n,他\t-17\n]\t-17\n说,\t-17\n[\t-17\n,有\t-17\n甚至\t-17\n%\t17\n说话\t17\n一些\t-17\n存在\t-17\n,可以\t-17\n,用\t-17\n这期\t17\n抱\t17\n本的\t-17\n太多\t-17\n。但\t-17\n人机\t-17\n最\t16\n成\t16\n才\t16\n写\t16\n住\t16\n从\t16\n段\t16\n服\t16\n声\t16\n口\t16\n手机\t-16\n值\t16\n一点\t-16\n啊,\t-16\n硬\t16\n这句\t16\n套\t16\n测\t16\n原来\t16\n标\t16\n及\t-16\n层\t16\n版本\t-16\n真正\t16\n,在\t-16\n赢\t16\n不行\t-16\n”,\t16\n肯\t16\n我想\t-16\n嘴\t16\n,本鱼\t16\n是把\t16\n右\t-16\n作者\t16\n舞\t16\n分\t15\n但\t15\n们\t-15\n像\t15\n单\t15\n\u0002\u0003\t-15\n连\t15\n气\t15\n觉得\t-15\n都不\t-15\n推\t15\n干\t15\n而\t-15\n存\t15\n只有\t-15\n部分\t-15\n压\t15\n,只\t-15\nde\t15\n一直\t-15\n敢\t15\n较\t-15\n所有\t-15\n我觉\t-15\n猫\t15\n送\t-15\n\u0002还\t-15\n吗?\u0003\t15\n几个\t-15\n照\t15\n这是\t-15\n男\t-15\n80\t-15\n效\t15\n某\t-15\n桌\t15\n屏\t15\n问题,\t-15\n言\t-15\n主要\t-15\n是个\t-15\n我都\t-15\n退\t15\n那几\t15\n停\t15\n,\t14\n点\t14\n手\t14\n感\t14\n游\t14\n为\t-14\n.\t14\n换\t14\n十\t14\n的话\t-14\n部\t-14\n也不\t-14\n越\t14\n叫\t14\n我的\t-14\n门\t14\n装\t14\n\u0002本\t14\n谱\t14\n源\t14\n知道\t14\n米\t14\n来的\t14\nep\t-14\n冲\t14\n不到\t-14\n,不是\t14\n睡\t14\n插\t14\n贴\t14\n抢\t14\n样的\t-14\n一般\t-14\n世界\t-14\n\u0002就\t-14\n不知道\t-14\n依旧\t-14\n天天\t14\n型\t14\n在\t13\n里\t13\n全\t13\n回\t13\n要\t-13\n知\t-13\n听\t13\n笑\t13\n台\t13\n只能\t-13\n看到\t-13\nto\t13\n地方\t13\n属\t13\n开始\t-13\nke\t13\n国\t-13\n此\t-13\n页\t13\n给我\t-13\n人家\t13\n味\t13\n美\t-13\n成本\t-13\n是真\t-13\n逻\t13\n还在\t13\n咋\t-13\n紧\t13\n创\t13\n还\t12\n了,\t-12\n中\t-12\n!\t12\n问\t12\n配\t12\n完\t12\n)\t12\n其\t-12\n哪\t12\n本来\t-12\n走\t12\n够\t12\n目\t-12\n名\t12\n,但是\t-12\n一样\t-12\n还有\t-12\n便\t-12\n题\t12\n证\t12\n遍\t12\n姐\t12\n历\t-12\n看完\t12\n究\t12\n似\t-12\n其他\t-12\n除\t-12\n盘\t12\n成了\t12\n来看\t-12\n整个\t-12\n不是\t11\n可\t11\n,这\t11\n别\t11\n没有\t-11\n啊\t-11\nai\t11\n清\t11\n吧\t-11\n行\t11\n的,\t-11\n相\t-11\n站\t11\n位\t11\n事\t11\n量\t11\n,你\t-11\n时候\t-11\n与\t11\n的。\t-11\n+\t-11\n总\t11\n核\t11\n了。\u0003\t-11\n受\t-11\n巴\t11\n很多\t-11\n影\t-11\n分钟\t11\n我不\t11\n报\t11\n钟\t11\n玩家\t11\n哥\t-11\n要是\t11\n免\t11\n。。。\t-11\n多少\t-11\n逻辑\t11\n不可\t-11\n查\t11\n东\t-11\n兴\t11\n藏\t11\n的很\t-11\n一\t10\n到\t10\n还是\t-10\n\u0002这\t-10\n3\t-10\n于\t-10\n一下\t-10\n强\t-10\n谁\t10\n儿\t10\n看看\t-10\n,那\t-10\n三\t10\n)\u0003\t10\n拿\t10\n正常\t-10\n按\t10\n线\t10\n光\t10\n定\t10\n,可\t10\n不要\t-10\n喜\t-10\n改\t10\n频\t10\n都在\t10\n掉\t10\n脸\t10\n看\t9\n吗\t-9\n也\t9\n开\t9\n么\t-9\n大\t-9\n之\t-9\n同\t9\n号\t9\n所\t-9\n1\t-9\n画\t9\n高\t-9\n他\t-9\n游戏\t-9\n那句\t9\n错\t9\n音\t-9\n该\t9\n代\t9\n教\t9\n管\t9\n说的\t-9\n显\t-9\n需\t9\n怎\t-9\n话,\t-9\n那个\t-9\n内\t-9\n,一\t-9\n上,\t9\n课\t9\n,然后\t-9\n价格\t-9\n世\t-9\n乐\t9\n到了\t-9\n我\t8\n人\t8\n了\u0003\t-8\n自\t8\n这个\t-8\n?\t-8\n活\t8\n实\t8\n白\t8\n当\t8\n变\t8\n明\t8\n,还\t-8\n了\t-8\n始\t-8\n两\t8\n二\t-8\n因为\t-8\n怎么\t8\n,然\t-8\n给你\t-8\n克\t8\n运\t-8\n词\t8\n呢?\t-8\n有点\t8\n西\t-8\n了\t7\n是\t7\n。\t7\n就\t7\n出\t7\n力\t-7\n00\t7\n信\t7\n差\t7\n用\t-7\n0\t-7\n...\t7\n心\t7\n日\t7\n概\t7\n居\t7\n边\t7\n大家\t7\n4\t-7\n豆\t7\n早\t7\n者\t-7\n并\t-7\n端\t7\n软件\t-7\n。这\t7\n下来\t7\n有\t-6\nk\t6\n说\t6\n果\t-6\n路\t6\n怕\t6\n基\t-6\n细\t6\n,但\t-6\n性\t-6\n格\t6\n而且\t-6\n加\t-6\n卡\t6\n解\t6\n难\t6\n然\t-6\n。\u0003\t5\n太\t5\n个\t-5\n想\t5\n第一\t-5\n话\t5\n理\t5\n原\t5\n工\t5\n水\t5\n和\t5\n幕\t5\n起\t5\n至\t-5\n子\t5\n板\t5\n所以\t5\n吧,\t-5\n重\t5\n以\t-4\nn\t-4\n都\t4\n下\t4\n接\t4\n?\u0003\t4\na\t-4\n那一\t4\n刚\t4\n非\t-4\n码\t4\n才是\t4\n费\t4\n不\t3\n表\t3\n死\t-3\n思\t-3\n都没\t-3\n自己\t3\n价\t3\n个人\t-3\n没\t2\nt\t2\ni\t2\n块\t-1\n能\t1\n合\t1";

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
