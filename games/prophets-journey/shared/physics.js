(function (root, factory) {
  'use strict';
  var physics = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = physics;
  if (root) root.PJPhysics = physics;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null), function () {
  'use strict';

  function overlaps(x, z, y, obstacle, radius, halfHeight) {
    if (obstacle.active === false || (obstacle.source && !obstacle.source.visible)) return false;
    if (obstacle.top !== undefined && y - halfHeight > obstacle.top) return false;
    if (obstacle.bottom !== undefined && y + halfHeight < obstacle.bottom) return false;
    if (obstacle.kind === 'circle') {
      var dx = x - obstacle.x, dz = z - obstacle.z;
      var reach = radius + obstacle.r;
      return dx * dx + dz * dz < reach * reach;
    }
    var closestX = Math.max(obstacle.x - obstacle.hx, Math.min(x, obstacle.x + obstacle.hx));
    var closestZ = Math.max(obstacle.z - obstacle.hz, Math.min(z, obstacle.z + obstacle.hz));
    var ox = x - closestX, oz = z - closestZ;
    return ox * ox + oz * oz < radius * radius;
  }

  function resolve(position, previous, velocity, obstacles, radius, halfHeight) {
    var blocked = false;
    var candidateZ = position.z;
    position.z = previous.z;
    var candidateX = position.x;
    for (var i = 0; i < obstacles.length; i++) {
      if (overlaps(candidateX, position.z, position.y, obstacles[i], radius, halfHeight)) {
        candidateX = previous.x;
        velocity.x = 0;
        blocked = true;
        break;
      }
    }
    position.x = candidateX;

    for (var j = 0; j < obstacles.length; j++) {
      if (overlaps(position.x, candidateZ, position.y, obstacles[j], radius, halfHeight)) {
        candidateZ = previous.z;
        velocity.z = 0;
        blocked = true;
        break;
      }
    }
    position.z = candidateZ;
    return blocked;
  }

  return { overlaps: overlaps, resolve: resolve };
});
