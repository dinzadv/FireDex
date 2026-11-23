(function() {
  "use strict";
  const W = (s) => s.trim().split(/\s+/);
  const WOODS = W("oak spruce birch jungle acacia dark_oak mangrove cherry pale_oak bamboo crimson warped");
  const COLORS = W("white orange magenta light_blue yellow lime pink gray light_gray cyan purple blue brown green red black");
  const CATS = {};
  const catOrder = ["wood", "stone", "colored", "copper", "nature", "ores", "redstone", "functional", "decor", "nether", "custom"];
  const catLabel = { wood: "Wood", stone: "Stone", colored: "Colored", copper: "Copper", nature: "Nature", ores: "Ores", redstone: "Redstone", functional: "Functional", decor: "Decoration", nether: "Nether & End", custom: "Project" };
  const add = (c, ids) => {
    (CATS[c] = CATS[c] || []).push.apply(CATS[c], Array.isArray(ids) ? ids : W(ids));
  };
  WOODS.forEach((w) => {
    const nether = w === "crimson" || w === "warped", bam = w === "bamboo", oak = w === "oak";
    const l = [w + "_planks"];
    if (bam) l.push("bamboo_block", "stripped_bamboo_block", "bamboo_mosaic", "bamboo_mosaic_stairs", "bamboo_mosaic_slab", "bamboo_mosaic_double_slab");
    else if (nether) l.push(w + "_stem", "stripped_" + w + "_stem", w + "_hyphae", "stripped_" + w + "_hyphae");
    else l.push(w + "_log", "stripped_" + w + "_log", w + "_wood", "stripped_" + w + "_wood", w + "_leaves");
    l.push(
      w + "_stairs",
      w + "_slab",
      w + "_double_slab",
      w + "_fence",
      oak ? "fence_gate" : w + "_fence_gate",
      oak ? "wooden_door" : w + "_door",
      oak ? "trapdoor" : w + "_trapdoor",
      oak ? "wooden_button" : w + "_button",
      oak ? "wooden_pressure_plate" : w + "_pressure_plate"
    );
    add("wood", l);
    if (!nether) add("nature", w + "_sapling");
  });
  add("wood", "bookshelf chiseled_bookshelf petrified_oak_slab petrified_oak_double_slab scaffolding barrel");
  add("stone", `stone granite polished_granite diorite polished_diorite andesite polished_andesite cobblestone mossy_cobblestone stone_bricks mossy_stone_bricks cracked_stone_bricks chiseled_stone_bricks smooth_stone
    deepslate cobbled_deepslate polished_deepslate deepslate_bricks deepslate_tiles cracked_deepslate_bricks cracked_deepslate_tiles chiseled_deepslate reinforced_deepslate
    tuff polished_tuff tuff_bricks chiseled_tuff chiseled_tuff_bricks calcite dripstone_block blackstone polished_blackstone polished_blackstone_bricks cracked_polished_blackstone_bricks chiseled_polished_blackstone gilded_blackstone
    basalt smooth_basalt polished_basalt obsidian crying_obsidian bedrock sandstone chiseled_sandstone cut_sandstone smooth_sandstone red_sandstone chiseled_red_sandstone cut_red_sandstone smooth_red_sandstone
    brick_block mud_bricks packed_mud nether_brick red_nether_brick cracked_nether_bricks chiseled_nether_bricks quartz_block chiseled_quartz_block quartz_bricks quartz_pillar smooth_quartz
    prismarine prismarine_bricks dark_prismarine purpur_block purpur_pillar end_bricks end_stone_brick_slab resin_block resin_bricks chiseled_resin_bricks
    stone_stairs normal_stone_stairs normal_stone_slab normal_stone_double_slab cobblestone_slab cobblestone_double_slab cobblestone_wall smooth_stone_slab smooth_stone_double_slab
    mossy_cobblestone_stairs mossy_cobblestone_slab mossy_cobblestone_double_slab mossy_cobblestone_wall stone_brick_stairs stone_brick_slab stone_brick_double_slab stone_brick_wall
    mossy_stone_brick_stairs mossy_stone_brick_slab mossy_stone_brick_double_slab mossy_stone_brick_wall granite_stairs granite_slab granite_double_slab granite_wall
    polished_granite_stairs polished_granite_slab polished_granite_double_slab diorite_stairs diorite_slab diorite_double_slab diorite_wall polished_diorite_stairs polished_diorite_slab polished_diorite_double_slab
    andesite_stairs andesite_slab andesite_double_slab andesite_wall polished_andesite_stairs polished_andesite_slab polished_andesite_double_slab
    cobbled_deepslate_stairs cobbled_deepslate_slab cobbled_deepslate_double_slab cobbled_deepslate_wall polished_deepslate_stairs polished_deepslate_slab polished_deepslate_double_slab polished_deepslate_wall
    deepslate_brick_stairs deepslate_brick_slab deepslate_brick_double_slab deepslate_brick_wall deepslate_tile_stairs deepslate_tile_slab deepslate_tile_double_slab deepslate_tile_wall
    tuff_stairs tuff_slab tuff_double_slab tuff_wall polished_tuff_stairs polished_tuff_slab polished_tuff_double_slab polished_tuff_wall tuff_brick_stairs tuff_brick_slab tuff_brick_double_slab tuff_brick_wall
    blackstone_stairs blackstone_slab blackstone_double_slab blackstone_wall polished_blackstone_stairs polished_blackstone_slab polished_blackstone_double_slab polished_blackstone_wall
    polished_blackstone_brick_stairs polished_blackstone_brick_slab polished_blackstone_brick_double_slab polished_blackstone_brick_wall polished_blackstone_button polished_blackstone_pressure_plate
    sandstone_stairs sandstone_slab sandstone_double_slab sandstone_wall cut_sandstone_slab cut_sandstone_double_slab smooth_sandstone_stairs smooth_sandstone_slab smooth_sandstone_double_slab
    red_sandstone_stairs red_sandstone_slab red_sandstone_double_slab red_sandstone_wall cut_red_sandstone_slab cut_red_sandstone_double_slab smooth_red_sandstone_stairs smooth_red_sandstone_slab smooth_red_sandstone_double_slab
    brick_stairs brick_slab brick_double_slab brick_wall mud_brick_stairs mud_brick_slab mud_brick_double_slab mud_brick_wall
    nether_brick_stairs nether_brick_slab nether_brick_double_slab nether_brick_wall nether_brick_fence red_nether_brick_stairs red_nether_brick_slab red_nether_brick_double_slab red_nether_brick_wall
    quartz_stairs quartz_slab quartz_double_slab smooth_quartz_stairs smooth_quartz_slab smooth_quartz_double_slab
    prismarine_stairs prismarine_slab prismarine_double_slab prismarine_wall prismarine_bricks_stairs prismarine_brick_slab prismarine_brick_double_slab dark_prismarine_stairs dark_prismarine_slab dark_prismarine_double_slab
    purpur_stairs purpur_slab purpur_double_slab end_brick_stairs end_stone_brick_double_slab end_stone_brick_wall resin_brick_stairs resin_brick_slab resin_brick_double_slab resin_brick_wall
    stone_button stone_pressure_plate iron_bars iron_chain stonecutter_block grindstone`);
  const cl = [];
  COLORS.forEach((c) => {
    cl.push(
      c + "_wool",
      c + "_carpet",
      c + "_concrete",
      c + "_concrete_powder",
      c + "_stained_glass",
      c + "_stained_glass_pane",
      c + "_terracotta",
      (c === "light_gray" ? "silver" : c) + "_glazed_terracotta",
      c + "_shulker_box",
      c + "_candle"
    );
  });
  cl.push("hardened_clay", "glass", "glass_pane", "tinted_glass", "undyed_shulker_box", "clay");
  add("colored", cl.filter(Boolean));
  const cu = [];
  [["", ""], ["exposed_", ""], ["weathered_", ""], ["oxidized_", ""], ["", "waxed_"], ["exposed_", "waxed_"], ["weathered_", "waxed_"], ["oxidized_", "waxed_"]].forEach(([ox, wx]) => {
    cu.push(!ox && !wx ? "copper_block" : wx + ox + "copper");
    W("cut_copper cut_copper_stairs cut_copper_slab double_cut_copper_slab chiseled_copper copper_grate copper_bulb copper_door copper_trapdoor copper_chest copper_bars copper_chain copper_lantern lightning_rod copper_golem_statue").forEach((n) => cu.push(wx + ox + n));
  });
  add("copper", cu.concat(W("copper_ore deepslate_copper_ore raw_copper_block copper_torch")));
  const corals = [];
  W("tube brain bubble fire horn").forEach((c) => {
    ["", "dead_"].forEach((d) => ["coral", "coral_block", "coral_fan", "coral_wall_fan"].forEach((k) => corals.push(d + c + "_" + k)));
  });
  add("nature", `grass_block dirt coarse_dirt dirt_with_roots podzol mycelium grass_path farmland sand red_sand gravel clay mud muddy_mangrove_roots mangrove_roots mangrove_propagule moss_block moss_carpet pale_moss_block pale_moss_carpet pale_hanging_moss hanging_roots
    snow snow_layer ice packed_ice blue_ice frosted_ice powder_snow cactus cactus_flower bamboo sugar_cane_unused kelp seagrass sea_pickle waterlily vine glow_lichen sculk sculk_vein sculk_catalyst sculk_sensor sculk_shrieker calibrated_sculk_sensor
    short_grass tall_grass short_dry_grass tall_dry_grass fern large_fern deadbush bush leaf_litter firefly_bush dandelion poppy blue_orchid allium azure_bluet red_tulip orange_tulip white_tulip pink_tulip oxeye_daisy cornflower lily_of_the_valley torchflower wither_rose
    sunflower lilac rose_bush peony pitcher_plant pink_petals wildflowers spore_blossom azalea flowering_azalea azalea_leaves azalea_leaves_flowered big_dripleaf small_dripleaf_block pointed_dripstone
    brown_mushroom red_mushroom brown_mushroom_block red_mushroom_block mushroom_stem sweet_berry_bush cave_vines_unused wheat carrots potatoes beetroot melon_stem pumpkin_stem melon_block pumpkin carved_pumpkin lit_pumpkin hay_block dried_kelp_block
    slime honey_block honeycomb_block bee_nest beehive turtle_egg sniffer_egg frog_spawn_unused open_eyeblossom closed_eyeblossom creaking_heart dried_ghast amethyst_block budding_amethyst small_amethyst_bud medium_amethyst_bud large_amethyst_bud amethyst_cluster sponge wet_sponge`.replace(/\S*_unused/g, "") + " " + corals.join(" "));
  add("ores", `coal_ore deepslate_coal_ore iron_ore deepslate_iron_ore gold_ore deepslate_gold_ore diamond_ore deepslate_diamond_ore emerald_ore deepslate_emerald_ore lapis_ore deepslate_lapis_ore redstone_ore deepslate_redstone_ore quartz_ore nether_gold_ore ancient_debris
    coal_block iron_block gold_block diamond_block emerald_block lapis_block redstone_block netherite_block raw_iron_block raw_gold_block bone_block`);
  add("redstone", `redstone_wire redstone_torch redstone_lamp repeater_unused comparator_unused lever tripwire_hook target observer piston sticky_piston dispenser dropper hopper daylight_detector daylight_detector_inverted noteblock tnt lightning_rod
    rail golden_rail detector_rail activator_rail heavy_weighted_pressure_plate light_weighted_pressure_plate command_block chain_command_block repeating_command_block crafter heavy_core jukebox bell lodestone respawn_anchor`.replace(/\S*_unused/g, ""));
  add("functional", `chest trapped_chest ender_chest barrel furnace blast_furnace smoker crafting_table smithing_table cartography_table fletching_table loom stonecutter_block grindstone anvil chipped_anvil damaged_anvil enchanting_table brewing_stand cauldron composter lectern
    beacon conduit decorated_pot vault trial_spawner mob_spawner structure_block structure_void jigsaw barrier bed campfire soul_campfire ladder`);
  add("decor", `torch soul_torch underwater_torch colored_torch_red colored_torch_green colored_torch_blue colored_torch_purple lantern soul_lantern sea_lantern glowstone shroomlight ochre_froglight verdant_froglight pearlescent_froglight end_rod flower_pot frame glow_frame
    skeleton_skull wither_skeleton_skull zombie_head creeper_head dragon_head piglin_head player_head dragon_egg web iron_door iron_trapdoor lit_redstone_lamp_unused`.replace(/\S*_unused/g, ""));
  add("nether", `netherrack crimson_nylium warped_nylium soul_sand soul_soil magma crimson_fungus warped_fungus crimson_roots warped_roots nether_sprouts nether_wart nether_wart_block warped_wart_block weeping_vines twisting_vines basalt blackstone end_stone end_portal_frame
    chorus_plant chorus_flower purpur_block lava water infested_stone infested_cobblestone infested_stone_bricks infested_mossy_stone_bricks infested_cracked_stone_bricks infested_chiseled_stone_bricks infested_deepslate suspicious_sand suspicious_gravel`);
  const BLOCKS = [], BLOCK_CAT = {};
  catOrder.forEach((c) => (CATS[c] || []).forEach((id) => {
    if (!BLOCK_CAT[id]) {
      BLOCK_CAT[id] = c;
      BLOCKS.push(id);
    }
  }));
  const blockCatFiltered = {};
  BLOCKS.forEach((id) => {
    (blockCatFiltered[BLOCK_CAT[id]] = blockCatFiltered[BLOCK_CAT[id]] || []).push(id);
  });
  const IT = [];
  const mats = { wooden: "wooden", stone: "stone", iron: "iron", golden: "golden", diamond: "diamond", netherite: "netherite", copper: "copper" };
  Object.keys(mats).forEach((m) => ["sword", "pickaxe", "axe", "shovel", "hoe", "spear"].forEach((t) => IT.push(m + "_" + t)));
  ["leather", "chainmail", "iron", "golden", "diamond", "netherite", "copper"].forEach((m) => ["helmet", "chestplate", "leggings", "boots"].forEach((p) => IT.push(m + "_" + p)));
  ["leather", "iron", "golden", "diamond", "copper", "netherite"].forEach((m) => IT.push(m + "_horse_armor"));
  ["iron", "golden", "diamond", "copper", "netherite"].forEach((m) => IT.push(m + "_nautilus_armor"));
  COLORS.forEach((c) => IT.push(c + "_dye", c + "_bundle", c + "_harness"));
  WOODS.filter((w) => w !== "crimson" && w !== "warped" && w !== "bamboo").forEach((w) => IT.push(w + "_boat", w + "_chest_boat", w + "_sign", w + "_hanging_sign"));
  IT.push("bamboo_raft", "bamboo_chest_raft", "bamboo_sign", "crimson_sign", "warped_sign");
  IT.push.apply(IT, W("allay armadillo axolotl bat bee blaze bogged breeze camel cat cave_spider chicken cod cow creaking creeper dolphin donkey drowned elder_guardian ender_dragon enderman endermite evoker fox frog ghast glow_squid goat guardian happy_ghast hoglin horse husk iron_golem llama magma_cube mooshroom mule ocelot panda parrot phantom pig piglin piglin_brute pillager polar_bear pufferfish rabbit ravager salmon sheep shulker silverfish skeleton skeleton_horse slime sniffer snow_golem spider squid stray strider tadpole trader_llama tropical_fish turtle vex villager vindicator wandering_trader warden witch wither wither_skeleton wolf zoglin zombie zombie_horse zombie_villager").map((m) => m + "_spawn_egg"));
  IT.push.apply(IT, W("angler archer arms_up blade brewer burn danger explorer flow friend guster heart heartbreak howl miner mourner plenty prize scrape sheaf shelter skull snort").map((m) => m + "_pottery_sherd"));
  IT.push.apply(IT, W("bolt coast dune eye flow host raiser rib sentry shaper silence snout spire tide vex ward wayfinder wild").map((m) => m + "_armor_trim_smithing_template"), "netherite_upgrade_smithing_template");
  IT.push.apply(IT, W("11 13 5 blocks cat chirp creator creator_music_box far lava_chicken mall mellohi otherside pigstep precipice relic stal strad tears wait ward").map((m) => "music_disc_" + m));
  IT.push.apply(IT, W(`apple golden_apple enchanted_golden_apple bread baked_potato potato poisonous_potato carrot golden_carrot beetroot beetroot_soup beef cooked_beef porkchop cooked_porkchop mutton cooked_mutton chicken cooked_chicken rabbit cooked_rabbit cod cooked_cod salmon cooked_salmon tropical_fish pufferfish rotten_flesh spider_eye fermented_spider_eye cookie cake pumpkin_pie melon_slice glistering_melon_slice sweet_berries glow_berries dried_kelp mushroom_stew rabbit_stew suspicious_stew honey_bottle milk_bucket chorus_fruit popped_chorus_fruit
    coal charcoal iron_ingot gold_ingot copper_ingot netherite_ingot netherite_scrap diamond emerald lapis_lazuli redstone quartz amethyst_shard prismarine_shard prismarine_crystals raw_iron raw_gold raw_copper iron_nugget gold_nugget copper_nugget resin_brick clay_ball brick netherbrick flint stick bone bone_meal string feather leather rabbit_hide rabbit_foot slime_ball magma_cream blaze_rod blaze_powder ghast_tear gunpowder glowstone_dust ender_pearl ender_eye nether_star shulker_shell phantom_membrane turtle_scute armadillo_scute breeze_rod echo_shard ink_sac glow_ink_sac sugar paper book enchanted_book writable_book name_tag saddle lead egg blue_egg brown_egg wheat wheat_seeds pumpkin_seeds melon_seeds beetroot_seeds torchflower_seeds pitcher_pod cocoa_beans sugar_cane nautilus_shell heart_of_the_sea totem_of_undying honeycomb disc_fragment_5 dragon_breath experience_bottle fire_charge firework_rocket firework_star wind_charge ominous_bottle trial_key ominous_trial_key
    bow crossbow arrow trident mace shield fishing_rod carrot_on_a_stick warped_fungus_on_a_stick shears flint_and_steel brush spyglass clock compass recovery_compass lodestone_compass map empty_map filled_map elytra turtle_helmet wolf_armor
    bucket water_bucket lava_bucket powder_snow_bucket cod_bucket salmon_bucket tropical_fish_bucket pufferfish_bucket axolotl_bucket tadpole_bucket glass_bottle potion splash_potion lingering_potion bowl minecart chest_minecart hopper_minecart tnt_minecart command_block_minecart armor_stand painting banner goat_horn totem_of_undying
    creeper_banner_pattern flower_banner_pattern globe_banner_pattern mojang_banner_pattern piglin_banner_pattern skull_banner_pattern field_masoned_banner_pattern bordure_indented_banner_pattern guster_banner_pattern flow_banner_pattern`));
  const ITEMS = Array.from(new Set(IT));
  const DIRS4 = ["east", "south", "west", "north"];
  const S = {
    stairs: [{ k: "weirdo_direction", t: "int", o: [0, 1, 2, 3], l: ["East", "West", "South", "North"], d: 0, dir: ["east", "west", "south", "north"] }, { k: "upside_down_bit", t: "bool", l: "Upside down", d: false }],
    slab: [{ k: "minecraft:vertical_half", t: "str", o: ["bottom", "top"], l: ["Bottom", "Top"], d: "bottom" }],
    door: [{ k: "direction", t: "int", o: [0, 1, 2, 3], l: ["East", "South", "West", "North"], d: 0, dir: ["east", "south", "west", "north"] }, { k: "door_hinge_bit", t: "bool", l: "Hinge right", d: false }, { k: "open_bit", t: "bool", l: "Open", d: false }],
    trapdoor: [{ k: "direction", t: "int", o: [0, 1, 2, 3], l: ["East", "West", "South", "North"], d: 0, dir: ["east", "west", "south", "north"] }, { k: "open_bit", t: "bool", l: "Open", d: false }, { k: "upside_down_bit", t: "bool", l: "Top half", d: false }],
    gate: [{ k: "direction", t: "int", o: [0, 1, 2, 3], l: ["South", "West", "North", "East"], d: 0, dir: ["south", "west", "north", "east"] }, { k: "open_bit", t: "bool", l: "Open", d: false }, { k: "in_wall_bit", t: "bool", l: "In wall", d: false }],
    pillar: [{ k: "pillar_axis", t: "str", o: ["y", "x", "z"], l: ["Up/Down (Y)", "East/West (X)", "North/South (Z)"], d: "y" }],
    card: [{ k: "minecraft:cardinal_direction", t: "str", o: ["north", "east", "south", "west"], l: ["North", "East", "South", "West"], d: "north", dir: ["north", "east", "south", "west"] }],
    face6: [{ k: "facing_direction", t: "str", o: ["up", "down", "north", "south", "east", "west"], l: ["Up", "Down", "North", "South", "East", "West"], d: "up", dir: ["up", "down", "north", "south", "east", "west"] }],
    face4: [{ k: "facing_direction", t: "str", o: ["north", "south", "east", "west"], l: ["North", "South", "East", "West"], d: "north", dir: ["north", "south", "east", "west"] }],
    leaves: [{ k: "persistent_bit", t: "bool", l: "Persistent (no decay)", d: true }],
    torch: [{ k: "torch_facing_direction", t: "str", o: ["top", "west", "east", "north", "south"], l: ["On floor", "Wall: west", "Wall: east", "Wall: north", "Wall: south"], d: "top" }],
    lever: [{ k: "lever_direction", t: "str", o: ["up_north_south", "up_east_west", "down_north_south", "down_east_west", "north", "south", "east", "west"], l: ["Floor N-S", "Floor E-W", "Ceiling N-S", "Ceiling E-W", "Wall north", "Wall south", "Wall east", "Wall west"], d: "up_north_south" }, { k: "open_bit", t: "bool", l: "On", d: false }],
    bed: [{ k: "direction", t: "int", o: [0, 1, 2, 3], l: ["South", "West", "North", "East"], d: 0, dir: ["south", "west", "north", "east"] }, { k: "head_piece_bit", t: "bool", l: "Head piece", d: false }, { k: "occupied_bit", t: "bool", l: "Occupied", d: false }],
    lantern: [{ k: "hanging", t: "bool", l: "Hanging", d: false }],
    plate: [{ k: "redstone_signal", t: "int", o: [0, 15], l: ["Off", "Pressed"], d: 0 }],
    height: [{ k: "height", t: "int", o: [0, 1, 2, 3, 4, 5, 6, 7], l: ["1/8", "2/8", "3/8", "4/8", "5/8", "6/8", "7/8", "Full"], d: 0 }],
    candle: [{ k: "candles", t: "int", o: [0, 1, 2, 3], l: ["1", "2", "3", "4"], d: 0 }, { k: "lit", t: "bool", l: "Lit", d: false }],
    rail: [{ k: "rail_direction", t: "int", o: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], l: ["N-S", "E-W", "Ascend E", "Ascend W", "Ascend N", "Ascend S", "Curve SE", "Curve SW", "Curve NW", "Curve NE"], d: 0 }]
  };
  const upper = { k: "upper_block_bit", t: "bool", l: "Upper half", d: false };
  function schemaFor(id) {
    const n = id.replace(/^minecraft:/, "");
    if (/_stairs$/.test(n)) return S.stairs;
    if (/_slab$/.test(n) && !/double/.test(n)) return S.slab;
    if (/(^|_)door$|^wooden_door$/.test(n)) return S.door;
    if (/(^|_)trapdoor$/.test(n)) return S.trapdoor;
    if (/(^|_)fence_gate$/.test(n)) return S.gate;
    if (/_(log|wood|stem|hyphae)$|^bamboo_block$|^stripped_bamboo_block$|^(hay_block|bone_block|purpur_pillar|quartz_pillar|basalt|polished_basalt|smooth_basalt_unused|deepslate|dried_kelp_block_unused|iron_chain|copper_chain|.*_chain)$/.test(n) && !/^(oak|spruce|.*)_planks$/.test(n)) return S.pillar;
    if (/(^|_)bed$/.test(n)) return S.bed;
    if (/^(chest|trapped_chest|furnace|blast_furnace|smoker|carved_pumpkin|lit_pumpkin|campfire|soul_campfire|ender_chest|.*copper_chest|loom|stonecutter_block|lectern|anvil|chipped_anvil|damaged_anvil|grindstone|bell_unused|beehive|bee_nest|jukebox_unused)$/.test(n)) return S.card;
    if (/glazed_terracotta$/.test(n) || /^(barrel|piston|sticky_piston|observer|dispenser|dropper|hopper|command_block|chain_command_block|repeating_command_block|crafter_unused|end_rod|lightning_rod|.*lightning_rod)$/.test(n)) return S.face6;
    if (/_button$|^wooden_button$/.test(n)) return S.face6;
    if (/^(ladder|wall_sign|wall_banner)$/.test(n)) return S.face4;
    if (/_leaves$/.test(n) && !/azalea/.test(n)) return S.leaves;
    if (/^(torch|redstone_torch|soul_torch|underwater_torch|copper_torch|colored_torch_.*)$/.test(n)) return S.torch;
    if (n === "lever") return S.lever;
    if (/lantern$/.test(n)) return S.lantern;
    if (/_pressure_plate$|^wooden_pressure_plate$/.test(n)) return S.plate;
    if (n === "snow_layer") return S.height;
    if (n === "candle" || /_candle$/.test(n)) return S.candle;
    if (/^(rail|golden_rail|detector_rail|activator_rail)$/.test(n)) return S.rail;
    return null;
  }
  const isTall = (id) => /^(tall_grass|large_fern|sunflower|lilac|rose_bush|peony|pitcher_plant)$/.test(id.replace(/^minecraft:/, "")) || /(^|_)door$|^wooden_door$/.test(id.replace(/^minecraft:/, ""));
  const isWall = (id) => /_wall$/.test(id.replace(/^minecraft:/, ""));
  function containerOf(id) {
    const n = id.replace(/^minecraft:/, "").replace(/\[.*$/, "");
    if (n === "chest" || n === "trapped_chest" || /copper_chest$/.test(n)) return { ent: "Chest", slots: 27, label: "Chest" };
    if (n === "barrel") return { ent: "Barrel", slots: 27, label: "Barrel" };
    if (/shulker_box$/.test(n)) return { ent: "ShulkerBox", slots: 27, label: "Shulker box" };
    if (n === "dispenser") return { ent: "Dispenser", slots: 9, label: "Dispenser" };
    if (n === "dropper") return { ent: "Dropper", slots: 9, label: "Dropper" };
    if (n === "hopper") return { ent: "Hopper", slots: 5, label: "Hopper" };
    return null;
  }
  const KC = [
    ["light_blue", "#3aafd9"],
    ["light_gray", "#8e8e86"],
    ["dark_oak", "#3e2912"],
    ["pale_oak", "#e3d9d2"],
    ["magenta", "#bd44b3"],
    ["orange", "#f07613"],
    ["yellow", "#f8c527"],
    ["lime", "#70b919"],
    ["pink", "#ed8dac"],
    ["cyan", "#158991"],
    ["purple", "#792aac"],
    ["white", "#e9ecec"],
    ["black", "#141519"],
    ["gray", "#3e4447"],
    ["blue", "#35399d"],
    ["brown", "#724728"],
    ["green", "#546d1b"],
    ["red", "#a12722"],
    ["spruce", "#6e5230"],
    ["birch", "#c4b57a"],
    ["jungle", "#a0714f"],
    ["acacia", "#a85a32"],
    ["mangrove", "#773a36"],
    ["cherry", "#e4b8b0"],
    ["bamboo", "#c8b04a"],
    ["crimson", "#7a2f4a"],
    ["warped", "#2b7a76"],
    ["oak", "#a2824f"],
    ["oxidized", "#52a58b"],
    ["weathered", "#6fa98a"],
    ["exposed", "#a0836b"],
    ["copper", "#c06c4a"],
    ["deepslate", "#4b4b50"],
    ["blackstone", "#2a252b"],
    ["sandstone", "#d9cd9a"],
    ["sand", "#dbcf9b"],
    ["quartz", "#ebe5de"],
    ["prismarine", "#5b9a8e"],
    ["purpur", "#a77ba7"],
    ["nether_brick", "#2d171b"],
    ["netherrack", "#6f3636"],
    ["soul", "#52402f"],
    ["end_stone", "#dfdd9f"],
    ["obsidian", "#150f22"],
    ["gold", "#f6d03c"],
    ["iron", "#d8d8d8"],
    ["diamond", "#62dfd5"],
    ["emerald", "#2bc65a"],
    ["lapis", "#1f438a"],
    ["redstone", "#a91509"],
    ["coal", "#191919"],
    ["brick", "#966453"],
    ["mud", "#3c3837"],
    ["dirt", "#866043"],
    ["grass", "#5b8c3a"],
    ["leaves", "#3f7a2a"],
    ["moss", "#5a7a2c"],
    ["snow", "#f4fbfb"],
    ["ice", "#91b8ff"],
    ["glass", "#c8e6f0"],
    ["tuff", "#6d6d62"],
    ["calcite", "#e0e0d8"],
    ["granite", "#9a6b59"],
    ["diorite", "#c9c9c9"],
    ["andesite", "#888888"],
    ["cobble", "#6b6b6b"],
    ["glow", "#d9b26a"],
    ["chest", "#a0702e"],
    ["barrel", "#8a6234"],
    ["door", "#9c7440"],
    ["crafting", "#9c7440"],
    ["furnace", "#707070"],
    ["stone", "#7d7d7d"],
    ["planks", "#a2824f"],
    ["water", "#2f43f4"],
    ["lava", "#d96514"],
    ["lantern", "#e0a040"],
    ["torch", "#ffd24a"],
    ["tnt", "#b8431f"],
    ["pumpkin", "#c07615"],
    ["melon", "#6f9a1e"],
    ["hay", "#c6a110"],
    ["clay", "#9aa3b3"],
    ["terracotta", "#985d43"]
  ];
  function colorFor(id) {
    const n = id.replace(/^[^:]*:/, "").replace(/\[.*$/, "");
    for (let i = 0; i < KC.length; i++) if (n.indexOf(KC[i][0]) >= 0) return KC[i][1];
    let h = 0;
    for (let i = 0; i < n.length; i++) h = h * 31 + n.charCodeAt(i) | 0;
    return "hsl(" + Math.abs(h) % 360 + ",40%,50%)";
  }
  function baseOf(n) {
    const m = /^(.*?)_(stairs|slab|double_slab|wall|fence_gate|fence|button|pressure_plate|trapdoor|door)$/.exec(n);
    if (!m) return n;
    const s = m[1];
    if (WOODS.indexOf(s) >= 0) return s + "_planks";
    const special = {
      stone: "stone",
      normal_stone: "stone",
      cobblestone: "cobblestone",
      brick: "brick_block",
      stone_brick: "stone_bricks",
      mossy_stone_brick: "mossy_stone_bricks",
      mud_brick: "mud_bricks",
      nether_brick: "nether_brick",
      red_nether_brick: "red_nether_brick",
      prismarine_brick: "prismarine_bricks",
      prismarine_bricks: "prismarine_bricks",
      end_stone_brick: "end_stone",
      end_brick: "end_stone",
      deepslate_brick: "deepslate_bricks",
      deepslate_tile: "deepslate_tiles",
      tuff_brick: "tuff_bricks",
      polished_blackstone_brick: "polished_blackstone_bricks",
      resin_brick: "resin_bricks",
      wooden: "oak_planks",
      iron: "iron_block",
      cut_copper: "cut_copper",
      smooth_stone: "smooth_stone"
    };
    return special[s] || s;
  }
  function texNames(id) {
    let n = id.replace(/^[^:]*:/, "").replace(/\[.*$/, "");
    const out = [];
    n = baseOf(n);
    if (n === "wooden") n = "oak_planks";
    const pw = n.match(/^(dark_oak|pale_oak|oak|spruce|birch|jungle|acacia|mangrove|cherry|bamboo|crimson|warped)_(planks|log|leaves|stem|hyphae|wood|sapling)$/) || [];
    if (pw[1]) {
      const k = pw[1] === "dark_oak" ? "big_oak" : pw[1];
      if (pw[2] === "planks") out.push("planks_" + k, "planks_" + pw[1]);
      if (pw[2] === "log") out.push("log_" + k, "log_" + k + "_top");
      if (pw[2] === "leaves") out.push("leaves_" + k);
    }
    const cc = n.match(/^(light_gray|light_blue|white|orange|magenta|yellow|lime|pink|gray|cyan|purple|blue|brown|green|red|black)_(wool|concrete|concrete_powder|stained_glass|stained_glass_pane|terracotta|glazed_terracotta|carpet|shulker_box|candle)$/);
    if (cc) {
      const c = cc[1], c2 = c === "light_gray" ? "silver" : c, k = cc[2];
      out.push(k === "wool" || k === "carpet" ? "wool_colored_" + c2 : k === "concrete" ? "concrete_" + c2 : k === "concrete_powder" ? "concrete_powder_" + c2 : k === "stained_glass" || k === "stained_glass_pane" ? "glass_" + c2 : k === "terracotta" ? "hardened_clay_stained_" + c2 : k === "glazed_terracotta" ? "glazed_terracotta_" + c2 : k === "shulker_box" ? "shulker_top_" + c2 : "candle_" + c);
    }
    const L = {
      stone_bricks: "stonebrick",
      brick_block: "brick",
      nether_brick: "nether_brick",
      red_nether_brick: "red_nether_brick",
      grass_block: "grass_top",
      sandstone: "sandstone_normal",
      red_sandstone: "red_sandstone_normal",
      hardened_clay: "hardened_clay",
      terracotta: "hardened_clay",
      quartz_block: "quartz_block_side",
      mossy_stone_bricks: "stonebrick_mossy",
      cracked_stone_bricks: "stonebrick_cracked",
      chiseled_stone_bricks: "stonebrick_carved",
      glowstone: "glowstone",
      crafting_table: "crafting_table_top",
      furnace: "furnace_front_off",
      tnt: "tnt_side",
      pumpkin: "pumpkin_top",
      melon_block: "melon_side",
      hay_block: "hay_block_side",
      water: "water_still",
      lava: "lava_still",
      torch: "torch_on",
      bookshelf: "bookshelf",
      copper_block: "copper_block",
      sea_lantern: "sea_lantern",
      granite: "stone_granite",
      polished_granite: "stone_granite_smooth",
      diorite: "stone_diorite",
      polished_diorite: "stone_diorite_smooth",
      andesite: "stone_andesite",
      polished_andesite: "stone_andesite_smooth",
      mud_bricks: "mud_bricks",
      prismarine: "prismarine_rough",
      dark_prismarine: "prismarine_dark",
      iron_door: "iron_door_top",
      wooden_door: "door_wood_upper",
      oak_log: "log_oak",
      cobblestone: "cobblestone",
      coarse_dirt: "coarse_dirt",
      podzol: "dirt_podzol_top",
      snow_layer: "snow",
      iron_bars: "iron_bars",
      chain: "chain",
      lantern: "lantern"
    };
    if (L[n]) out.push(L[n]);
    out.push(n, n + "_top", n + "_side", n + "_front", n + "_front_off", n + "_0", n.replace(/_block$/, ""), n + "s", n.replace(/_bricks$/, "_brick"));
    return out;
  }
  window.FD_STRUCT_DATA = {
    WOODS,
    COLORS,
    BLOCKS,
    BLOCK_CAT,
    CATS: blockCatFiltered,
    catOrder,
    catLabel,
    ITEMS: Array.from(new Set(ITEMS.concat(BLOCKS))),
    schemaFor,
    isTall,
    isWall,
    upper,
    containerOf,
    colorFor,
    texNames,
    DIRS4,
    addBlocks: function(cat, ids) {
      (Array.isArray(ids) ? ids : W(ids)).forEach((id) => {
        if (!BLOCK_CAT[id]) {
          BLOCK_CAT[id] = cat;
          BLOCKS.push(id);
          (blockCatFiltered[cat] = blockCatFiltered[cat] || []).push(id);
        }
      });
    }
  };
})();
