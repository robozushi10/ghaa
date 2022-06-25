const core = require('@actions/core');
const github = require('@actions/github');

console.log("Hello, World!");
const fname = core.getInput('log');
console.log("fname => <${fname}>");
