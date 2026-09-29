# Historial de pasos — Checklist digital EDAR Gijón Este

Cómo empezamos y cada cambio realizado, en orden. Detalle de cada paso: motivo, qué se tocó y cómo se validó.

**Repo:** `https://github.com/rusgar/EDAR` · **Sitio publicado:** `https://edareste.netlify.app/`

---

## Fase 1 — Origen del proyecto (18–20/09/2026)

### Paso 1. Primeros pasos: checklist de desarenadores en una sola página (18/09/2026, `787f9be`)

- Se partió de un archivo monolítico con HTML + CSS + JS mezclados y se separó en:
  - `TARDE/index.html` (estructura del formulario)
  - `TARDE/css/styles.css` (estilos)
  - `TARDE/js/app.js` (toda la lógica)
  - `TARDE/seed.html` (datos de prueba)
- Se añadió el logo de Grupo Tragsa en la cabecera y las pestañas para Desarenador A/B/C y Contenedor.
- Contenido original: checklist en papel de **Desarenadores A/B/C + Contenedor de arenas y grasas** (turno Tardes).
- **Alternativas descartadas:** bundler (Webpack/Vite) y framework (React/Vue) — la app es local, no necesita build ni dependencias.

### Paso 2. Presentación (18/09/2026, `1ec9fbf`)

- `TARDE/README.md`: qué es la app, funcionalidades, cómo usarla, estructura y tecnologías.

### Paso 3. Persistencia con IndexedDB + backup automático (19/09/2026, `db00b34`)

- Nuevo `TARDE/js/db.js` con el módulo `DB` sobre **IndexedDB**:
  - migración automática de datos de la clave antigua,
  - auto-backup a archivo JSON tras cada guardado,
  - indicador de "Último guardado",
  - botón de importar backup cuando no hay datos.

### Paso 4. Vuelta a localStorage (20/09/2026, `00a13ba`)

- **Problema:** IndexedDB **no es fiable con archivos abiertos como `file://`**: los datos se guardaban pero no se leían al recargar (el operario perdió el registro del día 18).
- **Solución:** `db.js` reescrito para usar **localStorage** manteniendo la estructura modular `DB` (claves `edar_checklist_data` y `edar_last_backup`).
- **Lección:** en apps que se abren con `file://`, usar localStorage; IndexedDB exige HTTPS/localhost.

### Paso 5. Reorganización de la documentación (20/09/2026, `061d260`)

- Se reescribe el `README.md` como documentación del proyecto (sin historial).
- Se crea la carpeta **`TARDE/evolucion/`** con `paso1.md` … `paso7.md` (qué se hizo, por qué, archivos modificados).
- Se crea `TARDE/db/seed_prueba.json` con datos de prueba.
- Se actualiza `seed.html` a la clave de localStorage vigente.

### Paso 6. Auto-carga completa del registro anterior (20/09/2026, `20ae45e`)

- **Problema:** los operarios no usan usuario/contraseña ni van a "Registros Guardados"; el programa debe cargar solo el día anterior.
- `autoLoadPreviousDay()` reescrita: carga **todos** los campos (cabecera, estados, SCADA, horas, observaciones por campo…), no solo 15 horas.
- Se elimina la antigua `loadPreviousHours()`.
- Se quitan los `confirm()` de la carga: auto-carga silenciosa al abrir y al cambiar la fecha a un día posterior (los avisos confunden al personal de campo).
- La fecha siempre es **hoy** (el operario registra para el día actual).

---

## Fase 2 — Arquitectura multi-turno (22/09/2026)

### Paso 7. Portal + carpetas TARDE y NOCHE (`42afa75`)

