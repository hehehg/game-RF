'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');

var root = path.resolve(__dirname, '../../..');
var index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var gameList = index.match(/const games = \[([\s\S]*?)\n  \];/);

test('all game cards point to existing standalone pages', function () {
  assert.ok(gameList, 'home page should define its game catalog');
  var files = Array.from(gameList[1].matchAll(/file:\s*"([^"]+)"/g), function (match) {
    return match[1];
  });
  assert.ok(files.length > 0, 'game catalog should not be empty');
  files.forEach(function (file) {
    assert.equal(fs.existsSync(path.resolve(root, file)), true, 'missing game page: ' + file);
  });
});
