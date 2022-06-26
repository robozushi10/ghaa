#!/usr/bin/env node
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const readline = require('readline');

// console.log(`----------------------------------------------------------------`);
// console.log(`引数チェック`);
// for(let i = 0; i < process.argv.length; i++){
//   console.log(`process.argv[${i}] => <${process.argv[i]}>`);
// }

console.log(`----------------------------------------------------------------`);
console.log(`一行ずつ処理をするために readline を準備する`);
const fname = core.getInput('log');
const rs = fs.createReadStream(fname);
const rl = readline.createInterface({
  input: rs,
  output: process.null  //! process.stdout だと、次の rl.on() で二重表示されてしまう
});

//! 下記 H_GC を保持するための配列
let L = []

//! ファイルごとにカバレッジ率を保持するためのハッシュ
let H_GC = {
  'file': null,
  'lines':    { 'val': null, 'pass': true },
  'branches': { 'val': null, 'pass': true },
  'calls':    { 'val': null, 'pass': true },
}

//! カバレッジ率合格となる閾値を保持するハッシュ
let H_TH = {
  'lines':    80,
  'branches': 10,
  'calls':    90,
}

//! カバレッジ率が合格とみなすための閾値

// rl.on('line', 〜) は非同期である
rl.on('line', function(l) {
  console.log(`[DEBUG:00] ${l}`);
  if(l == ''){
    // 空行だった場合
    console.log(`[DEBUG:10] L == ''`);
    if('file' in H_GC){
      console.log(`[DEBUG:11] L.push(H_GC)`)
      //! 解析したハッシュを deepcopy をして、配列に格納する
      L.push(Object.assign({}, H_GC))
    }
    //! ハッシュH_GC の要素をクリアしてやる
    delete H_GC
    //! 新たなオブジェクトを獲得する
    H_GC = {
      'file': null,
      'lines':    { 'val': null, 'pass': true },
      'branches': { 'val': null, 'pass': true },
      'calls':    { 'val': null, 'pass': true },
    }
    console.log(``);
    console.log(L)
  } else {
    var m = l.match(/File '(.*)'/);
    if(m != null){
      console.log(`[DEBUG:01] FILE: ${m[1]}`);
      H_GC['file'] = m[1]
    }
    var m = l.match(/Lines executed:(.*)% of (.*)/);
    if(m != null){
      console.log(`[DEBUG:02] LINES: ${m[1]}`);
      H_GC['lines']['val'] = parseFloat(m[1])
    }
    var m = l.match(/Branches executed:(.*)% of (.*)/);
    if(m != null){
      console.log(`[DEBUG:03] BRANCHES: ${m[1]}`);
      H_GC['branches']['val'] = parseFloat(m[1])
    }
    var m = l.match(/Calls executed:(.*)% of (.*)/);
    if(m != null){
      console.log(`[DEBUG:04] CALLS: ${m[1]}`);
      H_GC['calls']['val'] = parseFloat(m[1])
    }
  }
});


//! rl.on('close', 〜) を使って読み出しをすること
rl.on('close', function(){
  for(let a of L){
    if(a.lines.val < H_TH.lines){
      a.lines.pass = false;
    }
    if(a.branches.val < H_TH.branches){
      a.branches.pass = false;
    }
    if(a.calls.val < H_TH.calls){
      a.calls.pass = false;
    }
  }

// //! 結果を表示する
// for(let a of L){
//   console.log(a);
// }
});