- **Problema:** el checklist de Tardes (desarenadores) no cubre el turno de Noches (checklist GENERAL de ~130 puntos).
- Se crea `EDAR/index.html` como **portal selector de turno** (estático, sin JS ni almacenamiento).
- Se crea la carpeta **`NOCHE/`**: checklist GENERAL transcrito de 6 fotos (`Img/noche/`), mejoradas con Pillow (escala 3×, contraste) para leerlas.
- **Lógica genérica** en `NOCHE/js/app.js` (novedad frente al TARDE hardcodeado):
  - `collectFormData()` recorre el DOM y guarda `data.campos = { clave: valor }`,
  - `buildExcelRows()` genera las columnas del Excel dinámicamente,
  - `loadRecord()` restaura campos iterando `campos` sin conocer la estructura fija.
- Persistencia aislada: `edar_noche_data` / `edar_noche_last_backup`.
- Prefijo de campos de Noches: **`n_`**.
- Enlace "← Volver al selector de turno" en TARDE y NOCHE.
- `TARDE/evolucion/paso9.md` documenta todo.

### Paso 8. Se elimina el desplegable "Turno" (sesión de trabajo, incluido en `3c34ba3`)

- El select "Turno" se quitó de los tres formularios: el turno se fija al entrar desde el portal.
- En los tres `index.html` quedó un `<input type="hidden" id="turno" value="Mañanas|Tardes|Noches">` (el JS sigue leyendo ese valor).
- En TARDE se hizo en la plantilla generadora `TARDE/tools/generar_index.ps1`.

---

## Fase 3 — Los tres checklists actuales (28/09/2026)

### Paso 9. Checklist de Mañanas (`MANANA/`)

- **Origen:** checklist en papel "TRATAMIENTO TERCARIO" (2 páginas) + "DESARENADORES" (2 páginas), turno MAÑANAS; fotos en `Img/manana/`.
- Estructura copiada de `NOCHE/` (no de TARDE): se eligió la **lógica genérica** porque la de TARDE tenía los ids hardcodeados en 6 funciones (~800 líneas a reescribir).
- Contenido: 7 pestañas, 29 tarjetas, 95 puntos — Tratamiento Terciario (bombeo A/B, caudalímetros, filtro de discos, UV, medidores, presión, tomamuestras) + Desarenadores A/B/C + Contenedor.
- Claves nuevas: `edar_manana_data` / `edar_manana_last_backup`; prefijo de campos **`m_`**.
- **Validación con Chrome headless:** 29 tarjetas con estado, 14 grupos SCADA, 81 grupos SI/NO, `validateScada()=true`, `collectFormData()=138 campos + 29 estados`, 7 pestañas OK, guardado/carga OK, 0 errores JS.
- Detalle: `MANANA/evolucion/paso1.md`.

### Paso 10. Reescritura completa de TARDE: Biológicos A–F (`3c34ba3`)

- **Motivo:** el checklist en papel de Tardes cambió: ya no es el de desarenadores (ese está en Mañanas), sino **"BIOLÓGICOS"**.
- Fotos nuevas de WhatsApp copiadas a `Img/tarde/` (5 páginas de Biológicos + 2 de General).
- Transcripción con **OCR local** (Windows.Media.Ocr desde PowerShell) sobre `Img/tarde/`, porque la lectura visual directa daba resultados poco fiables.
- Se borró la implementación anterior de desarenadores de TARDE y se regeneró todo:
  - `TARDE/js/app.js` y `TARDE/js/db.js` pasan a ser los mismos que MANANA/NOCHE (genéricos), con claves `edar_tarde_data` / `edar_tarde_last_backup`, prefijo **`t_`**, pestaña inicial `bioA` y literales `checklist_tardes_*`.
  - **Nuevo `TARDE/index.html` generado por `TARDE/tools/generar_index.ps1`**: 9 pestañas (Biológico A–F, General, Observaciones, Registros), 102 tarjetas con estado, 21 grupos SCADA, 216 grupos de radio, 360 campos; 6 electroválvulas por biológico (selección única `M`/`A` de estado SCADA, `A`/`C` de posición y fugas SI/NO); tomamuestras al final del Biológico F y hoja General completa.
