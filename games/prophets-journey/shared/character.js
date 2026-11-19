(function () {
  'use strict';
  var T = window.THREE;
  function mat(color, emissive, roughness) {
    return new T.MeshStandardMaterial({ color: color, emissive: emissive || 0x000000, emissiveIntensity: emissive ? .45 : 0, roughness: roughness === undefined ? .55 : roughness, metalness: .18 });
  }
  window.PJCharacter = {
    create: function () {
      var g = new T.Group();
      var bodyMat = mat(0x38b6c8, 0x123f55), goldMat = mat(0xf4c95d, 0x705214);
      var wingMat = mat(0x85dddf, 0x1b6168), darkMat = mat(0x183849, 0x091821);
      var body = new T.Mesh(new T.CylinderGeometry(.75, .75, 3.3, 16), bodyMat);
      body.rotation.x = Math.PI / 2; body.position.y = .5; g.add(body);
      var nose = new T.Mesh(new T.ConeGeometry(.72, 1.25, 16), goldMat);
      nose.rotation.x = -Math.PI / 2; nose.position.set(0, .5, -2.1); g.add(nose);
      var cockpit = new T.Mesh(new T.SphereGeometry(.62, 16, 10), mat(0xbff4ff, 0x4b91aa));
      cockpit.scale.set(1.15, .55, .75);       cockpit.position.set(0, 1.15, -.45); g.add(cockpit);
      var leftWing = new T.Mesh(new T.BoxGeometry(3.2, .16, 1.05), wingMat);
      leftWing.position.set(1.55, .25, .1); g.add(leftWing);
      var rightWing = leftWing.clone(); rightWing.position.x = -1.55; g.add(rightWing);
      var tailWing = new T.Mesh(new T.BoxGeometry(1.7, .14, .65), goldMat);
      tailWing.position.set(0, .6, 1.45); g.add(tailWing);
      [-.62, .62].forEach(function (x) {
        var tail = new T.Mesh(new T.BoxGeometry(.14, .8, .75), goldMat);
        tail.position.set(x, .92, 1.5); g.add(tail);
      });
      var thrusterL = new T.Mesh(new T.CylinderGeometry(.34, .48, .55, 12), darkMat);
      thrusterL.rotation.x = Math.PI / 2; thrusterL.position.set(.72, .18, 1.7); g.add(thrusterL);
      var thrusterR = thrusterL.clone(); thrusterR.position.x = -.72; g.add(thrusterR);
      var flameMat = new T.MeshBasicMaterial({ color: 0xffd56a, transparent: true, opacity: .85, blending: T.AdditiveBlending, depthWrite: false });
      var leftFlame = new T.Mesh(new T.ConeGeometry(.22, 1.15, 12), flameMat);
      leftFlame.rotation.x = Math.PI / 2; leftFlame.position.set(.72, .18, 2.28); g.add(leftFlame);
      var rightFlame = leftFlame.clone(); rightFlame.position.x = -.72; g.add(rightFlame);
      var ring = new T.Mesh(new T.TorusGeometry(1.15, .045, 8, 28), new T.MeshBasicMaterial({ color: 0xffdf73, transparent: true, opacity: .35 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = -.7; g.add(ring);
      var glow = new T.Mesh(new T.SphereGeometry(1.45, 12, 8), new T.MeshBasicMaterial({ color: 0x71efff, transparent: true, opacity: .07, blending: T.AdditiveBlending, depthWrite: false }));
      g.add(glow);
      var core = new T.Mesh(new T.SphereGeometry(.12, 10, 8), new T.MeshBasicMaterial({ color: 0xfff1a8 }));
      core.position.set(0, .5, -2.1); g.add(core);
      var state = 'idle';
      function setState(next) { state = next; }
      function update(t, dt, motion) {
        motion = motion || {};
        var speed = motion.speed || 0, vertical = motion.vertical || 0, flying = motion.flying;
        if (!motion.grounded && vertical > 1) setState('rise');
        else if (!motion.grounded) setState('fall');
        else if (speed > 8) setState('run');
        else if (speed > .5) setState('walk');
        else setState(flying ? 'fly' : 'idle');
        g.rotation.z += ((motion.turn || 0) * -.12 - g.rotation.z) * Math.min(1, dt * 7);
        g.rotation.x += ((vertical > 1 ? -.12 : vertical < -1 ? .12 : 0) - g.rotation.x) * Math.min(1, dt * 6);
        ring.rotation.z += dt * .8;
        ring.material.opacity = .25 + Math.sin(t * 2) * .08;
        var flame = flying || !motion.grounded ? 1 : .35;
        leftFlame.scale.set(1, flame * (1 + Math.sin(t * 18) * .2), 1);
        rightFlame.scale.set(1, flame * (1 + Math.cos(t * 18) * .2), 1);
        leftFlame.visible = flame > .2; rightFlame.visible = flame > .2;
      }
      g.scale.setScalar(1.05); g.userData.playerVehicle = true; g.name = 'ExplorerVehicle';
      return { group: g, body: body, ring: ring, core: core, glow: glow, setState: setState, update: update, getState: function () { return state; } };
    }
  };
})();
