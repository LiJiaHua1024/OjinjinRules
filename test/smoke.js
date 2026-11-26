'use strict';

var assert = require('assert');
var path = require('path');

var variants = [
  { name: 'lite',    file: '../dist/ojinjin-rules-lite.js' },
  { name: 'compact', file: '../dist/ojinjin-rules-compact.js' },
  { name: 'pro',     file: '../dist/ojinjin-rules-pro.js' }
];

var aiSamples = [
  {
    rpid: 1,
    parent: 0,
    member: { uname: '路人大肥鱼', level_info: { current_level: 2 } },
    content: { message: '这条视频的节奏确实很稳——从前期的铺垫到后面的转折都值得细看，本鱼看完忍不住记一笔。' }
  },
  {
    rpid: 2,
    parent: 0,
    member: { uname: '普通昵称A', level_info: { current_level: 2 } },
    content: { message: '这期拆解得确实很透——从表面现象一路讲到底层逻辑，把最容易踩坑的地方都点出来了，挺适合收藏慢慢看。' }
  },
  {
    rpid: 3,
    parent: 0,
    member: { uname: '路人大肥魚', level_info: { current_level: 2 } },
    content: { message: '這條影片節奏確實很穩——本魚看完忍不住記一筆。' }
  }
];

var humanSamples = [
  {
    rpid: 101,
    parent: 0,
    member: { uname: '老观众', level_info: { current_level: 6 } },
    content: { message: '哈哈哈笑死我了，这段怎么跟我昨天遇到的一模一样[doge]' }
  },
  {
    rpid: 102,
    parent: 0,
    member: { uname: '科普搬运工', level_info: { current_level: 6 } },
    content: { message: '其实我觉得这个说法有点问题，因为03:15那里讲的原理跟教科书上的定义不太一样，但是整体方向可以理解，不知道有没有人做过实测？' }
  },
  {
    rpid: 103,
    parent: 1,
    member: { uname: '路人甲', level_info: { current_level: 5 } },
    content: { message: '回复 @老观众 :确实，我之前也买过一个，现在还在吃灰呢[笑哭]' }
  }
];

variants.forEach(function (v) {
  var eng = require(path.join(__dirname, v.file));
  assert.strictEqual(typeof eng.scoreText, 'function', v.name + ' missing scoreText');
  assert.strictEqual(typeof eng.scoreReply, 'function', v.name + ' missing scoreReply');
  assert.strictEqual(typeof eng.isAiText, 'function', v.name + ' missing isAiText');
  assert.strictEqual(typeof eng.isAiReply, 'function', v.name + ' missing isAiReply');

  aiSamples.forEach(function (r) {
    var p = eng.scoreReply(r);
    assert(p >= 0.65, v.name + ' expected AI >= 0.65 for rpid=' + r.rpid + ', got ' + p.toFixed(4));
  });

  humanSamples.forEach(function (r) {
    var p = eng.scoreReply(r);
    assert(p < 0.35, v.name + ' expected human < 0.35 for rpid=' + r.rpid + ', got ' + p.toFixed(4));
  });

  // Edge cases: empty / missing fields must never throw
  assert.strictEqual(typeof eng.scoreText(''), 'number');
  assert.strictEqual(typeof eng.scoreReply({}), 'number');
  assert.strictEqual(typeof eng.scoreReply(null), 'number');

  // Micro-benchmark (60 comments)
  var batch = [];
  for (var i = 0; i < 10; i++) batch = batch.concat(aiSamples, humanSamples);
  for (var w = 0; w < 20; w++) {
    for (var j = 0; j < batch.length; j++) eng.scoreReply(batch[j]);
  }
  var loops = 100;
  var t0 = process.hrtime.bigint();
  for (var k = 0; k < loops; k++) {
    for (var m = 0; m < batch.length; m++) eng.scoreReply(batch[m]);
  }
  var ms60 = Number(process.hrtime.bigint() - t0) / loops / 1e6;
  console.log('[PASS] ' + v.name + ' | 60 comments: ' + ms60.toFixed(2) + ' ms (' + (ms60 * 1000 / 60).toFixed(1) + ' us/item)');
});
