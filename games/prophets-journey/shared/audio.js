/* نظام الصوت المشترك — كله مُصنّع بالكود (لا ملفات صوتية ولا تلاوة). الإعدادات تُحفظ بمفتاح مستقل. */
(function () {
  var PJ = window.PJ = window.PJ || {};
  var SK = 'pj.settings.v1', ac = null, mg = null, bed = [], timer = null, mode = '', step = 0;
  var PENTA = [293.66, 329.63, 369.99, 440, 493.88, 587.33];
  function get() {
    var d = { vol: 40, muted: false };
    try { var s = JSON.parse(localStorage.getItem(SK) || 'null'); if (s) { if (typeof s.vol === 'number') d.vol = s.vol; d.muted = !!s.muted; } } catch (e) {}
    return d;
  }
  function put(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {} }
  function apply() { if (mg) mg.gain.setTargetAtTime(get().muted ? 0 : get().vol / 100, ac.currentTime, .1); }
  function note(f, dur, vol, type) {
    if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain(), n = ac.currentTime;
    o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(mg);
    g.gain.setValueAtTime(0.0001, n); g.gain.linearRampToValueAtTime(vol, n + .06); g.gain.exponentialRampToValueAtTime(.0001, n + dur);
    o.start(n); o.stop(n + dur + .05);
  }
  function stopBed() { if (timer) clearInterval(timer); timer = null; bed.forEach(function (n) { try { n.stop(); } catch (e) {} }); bed = []; }
  function startBed(m) {
    stopBed(); mode = m;
    var g = ac.createGain(); g.gain.value = m === 'sea' ? .07 : .045; g.connect(mg);
    [110, 164.81].forEach(function (f) { var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(g); o.start(); bed.push(o); });
    if (m === 'sea') {
      var n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * .2;
      var s = ac.createBufferSource(); s.buffer = b; s.loop = true;
      var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 400;
      var ng = ac.createGain(); ng.gain.value = .05; s.connect(f); f.connect(ng); ng.connect(g); s.start(); bed.push(s);
    }
    timer = setInterval(function () {
      step = Math.max(0, Math.min(PENTA.length - 1, step + Math.floor(Math.random() * 3) - 1));
      var hub = mode === 'hub';
      note(PENTA[step] * (hub ? 1 : .5), hub ? 2.2 : 3, hub ? .05 : .035);
      if (mode === 'sea' && Math.random() < .3) note(900 + Math.random() * 500, .12, .02);
    }, mode === 'sea' ? 2300 : 1600);
  }
  function label(b) { if (b) b.textContent = get().muted ? '🔇' : '🔊'; }
  PJ.audio = {
    init: function (m) {
      try {
        if (!ac) {
          var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
          ac = new C(); mg = ac.createGain(); mg.gain.value = 0; mg.connect(ac.destination);
        }
        if (ac.state === 'suspended' && ac.resume) ac.resume();
        if (mode !== m) startBed(m);
        apply();
      } catch (e) { ac = null; }
    },
    tone: function (f, d, t, v) { if (!ac || get().muted) return; try { note(f, d || .25, v || .06, t); } catch (e) {} },
    bindUI: function (btn, slider) {
      if (slider) slider.value = get().vol;
      label(btn);
      if (btn) btn.onclick = function () { var s = get(); s.muted = !s.muted; put(s); label(btn); apply(); };
      if (slider) slider.oninput = function () { var s = get(); s.vol = +slider.value; if (s.vol > 0) s.muted = false; put(s); label(btn); apply(); };
    }
  };
})();
