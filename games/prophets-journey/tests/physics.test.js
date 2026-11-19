'use strict';
var test = require('node:test');
var assert = require('node:assert/strict');
var physics = require('../shared/physics.js');

test('blocks vehicle movement at a tree while grounded', function () {
  var position = { x: 0, z: -1, y: 1.5 };
  var previous = { x: 0, z: 0 };
  var velocity = { x: 0, z: -5 };
  var obstacles = [{ kind: 'circle', x: 0, z: -2, r: 1, top: 8 }];

  assert.equal(physics.resolve(position, previous, velocity, obstacles, 1, 1), true);
  assert.equal(position.z, 0);
  assert.equal(velocity.z, 0);
});

test('allows flying above a tree canopy', function () {
  var position = { x: 0, z: 0, y: 12 };
  var previous = { x: 0, z: 1 };
  var velocity = { x: 0, z: -5 };
  var obstacles = [{ kind: 'circle', x: 0, z: -2, r: 1, top: 8 }];

  assert.equal(physics.resolve(position, previous, velocity, obstacles, 1, 1), false);
  assert.equal(position.z, 0);
});

test('slides along a wall instead of cancelling both movement axes', function () {
  var position = { x: 1, z: -1.25, y: 1 };
  var previous = { x: 0, z: 0 };
  var velocity = { x: 4, z: -4 };
  var obstacles = [{ kind: 'box', x: 0, z: -2, hx: 2, hz: .5 }];

  assert.equal(physics.resolve(position, previous, velocity, obstacles, .5, 1), true);
  assert.equal(position.x, 1);
  assert.equal(position.z, 0);
  assert.equal(velocity.x, 4);
  assert.equal(velocity.z, 0);
});
