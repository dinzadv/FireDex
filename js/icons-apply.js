(function() {
  var I = window.FD_ICONS;
  if (!I) return;
  var map = { models: "cube", uuid: "tag", jsonfmt: "json", colors: "texture", snippets: "code", manifest: "manifest", imgjson: "film", versions: "refresh", images: "image", packicon: "star", recipe: "recipe", loot: "loot", blocks: "block", hud: "hud", structures: "structure", textures: "brush" };
  try {
    I.override(ICONS);
    I.override(UI_ICONS);
  } catch (e) {
  }
  TOOLBOX_TOOLS.forEach(function(t) {
    if (map[t.id]) t.icon = I.svg(map[t.id], { size: 28 });
    if (t.id === "imgjson") {
      t.name = "Animator";
      t.desc = "Play images, GIFs and sprite sheets as full-screen animations in the game.";
    }
  });
})();
