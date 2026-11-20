/* Versiones de referencia para addons Bedrock (revisadas en nov-2026).
   Cámbialas aquí y todo el editor (plantillas, Toolbox, validador) se actualiza. */
window.FD_VERSIONS = {
  game: '26.63',                       // Bedrock estable
  server: '2.11.0',                    // @minecraft/server
  serverUi: '2.3.0',                   // @minecraft/server-ui (requiere server 2.x)
  common: '1.2.0',                     // @minecraft/common
  // Versiones de @minecraft/server que ofrece el editor (de más nueva a más compatible)
  serverChoices: [
    ['2.11.0', '2.11.0 (última)'],
    ['2.0.0', '2.0.0 (muy compatible)'],
    ['1.18.0', '1.18.0 (antigua)']
  ],
  // min_engine_version por defecto. La numeración 26.x aún no se ha verificado
  // para este campo, por eso se mantiene un valor 1.21.x que cargan los clientes nuevos.
  minEngine: [1, 21, 50],
  formats: {
    entityBP: '1.21.50',
    block: '1.21.50',
    clientEntity: '1.10.0',
    renderController: '1.10.0',
    geometry: '1.12.0',
    animation: '1.10.0'
  }
};
