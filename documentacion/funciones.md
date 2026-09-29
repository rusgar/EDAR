# Funciones JavaScript — qué hace cada una

**Alcance:** la lógica vive en `MANANA/js/app.js`, `TARDE/js/app.js` y `NOCHE/js/app.js` (**son prácticamente idénticos**, ~542 líneas, mismas líneas en los tres), más `*/js/db.js`, `admin.html`, `netlify/functions/api-datos.mjs` y el generador `TARDE/tools/generar_index.ps1`.

Referencias de línea → `MANANA/js/app.js` salvo indicación.

---

## 1. Diferencias entre los tres turnos

| | `MANANA/` | `TARDE/` | `NOCHE/` |
|---|---|---|---|
| `TURNO_SYNC` (línea 344) | `manana` | `tarde` | `noche` |
| `DRAFT_KEY` (línea 343) | `edar_manana_draft` | `edar_tarde_draft` | `edar_noche_draft` |
| Claves en `db.js` | `edar_manana_data` / `…_last_backup` | `edar_tarde_data` / `…_last_backup` | `edar_noche_data` / `…_last_backup` |
| Prefijo de campos | `m_…` | `t_…` | `n_…` |
| Pestaña inicial (`loadRecord`) | `switchTab('terciario')` | `switchTab('bioA')` | `switchTab('general')` |
| Turno por defecto (`applyDataToForm`) | `Mañanas` | `Tardes` | `Noches` |
| Nombre de descargas | `checklist_mananas_*` | `checklist_tardes_*` | `checklist_noches_*` |

Todo lo demás es código compartido: al cambiar la lógica hay que cambiarla en los **tres** archivos.

---

## 2. `js/db.js` — módulo `DB` (persistencia en localStorage)

| Función | Línea | Qué hace |
|---|---|---|
| `DB.getAll([callback])` | 5 | Lee `localStorage[edar_<turno>_data]`, parsea y devuelve el array de registros (vacío si no hay o si está corrupto). Devuelve el valor y llama al callback. |
| `DB.saveAll(list, [callback])` | 17 | Guarda el array completo con `JSON.stringify` + marca `edar_<turno>_last_backup` con la hora actual. Devuelve `false` y avisa si el navegador está lleno. |
| `DB.addRecord(record, [callback])` | 29 | Añade un registro al final de la lista existente y guarda. |
| `DB.exportToFile()` | 35 | **Backup automático:** descarga `edar_backup_<hoy>.json` con TODOS los registros locales (`JSON.stringify(list, null, 2)`) y actualiza el sello de "último guardado". No hace nada si no hay registros. |
| `DB.importFromFile(file, callback)` | 56 | Lee un `.json` seleccionado, valida que sea un array y lo **sustituye** como lista completa (informa del nº de registros importados). |
| `DB.updateBackupStatus()` | 81 | Escribe en la página el texto "Último guardado: fecha hora" a partir de `edar_<turno>_last_backup`. |
| `DB.getLocalBackup()` | 95 | Devuelve la lista local (mismo contenido que `getAll`); se usa de respaldo en `loadDataFromDB`. |

---

## 3. `js/app.js` — lógica del checklist

### 3.1 Estado global (líneas 1–6, 343–346)

| Variable | Qué guarda |
|---|---|
| `window._dataCache` | Array de registros en memoria (la "base de datos" de la sesión). |
| `loadingRecord` | Flag: `true` mientras se carga un registro en el formulario → evita que el handler de fecha dispare la pregunta del día anterior. |
| `adminAutenticado` | Si la pestaña Registros está desbloqueada. |
| `pendingSaveData` | Registro recogido y en espera de confirmación en el modal de revisión. |
| `ADMIN_USER` / `ADMIN_PASS` | `admin` / `edar2026` (líneas 5–6). |
| `DRAFT_KEY` / `TURNO_SYNC` | Clave del borrador y turno de sincronización (343–344). |
| `draftTimer` / `formDirty` | Temporizador del borrador y "el formulario tiene cambios sin guardar" (345–346). |

### 3.2 Carga y persistencia