- Portal actualizado: la tarjeta "Turno de Tardes" describe Biológicos A–F + General.
- **Validación headless:** `tabs=9`, `cardsConEstado=102`, `scadaGroups=21`, `campos=360`, `estados=102`, sin ids duplicados, validación SCADA correcta, `toggleEquipment` OK, persistencia OK.
- **Regenerar** (si cambia el papel): `powershell -NoProfile -ExecutionPolicy Bypass -File TARDE/tools/generar_index.ps1` (no editar `index.html` a mano).
- Detalle: `TARDE/evolucion/paso10.md`.

### Paso 11. Backups de ejemplo del 27/09 (`28ba994`)

- Se generaron `backups/backup_2026-09-27_{manana,tarde,noche}.json` (array con 1 registro por turno, turno correcto, operarios, 204/518/346 campos) para poder probar la importación y tener datos de arranque.
- Formato: **array de registros** (igual que el backup automático que descarga la app), UTF-8, fecha `2026-09-27`.
- **Validación:** importarlos con Chrome headless en los 3 turnos → cargan en la fecha de hoy con `cargaOK=true`.

---

## Fase 4 — Publicación y datos compartidos (29/09/2026)

### Paso 12. Netlify: Blobs + Functions, datos compartidos entre tablets (`d02ca6f`)

**Motivo:** cada dispositivo guardaba en su propio navegador (localStorage) y el jefe no veía los datos desde otro equipo.

- **Servidor nuevo:**
  - `netlify/functions/api-datos.mjs` → endpoint `GET/POST /api/datos?turno=manana|tarde|noche`; guarda/lee los registros en **Netlify Blobs** (tienda `checklists-edar`, clave `{turno}/registros.json`); upsert por `id` (gana el `timestamp` más reciente), ordena por fecha.
  - `netlify.toml` (publica la raíz, empaqueta las functions), `package.json` (dependencia `@netlify/blobs`), `.gitignore` (`node_modules/`, `.netlify/`).
- **Sincronización en los 3 `js/app.js`:**
  - `TURNO_SYNC` (`manana|tarde|noche`).
  - `mergeListas(a,b)`: mezcla local+remoto por `id`, gana el más reciente.
  - `sincronizarDesdeServidor(cb)`: al abrir, descarga los registros del turno y los guarda también en local (la app sigue funcionando sin conexión). No-op con `file://`.
  - `subirRegistro(reg, cb)`: `POST` al guardar.
  - `confirmSave()` ahora sube el registro y avisa *"…sincronizados con el servidor"* o *"…sin sincronizar con el servidor"*.
  - El arranque (`DOMContentLoaded`) envuelve draft/prompt dentro de `sincronizarDesdeServidor()`.
- **Pregunta al cambiar de día:** `preguntarCargaAnterior(fechaDestino)` — *"Hay datos guardados del X. ¿Cargarlos como base del Y?"*; `autoLoadPreviousDay(fechaObjetivo)` ya no sobreescribe la fecha elegida (se corrigió el bug "no me deja poner el 29").
- **Borrador autoguardado (por tablet):**
  - `DRAFT_KEY` (`edar_*_draft`), `formDirty`, `scheduleDraftSave()` (debounce 800 ms en `input`/`change`), `saveDraft()` (solo si hay contenido), `borrarDraft()` (al guardar/cargar/limpiar), `recuperarDraft()` (pregunta *"Se encontraron datos sin guardar del X. ¿Recuperarlos?"*), `applyDataToForm(r, fechaDestino)` (restauración reutilizable) y `beforeunload`.
- Credenciales de la pestaña Registros: `admin` / `edar2026`.
- READMEs actualizados (uso, `backups/`, borrador, alcance navegador/PC, credenciales).
- **Validaciones:** pruebas headless de borrador (2 sesiones), prompt de día, y prueba end-to-end contra un servidor local que imita la API (tablet vacía → descarga → pregunta → carga en la fecha elegida → sube registro → servidor con 2 registros).

