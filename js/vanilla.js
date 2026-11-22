(function() {
  var REPO = "Mojang/bedrock-samples", BRANCH = "main", DIR = "resource_pack/textures/blocks";
  var RAW = "https://raw.githubusercontent.com/" + REPO + "/" + BRANCH + "/" + DIR + "/";
  var CK = "fd_vanilla_list_v1", TTL = 7 * 864e5;
  var FALLBACK = "stone dirt cobblestone planks_oak planks_spruce planks_birch planks_jungle planks_acacia planks_big_oak sand gravel gold_ore iron_ore coal_ore diamond_ore redstone_ore lapis_ore emerald_ore log_oak log_spruce log_birch glass sponge brick bookshelf obsidian ice snow netherrack glowstone stonebrick sandstone_normal wool_colored_white wool_colored_red wool_colored_blue wool_colored_green wool_colored_yellow wool_colored_black iron_block gold_block diamond_block emerald_block lapis_block redstone_block quartz_block_side bedrock grass_side grass_top leaves_oak crafting_table_top furnace_front_off tnt_side tnt_top pumpkin_face_off pumpkin_top melon_side melon_top clay hardened_clay soul_sand end_stone prismarine_bricks sea_lantern".split(" ");
  var listP = null, imgs = {};
  function list() {
    if (listP) return listP;
    try {
      var c = JSON.parse(localStorage.getItem(CK) || "null");
      if (c && Date.now() - c.t < TTL && c.l.length) return listP = Promise.resolve(c.l);
    } catch (e) {
    }
    listP = fetch("https://api.github.com/repos/" + REPO + "/contents/" + DIR + "?ref=" + BRANCH).then(function(r) {
      if (!r.ok) throw new Error("GitHub " + r.status);
      return r.json();
    }).then(function(a) {
      var l = a.filter(function(f) {
        return f.type === "file" && /\.png$/i.test(f.name);
      }).map(function(f) {
        return f.name.replace(/\.png$/i, "");
      }).sort();
      if (!l.length) throw new Error("empty");
      try {
        localStorage.setItem(CK, JSON.stringify({ t: Date.now(), l }));
      } catch (e) {
      }
      return l;
    }).catch(function() {
      return FALLBACK.slice();
    });
    return listP;
  }
  function image(name) {
    if (imgs[name]) return imgs[name];
    return imgs[name] = new Promise(function(res, rej) {
      var i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = function() {
        res(i);
      };
      i.onerror = function() {
        delete imgs[name];
        rej(new Error("No se pudo cargar " + name));
      };
      i.src = RAW + name + ".png";
    });
  }
  function canvas(name) {
    return image(name).then(function(i) {
      var c = document.createElement("canvas");
      c.width = i.naturalWidth;
      c.height = i.naturalHeight;
      c.getContext("2d").drawImage(i, 0, 0);
      return c;
    });
  }
  window.FD_VANILLA = { list, image, canvas, url: function(n) {
    return RAW + n + ".png";
  }, repo: { name: REPO, branch: BRANCH, dir: DIR, url: "https://github.com/" + REPO } };
})();
