/* OjinjinRules-Lite v1.1 — Pure ES5 JS Zero-Tree Distilled Rule Engine (299 n-grams + 38 style + 9 reply-meta)
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

  var NG_SCALE = 0.01095927;
  var LIN_BIAS = -3.273900;
  var STYLE_W = [0.435158, -0.168672, -0.004204, -0.292075, -0.018655, 0.170143, -0.091951, -0.353356, 0.029206, 0.742225, 0.009804, 0.119775, -0.373828, 0.081829, -0.156521, 0.089201, 0.197484, 0.573043, 0.087094, 0.2172, -0.039527, 0.201645, 0.191307, -0.079908, -1.350974, -0.696267, -0.884629, 1.143612, -0.75719, 0.564262, 0.736473, 0.065382, -0.331462, 0.327384, 0.212132, 0.097726, 0.126158, -0.372626];
  var META_LIN_W = [0.860442, 2.780164, -0.039116, 1.068099, 0.249551, -0.199502, -0.49411, -0.572758, -0.652287, 0.075746];
  var META_LIN_B = -0.196711;
  var THRESHOLDS = {"text":{"strict":0.8655,"balanced":0.5785,"aggressive":0.5785},"reply":{"strict":0.7493,"balanced":0.65,"aggressive":0.5071}};
  var NG_RAW = "本鱼\t127\n主人\t117\n本鲸\t114\n尾巴\t104\n但是\t-104\n——\t100\n。。\t-85\n比较\t-85\n—\t81\n完全\t-79\n且\t-78\n拆\t77\n比如\t-75\n~\t74\n稳\t73\n让人\t73\n却\t73\n然后\t-73\n\u0002其实\t-72\n平时\t71\n「\t70\n可能\t-70\n顺\t69\n奏\t68\n往往\t68\n挺\t67\n女\t-67\n里面\t-67\n\uE001\u0003\t66\n省\t66\n秒\t66\n喊\t65\n可以\t-65\n真是\t-64\n而是\t63\n应该\t-63\n这里\t-63\n句\t62\n,本\t62\n啦\t61\n留\t59\n场\t58\n现在\t-58\n梗\t56\n感觉\t-56\n工具\t55\n跳\t54\n先\t53\n真的\t-53\n,在\t-53\n挑\t52\n容易\t52\n这期\t52\n把\t51\n落\t51\n国\t-51\n,他\t-51\n」\t50\n验\t50\n的不是\t50\n确实\t49\n劲\t49\n补\t48\n\uE001\t-48\n刷\t47\n狠\t47\n亮\t47\n一些\t-47\n民\t-46\n只有\t-46\n讲\t45\n标\t45\n饭\t45\n透\t45\n着\t44\n条\t44\n....\t44\n搞\t-44\n如\t-43\n手机\t-43\n鱼\t42\n,是\t42\n不用\t42\n反\t41\n倒\t41\n满\t41\n替\t41\n转\t41\n\u0002\uE002\t-41\n都是\t-41\n一直\t-41\n、\t40\n十\t40\n压\t40\n这条\t40\n还有\t-40\n非\t-40\n真\t39\n它\t39\n清\t39\n整\t39\n底\t39\n卡\t39\n,比\t39\n没有\t-39\n那么\t-39\n感\t38\n心\t38\n靠\t38\n收\t38\n刚\t38\n账\t38\nk\t38\n排\t38\n些\t-38\n他\t-38\n问题\t-38\n只能\t-38\n的是\t37\n记\t37\n不过\t37\n半\t37\n准\t37\n也是\t-37\n比\t36\n听\t36\n连\t36\n反而\t36\n部\t-36\n,你\t-36\n全\t35\n门\t35\n画\t35\n切\t35\n啊\t-35\n,但是\t-35\n,就\t-35\n世界\t-35\n本\t34\n只\t34\n台\t34\n热\t34\n其实\t34\n并\t-34\n她\t-34\n得\t33\n算\t33\n点\t33\n头\t33\n换\t33\n住\t33\n名\t33\n鲸\t33\n参\t33\n失\t33\n\u0002我\t-33\n一点\t-33\n从\t32\n数\t32\n这样\t-32\n被\t31\n服\t31\n越\t31\n视频\t-31\n人,\t-31\n之前\t-31\n笑\t30\n同\t30\n们\t-30\n的话\t-30\n因为\t-30\n聊\t29\n啊,\t-29\n手\t28\n气\t28\n;\t28\n写\t28\n认\t28\n路\t28\n口\t28\n时候\t-28\n里\t27\n怕\t27\n硬\t27\n?\t-27\n的,\t-27\n无\t-27\n所\t-27\n这\t26\n才\t26\n尾\t26\n往\t26\n配\t26\n直\t26\n值\t26\n词\t26\n为\t-26\n吗\t-26\n肥鱼\t-26\n分\t25\n套\t25\n完\t25\n拿\t25\n立\t25\n的。\t-25\n那\t24\n进\t24\n号\t24\n位\t24\n0\t-24\n吧\t-24\n者\t-24\np\t-24\n看\t23\n出\t23\n之\t-23\n持\t-23\n在\t22\n别\t22\n难\t22\n要\t-22\n还\t21\n最\t21\n可\t21\n总\t21\n还是\t-21\n\uE002 \uE002\t-21\n是一\t-21\n文\t-21\n但\t20\n单\t20\n哪\t20\n于\t-20\n成\t19\n懂\t19\n力\t-19\n类\t-19\n电\t-19\n。\t18\n起\t18\n谁\t18\n了,\t-18\n就是\t-18\nd\t-18\n实\t17\n,这\t17\n段\t17\n评\t17\n乐\t17\n真正\t17\n觉\t-17\n强\t-17\n:\t16\n回\t16\n面\t16\n个\t-16\n中\t-16\n两\t15\n多\t-15\n说\t14\n再\t14\n当\t14\n推\t14\n子\t14\n么\t-14\n这个\t-14\n\u0002这\t-14\n我\t13\n不是\t13\n开\t13\n巴\t13\n很\t-13\n高\t-13\n1\t-13\n第\t12\n了\u0003\t-12\na\t-12\n,\t11\n也\t11\n自\t11\n是\t11\n度\t11\n的\t-11\n好\t-11\n动\t9\n下\t9\n次\t9\n死\t-9\n到\t8\n像\t8\n题\t8\n有\t-8\n人\t7\n.\t7\n行\t7\n大\t-6\n。\u0003\t5\n了\t2\n以\t-2";

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

  /* Exact branch-and-bound bounds for the 6 style regexes (zero approximation) */
  var RE_POS_MAX = 1e-7, RE_NEG_MIN = -1e-7;
  var THR_Z_TEXT = {}, THR_Z_REPLY = {};
  (function () {
    var idxs = [8,32,33,34,35,36], i, w, k, t;
    for (i = 0; i < idxs.length; i++) { w = STYLE_W[idxs[i]]; if (w > 0) RE_POS_MAX += w; else RE_NEG_MIN += w; }
    for (k in THRESHOLDS.text) { t = THRESHOLDS.text[k]; THR_Z_TEXT[k] = Math.log(t / (1 - t)); }
    for (k in THRESHOLDS.reply) { t = THRESHOLDS.reply[k]; THR_Z_REPLY[k] = Math.log(t / (1 - t)); }
  })();
  var OLINK_POS = META_LIN_W[2] > 0 ? META_LIN_W[2] : 0;
  var OLINK_NEG = META_LIN_W[2] < 0 ? META_LIN_W[2] : 0;
  var INV_MW0 = 1 / META_LIN_W[0];

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

  function computeTextZ(rawMsg, checkBound, zLo, zHi) {
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

    var W = STYLE_W;
    var zBase = LIN_BIAS + ngSum
      + (n > 0 ? W[0] * (Math.log(1 + n) / 6) : 0) + (n <= 10 ? W[1] : 0) + (n >= 40 ? W[2] : 0) + (n >= 80 ? W[3] : 0)
      + (nSent > 0 ? W[4] * (Math.log(1 + nSent) / 3) : 0) + W[5] * ((meanSl < 80 ? meanSl : 80) / 40) + W[6] * (cvSl < 2 ? cvSl : 2)
      + (nlCnt > 0 ? W[7] * (Math.log(1 + nlCnt) / 3) : 0)
      + (lastCode === 0x3002 ? W[9] : 0) + ((lastCode === 0xFF1F || lastCode === 63) ? W[10] : 0)
      + ((lastCode === 0xFF01 || lastCode === 33) ? W[11] : 0) + (endsEmote ? W[12] : 0)
      + (periodCnt ? W[13] * ((periodCnt * per100 < 15 ? periodCnt * per100 : 15) / 10) : 0)
      + (commaCnt ? W[14] * ((commaCnt * per100 < 20 ? commaCnt * per100 : 20) / 10) : 0)
      + (pauseCnt ? W[15] * ((pauseCnt * per100 < 15 ? pauseCnt * per100 : 15) / 10) : 0)
      + (colonCnt ? W[16] * ((colonCnt < 4 ? colonCnt : 4) / 4) : 0)
      + (semiCnt ? W[17] * ((semiCnt < 4 ? semiCnt : 4) / 4) : 0)
      + (dashCnt ? W[18] * ((dashCnt < 4 ? dashCnt : 4) / 4) : 0)
      + (cornerQ ? W[19] * ((cornerQ < 6 ? cornerQ : 6) / 6) : 0)
      + (stdQ ? W[20] * ((stdQ < 6 ? stdQ : 6) / 6) : 0)
      + (qCnt ? W[21] * ((qCnt * per100 < 15 ? qCnt * per100 : 15) / 10) : 0)
      + (exCnt ? W[22] * ((exCnt * per100 < 15 ? exCnt * per100 : 15) / 10) : 0)
      + (formalP ? W[23] * ((formalP * per100 < 25 ? formalP * per100 : 25) / 15) : 0)
      + W[24] * (cjkCnt / denom) + W[25] * (digitCnt / denom) + W[26] * (asciiCnt / denom)
      + (n > 0 ? W[27] * (uniqCnt / denom) : 0)
      + (emoteCnt ? W[28] * (Math.log(1 + emoteCnt) / 3) : 0)
      + (emojiCnt ? W[29] * (Math.log(1 + emojiCnt) / 3) : 0)
      + (hasAt ? W[30] : 0) + (tsHits > 0 ? W[31] : 0)
      + (allP ? W[37] * ((allP / denom < 0.5 ? allP / denom : 0.5) * 2) : 0);

    if (checkBound) {
      if (zBase + RE_POS_MAX < zLo) return -1e9;
      if (zBase + RE_NEG_MIN > zHi) return 1e9;
    }
    var firstCode = rLen ? rawBody.charCodeAt(0) : 0;
    if ((nlCnt > 0 || hasParenOrStar || (firstCode >= 48 && firstCode <= 57) || firstCode === 45 || firstCode === 0x2022 || firstCode === 0x00B7 || firstCode === 0x4E00 || firstCode === 0x4E8C || firstCode === 0x4E09 || firstCode === 0x56DB || firstCode === 0x4E94) && RE_LIST_MARKER.test(rawBody)) zBase += W[8];
    if (RE_REPEAT_BURST.test(nm)) zBase += W[32];
    if (RE_HUMAN_SLANG.test(nm)) zBase += W[33];
    if (RE_AI_BRAND.test(nm)) zBase += W[34];
    if (hasParenOrStar && RE_ACTION_PAREN.test(rawBody)) zBase += W[35];
    if (RE_AI_TEMPLATE.test(nm)) zBase += W[36];
    return zBase;
  }

  var LAST_U = '';
  function computeMetaFixed(reply) {
    var m = reply && reply.member, rawUname = (m && (m.uname || m.name)) || (reply && reply.uname) || '';
    var u = rawUname ? norm(rawUname) : '', nPts = u ? nameScore(u) / 55 : 0;
    LAST_U = u;
    var lvl = (m && m.level_info && typeof m.level_info.current_level === 'number')
      ? m.level_info.current_level : ((reply && typeof reply.level === 'number') ? reply.level : null);
    var lvlVal = 3, lLe2 = 0, l3 = 0, l4 = 0, l5 = 0, l6 = 0;
    if (lvl !== null) {
      lvlVal = lvl;
      if (lvl <= 2) lLe2 = 1; else if (lvl === 3) l3 = 1; else if (lvl === 4) l4 = 1; else if (lvl === 5) l5 = 1; else l6 = 1;
    }
    var isSub = (reply && (reply.is_sub || (reply.parent && reply.parent > 0) || (reply.root && reply.root > 0))) ? 1 : 0;
    var MW = META_LIN_W;
    return META_LIN_B + MW[1]*nPts + MW[3]*lLe2 + MW[4]*l3 + MW[5]*l4 + MW[6]*l5 + MW[7]*l6 + MW[8]*((lvlVal - 3) / 3) + MW[9]*isSub;
  }

  function scoreText(rawMsg) { return sigmoid(computeTextZ(rawMsg || '', false, 0, 0)); }

  function scoreReply(reply) {
    var rawMsg = (reply && reply.content && typeof reply.content.message === 'string')
      ? reply.content.message : ((reply && typeof reply.message === 'string') ? reply.message : '');
    var zLin = computeTextZ(rawMsg, false, 0, 0), nm = LAST_NM, zMeta = computeMetaFixed(reply);
    var oLink = 0, match, u = LAST_U;
    if (u && LAST_HAS_AT_NM && nm.indexOf('@') !== -1) {
      RE_MENTION_G.lastIndex = 0;
      while ((match = RE_MENTION_G.exec(nm)) !== null) if (ownerLink(u, match[1])) { oLink = 1; break; }
    }
    return sigmoid(zMeta + META_LIN_W[0] * zLin + META_LIN_W[2] * oLink);
  }

  function isAiText(rawMsg, level) {
    var lv = level || 'balanced', thr = (THRESHOLDS.text && THRESHOLDS.text[lv]) || 0.5;
    var zThr = THR_Z_TEXT[lv] !== undefined ? THR_Z_TEXT[lv] : Math.log(thr / (1 - thr));
    var z = computeTextZ(rawMsg || '', true, zThr - 1e-7, zThr + 1e-7);
    return z === -1e9 ? false : (z === 1e9 ? true : sigmoid(z) >= thr);
  }

  function isAiReply(reply, level) {
    var lv = level || 'balanced', thr = (THRESHOLDS.reply && THRESHOLDS.reply[lv]) || 0.5;
    var zThr = THR_Z_REPLY[lv] !== undefined ? THR_Z_REPLY[lv] : Math.log(thr / (1 - thr));
    var zMeta = computeMetaFixed(reply), u = LAST_U;
    var zLo = (zThr - zMeta - OLINK_POS) * INV_MW0 - 1e-7;
    var zHi = (zThr - zMeta - OLINK_NEG) * INV_MW0 + 1e-7;
    var rawMsg = (reply && reply.content && typeof reply.content.message === 'string')
      ? reply.content.message : ((reply && typeof reply.message === 'string') ? reply.message : '');
    var zLin = computeTextZ(rawMsg, true, zLo, zHi);
    if (zLin === -1e9) return false;
    if (zLin === 1e9) return true;
    var oLink = 0, match, nm = LAST_NM;
    if (u && LAST_HAS_AT_NM && nm.indexOf('@') !== -1) {
      RE_MENTION_G.lastIndex = 0;
      while ((match = RE_MENTION_G.exec(nm)) !== null) if (ownerLink(u, match[1])) { oLink = 1; break; }
    }
    return sigmoid(zMeta + META_LIN_W[0] * zLin + META_LIN_W[2] * oLink) >= thr;
  }

  return { version: 'ojinjin-rules-lite', thresholds: THRESHOLDS, scoreText: scoreText, scoreReply: scoreReply, isAiText: isAiText, isAiReply: isAiReply };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = OjinjinRules; }
