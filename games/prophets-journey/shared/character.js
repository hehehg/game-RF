(function () {
  'use strict';
  var T = window.THREE;

  function mat(color, roughness) {
    return new T.MeshStandardMaterial({ color: color, roughness: roughness === undefined ? .8 : roughness });
  }

  window.PJCharacter = {
    create: function (options) {
      options = options || {};
      var g = new T.Group();
      var clothes = mat(options.clothes || 0x287fb5);
      var accent = mat(options.accent || 0xf4c95d);
      var skin = mat(options.skin || 0xd69b6a);
      var dark = mat(options.dark || 0x263746);
      var hair = mat(options.hair || 0x4a3026);

      var shadow = new T.Mesh(new T.CircleGeometry(1.15, 24), new T.MeshBasicMaterial({
        color: 0x07131a, transparent: true, opacity: .28, depthWrite: false
      }));
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -.05;
      g.add(shadow);

      var body = new T.Mesh(new T.CylinderGeometry(.72, .58, 1.45, 12), clothes);
      body.position.y = 1.65;
      g.add(body);

      var head = new T.Mesh(new T.SphereGeometry(.72, 18, 12), skin);
      head.position.y = 3.15;
      g.add(head);

      var hairMesh = new T.Mesh(new T.SphereGeometry(.74, 16, 8, 0, Math.PI * 2, 0, Math.PI * .48), hair);
      hairMesh.position.y = 3.25;
      g.add(hairMesh);

      var eyeGeo = new T.SphereGeometry(.09, 8, 6);
      [-.25, .25].forEach(function (x) {
        var eye = new T.Mesh(eyeGeo, dark);
        eye.position.set(x, 3.18, -.67);
        g.add(eye);
      });

      var nose = new T.Mesh(new T.SphereGeometry(.08, 8, 6), skin);
      nose.position.set(0, 3.04, -.72);
      g.add(nose);

      var hat = new T.Mesh(new T.CylinderGeometry(.78, .78, .13, 18), accent);
      hat.position.y = 3.78;
      g.add(hat);
      var hatTop = new T.Mesh(new T.ConeGeometry(.55, .38, 18), accent);
      hatTop.position.y = 4.02;
      g.add(hatTop);

      var backpack = new T.Mesh(new T.BoxGeometry(1.05, 1.25, .38), mat(options.backpack || 0xe8a44a));
      backpack.position.set(0, 1.7, .58);
      g.add(backpack);

      var legs = [], arms = [];
      [-.38, .38].forEach(function (x) {
        var leg = new T.Mesh(new T.CylinderGeometry(.16, .14, .82, 8), dark);
        leg.position.set(x, .82, 0);
        g.add(leg); legs.push(leg);
        var arm = new T.Mesh(new T.CylinderGeometry(.14, .12, .88, 8), clothes);
        arm.position.set(x * 1.9, 1.75, 0);
        g.add(arm); arms.push(arm);
      });

      var ring = new T.Mesh(new T.TorusGeometry(1.28, .055, 8, 28), new T.MeshBasicMaterial({
        color: 0xffdf73, transparent: true, opacity: .45
      }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -.5;
      g.add(ring);
      var core = new T.Mesh(new T.SphereGeometry(.16, 12, 8), new T.MeshBasicMaterial({ color: 0xfff2b0 }));
      core.position.y = 4.18;
      g.add(core);
      var glow = new T.Mesh(new T.SphereGeometry(1.7, 12, 8), new T.MeshBasicMaterial({
        color: 0xffdf73, transparent: true, opacity: .08, depthWrite: false, blending: T.AdditiveBlending
      }));
      glow.position.y = 2;
      g.add(glow);

      var state = 'idle';
      function setState(next) { state = next; }
      function update(t, dt, motion) {
        motion = motion || {};
        var speed = motion.speed || 0;
        var grounded = motion.grounded !== false;
        var vertical = motion.vertical || 0;
        if (!grounded) setState(vertical > 1 ? 'rise' : 'fall');
        else if (speed > 10) setState('run');
        else if (speed > .5) setState('walk');
        else setState('idle');

        var breathe = Math.sin(t * 2.2) * .025;
        body.scale.y = 1 + breathe;
        head.position.y = 3.15 + breathe;
        ring.rotation.z += dt * .7;
        ring.material.opacity = .32 + Math.sin(t * 2) * .08;
        glow.scale.setScalar(1 + Math.sin(t * 1.8) * .04);

        var phase = t * (state === 'run' ? 10 : 6);
        legs[0].rotation.x = grounded ? Math.sin(phase) * Math.min(.55, speed * .04) : -.3;
        legs[1].rotation.x = grounded ? -legs[0].rotation.x : .25;
        arms[0].rotation.x = grounded ? -legs[0].rotation.x * .65 : -.7;
        arms[1].rotation.x = grounded ? -legs[1].rotation.x * .65 : -.45;
        g.rotation.z += (-(motion.turn || 0) * .08 - g.rotation.z) * Math.min(1, dt * 8);
        g.position.y += Math.max(0, vertical > 0 ? .002 : 0);
      }

      g.scale.setScalar(.9);
      g.userData.playerCharacter = true;

      var characterSprite = null;
      var texLoader = new T.TextureLoader();
      texLoader.load('assets/maincharcter.png', function (texture) {
        texture.colorSpace = T.SRGBColorSpace;
        characterSprite = new T.Sprite(new T.SpriteMaterial({ map: texture, transparent: true, alphaTest: .05 }));
        characterSprite.center.set(.5, 0);
        characterSprite.scale.set(4.8, 5.2, 1);
        characterSprite.position.y = 0;
        characterSprite.renderOrder = 2;
        g.add(characterSprite);
        g.children.forEach(function (child) {
          if (child !== characterSprite && child !== shadow && child !== ring && child !== glow) child.visible = false;
        });
      });

      var originalUpdate = update;
      update = function (t, dt, motion) {
        originalUpdate(t, dt, motion);
        if (characterSprite) {
          characterSprite.position.y = Math.sin(t * 2.2) * (motion.speed > .5 ? .035 : .018);
          var breathe = 1 + Math.sin(t * 2.2) * .012;
          characterSprite.scale.set(4.8 * (1 + Math.abs(motion.turn || 0) * .018), 5.2 * breathe, 1);
        }
      };

      return { group: g, body: body, head: head, legs: legs, arms: arms, ring: ring, core: core, glow: glow, shadow: shadow, setState: setState, update: update, getState: function () { return state; }, sprite: function () { return characterSprite; } };
    }
  };
})();
