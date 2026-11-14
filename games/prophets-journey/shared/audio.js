/* نظام الصوت المشترك — بلا موسيقى ولا معازف.
   المؤثرات: ماء وفقاعات مُصنّعة بالكود فقط. الصوت البشري (إنشاد/تلاوة) يُشغَّل من ملفات mp3 يضعها صاحب المشروع في مجلد audio. */
(function () {
  var PJ = window.PJ = window.PJ || {};
  var SK = 'pj.settings.v1', ac = null, mg = null, bed = [], mode = '', file = null;
  function get() {
    var d = { vol: 70, muted: false };
    try { var s = JSON.parse(localStorage.getItem(SK) || 'null'); if (s) { if (typeof s.vol === 'number') d.vol = s.vol; d.muted = !!s.muted; } } catch (e) {}
    return d;
  }
  function put(s) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {} }
  function apply() {
    var s = get();
    if (mg) mg.gain.setTargetAtTime(s.muted ? 0 : s.vol / 100, ac.currentTime, .1);
    if (file) { file.volume = s.vol / 100; file.muted = s.muted; }
  }
  function stopBed() { bed.forEach(function (n) { try { n.stop(); } catch (e) {} }); bed = []; }
  function sea(m) {
    stopBed();
    var n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * .2;
    var s = ac.createBufferSource(); s.buffer = b; s.loop = true;
    var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = m === 'wind' ? 900 : 420;
    var g = ac.createGain(); g.gain.value = m === 'wind' ? .04 : .06;
    var lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .11; lg.gain.value = .03; lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(mg); s.start(); lfo.start(); bed.push(s, lfo);
  }
  function bubble(f, vol) {
    if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain(), n = ac.currentTime, b = Math.max(250, Math.min(800, f || 400));
    o.type = 'sine'; o.frequency.setValueAtTime(b * .6, n); o.frequency.exponentialRampToValueAtTime(b * 1.3, n + .09);
    g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(.0001, n + .14);
    o.connect(g); g.connect(mg); o.start(n); o.stop(n + .2);
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
        if (mode !== m) { mode = m; if (m === 'sea' || m === 'wind') sea(m); else stopBed(); }
        apply();
      } catch (e) { ac = null; }
    },
    tone: function (f, d, t, v) { if (!ac || get().muted) return; try { bubble(f, Math.min(v || .05, .05)); } catch (e) {} },
    /* ملفات صوتية بشرية: يتحقق أولًا من وجود الملف ثم يستدعي cb(true/false) */
    probe: function (url, cb) {
      try {
        var a = new Audio(); a.preload = 'metadata';
        a.addEventListener('loadedmetadata', function () { cb(true); });
        a.addEventListener('error', function () { cb(false); });
        a.src = url;
      } catch (e) { cb(false); }
    },
    play: function (url, loop, onend) {
      try { PJ.audio.stop(); file = new Audio(url); file.loop = !!loop; if (onend) file.onended = onend; apply(); var p = file.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    },
    /* تشغيل عدة ملفات بالتتابع ثم استدعاء done */
    seq: function (urls, done) {
      var i = 0;
      (function next() {
        if (i >= urls.length) { if (done) done(); return; }
        PJ.audio.play(urls[i++], false, next);
      })();
    },
    stop: function () { if (file) { try { file.pause(); } catch (e) {} file = null; } },
    playing: function () { return !!file && !file.paused; },
    bindUI: function (btn, slider) {
      if (slider) slider.value = get().vol;
      label(btn);
      if (btn) btn.onclick = function () { var s = get(); s.muted = !s.muted; put(s); label(btn); apply(); };
      if (slider) slider.oninput = function () { var s = get(); s.vol = +slider.value; if (s.vol > 0) s.muted = false; put(s); label(btn); apply(); };
    }
  };
})();