### Paso 13. Portal: los 3 turnos en una sola fila (`da87432`)

- `EDAR/index.html`: `.cards` pasó de `repeat(auto-fit, minmax(240px,1fr))` (rompía en 2+1 o apilaba) a **`repeat(3, 1fr)`** siempre; contenedor ampliado a 1100 px y tipografía reducida bajo 820 px.
- **Validado** con Chrome headless a 1280/1024/768/504 px → las 3 tarjetas con el mismo `top` en todos (`filaUnica:true`).

### Paso 14. Consola de administración (`660976c`)

- Nuevo **`admin.html`** + botón **🔒 Consola Admin** en el portal:
  - Acceso con `admin` / `edar2026` (misma credencial que la pestaña Registros).
  - Descarga de golpe los 3 turnos (`GET /api/datos?turno=…`) y los mezcla en una sola vista; botón **⟳ Actualizar**.
  - Tabla resumen (Fecha, Turno, Operarios, Observaciones, nº campos) y **detalle al pulsar una fila** (todos los campos + estados SCADA).
  - Filtros: fecha desde/hasta, turno, texto libre; chips con recuento por turno.
  - **⬇ Excel (3 turnos)**: un `.xlsx` con hoja **Todos** + hojas **Mañanas / Tardes / Noches**; también Excel de un solo registro desde el detalle.
  - Modo local (`file://`) con aviso, si no hay servidor.
- **Validado** con headless en los dos modos: login correcto/incorrecto, 3 registros, detalle (394 campos), filtros y libro de 4 hojas (`ok:true`).
- Docs: sección "Consola de administración" en el `README.md` raíz.

### Paso 15. Esta documentación (29/09/2026)

- Se crea la carpeta `documentacion/` con:
  - **`pasos.md`** — este archivo: historial completo paso a paso.
  - **`funciones.md`** — qué hace cada función de JavaScript (app.js, db.js, admin.html, function de Netlify y el generador de TARDE).

---

## Apéndice A — Claves de almacenamiento

| Clave | Contenido |
|---|---|
| `edar_manana_data` / `edar_tarde_data` / `edar_noche_data` | Registros guardados de cada turno (array JSON) |
| `edar_manana_last_backup` / `…_tarde…` / `…_noche…` | ISO de la última fecha de guardado (indicador "Último guardado") |
| `edar_manana_draft` / `edar_tarde_draft` / `edar_noche_draft` | Borrador sin guardar (autoguardado por tablet) |
| `edar_checklist_data` | Clave **antigua** de Tardes (datos pre-Biológicos, aún en el navegador) |
| Blobs `checklists-edar` → `manana/registros.json` (etc.) | Copia en servidor compartida entre dispositivos |

## Apéndice B — Cómo se validan los cambios

- **Chrome headless:** `chrome --headless --disable-gpu --user-data-dir=… --virtual-time-budget=… --dump-dom file:///…` sobre un HTML de prueba temporal (inyectado con `localStorage` sembrado), leyendo el `<pre>` de resultado con reintento (`FileShare.ReadWrite`).
- Con servidor simulado: se levanta un PowerShell `HttpListener` que sirve los estáticos y una API `/api/datos` en memoria para probar la sincronización (`http://localhost:8787/`).
- PowerShell no captura stdout de Chrome → redirigir con `cmd /c "… > salida.html 2>nul"` y leer el archivo con reintento hasta encontrar la marca esperada.
- OCR de las fotos de papel: `Windows.Media.Ocr` en PowerShell (sin dependencias externas).

## Apéndice C — Comandos útiles

```powershell
# Regenerar TARDE/index.html si cambia la plantilla en papel
powershell -NoProfile -ExecutionPolicy Bypass -File TARDE/tools/generar_index.ps1

# Publicar: git add … && git commit && git push → Netlify despliega solo (netlify.toml)
```