- **`getDataList()`** (8) → devuelve `_dataCache`.
- **`loadDataFromDB(callback)`** (9) → al abrir, lee los registros de localStorage; si está vacío usa `DB.getLocalBackup()`; inicializa `_dataCache` y ejecuta el callback. Base del arranque.
- **`persistData(callback)`** (26) → guarda `_dataCache` completo con `DB.saveAll` y refresca el indicador "Último guardado".

### 3.3 Pestañas, tarjetas y operarios

- **`switchTab(tabId, btn)`** (40) → muestra la pestaña `tabId` y marca su botón. Si es `resumenTab` (Registros) gestiona el login: sin sesión muestra el formulario de acceso, con sesión muestra la tabla de registros.
- **`toggleEquipment(select)`** (57) → al cambiar el estado de una tarjeta (Funcionando/Parado/Defecto/No funciona): si NO está funcionando, **deshabilita y limpia** todos los campos de esa tarjeta (números, textos, radios, checkboxes) y quita marcas de error; si vuelve a funcionar, los reactiva.
- **`getScadaVal(name)`** (70) → lee un grupo SCADA (checkboxes R/L/M/A): devuelve `"R, L"` (los 2 seleccionados unidos) o `null` si el equipo no funciona o si no hay **exactamente 2** (entonces marca el grupo en rojo `has-error`).
- **`filterOperario2()`** (32) → evita repetir operario: deshabilita en "Operario 2" el nombre elegido en "Operario 1" (y lo limpia si coincidía).

### 3.4 Recolección y validación

- **`collectFormData()`** (83) → **corazón de la recolección**: construye el registro `{ id: 'CHECK_'+Date.now(), fecha, turno, operario1, operario2, observaciones_generales, timestamp, campos: {...} }` recorriendo el DOM:
  - grupos SCADA → `getScadaVal()` (`"R, L"` o `null`),
  - radios → valor del marcado (`null` si ninguno),
  - inputs por `id` (números, `_valor`, `_horas`, `_num`, textos),
  - observaciones de fila → clave `<name>_obs`,
  - `campos._estados` → mapa `título de tarjeta → estado` de cada `status-select`.
  - Al ser genérica, sirve para los 3 checklists sin tocar ids.
- **`validateScada()`** (139) → devuelve `true` si **cada** grupo SCADA activo tiene exactamente 2 opciones marcadas (los parados se saltan y se desmarcan del error).
- **`saveToLocalStorage()`** (152) → botón **Guardar Local**: valida SCADA → `pendingSaveData = collectFormData()` → abre el modal de revisión (aún no guarda).

### 3.5 Exportación

- **`exportJSON()`** (157) → descarga el **formulario actual** como `checklist_mananas_<fecha>.json`.
- **`buildExcelRows(list)`** (167) → genera las cabeceras del Excel (Fecha, Turno, Operario 1/2, Observaciones, Fecha/Hora + **todas las claves de `campos` ordenadas**, sin `_estados`) y las filas correspondientes; convierte objetos a JSON y los nulos a vacío.
- **`exportExcel()`** (193) → con SheetJS, hoja `Registros` con TODOS los registros locales → `checklist_mananas_<fecha>.xlsx` (anchos de columna automáticos).
- **`downloadSingleJSON(index)`** (215) → descarga JSON de UN registro desde la tabla de Registros.
- **`importBackupFile()`** (488) → importa un `.json` con `DB.importFromFile`, recarga todo, oculta el mensaje "no hay datos", borra el borrador y auto-carga el registro anterior.
- **`resetForm()`** (496) → con confirmación, limpia el formulario, pone la fecha de hoy, desmarca errores SCADA, reactiva operarios y borra el borrador.

### 3.6 Registros guardados (pestaña Registros)

- **`loadSavedRecords()`** (204) → pinta la tabla (Fecha, Turno, Operario 1/2, Acciones) con botones **JSON** (`downloadSingleJSON`) y **Cargar** (`loadRecord`).
- **`loadRecord(index)`** (226) → carga un registro en el formulario: pide confirmación (pierde lo actual), rellena cabecera, restaura `_estados` (llamando a `toggleEquipment`), checkboxes SCADA (separando por comas), radios, inputs y observaciones `*_obs`; luego `switchTab` a la primera pestaña y `borrarDraft()`. Flag `loadingRecord` + `try/catch`.

