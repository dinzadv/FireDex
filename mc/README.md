# Repositorio de assets de Minecraft (FireDex)

Esta carpeta la usa el creador de estructuras para dibujar bloques, cofres, losas, escaleras y plantas con las texturas reales de Minecraft Bedrock.

Cómo se llena (una sola vez, o cuando quieras actualizar a una versión nueva):

    node tools/sync-mc-assets.mjs                     # clona solo lo necesario de Mojang/bedrock-samples (necesita git)
    node tools/sync-mc-assets.mjs --zip bedrock-samples-main.zip
    node tools/sync-mc-assets.mjs --dir ruta/a/bedrock-samples

Genera aquí: `manifest.json`, `blocks.json`, `textures/terrain_texture.json`, `textures/item_texture.json`, `textures/blocks/`, `textures/items/` y `textures/entity/chest/`.

Si esta carpeta está vacía o no existe, el creador de estructuras usa jsDelivr (Mojang/bedrock-samples) como respaldo, así que sigue funcionando.

Para comprobar qué bloques quedaron sin textura, abre el creador de estructuras y en la consola del navegador escribe:

    await FD_MC.coverage()

Los assets pertenecen a Mojang/Microsoft; revisa su licencia antes de publicar la carpeta.
