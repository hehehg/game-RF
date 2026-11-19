'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');

function createStore(initial, shouldThrow) {
  var value = initial || null;
  var context = {
    localStorage: {
      getItem: function () { if (shouldThrow) throw new Error('storage unavailable'); return value; },
      setItem: function (key, next) { if (shouldThrow) throw new Error('storage unavailable'); value = next; }
    },
    console: { warn: function () {} }
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../shared/save.js'), 'utf8'), context);
  return context.PJ;
}

test('restores valid saved progress and fills missing adventures', function () {
  var pj = createStore(JSON.stringify({ v: 1, adam: { step: 2, done: false } }));
  var saved = pj.load();
  assert.equal(saved.adam.step, 2);
  assert.equal(saved.yunus.step, 0);
});

test('falls back to defaults for malformed or unsupported save data', function () {
  var pj = createStore('{not json');
  assert.equal(pj.load().v, 1);
  pj = createStore(JSON.stringify({ v: 999, adam: { step: 50 } }));
  assert.equal(pj.load().adam, undefined);
});

test('returns a failure when browser storage is unavailable', function () {
  var pj = createStore(null, true);
  assert.equal(pj.store(pj.defaults()), false);
});