### 3.7 Revisión y guardado definitivo

- **`showReviewModal(data)`** (287) → pinta el resumen del modal (cabecera, nº de campos, campo a campo los no vacíos, observaciones) y lo abre.
- **`reviewRow(label,value)`** (307) / **`closeReviewModal()`** (308) → helper de fila y cierre (anula `pendingSaveData`).
- **`confirmSave()`** (309) → **Confirmar Guardado** del modal:
  1. `pendingSaveData` → `_dataCache`,
  2. `persistData` (localStorage + sello),
  3. `DB.exportToFile()` → descarga automática del backup JSON,
  4. cierra el modal y `borrarDraft()`,
  5. **`subirRegistro`** al servidor → aviso *"…sincronizados con el servidor"* o *"…sin sincronizar"* si falla.

### 3.8 Acceso de administrador

- **`adminLogin()`** (325) → valida `admin`/`edar2026`, muestra la tabla de registros y la oculta en caso contrario.
- **`adminLogout()`** (336) → revoca la sesión y vuelve a mostrar el login.

### 3.9 Borrador autoguardado (por tablet)

- **`scheduleDraftSave()`** (347) → debounced: 800 ms después del último cambio del formulario llama a `saveDraft()` (solo si `formDirty`).
- **`saveDraft()`** (352) → guarda el formulario en `localStorage[DRAFT_KEY]` **solo si hay contenido** (operarios, observaciones o algún campo); si está vacío lo borra. Añade `_guardado` (ISO).
- **`borrarDraft()`** (369) → limpia `formDirty`, el temporizador y la clave del borrador (se llama al guardar, cargar registro, importar y resetear).
- **`recuperarDraft()`** (374) → al abrir: si existe borrador pregunta *"Se encontraron datos sin guardar del X. ¿Recuperarlos?"*; si acepta lo restaura con `applyDataToForm` y devuelve `true` (si rechaza, lo borra).

### 3.10 Sincronización con el servidor (Netlify Blobs)

- **`mergeListas(a, b)`** (389) → une dos listas por `id`; si el mismo `id` está en ambas gana el que tenga `timestamp` mayor. Devuelve la lista única ordenada por `id` de mapa.
- **`sincronizarDesdeServidor(callback)`** (399) → `GET /api/datos?turno=<TURNO_SYNC>`: mezcla lo local con lo remoto (`mergeListas`), guarda el resultado en `_dataCache` **y** en localStorage, y ejecuta el callback. **No-op** si es `file://` o no hay `fetch` (modo local).
- **`subirRegistro(reg, callback)`** (414) → `POST /api/datos?turno=<TURNO_SYNC>` con `{ registros: [reg] }`; la respuesta trae la lista del servidor, se mezcla y se guarda; `callback(true/false)` para el aviso de `confirmSave`.

### 3.11 Carga del día anterior

- **`preguntarCargaAnterior(fechaDestino)`** (433) → si hay registros y el último es de un día **anterior** al destino, pregunta *"Hay datos guardados del X. ¿Cargarlos como base del Y?"*; si la fecha ya es la misma, carga directo. Se dispara al cambiar la fecha (506) y al abrir (533).
- **`autoLoadPreviousDay(fechaObjetivo)`** (444) → toma el último registro y lo mete en el formulario **con la fecha indicada** (no se pone la del registro).
- **`applyDataToForm(r, fechaDestino)`** (451) → restauración genérica compartida por `loadRecord` (versión con confirmación y pestaña) y por borrador/carga del día anterior (sin confirmación): cabecera, `_estados`, SCADA por comas, radios, inputs y `*_obs`; usa `loadingRecord` para no disparar eventos.
- **Handler `fecha.change`** (506) → ignorado mientras `loadingRecord`; si el nuevo día es posterior al último registro → `preguntarCargaAnterior`.
- **`DOMContentLoaded`** (515) → arranque:
  1. fecha = hoy,
  2. límite de 2 marcados por grupo SCADA,
  3. `loadDataFromDB` → **`sincronizarDesdeServidor`** → oculta/muestra "no hay datos" → `recuperarDraft()` o, si hay datos, `preguntarCargaAnterior(hoy)`,
  4. listeners `input`/`change` del formulario → `formDirty` + `scheduleDraftSave`,
  5. `beforeunload` → si había cambios pendientes, guarda el borrador al cerrar.

