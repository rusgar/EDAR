# Paso 6 - Persistencia de datos (localStorage → IndexedDB → localStorage)

**Fecha:** Dia 5-7
**Objetivo:** Asegurar que los datos persistan entre sesiones del navegador

## Evolucion de la persistencia

### Intento 1: localStorage original
- Almacenamiento en `localStorage` con clave `desarenadores_data`
- Funcionaba pero los datos se perdian al cerrar/abrir el navegador en algunos casos

### Intento 2: IndexedDB
- Se creo `js/db.js` con modulo `DB` usando IndexedDB
- Migracion automatica de datos antiguos de localStorage
- Auto-backup a archivo JSON tras cada guardado
- Indicador de ultimo backup visible
- Mensaje de "No hay datos" con import de backup

### Problema con IndexedDB
**IndexedDB no funciona de forma fiable con archivos locales (`file://`).**
- Algunos navegadores restringen IndexedDB en contexto seguro (solo HTTPS o localhost)
- Los datos se guardaban pero no se leian al recargar la pagina
- El usuario reporto que los datos del dia 18 se perdian al recargar

### Solucion final: Volver a localStorage
- Se reescribio `db.js` para usar **localStorage** como almacenamiento principal
- localStorage funciona perfectamente con archivos locales (`file://`)
- Se mantuvo la estructura modular de `DB` para facilitar futuros cambios
- Se mantuvo la exportacion/importacion de backups JSON

## Funcionalidades de persistencia implementadas

### Guardado automatico
- Cada "Guardar Local" almacena en localStorage
- Descarga automatica de backup JSON tras cada guardado
- Indicador de "Ultimo guardado" visible en la barra de acciones

### Importacion de backups
- Si no hay datos al iniciar, se muestra boton para importar backup
- Formato JSON compatible con la estructura de datos interna

### Migracion de datos
- Si existen datos en la clave antigua (`desarenadores_data`), se migran automaticamente
- Se limpia la clave antigua tras la migracion

## Archivos modificados

- `js/db.js` - Reescrito completamente (IndexedDB → localStorage)
- `js/app.js` - Funciones `loadDataFromDB()`, `persistData()`, `importBackupFile()`
- `index.html` - Elemento de import de backup, indicador de backup

## Notas tecnicas

- Clave de localStorage: `edar_checklist_data`
- Clave de timestamp: `edar_last_backup`
- Los datos se almacenan como array de objetos JSON
- Cada registro tiene un `id` unico basado en `Date.now()`
- La exportacion JSON usa `JSON.stringify(list, null, 2)` para legibilidad

## Leccion aprendida

**Para aplicaciones locales que se abren con `file://`, usar localStorage en lugar de IndexedDB.** IndexedDB requiere contexto seguro (HTTPS o localhost) que no esta disponible al abrir archivos directamente.
