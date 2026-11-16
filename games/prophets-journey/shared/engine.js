/* محرك المغامرات العام: كل مغامرة = ملف بيانات في adventures/<id>.js */
(function () {
'use strict';
var $ = function (i) { return document.getElementById(i); }, clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); }, ss = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
var id = (new URLSearchParams(location.search).get('id') || '').replace(/[^a-z]/g, '');
var isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
if (isTouch) $('root').classList.add('istouch');
function fail(m) { $('nogl').querySelector('h2').textContent = m; $('nogl').querySelector('p').textContent = ''; $('nogl').classList.remove('hidden'); }
var sc = document.createElement('script'); sc.src = 'adventures/' + id + '.js';
sc.onerror = function () { fail('المغامرة غير موجودة'); };
sc.onload = function () { var A = (window.PJ_ADV || {})[id]; if (A) start(A); else fail('المغامرة غير موجودة'); };
document.head.appendChild(sc);

function start(A) {
  if (typeof THREE === 'undefined') return fail('تعذّر تحميل مكتبة العرض');
  var T = A.theme, TR = A.terrain, PK = TR.peak, STEPS = A.steps;
  var save = PJ.load(); save[id] = save[id] || { step: 0, done: false }; var SV = save[id];
  function store() { PJ.store(save); }
  var R; try { R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true }); } catch (e) { return fail('تعذّر تشغيل العرض ثلاثي الأبعاد'); }
  R.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2)); R.setSize(innerWidth, innerHeight);
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
  var S = new THREE.Scene(), FOG = new THREE.Color(T.fog), STORM = new THREE.Color(T.storm || 0x45515c);
  S.background = FOG.clone(); S.fog = new THREE.Fog(FOG.clone(), 30, T.fogFar || 150);
  var cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 400);
  var HB = T.hemi || 1.5, SB = T.sunI || 1.7, DAWN = new THREE.Color(T.dawn || 0xf3b98a);
  var hemi = new THREE.HemisphereLight(T.sky || 0xdff3ff, T.ground[0], HB); S.add(hemi);
  var sun = new THREE.DirectionalLight(0xfff4d6, SB); sun.position.set(40, 80, 20); S.add(sun);
  var seed = 11; function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function H(x, z) {
    var y = TR.kind === 'dunes' ? -4 + Math.sin(x * .04 + z * .02) * 4 + Math.sin(z * .05) * 3 + Math.sin(x * .11 - z * .07) * 1.2
      : -6 + Math.sin(x * .05) * 2.5 + Math.cos(z * .04 + x * .02) * 2.5 + Math.sin(x * .13 + z * .1);
    if (PK) { var dx = x - PK.x, dz = z - PK.z; y += PK.h * Math.exp(-(dx * dx + dz * dz) / (2 * PK.r * PK.r)); }
    (TR.flat || []).forEach(function (f) { var d = Math.hypot(x - f.x, z - f.z), k = 1 - ss((d - f.r) / (f.r * .8)); y = y * (1 - k) + f.y * k; });
    return y;
  }
  var W = TR.w || 160, L = TR.l || 220, CZ = TR.cz || -60, XM = W / 2 - 4, ZA = CZ + L / 2 - 4, ZB = CZ - L / 2 + 4;
  /* التضاريس */
  (function () {
    var g = new THREE.PlaneGeometry(W, L, 130, 180); g.rotateX(-Math.PI / 2); g.translate(0, 0, CZ);
    var p = g.attributes.position; for (var i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)));
    g.computeVertexNormals(); var n = g.attributes.normal, col = new Float32Array(p.count * 3);
    var c0 = new THREE.Color(T.ground[0]), c1 = new THREE.Color(T.ground[1]), c2 = new THREE.Color(T.ground[2]), cr = new THREE.Color(T.rock || 0x7a7468), tmp = new THREE.Color();
    var lo = TR.lo === undefined ? -8 : TR.lo, hi = TR.hi === undefined ? 12 : TR.hi;
    for (var j = 0; j < p.count; j++) {
      var y = p.getY(j), x = p.getX(j), z = p.getZ(j), t = clamp((y - lo) / (hi - lo), 0, 1), sl = clamp((1 - n.getY(j) - .12) * 3, 0, 1), v = (Math.sin(x * .2 + z * .17) + Math.sin(x * .07 - z * .11)) * .25 + .5;
      if (t < .5) tmp.copy(c0).lerp(c1, t * 2); else tmp.copy(c1).lerp(c2, (t - .5) * 2);
      tmp.lerp(c1, v * .25).lerp(cr, sl); col.set([tmp.r, tmp.g, tmp.b], j * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    S.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 })));
  })();
  var water = new THREE.Mesh(new THREE.PlaneGeometry(W * 3, L * 3, 40, 40), new THREE.MeshStandardMaterial({ color: T.water || 0x4f86a0, transparent: true, opacity: .82, roughness: .25, metalness: .1 }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, -200, CZ); S.add(water);
  /* زينة العالم */
  function nearFlat(x, z) { return (TR.flat || []).some(function (f) { return Math.hypot(x - f.x, z - f.z) < f.r + 4; }); }
  var rockM = [0x7a7468, 0x6a645a, 0x8a8478].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: .95, flatShading: true }); });
  function rock(x, z, s) { var m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockM[(rnd() * 3) | 0]); m.scale.set(s, s * (.6 + rnd() * .6), s); m.position.set(x, H(x, z) + s * .3, z); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); S.add(m); }
  var dummy = new THREE.Object3D();
  (A.decor || []).forEach(function (d) {
    if (d.type === 'rocks') { for (var i = 0; i < d.n; i++) { var x = (rnd() - .5) * W * .9, z = CZ + (rnd() - .5) * L * .9; if (!nearFlat(x, z)) rock(x, z, 1 + rnd() * 2.6); } }
    if (d.type === 'trees') {
      var tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(.25, .4, 3, 6).translate(0, 1.5, 0), new THREE.MeshStandardMaterial({ color: 0x6b4a2b }), d.n);
      var cn = new THREE.InstancedMesh(new THREE.ConeGeometry(1.8, 4.2, 7).translate(0, 5, 0), new THREE.MeshStandardMaterial({ roughness: .9 }), d.n), k = 0;
      var cols = (d.colors || [0x3f7d3a, 0x56903f, 0x2f6b3a]).map(function (c) { return new THREE.Color(c); });
      for (var i = 0; i < d.n; i++) { var x = (rnd() - .5) * W * .92, z = CZ + (rnd() - .5) * L * .92, y = H(x, z); if (nearFlat(x, z) || y > (d.maxY || 6)) continue;
        var s = .8 + rnd() * .8; dummy.position.set(x, y, z); dummy.scale.set(s, s, s); dummy.rotation.set(0, rnd() * 6, 0); dummy.updateMatrix(); tr.setMatrixAt(k, dummy.matrix); cn.setMatrixAt(k, dummy.matrix); cn.setColorAt(k, cols[(rnd() * cols.length) | 0]); k++; }
      tr.count = cn.count = k; S.add(tr, cn);
    }
  });
  /* مركبة الاستكشاف (كرة نور) — خيالية وليست جزءًا من القصة */
  var orb = new THREE.Group();
  var shell = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 16), new THREE.MeshStandardMaterial({ color: 0xbff3ff, emissive: 0x2aa6c8, emissiveIntensity: .5, transparent: true, opacity: .4, roughness: .1 }));
  var core = new THREE.Mesh(new THREE.SphereGeometry(.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2b0 }));
  var ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, .13, 10, 40), new THREE.MeshStandardMaterial({ color: 0xf4c95d, emissive: 0xf4c95d, emissiveIntensity: .7 })); ring.rotation.x = Math.PI / 2;
  var glow = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false }));
  orb.add(shell, core, ring, glow); S.add(orb); if (T.night) orb.add(new THREE.PointLight(0xfff2b0, 90, 50, 1.3));
  var guide = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, 30, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); guide.visible = false; S.add(guide);
  /* مطر */
  var RN = 320, rg = new THREE.BufferGeometry(), rp = new Float32Array(RN * 3); for (var i = 0; i < RN * 3; i++) rp[i] = (rnd() - .5) * 60;
  rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  var rain = new THREE.Points(rg, new THREE.PointsMaterial({ color: T.dust || 0xcfe8ff, size: T.dust ? .5 : .22, transparent: true, opacity: .6, depthWrite: false })); rain.visible = false; rain.frustumCulled = false; S.add(rain);

  /* المنشآت التي تُبنى بالتقدم */
  var STR = A.structure, strG = null, strParts = [], strExtra = null, animalSlots = [], animalN = 0;
  if (STR) {
    strG = new THREE.Group(); var sy = H(STR.x, STR.z); strG.position.set(STR.x, sy, STR.z);
    if (STR.type === 'ark') {
      var m1 = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: .9 }), m2 = new THREE.MeshStandardMaterial({ color: 0xa9733a, roughness: .9 });
      for (var i = 0; i < 5; i++) { var sgm = new THREE.Mesh(new THREE.BoxGeometry(8, 2.8, 4), m1); sgm.position.set(0, 1.4, -8 + i * 4); sgm.visible = false; strG.add(sgm); strParts.push(sgm); }
      var cab = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.6, 8), m2); cab.position.set(0, 4.1, 1); cab.visible = false; strG.add(cab); strExtra = cab;
      var bow = new THREE.Mesh(new THREE.ConeGeometry(4.2, 4, 4), m1); bow.rotation.set(Math.PI / 2, Math.PI / 4, 0); bow.position.set(0, 1.4, -12); bow.scale.set(1, 1, .7); bow.visible = false; strG.add(bow); strParts[0].userData.bow = bow;
      for (var a = 0; a < 3; a++) for (var b = -1; b <= 1; b += 2) animalSlots.push([b * 2.6, 3.3, -6 + a * 4]);
    } else if (STR.type === 'house') {
      var sm = new THREE.MeshStandardMaterial({ color: 0x9a8a72, roughness: .95, flatShading: true });
      [[-3.4, -3], [0, -3], [3.4, -3], [-3.4, 3], [0, 3], [3.4, 3]].forEach(function (q) { var bl = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 3.2), sm); bl.position.set(q[0], .9, q[1]); bl.visible = false; strG.add(bl); strParts.push(bl); });
    }
    S.add(strG);
  }
  function reveal(i) { if (strParts[i]) { strParts[i].visible = true; if (strParts[i].userData.bow) strParts[i].userData.bow.visible = true; if (STR.type === 'ark' && i === 4 && strExtra) strExtra.visible = true; } }

  /* الحالة */
  var step = 0, paused = true, introOn = true, M = null, flood = null, ending = false, yaw = 0, pitch = -.12, vel = new THREE.Vector3(), keys = {}, joy = { x: 0, y: 0 }, tUp = false, tDn = false, objs = [];
  var START = A.start || [0, 8, 30];
  orb.position.set(START[0], START[1], START[2]);
  function toast(t, ms) { var e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, ms || 6500); }
  function card(o) { $('ct').textContent = o.t; $('cb').textContent = o.b || ''; $('cd').textContent = o.d || ''; $('cr').textContent = o.r || ''; $('cs').style.display = 'none'; $('cok').textContent = o.btn || 'متابعة'; $('card').classList.remove('hidden'); paused = true; $('cok').onclick = function () { $('card').classList.add('hidden'); paused = false; if (o.done) o.done(); }; }
  var pips = $('pips'); STEPS.forEach(function () { pips.appendChild(document.createElement('i')); });
  function hud() {
    var s = STEPS[Math.min(step, STEPS.length - 1)]; $('mt').textContent = s.t; $('mx').textContent = s.m;
    Array.prototype.forEach.call(pips.children, function (p, i) { p.className = i < step ? 'on' : i === step ? 'cur' : ''; });
    var c = ''; if (M) { if (M.type === 'rings') c = 'الحلقات: ' + M.hit.filter(Boolean).length + '/' + M.pts.length; else if (M.type === 'carry' || M.type === 'discover') c = (s.count || 'المنقول') + ': ' + M.delivered + '/' + M.items.length; } $('cnt').textContent = c;
  }
  function clearObjs() { objs.forEach(function (o) { S.remove(o); if (o.parent && o.parent !== S) o.parent.remove(o); }); objs = []; }
  function makeAnimal(col) { var g = new THREE.Group(), mt = new THREE.MeshStandardMaterial({ color: col, roughness: .8 });
    var b = new THREE.Mesh(new THREE.SphereGeometry(.8, 12, 8), mt); b.scale.set(1.5, 1, 1); var h = new THREE.Mesh(new THREE.SphereGeometry(.45, 10, 8), mt); h.position.set(1.2, .5, 0);
    [-.25, .25].forEach(function (z) { var e = new THREE.Mesh(new THREE.ConeGeometry(.15, .4, 5), mt); e.position.set(1.2, 1, z); g.add(e); });
    for (var k = 0; k < 4; k++) { var l = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .8, 5), mt); l.position.set(k < 2 ? .7 : -.7, -.7, k % 2 ? .35 : -.35); g.add(l); }
    g.add(b, h); return g; }
  function makeItem(kind, col) {
    if (kind === 'animal') return makeAnimal(col);
    var g = new THREE.Group(), mesh = kind === 'stone' ? new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.8), new THREE.MeshStandardMaterial({ color: 0x9a8a72, roughness: .95, flatShading: true }))
      : new THREE.Mesh(new THREE.BoxGeometry(3.2, .35, 1), new THREE.MeshStandardMaterial({ color: 0xb07a3c, roughness: .9 }));
    g.add(mesh); return g;
  }
  function addGlow(g, r) { var h = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(h); }
  function label(text) { var c = document.createElement('canvas'); c.width = 320; c.height = 80; var x = c.getContext('2d'); x.font = '700 44px Tajawal, Tahoma, sans-serif'; x.textAlign = 'center'; x.fillStyle = 'rgba(6,22,31,.7)'; x.fillRect(0, 8, 320, 64); x.fillStyle = '#f4e6b4'; x.fillText(text, 160, 56);
    var sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true })); sp2.scale.set(7, 1.75, 1); sp2.renderOrder = 9; return sp2; }
  function lm(kind) {
    var g = new THREE.Group(), mat = function (c, e) { return new THREE.MeshStandardMaterial({ color: c, emissive: e || 0, emissiveIntensity: e ? .6 : 0, roughness: .8 }); };
    if (kind === 'earth') g.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 8, 0, 6.283, 0, 1.57), mat(0x8a5a2b, 0x3a2000)));
    else if (kind === 'light' || kind === 'star') { var o = new THREE.Mesh(new THREE.OctahedronGeometry(1.6), mat(kind === 'star' ? 0xbfe8ff : 0xfff2b0, kind === 'star' ? 0x4aa0ff : 0xffd34a)); o.position.y = 2; g.add(o); g.userData.spin = o; }
    else if (kind === 'book') [-1, 1].forEach(function (k) { var b = new THREE.Mesh(new THREE.BoxGeometry(1.6, .2, 2.2), mat(0xfff4d6, 0x806a30)); b.position.set(k * .85, 1.2, 0); b.rotation.z = -k * .25; g.add(b); });
    else if (kind === 'gate') { [-2, 2].forEach(function (x) { var c = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, 5, 8), mat(0xf4e6b4, 0x806a30)); c.position.set(x, 2.5, 0); g.add(c); }); var a = new THREE.Mesh(new THREE.TorusGeometry(2, .3, 8, 20, Math.PI), mat(0xf4c95d, 0xb08a20)); a.position.y = 5; g.add(a); }
    else if (kind === 'tree') { var t = new THREE.Mesh(new THREE.CylinderGeometry(.35, .5, 3, 7), mat(0x6b4a2b)); t.position.y = 1.5; var cn = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.5, 8), mat(0x3f9d4a, 0x0a4a1a)); cn.position.y = 5; g.add(t, cn); }
    else if (kind === 'fountain') { var b2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.4, .8, 16), mat(0xcfd8dc)); b2.position.y = .4; var w = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, .9, 16), mat(0x4fc3f7, 0x0277bd)); w.position.y = .55; g.add(b2, w); }
    else if (kind === 'tower') for (var i = 0; i < 4; i++) { var tb = new THREE.Mesh(new THREE.BoxGeometry(3 - i * .5, 3.2, 3 - i * .5), mat(0xc9a870)); tb.position.y = 1.6 + i * 3.2; g.add(tb); }
    else if (kind === 'rockhouse') { var r = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 3), mat(0xa0694a)); r.position.y = 2.5; var d1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, .5), mat(0x2a1a10)); d1.position.set(0, 1.4, 1.6); var d2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, .5), mat(0x2a1a10)); d2.position.set(-2, 3.4, 1.6); g.add(r, d1, d2); }
    else if (kind === 'camel') { var a2 = makeAnimal(0xc8a56a); a2.scale.setScalar(1.8); a2.position.y = 2.2; var nk = new THREE.Mesh(new THREE.CylinderGeometry(.25, .35, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0xc8a56a })); nk.position.set(1.8, .9, 0); nk.rotation.z = -.5; a2.add(nk); g.add(a2); }
    else if (kind === 'lamp') { var pl = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, 4, 6), mat(0x3a3a3a)); pl.position.y = 2; var sb = new THREE.Mesh(new THREE.SphereGeometry(.6, 10, 8), mat(0xffe08a, 0xffc040)); sb.position.y = 4.3; g.add(pl, sb); }
    return g;
  }
  function buildStep(n) {
    clearObjs(); var s = STEPS[n]; M = { type: s.type };
    if (s.type === 'rings') { M.pts = s.pts.map(function (a) { return new THREE.Vector3(a[0], a[1], a[2]); }); M.hit = M.pts.map(function () { return false; });
      M.meshes = M.pts.map(function (p) { var m = new THREE.Mesh(new THREE.TorusGeometry(3.2, .34, 16, 48), new THREE.MeshStandardMaterial({ color: 0xf4c95d, emissive: 0xf4c95d, emissiveIntensity: .8 })); m.add(new THREE.Mesh(new THREE.TorusGeometry(3.2, .8, 10, 48), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false }))); m.position.copy(p); S.add(m); objs.push(m); return m; }); }
    if (s.type === 'carry') {
      M.delivered = 0; M.carry = null; M.to = new THREE.Vector3(s.to[0], H(s.to[0], s.to[1]) + 1.5, s.to[1]);
      M.items = s.items.map(function (it, ix) { var g = makeItem(s.kind, it.color); var y = H(it[0] === undefined ? it.x : it[0], it.z) ; g.position.set(it.x, H(it.x, it.z) + 1.2, it.z); addGlow(g, 1.8); g.visible = ix === 0; S.add(g); objs.push(g); return { g: g, done: false, fact: it.fact, color: it.color }; });
      var pad = new THREE.Mesh(new THREE.TorusGeometry(6, .25, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .8 })); pad.rotation.x = Math.PI / 2; pad.position.set(s.to[0], M.to.y - 1, s.to[1]); S.add(pad); objs.push(pad); M.pad = pad;
    }
    if (s.type === 'discover') {
      M.delivered = 0; M.items = s.items.map(function (it, ix) { var g = lm(it.kind), y = it.y !== undefined ? it.y : H(it.x, it.z); g.position.set(it.x, y, it.z); addGlow(g, 3); var lb = label(it.name); lb.position.y = 7; g.add(lb); g.visible = ix === 0; S.add(g); objs.push(g); return { g: g, fact: it.fact }; });
    }
    if (s.type === 'storm') { M.pos = new THREE.Vector3(s.pos[0], H(s.pos[0], s.pos[1]) + 3, s.pos[1]); M.t = 0; M.wind = s.wind || [1, 0]; M.force = s.force || 7; var bm = new THREE.Mesh(new THREE.OctahedronGeometry(2), new THREE.MeshBasicMaterial({ color: 0xfff2b0 })); bm.position.copy(M.pos); S.add(bm); objs.push(bm); }
    if (s.type === 'flood') { M.pos = new THREE.Vector3(s.pos[0], H(s.pos[0], s.pos[1]) + 3, s.pos[1]); }
    hud();
  }
  function setStep(n, spawn) {
    step = n; SV.step = n; store();
    for (var i = 0; i < n; i++) if (STEPS[i].type === 'carry') STEPS[i].items.forEach(function (_, k) { if (STEPS[i].reveals === 'parts') reveal(k + (STEPS[i].offset || 0)); });
    if (n >= 0 && STEPS[n].type === 'flood') {}
    buildStep(n); if (spawn) { var p = STEPS[n].spawn || START; orb.position.set(p[0], p[1], p[2]); yaw = STEPS[n].yaw || 0; vel.set(0, 0, 0); }
  }
  function nextStep() { if (step + 1 >= STEPS.length) return finish(); var n = step + 1; setStep(n, false); var s = STEPS[n]; if (s.intro) toast(s.intro, 7000); if (s.type === 'flood') startFlood(); }
  function startFlood() { flood = { t: 0, phase: 'rise', r: 0 }; rain.visible = true; PJ.audio.tone(140, 1, 'sine', .05); }
  var FXS = null;
  function finish() {
    SV.done = true; SV.step = STEPS.length; store(); ending = true; flood = flood || null;
    if (A.ending.fx) { FXS = { t: 0, k: A.ending.fx, shown: false }; paused = true; } else showEnding();
  }
  function showEnding() {
    card({ t: A.ending.t, b: A.ending.b, r: A.ending.r, btn: 'العودة إلى المركز', done: function () { location.href = '../prophets-journey.html'; } });
  }
  function target() {
    if (!M || ending) return null;
    if (M.type === 'rings') { var i = M.hit.indexOf(false); return i < 0 ? null : M.pts[i]; }
    if (M.type === 'carry') { if (M.carry) return M.to; var cur = M.items[M.delivered]; return cur ? cur.g.position : null; }
    if (M.type === 'discover') { var cd = M.items[M.delivered]; return cd ? cd.g.position : null; }
    if (M.type === 'flood' || M.type === 'storm') return M.pos; return null;
  }
  /* الإدخال */
  addEventListener('keydown', function (e) { if (/^(Space|Arrow)/.test(e.code)) e.preventDefault(); keys[e.code] = true; });
  addEventListener('keyup', function (e) { keys[e.code] = false; }); addEventListener('blur', function () { keys = {}; });
  var pad = $('joy'), knob = $('knob'), jid = null;
  function jset(e) { var r = pad.getBoundingClientRect(), m = r.width * .4, dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), l = Math.hypot(dx, dy); if (l > m) { dx *= m / l; dy *= m / l; } joy.x = dx / m; joy.y = dy / m; knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
  pad.addEventListener('pointerdown', function (e) { jid = e.pointerId; pad.setPointerCapture(jid); jset(e); });
  pad.addEventListener('pointermove', function (e) { if (e.pointerId === jid) jset(e); });
  function jend(e) { if (e.pointerId === jid) { jid = null; joy.x = joy.y = 0; knob.style.transform = ''; } } pad.addEventListener('pointerup', jend); pad.addEventListener('pointercancel', jend);
  function hb(i, fn) { var b = $(i); b.addEventListener('pointerdown', function (e) { e.preventDefault(); b.setPointerCapture(e.pointerId); fn(true); }); var u = function () { fn(false); }; b.addEventListener('pointerup', u); b.addEventListener('pointercancel', u); }
  hb('bUp', function (v) { tUp = v; }); hb('bDn', function (v) { tDn = v; });
  var cid = null, lx = 0, ly = 0, cv = $('c');
  cv.addEventListener('pointerdown', function (e) { cid = e.pointerId; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(cid); });
  cv.addEventListener('pointermove', function (e) { if (e.pointerId !== cid) return; yaw -= (e.clientX - lx) * .005; pitch = clamp(pitch - (e.clientY - ly) * .003, -.7, .5); lx = e.clientX; ly = e.clientY; });
  function cend(e) { if (e.pointerId === cid) cid = null; } cv.addEventListener('pointerup', cend); cv.addEventListener('pointercancel', cend);
  addEventListener('resize', function () { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); });

  var up = new THREE.Vector3(0, 1, 0), WL0 = -200, WHI = (A.flood && A.flood.level) || 14;
  function update(dt, t) {
    var sp = orb.position, storm = 0;
    if (M && M.type === 'storm') { M.t += dt; storm = Math.min(1, M.t / 4); rain.visible = true; }
    if (!paused) {
      var f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y, r = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + joy.x, u = (keys.Space || tUp ? 1 : 0) - (keys.KeyC || keys.ShiftLeft || tDn ? 1 : 0);
      if (keys.ArrowLeft) yaw += 1.6 * dt; if (keys.ArrowRight) yaw -= 1.6 * dt;
      var want = new THREE.Vector3(-Math.sin(yaw) * f + Math.cos(yaw) * r, u * .8, -Math.cos(yaw) * f - Math.sin(yaw) * r); if (want.lengthSq() > 1) want.normalize(); want.multiplyScalar(16);
      vel.lerp(want, 1 - Math.exp(-4 * dt)); sp.addScaledVector(vel, dt);
      if (M && M.type === 'storm') { sp.x += M.wind[0] * M.force * storm * dt; sp.z += M.wind[1] * M.force * storm * dt; }
    } else vel.multiplyScalar(.95);
    sp.x = clamp(sp.x, -XM, XM); sp.z = clamp(sp.z, ZB, ZA); sp.y = clamp(sp.y, H(sp.x, sp.z) + 2.2, A.ceiling || 48);
    orb.rotation.y += dt * .8; ring.rotation.z += dt * 1.5; core.scale.setScalar(1 + Math.sin(t * 3) * .08);
    /* المهام */
    if (!paused && M && !ending) {
      if (M.type === 'rings') { M.meshes.forEach(function (m, i) { if (!M.hit[i] && sp.distanceTo(M.pts[i]) < 4.4) { M.hit[i] = true; m.material.emissiveIntensity = 2; PJ.audio.tone(480 + i * 120, .25, 'triangle', .05); hud(); if (M.hit.every(Boolean)) { toast('أحسنت! ' + (STEPS[step].done || 'تعلّمتَ قيادة المركبة.'), 4000); setTimeout(nextStep, 900); M.type = 'wait'; } } }); }
      else if (M.type === 'carry') {
        if (!M.carry) { for (var i = 0; i < M.items.length; i++) { var it = M.items[i]; if (i === M.delivered && !it.done && it.g.position.distanceTo(sp) < 5.2) { M.carry = it; S.remove(it.g); orb.add(it.g); it.g.position.set(0, -2.6, 0); it.g.scale.setScalar(.8); PJ.audio.tone(520, .2, 'triangle', .05); toast('تم الالتقاط. أوصله إلى الدائرة المضيئة.', 3500); break; } } }
        else if (Math.hypot(sp.x - M.to.x, sp.z - M.to.z) < 6.5 && Math.abs(sp.y - M.to.y) < 9) {
          var it2 = M.carry; M.carry = null; orb.remove(it2.g); it2.done = true; var k = M.delivered++; var st = STEPS[step]; if (M.items[M.delivered]) M.items[M.delivered].g.visible = true;
          if (st.reveals === 'parts') reveal(k + (st.offset || 0)); else if (st.reveals === 'animals' && animalSlots[k]) { var a = makeAnimal(it2.color); a.scale.setScalar(.55); a.position.set.apply(a.position, animalSlots[k]); strG.add(a); }
          PJ.audio.tone(660, .3, 'triangle', .05); if (it2.fact) toast(it2.fact[0] + '  [' + it2.fact[1] + ']', 8000); hud();
          if (M.delivered >= M.items.length) { var mm = M; M = { type: 'wait' }; setTimeout(function () { if (!ending) nextStep(); }, 1600); }
        }
      }
      else if (M.type === 'discover') {
        var cur = M.items[M.delivered];
        if (cur && cur.g.position.distanceTo(sp) < 7) { M.delivered++; PJ.audio.tone(560 + M.delivered * 60, .3, 'triangle', .05); toast(cur.fact[0] + '  [' + cur.fact[1] + ']', 9500);
          if (M.items[M.delivered]) M.items[M.delivered].g.visible = true; hud();
          if (M.delivered >= M.items.length) { M = { type: 'wait' }; setTimeout(function () { if (!ending) nextStep(); }, 2600); } }
      }
      else if (M.type === 'storm' && sp.distanceTo(M.pos) < 8) { toast(STEPS[step].settle, 9500); rain.visible = false; M = { type: 'wait' }; setTimeout(function () { if (!ending) nextStep(); }, 3800); }
      else if (M.type === 'flood' && flood && flood.phase === 'rise' && sp.distanceTo(M.pos) < 8) { flood.phase = 'recede'; flood.r = 0; toast(A.flood.settle, 9000); }
    }
    /* الطوفان: ارتفاع الماء، والسفينة تطفو وتتجه نحو الجبل ثم تستقر */
    if (flood) {
      flood.t += dt; var dest = A.flood.dest, dy = H(dest[0], dest[1]) + .4;
      if (flood.phase === 'rise') { var k2 = ss(flood.t / A.flood.dur); water.position.y = WL0 + (WHI - WL0) * k2 * k2 * k2 * 0 + (WHI - (-60)) * 0; water.position.y = -30 + (WHI + 30) * k2; storm = Math.min(1, flood.t / 6);
        if (strG) { strG.position.x += (dest[0] - strG.position.x) * dt * .05 * k2; strG.position.z += (dest[1] - strG.position.z) * dt * .05 * k2; strG.position.y = Math.max(H(STR.x, STR.z), water.position.y + .6) + Math.sin(t * 1.3) * .15; } }
      else { flood.r += dt; var k3 = ss(flood.r / 9); water.position.y = WHI - (WHI + 30) * k3 * .0 - (WHI - (dy - 3)) * k3; storm = 1 - k3;
        if (strG) { strG.position.x += (dest[0] - strG.position.x) * dt * .6; strG.position.z += (dest[1] - strG.position.z) * dt * .6; var ty = Math.max(dy, water.position.y + .6); strG.position.y += (ty - strG.position.y) * dt * 1.5; }
        if (flood.r > 10 && !ending) { rain.visible = false; finish(); } }
      water.geometry.attributes.position.needsUpdate = false;
    }
    if (rain.visible) { var rp2 = rain.geometry.attributes.position; for (var q = 0; q < RN; q++) { var x = rp2.getX(q), y = rp2.getY(q) - dt * (T.dust ? 3 : 38), z = rp2.getZ(q); if (T.dust && M && M.wind) { x += dt * 40 * M.wind[0]; z += dt * 40 * M.wind[1]; } if (y - sp.y < -25) y += 50; else if (y - sp.y > 25) y -= 50; if (x - sp.x > 30) x -= 60; else if (x - sp.x < -30) x += 60; if (z - sp.z > 30) z -= 60; else if (z - sp.z < -30) z += 60; rp2.setXYZ(q, x, y, z); } rp2.needsUpdate = true; rain.material.opacity = (T.dust ? .8 : .6) * storm; }
    S.fog.color.copy(FOG).lerp(STORM, storm * .85); S.background.copy(S.fog.color); S.fog.far = (T.fogFar || 150) - storm * 60; hemi.intensity = HB * (1 - storm * .45); sun.intensity = SB * (1 - storm * .65);
    /* الحلقات وهدف المهمة */
    if (M && M.type === 'rings') M.meshes.forEach(function (m, i) { m.rotation.z = t * .5 + i; if (!M.hit[i]) m.material.emissiveIntensity = .7 + Math.sin(t * 3) * .25; });
    var tg = target();
    if (tg && !paused && !introOn) { var dx = tg.x - sp.x, dz = tg.z - sp.z, fx = -Math.sin(yaw), fz = -Math.cos(yaw), ang = Math.atan2(dx * Math.cos(yaw) - dz * Math.sin(yaw), dx * fx + dz * fz), d = Math.hypot(dx, dz, tg.y - sp.y);
      $('na').style.transform = 'rotate(' + ang + 'rad)'; $('nd').textContent = Math.round(d) + ' م' + (Math.abs(tg.y - sp.y) > 5 ? (tg.y > sp.y ? ' ⬆' : ' ⬇') : ''); $('nav').style.display = 'flex'; guide.visible = true; guide.position.set(tg.x, tg.y + 14, tg.z); guide.material.opacity = .16 + Math.sin(t * 3) * .05; }
    else { $('nav').style.display = 'none'; guide.visible = false; }
    if (M && M.pad) M.pad.rotation.z = t;
    if (M && M.items) M.items.forEach(function (it) { if (it.g.userData.spin) it.g.userData.spin.rotation.y = t; });
    /* الكاميرا */
    if (introOn) { var a = t * .15; cam.position.set(sp.x + Math.sin(a) * 16, sp.y + 5, sp.z + Math.cos(a) * 16); cam.lookAt(sp.x, sp.y, sp.z); }
    else { var off = new THREE.Vector3(0, 4.4 - pitch * 4, 12).applyAxisAngle(up, yaw), tgt = sp.clone().add(off); tgt.y = Math.max(tgt.y, H(tgt.x, tgt.z) + 1); cam.position.lerp(tgt, 1 - Math.exp(-7 * dt)); cam.lookAt(sp.x - Math.sin(yaw) * 12, sp.y + 1 + pitch * 6, sp.z - Math.cos(yaw) * 12); }
    if (FXS) { FXS.t += dt; var amp = Math.min(1, FXS.t / 1.2) * (FXS.t < 4 ? 1 : Math.max(0, 5 - FXS.t)); cam.position.x += (Math.random() - .5) * .9 * amp; cam.position.y += (Math.random() - .5) * .9 * amp;
      if (FXS.k === 'dawn') { var kd = ss(FXS.t / 4); S.fog.color.lerp(DAWN, kd); S.background.copy(S.fog.color); hemi.intensity = HB + kd * 1.2; sun.intensity = SB + kd * 1.2; }
      if (FXS.t > 4.8 && !FXS.shown) { FXS.shown = true; showEnding(); } }
  }
  var last = performance.now();
  function loop(now) { var dt = Math.min((now - last) / 1000, .05); last = now; update(dt, now / 1000); R.render(S, cam); requestAnimationFrame(loop); }
  /* البدء */
  $('intro').querySelector('h2').textContent = A.title; $('intro').querySelector('p').textContent = A.intro;
  ['ai', 'as'].forEach(function (k) { if ($(k)) $(k).remove(); });
  $('mute').onclick = null; PJ.audio.bindUI($('mute'), $('vol'));
  document.title = 'رحلة الأنبياء — ' + A.title;
  function begin(fresh) {
    introOn = false; PJ.audio.init(A.ambient || 'wind'); try { window.focus(); } catch (e) { }
    if (fresh) { SV.step = 0; SV.done = false; }
    var s = SV.done && !fresh ? 0 : clamp(SV.step || 0, 0, STEPS.length - 1); ending = false; FXS = null; flood = null; water.position.y = -200; rain.visible = false;
    setStep(s, true); if (STEPS[s].type === 'flood') startFlood(); $('intro').classList.add('hidden'); paused = false;
  }
  if (SV.step > 0 && !SV.done) { $('go').textContent = 'متابعة المغامرة'; $('fresh').style.display = ''; } else if (SV.done) $('go').textContent = 'العب المغامرة مرة أخرى';
  $('go').onclick = function () { begin(false); }; $('fresh').onclick = function () { begin(true); };
  buildStep(0); hud(); requestAnimationFrame(loop);
}
})();
