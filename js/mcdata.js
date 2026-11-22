(function(root) {
  const M = (n, sig, d, r) => [n, "m", sig || "()", d || "", r];
  const P = (n, t, d, r) => [n, "p", t || "", d || "", r];
  const AFTER = {
    playerSpawn: "Un jugador aparece (o reaparece) en el mundo",
    playerJoin: "Un jugador se une al mundo",
    playerLeave: "Un jugador sale del mundo",
    entitySpawn: "Se crea una entidad",
    entityDie: "Una entidad muere",
    entityHurt: "Una entidad recibe da\xF1o",
    entityHitEntity: "Una entidad golpea a otra",
    entityHitBlock: "Una entidad golpea un bloque",
    entityRemove: "Una entidad es eliminada",
    entityLoad: "Una entidad se carga",
    itemUse: "Un jugador usa un objeto",
    itemUseOn: "Un jugador usa un objeto sobre un bloque",
    itemStartUse: "Un jugador empieza a usar un objeto",
    itemStopUse: "Un jugador deja de usar un objeto",
    itemReleaseUse: "Un jugador suelta un objeto cargado (arco)",
    itemCompleteUse: "Un jugador termina de usar un objeto (comer)",
    playerBreakBlock: "Un jugador rompe un bloque",
    playerPlaceBlock: "Un jugador coloca un bloque",
    playerInteractWithBlock: "Un jugador interact\xFAa con un bloque",
    playerInteractWithEntity: "Un jugador interact\xFAa con una entidad",
    playerDimensionChange: "Un jugador cambia de dimensi\xF3n",
    playerGameModeChange: "Un jugador cambia de modo de juego",
    playerEmote: "Un jugador hace un emote",
    playerInputModeChange: "Un jugador cambia el m\xE9todo de entrada",
    chatSend: "Se env\xEDa un mensaje al chat",
    buttonPush: "Se pulsa un bot\xF3n",
    leverAction: "Se acciona una palanca",
    pressurePlatePush: "Se pisa una placa de presi\xF3n",
    pressurePlatePop: "Se suelta una placa de presi\xF3n",
    tripWireTrip: "Se activa un cable trampa",
    projectileHit: "Un proyectil impacta",
    targetBlockHit: "Un bloque diana es golpeado",
    blockExplode: "Un bloque explota",
    explosion: "Ocurre una explosi\xF3n",
    pistonActivate: "Un pist\xF3n se activa",
    weatherChange: "Cambia el clima",
    effectAdd: "Se a\xF1ade un efecto a una entidad",
    dataDrivenEntityTrigger: "Se dispara un evento de entidad",
    gameRuleChange: "Cambia una regla del juego",
    worldLoad: "El mundo termin\xF3 de cargar",
    worldInitialize: "El mundo se inicializa (versiones antiguas)",
    scriptEventReceive: "Se recibe /scriptevent"
  };
  const BEFORE = {
    chatSend: "Antes de enviar un mensaje (cancelable)",
    itemUse: "Antes de usar un objeto (cancelable)",
    itemUseOn: "Antes de usar un objeto sobre un bloque (cancelable)",
    playerBreakBlock: "Antes de romper un bloque (cancelable)",
    playerPlaceBlock: "Antes de colocar un bloque (cancelable)",
    playerInteractWithBlock: "Antes de interactuar con un bloque (cancelable)",
    playerInteractWithEntity: "Antes de interactuar con una entidad (cancelable)",
    playerLeave: "Antes de que un jugador salga",
    entityRemove: "Antes de eliminar una entidad",
    explosion: "Antes de una explosi\xF3n (cancelable)",
    effectAdd: "Antes de a\xF1adir un efecto",
    weatherChange: "Antes de cambiar el clima",
    pistonActivate: "Antes de activar un pist\xF3n",
    worldInitialize: "Antes de inicializar el mundo",
    startup: "Al iniciar el servidor (registro de comandos y componentes)",
    shutdown: "Al cerrar el servidor",
    watchdogTerminate: "Cuando el watchdog va a terminar el script"
  };
  const SYS_AFTER = ["scriptEventReceive"];
  const TYPES = {};
  TYPES.World = [
    P("afterEvents", "WorldAfterEvents", "Eventos posteriores a un cambio", "WorldAfterEvents"),
    P("beforeEvents", "WorldBeforeEvents", "Eventos previos (cancelables)", "WorldBeforeEvents"),
    M("getAllPlayers", "(): Player[]", "Todos los jugadores conectados", "Player[]"),
    M("getPlayers", "(options?: EntityQueryOptions): Player[]", "Jugadores filtrados", "Player[]"),
    M("getDimension", "(id: string): Dimension", 'Obtiene una dimensi\xF3n: "overworld", "nether", "the_end"', "Dimension"),
    M("getEntity", "(id: string): Entity | undefined", "Busca una entidad por su id", "Entity"),
    M("sendMessage", "(message: string | RawMessage): void", "Env\xEDa un mensaje a todos los jugadores"),
    M("playSound", "(soundId: string, location: Vector3, options?): void", "Reproduce un sonido en una posici\xF3n"),
    M("getDynamicProperty", "(id: string): string | number | boolean | undefined", "Lee una propiedad din\xE1mica del mundo"),
    M("setDynamicProperty", "(id: string, value?): void", "Guarda una propiedad din\xE1mica persistente"),
    M("getDynamicPropertyIds", "(): string[]", "Lista las propiedades din\xE1micas"),
    M("clearDynamicProperties", "(): void", "Elimina todas las propiedades din\xE1micas"),
    M("getDay", "(): number", "D\xEDa actual del mundo"),
    M("getTimeOfDay", "(): number", "Hora del d\xEDa (0-24000)"),
    M("setTimeOfDay", "(time: number | TimeOfDay): void", "Cambia la hora del d\xEDa"),
    M("getAbsoluteTime", "(): number", "Ticks totales del mundo"),
    M("getMoonPhase", "(): MoonPhase", "Fase lunar actual"),
    M("getDefaultSpawnLocation", "(): Vector3", "Punto de aparici\xF3n del mundo", "Vector3"),
    M("setDefaultSpawnLocation", "(location: Vector3): void", "Cambia el punto de aparici\xF3n del mundo"),
    P("scoreboard", "Scoreboard", "Marcadores del mundo", "Scoreboard"),
    P("gameRules", "GameRules", "Reglas del juego", "GameRules"),
    P("structureManager", "StructureManager", "Guardar y colocar estructuras")
  ];
  TYPES.System = [
    M("run", "(callback: () => void): number", "Ejecuta en el siguiente tick"),
    M("runInterval", "(callback: () => void, tickInterval?: number): number", "Repite cada N ticks (20 ticks = 1 s)"),
    M("runTimeout", "(callback: () => void, tickDelay?: number): number", "Ejecuta una vez tras N ticks"),
    M("runJob", "(generator: Generator): number", "Ejecuta un generador repartido en varios ticks"),
    M("clearRun", "(id: number): void", "Cancela un run/runInterval/runTimeout"),
    M("clearJob", "(id: number): void", "Cancela un job"),
    M("waitTicks", "(ticks: number): Promise<void>", "Espera N ticks (async/await)"),
    P("currentTick", "number", "Tick actual del servidor"),
    P("afterEvents", "SystemAfterEvents", "Eventos del sistema (scriptEventReceive)", "SystemAfterEvents"),
    P("beforeEvents", "SystemBeforeEvents", "Eventos previos (startup, shutdown)", "SystemBeforeEvents"),
    P("serverSystemInfo", "ServerSystemInfo", "Informaci\xF3n del servidor"),
    M("isEditorWorld", "(): boolean", "Si el mundo es del editor")
  ];
  TYPES.Signal = [
    M("subscribe", "(callback: (event) => void, options?): Function", "Suscribe una funci\xF3n al evento"),
    M("unsubscribe", "(callback: Function): void", "Cancela la suscripci\xF3n")
  ];
  const entityBase = [
    P("id", "string", "Identificador \xFAnico de la entidad"),
    P("typeId", "string", 'Tipo: "minecraft:zombie", "minecraft:player"\u2026'),
    P("nameTag", "string", "Nombre visible sobre la entidad"),
    P("location", "Vector3", "Posici\xF3n {x, y, z}", "Vector3"),
    P("dimension", "Dimension", "Dimensi\xF3n actual", "Dimension"),
    P("isValid", "boolean", "Si la entidad sigue existiendo"),
    P("isSneaking", "boolean", "Si est\xE1 agachado"),
    P("isSprinting", "boolean", "Si est\xE1 corriendo"),
    P("isSwimming", "boolean", "Si est\xE1 nadando"),
    P("isOnGround", "boolean", "Si est\xE1 en el suelo"),
    P("isFalling", "boolean", "Si est\xE1 cayendo"),
    P("isInWater", "boolean", "Si est\xE1 en el agua"),
    P("isClimbing", "boolean", "Si est\xE1 escalando"),
    P("isGliding", "boolean", "Si planea con \xE9litros"),
    M("getComponent", "(componentId: string): Component | undefined", 'Obtiene un componente: "minecraft:health", "minecraft:inventory"\u2026', "Component"),
    M("hasComponent", "(componentId: string): boolean", "Si tiene el componente"),
    M("addTag", "(tag: string): boolean", "A\xF1ade una etiqueta"),
    M("removeTag", "(tag: string): boolean", "Quita una etiqueta"),
    M("hasTag", "(tag: string): boolean", "Si tiene la etiqueta"),
    M("getTags", "(): string[]", "Lista de etiquetas", "string[]"),
    M("kill", "(): boolean", "Mata a la entidad"),
    M("remove", "(): void", "Elimina la entidad sin matarla"),
    M("teleport", "(location: Vector3, options?: TeleportOptions): void", "Teletransporta a la entidad"),
    M("applyDamage", "(amount: number, options?): boolean", "Aplica da\xF1o"),
    M("applyImpulse", "(vector: Vector3): void", "Aplica un impulso"),
    M("applyKnockback", "(dirX: number, dirZ: number, horizontal: number, vertical: number): void", "Empuja a la entidad"),
    M("addEffect", "(effectType: string, duration: number, options?): Effect", "A\xF1ade un efecto de poci\xF3n (duraci\xF3n en ticks)"),
    M("removeEffect", "(effectType: string): boolean", "Quita un efecto"),
    M("getEffect", "(effectType: string): Effect | undefined", "Obtiene un efecto activo"),
    M("getEffects", "(): Effect[]", "Efectos activos"),
    M("runCommand", "(command: string): CommandResult", "Ejecuta un comando como la entidad"),
    M("getDynamicProperty", "(id: string)", "Lee una propiedad din\xE1mica"),
    M("setDynamicProperty", "(id: string, value?): void", "Guarda una propiedad din\xE1mica"),
    M("getRotation", "(): Vector2", "Rotaci\xF3n {x, y}", "Vector2"),
    M("setRotation", "(rotation: Vector2): void", "Cambia la rotaci\xF3n"),
    M("getVelocity", "(): Vector3", "Velocidad actual", "Vector3"),
    M("getViewDirection", "(): Vector3", "Direcci\xF3n de la mirada", "Vector3"),
    M("getHeadLocation", "(): Vector3", "Posici\xF3n de la cabeza", "Vector3"),
    M("getBlockFromViewDirection", "(options?): BlockRaycastHit | undefined", "Bloque al que apunta"),
    M("getEntitiesFromViewDirection", "(options?): EntityRaycastHit[]", "Entidades a las que apunta"),
    M("setOnFire", "(seconds: number, useEffects?: boolean): boolean", "Prende fuego"),
    M("extinguishFire", "(useEffects?: boolean): boolean", "Apaga el fuego"),
    M("triggerEvent", "(eventName: string): void", "Dispara un evento de la entidad"),
    M("clearVelocity", "(): void", "Anula la velocidad"),
    M("matches", "(options: EntityQueryOptions): boolean", "Si cumple el filtro"),
    M("playAnimation", "(animationName: string, options?): void", "Reproduce una animaci\xF3n")
  ];
  TYPES.Entity = entityBase;
  TYPES.Player = entityBase.concat([
    P("name", "string", "Nombre del jugador"),
    P("level", "number", "Nivel de experiencia"),
    P("onScreenDisplay", "ScreenDisplay", "T\xEDtulo, subt\xEDtulo y action bar", "ScreenDisplay"),
    P("selectedSlotIndex", "number", "Ranura seleccionada de la barra"),
    P("camera", "Camera", "Control de c\xE1mara"),
    P("isFlying", "boolean", "Si est\xE1 volando"),
    P("isJumping", "boolean", "Si est\xE1 saltando"),
    P("isEmoting", "boolean", "Si hace un emote"),
    M("sendMessage", "(message: string | RawMessage): void", "Env\xEDa un mensaje al jugador"),
    M("getGameMode", "(): GameMode", "Modo de juego actual"),
    M("setGameMode", "(mode: GameMode): void", "Cambia el modo de juego"),
    M("isOp", "(): boolean", "Si es operador"),
    M("playSound", "(soundId: string, options?): void", "Reproduce un sonido para el jugador"),
    M("spawnParticle", "(effectName: string, location: Vector3, molangVars?): void", "Crea part\xEDculas"),
    M("addExperience", "(amount: number): number", "Suma experiencia"),
    M("addLevels", "(amount: number): number", "Suma niveles"),
    M("resetLevel", "(): void", "Reinicia el nivel"),
    M("getTotalXp", "(): number", "XP total"),
    M("setSpawnPoint", "(point?: DimensionLocation): void", "Cambia el punto de reaparici\xF3n"),
    M("getSpawnPoint", "(): DimensionLocation | undefined", "Punto de reaparici\xF3n"),
    M("getItemCooldown", "(category: string): number", "Enfriamiento de un objeto"),
    M("startItemCooldown", "(category: string, ticks: number): void", "Inicia el enfriamiento de un objeto"),
    M("playMusic", "(trackId: string, options?): void", "Reproduce m\xFAsica"),
    M("stopMusic", "(): void", "Detiene la m\xFAsica"),
    M("getSelectedSlotIndex", "(): number", "Ranura seleccionada")
  ]);
  TYPES.ScreenDisplay = [
    M("setActionBar", "(text: string | RawMessage): void", "Muestra texto sobre la barra de objetos"),
    M("setTitle", "(title: string | RawMessage, options?): void", "Muestra un t\xEDtulo grande"),
    M("updateSubtitle", "(subtitle: string | RawMessage): void", "Actualiza el subt\xEDtulo"),
    M("clearTitle", "(): void", "Quita el t\xEDtulo"),
    M("resetTitleDuration", "(): void", "Restablece la duraci\xF3n del t\xEDtulo"),
    M("setHudVisibility", "(visible, hudElements?): void", "Muestra u oculta elementos del HUD")
  ];
  TYPES.Block = [
    P("typeId", "string", 'Id del bloque: "minecraft:stone"'),
    P("type", "BlockType", "Tipo de bloque"),
    P("permutation", "BlockPermutation", "Estados actuales", "BlockPermutation"),
    P("location", "Vector3", "Posici\xF3n", "Vector3"),
    P("x", "number", "Coordenada X"),
    P("y", "number", "Coordenada Y"),
    P("z", "number", "Coordenada Z"),
    P("dimension", "Dimension", "Dimensi\xF3n", "Dimension"),
    P("isAir", "boolean", "Si es aire"),
    P("isLiquid", "boolean", "Si es l\xEDquido"),
    P("isSolid", "boolean", "Si es s\xF3lido"),
    P("isWaterlogged", "boolean", "Si tiene agua dentro"),
    P("isValid", "boolean", "Si el bloque es v\xE1lido"),
    M("setType", "(blockType: BlockType | string): void", "Cambia el tipo de bloque"),
    M("setPermutation", "(permutation: BlockPermutation): void", "Cambia los estados del bloque"),
    M("getComponent", "(id: string): BlockComponent | undefined", "Obtiene un componente", "Component"),
    M("above", "(steps?: number): Block | undefined", "Bloque superior", "Block"),
    M("below", "(steps?: number): Block | undefined", "Bloque inferior", "Block"),
    M("north", "(steps?: number): Block | undefined", "Bloque al norte", "Block"),
    M("south", "(steps?: number): Block | undefined", "Bloque al sur", "Block"),
    M("east", "(steps?: number): Block | undefined", "Bloque al este", "Block"),
    M("west", "(steps?: number): Block | undefined", "Bloque al oeste", "Block"),
    M("offset", "(offset: Vector3): Block | undefined", "Bloque desplazado", "Block"),
    M("center", "(): Vector3", "Centro del bloque", "Vector3"),
    M("bottomCenter", "(): Vector3", "Centro de la base", "Vector3"),
    M("hasTag", "(tag: string): boolean", "Si tiene la etiqueta"),
    M("getTags", "(): string[]", "Etiquetas del bloque"),
    M("getItemStack", "(amount?: number, withData?: boolean): ItemStack", "Objeto equivalente", "ItemStack"),
    M("matches", "(blockName: string, states?): boolean", "Si coincide con el bloque")
  ];
  TYPES.BlockPermutation = [
    M("getState", "(name: string)", "Lee un estado"),
    M("withState", "(name: string, value): BlockPermutation", "Copia con otro estado", "BlockPermutation"),
    M("getAllStates", "(): Record<string, any>", "Todos los estados"),
    M("matches", "(blockName: string, states?): boolean", "Si coincide"),
    P("type", "BlockType", "Tipo de bloque")
  ];
  TYPES.Dimension = [
    P("id", "string", 'Id de la dimensi\xF3n: "minecraft:overworld"'),
    P("heightRange", "{min, max}", "Rango de altura"),
    M("getBlock", "(location: Vector3): Block | undefined", "Bloque en una posici\xF3n", "Block"),
    M("getEntities", "(options?: EntityQueryOptions): Entity[]", "Entidades filtradas", "Entity[]"),
    M("getPlayers", "(options?: EntityQueryOptions): Player[]", "Jugadores en la dimensi\xF3n", "Player[]"),
    M("spawnEntity", "(id: string, location: Vector3, options?): Entity", "Crea una entidad", "Entity"),
    M("spawnItem", "(item: ItemStack, location: Vector3): Entity", "Suelta un objeto", "Entity"),
    M("spawnParticle", "(effectName: string, location: Vector3, molangVars?): void", "Crea part\xEDculas"),
    M("playSound", "(soundId: string, location: Vector3, options?): void", "Reproduce un sonido"),
    M("runCommand", "(command: string): CommandResult", "Ejecuta un comando"),
    M("setBlockType", "(location: Vector3, type: BlockType | string): void", "Cambia un bloque"),
    M("setBlockPermutation", "(location: Vector3, permutation: BlockPermutation): void", "Coloca una permutaci\xF3n"),
    M("createExplosion", "(location: Vector3, radius: number, options?): boolean", "Crea una explosi\xF3n"),
    M("getTopmostBlock", "(location: Vector2, minHeight?: number): Block | undefined", "Bloque m\xE1s alto", "Block"),
    M("fillBlocks", "(volume, block, options?): ListBlockVolume", "Rellena un volumen"),
    M("getBlockFromRay", "(location, direction, options?): BlockRaycastHit | undefined", "Raycast de bloques"),
    M("getEntitiesAtBlockLocation", "(location: Vector3): Entity[]", "Entidades en un bloque", "Entity[]"),
    M("setWeather", "(type: WeatherType, duration?: number): void", "Cambia el clima")
  ];
  TYPES.ItemStack = [
    P("typeId", "string", 'Id del objeto: "minecraft:diamond"'),
    P("amount", "number", "Cantidad"),
    P("maxAmount", "number", "Cantidad m\xE1xima por pila"),
    P("nameTag", "string", "Nombre personalizado"),
    P("isStackable", "boolean", "Si se apila"),
    P("keepOnDeath", "boolean", "Si se conserva al morir"),
    P("lockMode", "ItemLockMode", "Bloqueo de la ranura"),
    M("getLore", "(): string[]", "Descripci\xF3n del objeto", "string[]"),
    M("setLore", "(lore: string[]): void", "Cambia la descripci\xF3n"),
    M("getComponent", "(id: string): ItemComponent | undefined", "Obtiene un componente", "Component"),
    M("hasComponent", "(id: string): boolean", "Si tiene el componente"),
    M("getTags", "(): string[]", "Etiquetas del objeto"),
    M("hasTag", "(tag: string): boolean", "Si tiene la etiqueta"),
    M("clone", "(): ItemStack", "Copia el objeto", "ItemStack"),
    M("setCanPlaceOn", "(blocks?: string[]): void", "Bloques donde puede colocarse"),
    M("setCanDestroy", "(blocks?: string[]): void", "Bloques que puede romper"),
    M("getDynamicProperty", "(id: string)", "Lee una propiedad din\xE1mica"),
    M("setDynamicProperty", "(id: string, value?): void", "Guarda una propiedad din\xE1mica")
  ];
  TYPES.Container = [
    P("size", "number", "N\xFAmero de ranuras"),
    P("emptySlotsCount", "number", "Ranuras vac\xEDas"),
    M("getItem", "(slot: number): ItemStack | undefined", "Objeto de una ranura", "ItemStack"),
    M("setItem", "(slot: number, item?: ItemStack): void", "Pone un objeto en una ranura"),
    M("addItem", "(item: ItemStack): ItemStack | undefined", "A\xF1ade un objeto donde quepa"),
    M("removeItem", "(itemType: string, amount: number): void", "Quita objetos"),
    M("swapItems", "(slot: number, otherSlot: number, other: Container): void", "Intercambia ranuras"),
    M("moveItem", "(from: number, to: number, other: Container): void", "Mueve un objeto"),
    M("clearAll", "(): void", "Vac\xEDa el contenedor")
  ];
  TYPES.Inventory = [P("container", "Container", "Contenedor del inventario", "Container"), P("inventorySize", "number", "Tama\xF1o")];
  TYPES.Health = [
    P("currentValue", "number", "Vida actual"),
    P("effectiveMax", "number", "Vida m\xE1xima"),
    P("defaultValue", "number", "Valor por defecto"),
    M("setCurrentValue", "(value: number): boolean", "Cambia la vida"),
    M("resetToMaxValue", "(): void", "Restaura al m\xE1ximo"),
    M("resetToDefaultValue", "(): void", "Restaura al valor por defecto")
  ];
  TYPES.Equippable = [
    M("getEquipment", "(slot: EquipmentSlot): ItemStack | undefined", "Objeto equipado", "ItemStack"),
    M("setEquipment", "(slot: EquipmentSlot, item?: ItemStack): boolean", "Equipa un objeto"),
    M("getEquipmentSlot", "(slot: EquipmentSlot): ContainerSlot", "Ranura de equipo")
  ];
  TYPES.Durability = [
    P("damage", "number", "Da\xF1o acumulado"),
    P("maxDurability", "number", "Durabilidad m\xE1xima"),
    M("getDamageChance", "(unbreaking?: number): number", "Probabilidad de da\xF1o")
  ];
  TYPES.Component = [P("typeId", "string", "Id del componente"), P("isValid", "boolean", "Si es v\xE1lido")];
  TYPES.Vector3 = [P("x", "number", "X"), P("y", "number", "Y"), P("z", "number", "Z")];
  TYPES.Vector2 = [P("x", "number", "X"), P("y", "number", "Y")];
  TYPES.Scoreboard = [
    M("getObjective", "(id: string): ScoreboardObjective | undefined", "Obtiene un objetivo"),
    M("addObjective", "(id: string, displayName?: string): ScoreboardObjective", "Crea un objetivo"),
    M("removeObjective", "(id: string): boolean", "Elimina un objetivo"),
    M("getObjectives", "(): ScoreboardObjective[]", "Lista los objetivos"),
    M("getParticipants", "(): ScoreboardIdentity[]", "Lista los participantes"),
    M("setObjectiveAtDisplaySlot", "(slot, options): ScoreboardObjective", "Muestra un objetivo")
  ];
  TYPES.Event = [
    P("player", "Player", "Jugador del evento", "Player"),
    P("source", "Entity | Player", "Origen del evento", "Player"),
    P("sender", "Player", "Quien envi\xF3 el mensaje", "Player"),
    P("entity", "Entity", "Entidad del evento", "Entity"),
    P("block", "Block", "Bloque del evento", "Block"),
    P("itemStack", "ItemStack", "Objeto del evento", "ItemStack"),
    P("initialSpawn", "boolean", "true si es la primera vez que aparece (playerSpawn)"),
    P("message", "string", "Mensaje de chat / scriptevent"),
    P("id", "string", "Id del scriptevent"),
    P("sourceType", "ScriptEventSource", "Origen del scriptevent"),
    P("sourceEntity", "Entity", "Entidad que lanz\xF3 el scriptevent", "Entity"),
    P("damage", "number", "Da\xF1o recibido"),
    P("damageSource", "EntityDamageSource", "Fuente del da\xF1o"),
    P("hitEntity", "Entity", "Entidad golpeada", "Entity"),
    P("damagingEntity", "Entity", "Entidad que golpea", "Entity"),
    P("hurtEntity", "Entity", "Entidad herida", "Entity"),
    P("deadEntity", "Entity", "Entidad muerta", "Entity"),
    P("brokenBlockPermutation", "BlockPermutation", "Permutaci\xF3n rota", "BlockPermutation"),
    P("blockFace", "Direction", "Cara del bloque"),
    P("cancel", "boolean", "Poner true para cancelar (eventos before)"),
    P("dimension", "Dimension", "Dimensi\xF3n", "Dimension"),
    P("location", "Vector3", "Posici\xF3n", "Vector3")
  ];
  TYPES.Array = [
    P("length", "number", "Cantidad de elementos"),
    M("forEach", "(cb: (item, index) => void): void"),
    M("map", "(cb: (item) => any): any[]"),
    M("filter", "(cb: (item) => boolean)"),
    M("find", "(cb: (item) => boolean)"),
    M("findIndex", "(cb)"),
    M("some", "(cb)"),
    M("every", "(cb)"),
    M("includes", "(value): boolean"),
    M("indexOf", "(value): number"),
    M("push", "(...items): number"),
    M("pop", "()"),
    M("shift", "()"),
    M("unshift", "(...items)"),
    M("slice", "(start?, end?)"),
    M("splice", "(start, count?, ...items)"),
    M("join", "(separator?): string"),
    M("sort", "(cmp?)"),
    M("reduce", "(cb, initial?)"),
    M("flat", "(depth?)"),
    M("at", "(index: number)"),
    M("concat", "(...arrays)"),
    M("reverse", "()")
  ];
  TYPES.String = [
    P("length", "number", "Longitud"),
    M("includes", "(text): boolean"),
    M("startsWith", "(text): boolean"),
    M("endsWith", "(text): boolean"),
    M("split", "(sep): string[]"),
    M("replace", "(search, replacement): string"),
    M("replaceAll", "(search, replacement): string"),
    M("trim", "(): string"),
    M("toLowerCase", "(): string"),
    M("toUpperCase", "(): string"),
    M("slice", "(start, end?): string"),
    M("substring", "(start, end?): string"),
    M("indexOf", "(text): number"),
    M("padStart", "(len, fill?): string"),
    M("padEnd", "(len, fill?): string"),
    M("repeat", "(n): string"),
    M("charAt", "(i): string"),
    M("at", "(i): string")
  ];
  TYPES.Math = [
    P("PI", "number"),
    M("abs", "(x)"),
    M("floor", "(x)"),
    M("ceil", "(x)"),
    M("round", "(x)"),
    M("trunc", "(x)"),
    M("random", "(): number", "0 \u2264 n < 1"),
    M("min", "(...n)"),
    M("max", "(...n)"),
    M("sqrt", "(x)"),
    M("pow", "(x, y)"),
    M("sin", "(x)"),
    M("cos", "(x)"),
    M("atan2", "(y, x)"),
    M("hypot", "(...n)"),
    M("sign", "(x)")
  ];
  TYPES.Console = [M("log", "(...args)", "Escribe en el registro"), M("warn", "(...args)"), M("error", "(...args)"), M("info", "(...args)")];
  TYPES.Object = [M("keys", "(obj): string[]"), M("values", "(obj)"), M("entries", "(obj)"), M("assign", "(target, ...sources)"), M("freeze", "(obj)"), M("fromEntries", "(entries)")];
  TYPES.JSON = [M("parse", "(text: string)"), M("stringify", "(value, replacer?, space?): string")];
  TYPES.Number = [M("isInteger", "(v): boolean"), M("parseFloat", "(s)"), M("parseInt", "(s)"), P("MAX_SAFE_INTEGER", "number")];
  TYPES.WorldAfterEvents = Object.keys(AFTER).filter((k) => k !== "scriptEventReceive").map((k) => ["" + k, "e", "AfterEventSignal", AFTER[k], "Signal"]);
  TYPES.WorldBeforeEvents = Object.keys(BEFORE).filter((k) => !["startup", "shutdown", "watchdogTerminate"].includes(k)).map((k) => [k, "e", "BeforeEventSignal", BEFORE[k], "Signal"]);
  TYPES.SystemAfterEvents = [["scriptEventReceive", "e", "ScriptEventCommandMessageAfterEventSignal", AFTER.scriptEventReceive, "Signal"]];
  TYPES.SystemBeforeEvents = ["startup", "shutdown", "watchdogTerminate"].map((k) => [k, "e", "BeforeEventSignal", BEFORE[k], "Signal"]);
  TYPES.GameMode = ["survival", "creative", "adventure", "spectator"].map((k) => [k, "k", "GameMode", "Modo " + k]);
  TYPES.EquipmentSlot = ["Head", "Chest", "Legs", "Feet", "Mainhand", "Offhand"].map((k) => [k, "k", "EquipmentSlot", "Ranura " + k]);
  TYPES.TimeOfDay = ["Day", "Noon", "Sunset", "Night", "Midnight", "Sunrise"].map((k) => [k, "k", "TimeOfDay", "Hora " + k]);
  TYPES.Direction = ["Down", "Up", "North", "South", "West", "East"].map((k) => [k, "k", "Direction", "Cara " + k]);
  TYPES.EntityComponentTypes = [["Health", "k", "minecraft:health"], ["Inventory", "k", "minecraft:inventory"], ["Equippable", "k", "minecraft:equippable"], ["Movement", "k", "minecraft:movement"], ["Ageable", "k", "minecraft:ageable"], ["Tameable", "k", "minecraft:tameable"], ["Rideable", "k", "minecraft:rideable"], ["OnFire", "k", "minecraft:onfire"]];
  TYPES.ItemComponentTypes = [["Durability", "k", "minecraft:durability"], ["Enchantable", "k", "minecraft:enchantable"], ["Cooldown", "k", "minecraft:cooldown"], ["Food", "k", "minecraft:food"], ["Dyeable", "k", "minecraft:dyeable"]];
  const COMPONENTS = {
    "minecraft:health": "Health",
    "minecraft:inventory": "Inventory",
    "minecraft:equippable": "Equippable",
    "minecraft:durability": "Durability",
    "health": "Health",
    "inventory": "Inventory",
    "equippable": "Equippable",
    "durability": "Durability",
    EntityComponentTypes_Health: "Health",
    EntityComponentTypes_Inventory: "Inventory",
    EntityComponentTypes_Equippable: "Equippable",
    ItemComponentTypes_Durability: "Durability"
  };
  const IMPORTS = {
    world: "@minecraft/server",
    system: "@minecraft/server",
    Player: "@minecraft/server",
    Entity: "@minecraft/server",
    ItemStack: "@minecraft/server",
    Block: "@minecraft/server",
    BlockPermutation: "@minecraft/server",
    BlockTypes: "@minecraft/server",
    ItemTypes: "@minecraft/server",
    EntityComponentTypes: "@minecraft/server",
    ItemComponentTypes: "@minecraft/server",
    EquipmentSlot: "@minecraft/server",
    GameMode: "@minecraft/server",
    Direction: "@minecraft/server",
    TimeOfDay: "@minecraft/server",
    EntityDamageCause: "@minecraft/server",
    ScriptEventSource: "@minecraft/server",
    TicksPerSecond: "@minecraft/server",
    MolangVariableMap: "@minecraft/server",
    DimensionTypes: "@minecraft/server",
    CustomCommandStatus: "@minecraft/server",
    ActionFormData: "@minecraft/server-ui",
    ModalFormData: "@minecraft/server-ui",
    MessageFormData: "@minecraft/server-ui",
    FormCancelationReason: "@minecraft/server-ui",
    MinecraftBlockTypes: "@minecraft/vanilla-data",
    MinecraftItemTypes: "@minecraft/vanilla-data",
    MinecraftEntityTypes: "@minecraft/vanilla-data",
    MinecraftEffectTypes: "@minecraft/vanilla-data"
  };
  const GLOBAL_TYPE = { world: "World", system: "System", Math: "Math", console: "Console", Object: "Object", JSON: "JSON", Number: "Number", GameMode: "GameMode", EquipmentSlot: "EquipmentSlot", TimeOfDay: "TimeOfDay", Direction: "Direction", EntityComponentTypes: "EntityComponentTypes", ItemComponentTypes: "ItemComponentTypes" };
  const VAR_TYPE = [
    [/^(player|plr|sender|p|jugador|owner|pl|source)$/i, "Player"],
    [/^(entity|target|victim|attacker|damager|damagingEntity|hitEntity|hurtEntity|deadEntity|mob|ent)$/i, "Entity"],
    [/^(block|hitBlock|brokenBlock|clickedBlock|b)$/i, "Block"],
    [/^(dimension|dim|overworld|nether|theEnd|end)$/i, "Dimension"],
    [/^(item|itemStack|stack|heldItem|mainhand|itemStackBefore|itemStackAfter)$/i, "ItemStack"],
    [/^(container|inventory|inv)$/i, "Container"],
    [/^(event|ev|evt|e|data|result)$/i, "Event"],
    [/^(loc|location|pos|position|vec|vector|velocity|direction)$/i, "Vector3"],
    [/^(players|entities|items|list|arr|array|blocks)$/i, "Array"],
    [/^(scoreboard)$/i, "Scoreboard"]
  ];
  const SNIPPETS = [
    { p: "imp", n: "import @minecraft/server", d: "Importa world y system", t: 'import { world, system } from "@minecraft/server";\n', l: ["js", "ts"] },
    { p: "impui", n: "import @minecraft/server-ui", d: "Formularios", t: 'import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";\n', l: ["js", "ts"] },
    { p: "sub", n: "subscribe a un evento", d: "world.afterEvents.X.subscribe", t: "world.afterEvents.${1:playerSpawn}.subscribe((event) => {\n  $0\n});", l: ["js", "ts"] },
    { p: "subb", n: "subscribe a un evento before", d: "world.beforeEvents.X.subscribe", t: "world.beforeEvents.${1:chatSend}.subscribe((event) => {\n  $0\n});", l: ["js", "ts"] },
    { p: "interval", n: "system.runInterval", d: "Repite cada N ticks", t: "system.runInterval(() => {\n  $0\n}, ${1:20});", l: ["js", "ts"] },
    { p: "timeout", n: "system.runTimeout", d: "Ejecuta tras N ticks", t: "system.runTimeout(() => {\n  $0\n}, ${1:20});", l: ["js", "ts"] },
    { p: "forp", n: "for jugadores", d: "Recorre todos los jugadores", t: "for (const player of world.getAllPlayers()) {\n  $0\n}", l: ["js", "ts"] },
    { p: "scriptevent", n: "scriptEventReceive", d: "Maneja /scriptevent", t: 'system.afterEvents.scriptEventReceive.subscribe((event) => {\n  if (event.id !== "${1:ns:accion}") return;\n  $0\n});', l: ["js", "ts"] },
    { p: "form", n: "ActionFormData", d: "Formulario con botones", t: 'const form = new ActionFormData()\n  .title("${1:T\xEDtulo}")\n  .body("${2:Elige una opci\xF3n}")\n  .button("${3:Bot\xF3n}");\n\nform.show(player).then((response) => {\n  if (response.canceled) return;\n  $0\n});', l: ["js", "ts"] },
    { p: "modal", n: "ModalFormData", d: "Formulario con controles", t: 'const form = new ModalFormData()\n  .title("${1:T\xEDtulo}")\n  .textField("${2:Nombre}", "${3:Escribe aqu\xED}")\n  .toggle("${4:Activar}", false);\n\nform.show(player).then((response) => {\n  if (response.canceled) return;\n  $0\n});', l: ["js", "ts"] },
    { p: "fn", n: "function", d: "Declaraci\xF3n de funci\xF3n", t: "function ${1:nombre}(${2}) {\n  $0\n}", l: ["js", "ts"] },
    { p: "afn", n: "async function", d: "Funci\xF3n as\xEDncrona", t: "async function ${1:nombre}(${2}) {\n  $0\n}", l: ["js", "ts"] },
    { p: "arrow", n: "arrow function", d: "Funci\xF3n flecha", t: "const ${1:nombre} = (${2}) => {\n  $0\n};", l: ["js", "ts"] },
    { p: "iff", n: "if", d: "Condicional", t: "if (${1:condici\xF3n}) {\n  $0\n}", l: ["js", "ts"] },
    { p: "ife", n: "if / else", d: "Condicional con else", t: "if (${1:condici\xF3n}) {\n  $2\n} else {\n  $0\n}", l: ["js", "ts"] },
    { p: "forof", n: "for\u2026of", d: "Recorre un iterable", t: "for (const ${1:item} of ${2:lista}) {\n  $0\n}", l: ["js", "ts"] },
    { p: "fori", n: "for (i)", d: "Bucle num\xE9rico", t: "for (let i = 0; i < ${1:n}; i++) {\n  $0\n}", l: ["js", "ts"] },
    { p: "try", n: "try / catch", d: "Manejo de errores", t: "try {\n  $0\n} catch (error) {\n  console.warn(`Error: ${error}`);\n}", l: ["js", "ts"] },
    { p: "cmd", n: "runCommand", d: "Ejecuta un comando", t: '${1:player}.runCommand("${2:say hola}");', l: ["js", "ts"] },
    { p: "sendmsg", n: "sendMessage", d: "Mensaje a un jugador", t: '${1:player}.sendMessage("${2:Hola}");', l: ["js", "ts"] },
    { p: "actionbar", n: "setActionBar", d: "Texto sobre la hotbar", t: '${1:player}.onScreenDisplay.setActionBar("${2:Texto}");', l: ["js", "ts"] },
    { p: "interface", n: "interface", d: "Interfaz TypeScript", t: "interface ${1:Nombre} {\n  ${2:campo}: ${3:string};\n}", l: ["ts"] },
    { p: "type", n: "type alias", d: "Alias de tipo TypeScript", t: "type ${1:Nombre} = ${2:string};", l: ["ts"] },
    { p: "enum", n: "enum", d: "Enumeraci\xF3n TypeScript", t: "enum ${1:Nombre} {\n  ${2:A},\n  ${3:B},\n}", l: ["ts"] },
    { p: "cls", n: "class", d: "Clase", t: "class ${1:Nombre} {\n  constructor(${2}) {\n    $0\n  }\n}", l: ["js", "ts"] }
  ];
  const MCFUNCTION_COMMANDS = ["give", "tp", "teleport", "execute", "summon", "setblock", "fill", "clone", "kill", "effect", "gamemode", "tag", "scoreboard", "title", "titleraw", "tellraw", "say", "playsound", "stopsound", "particle", "function", "scriptevent", "time", "weather", "xp", "enchant", "clear", "replaceitem", "structure", "tickingarea", "camerashake", "camera", "music", "inputpermission", "difficulty", "gamerule", "setworldspawn", "spawnpoint", "event", "loot", "damage", "dialogue", "mobevent", "ride", "msg", "me", "testfor", "testforblock", "testforblocks", "fog", "hud", "volumearea", "playanimation", "transfer", "kick", "op", "deop", "ability", "alwaysday", "daylock", "locate", "list", "recipe", "schedule"];
  const EXEC_SUB = ["as", "at", "if", "unless", "run", "positioned", "rotated", "facing", "align", "anchored", "in", "store"];
  const MCFUNCTION_SNIPPETS = [
    { p: "give", n: "give", d: "give @s diamond 1", t: "give ${1:@s} ${2:diamond} ${3:1}", l: ["mcfunction"] },
    { p: "execute", n: "execute as at", d: "Ejecuta como/en", t: "execute as ${1:@a} at @s run ${0}", l: ["mcfunction"] },
    { p: "title", n: "title", d: "Muestra un t\xEDtulo", t: 'title ${1:@a} title {"text":"${2:Hola}"}', l: ["mcfunction"] },
    { p: "tellraw", n: "tellraw", d: "Mensaje con formato", t: 'tellraw ${1:@a} {"rawtext":[{"text":"${2:Hola}"}]}', l: ["mcfunction"] }
  ];
  root.MCDATA = { TYPES, AFTER, BEFORE, SYS_AFTER, COMPONENTS, IMPORTS, GLOBAL_TYPE, VAR_TYPE, SNIPPETS, MCFUNCTION_COMMANDS, EXEC_SUB, MCFUNCTION_SNIPPETS };
  if (typeof module !== "undefined" && module.exports) module.exports = root.MCDATA;
})(typeof window !== "undefined" ? window : globalThis);
