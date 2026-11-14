/* نظام الحفظ المشترك لرحلة الأنبياء — مفتاح واحد لكل المغامرات */
window.PJ = window.PJ || {};
PJ.KEY = 'pj.save.v1';
PJ.defaults = function () { return { v: 1, yunus: { step: 0, pearls: 0, done: false } }; };
PJ.load = function () {
  try {
    var s = JSON.parse(localStorage.getItem(PJ.KEY) || 'null');
    if (s && s.v === 1) { var d = PJ.defaults(); for (var k in d) if (!s[k]) s[k] = d[k]; return s; }
  } catch (e) {}
  return PJ.defaults();
};
PJ.store = function (s) { try { localStorage.setItem(PJ.KEY, JSON.stringify(s)); return true; } catch (e) { return false; } };
PJ.reset = function () { return PJ.store(PJ.defaults()); };
