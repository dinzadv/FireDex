(function () {
  var I = window.FD_ICONS; if (!I) return;
  try { I.tagLegacy(ICONS); I.tagLegacy(UI_ICONS); } catch (e) { }
  TOOLBOX_TOOLS.forEach(function (t) {
    if (t.id === 'imgjson') { t.name = 'Animator'; t.desc = 'Play images, GIFs and sprite sheets as full-screen animations in the game.'; }
  });
  I.tagTools(TOOLBOX_TOOLS);
})();