> Nota histórica: en el TARDE antiguo (con ids hardcodeados) existía `validateHours()` (aviso si horas/arranques varían >50 % respecto al registro anterior); quedó retirada al pasar a la arquitectura genérica.

---

## 4. `admin.html` — consola de administración

| Función | Línea | Qué hace |
|---|---|---|
| (handler `submit` de `#loginForm`) | ~137 | Valida `admin`/`edar2026` → `sessionStorage['edar_admin']='1'` y `entrar()`; si falla, muestra el error. |
| **`entrar()`** | 151 | Oculta el login, muestra la consola y carga los datos (aviso si falla el servidor o si es `file://` → modo local). |
| **`mostrarAviso(txt)`** | 165 | Muestra/oculta la banda de aviso (naranja). |
| **`cargarDatos(cb)`** | 170 | En `http(s)`: `GET /api/datos` de los 3 turnos en paralelo y mezcla en `todos` con `_turnoKey`; en `file://`: lee las claves de localStorage por turno (modo local). |
| **`filtrar()`** | 196 | Aplica filtros (fecha desde/hasta, turno, texto en operarios/observaciones) y ordena por fecha y `timestamp` descendentes → lista `filtrados`. |
| **`render()`** | 214 | Recuentos por turno (chips) + tabla resumen (Fecha, Turno, Operario 1/2, Observaciones, nº campos) con clic en fila → `abrirDetalle`; mensaje vacío si no hay resultados. |
| **`esc(s)`** | 250 | Escapado HTML (evita inyección de `<`/`&` en los datos). |
| **`abrirDetalle(r)`** | 252 | Modal con meta del registro, observaciones, **todos los campos** (los vacíos en gris) y el mapa `_estados` SCADA; botón para exportar el Excel de ese registro. |
| **`cabeceras(list)`** | 286 | Cabeceras = las 6 base + unión de todas las claves de `campos` ordenadas (sin `_estados`). |
| **`aFila(r)`** | 295 | Convierte un registro en fila de Excel (columnas base + campos). |
| **`hojaDe(regs)`** | 308 | Crea la hoja SheetJS con anchos de columna. |
| **`construirLibro(regs)`** | 315 | Libro con hoja **Todos** + una hoja por turno con datos (**Mañanas/Tardes/Noches**). |
| **`exportarLibro(regs, nombre)`** | 325 | Descarga el `.xlsx` (avisa si no hay registros). Botones: `btnExcel` (todo filtrado), `dExcel` (registro del detalle), `btnRefrescar` → `cargarDatos`+`render`, filtros `fDesde/fHasta/fTurno/fTexto` → `render`. |

---

## 5. `netlify/functions/api-datos.mjs` — API de datos

- Ruta: `GET` y `POST /api/datos?turno=manana|tarde|noche` (`export const config = { path: '/api/datos' }`).
- Almacén: **Netlify Blobs**, tienda `checklists-edar`, clave `"<turno>/registros.json"`.
- **GET** → `{ registros: [...] }` (array completo de ese turno, ordenado por fecha/timestamp).
- **POST** → body `{ registros: [ … ] }`: hace **upsert por `id`** (si ya existe, gana el `timestamp` más reciente), reordena y guarda; devuelve la lista resultante.
- Valida que `turno` esté en `manana|tarde|noche`; errores → 400/500.

---

## 6. `TARDE/tools/generar_index.ps1` — generador del HTML de TARDE

- Script de PowerShell que **genera** `TARDE/index.html` completo (9 pestañas, 102 tarjetas, 21 grupos SCADA, 360 campos) a partir de tablas de datos dentro del script.
- Uso: `powershell -NoProfile -ExecutionPolicy Bypass -File TARDE/tools/generar_index.ps1`.
- Si cambia el checklist en papel, se edita el script (títulos, códigos, filas) y se regenera; **no editar `index.html` a mano** (se perdería).
- También contiene el `<input type="hidden" id="turno" value="Tardes">` (el desplegable "Turno" fue eliminado).
