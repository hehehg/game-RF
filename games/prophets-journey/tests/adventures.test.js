'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');

var gameDir = path.resolve(__dirname, '..');
var listContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(gameDir, 'adventures.js'), 'utf8'), listContext);
var adventures = listContext.window.ADVENTURES;

test('every adventure in the catalog has a matching data file and valid steps', function () {
  assert.equal(adventures.length, 25);
  adventures.forEach(function (adventure) {
    var id = adventure.id;
    if (id === 'yunus') {
      assert.equal(fs.existsSync(path.join(gameDir, 'yunus.html')), true);
      return;
    }
    var file = path.join(gameDir, 'adventures', id + '.js');
    assert.equal(fs.existsSync(file), true, id + ' data file should exist');
    var context = { window: {} };
    context.window.PJ_ADV = context.PJ_ADV = {};
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
    var data = context.window.PJ_ADV[id];
    assert.ok(data, id + ' should export its adventure data');
    assert.equal(data.steps.length, adventure.steps, id + ' step count should match the catalog');
    assert.ok(data.title && data.intro && data.ending, id + ' should include presentation and ending content');
    assert.ok(data.ending.r, id + ' ending should retain its source references');
    assert.doesNotMatch(data.intro, /كرة نور/, id + ' intro should match the explorer vehicle');
    data.steps.forEach(function (step, index) {
      assert.ok(step.t && step.m && step.type, id + ' step ' + index + ' should include title, instructions, and type');
      if (step.type === 'rings') assert.ok(Array.isArray(step.pts) && step.pts.length > 0, id + ' ring course should have targets');
      if (step.type === 'carry' || step.type === 'discover') {
        assert.ok(Array.isArray(step.items) && step.items.length > 0, id + ' objective should have items');
        step.items.forEach(function (item) {
          if (item.fact) assert.ok(item.fact[0] && item.fact[1], id + ' item fact should retain its source');
        });
      }
    });
  });
});
