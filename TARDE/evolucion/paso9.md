# Paso 9 - Arquitectura multi-turno: portal + carpetas TARDE y NOCHE

**Fecha:** Día 8-9
**Objetivo:** Integrar el checklist del turno de Noches y separar por carpetas con un portal principal

## Problema detectado

El checklist de Tardes (desarenadores A/B/C) no cubre el turno de Noches. El turno de Noches tiene un checklist GENERAL mucho más amplio (General + Servicios Auxiliares + Fangos) con 45+ equipos. Se necesitaba:
- Que al seleccionar "Noches" aparezca el checklist de Noches, no el de Tardes
- Estructura con carpeta TARDE y carpeta NOCHE independientes
- Un `index.html` principal fuera de las carpetas como portal selector de turno

## Qué se hizo

### Estructura de carpetas

**Antes:**
```
EDAR/
└── TARDE/
    ├── index.html
    ├── css/styles.css
    ├── js/app.js, db.js, vendor/
    ├── img/logo_cabecera.png
    ├── db/seed_prueba.json
    └── evolucion/paso1-8.md
```

**Ahora:**
```
EDAR/
├── index.html                  # Portal selector de turno (nuevo)
├── README.md                   # Documentación global (pendiente)
├── TARDE/
│   ├── index.html              # Checklist desarenadores (existente, + enlace al portal)
│   ├── css/styles.css
│   ├── js/app.js (v8), db.js (clave: edar_checklist_data)
│   ├── img/logo_cabecera.png
│   ├── db/seed_prueba.json
│   └── evolucion/paso1-9.md
└── NOCHE/
    ├── index.html              # Checklist Noches GENERAL (nuevo, ~140KB, 6 tabs)
    ├── css/styles.css          # Copia de TARDE
    ├── js/app.js               # Lógica genérica (campos dinámicos, clave: edar_noche_data)
    ├── js/db.js                # Copia adaptada (clave: edar_noche_data)
    ├── js/vendor/xlsx.full.min.js
    ├── img/logo_cabecera.png
    ├── db/seed_prueba.json
    └── evolucion/              # Vacío por ahora
```

### Portal principal `EDAR/index.html`

- Dos tarjetas grandes: "Turno de Tardes" (☀️) → `TARDE/index.html` y "Turno de Noches" (🌙) → `NOCHE/index.html`
- Header con logo Tragsa, footer, responsive (grid 2→1 columna en móvil)
- Sin lógica JS, solo navegación estática

### Checklist de Noches `NOCHE/index.html`

Transcrito de 6 imágenes (`Img/noche/13782-13787.jpg`), mejoradas con Pillow (upscale 3x + contraste). Contenido:

**Tab General:**
- Caudalímetro de entrada (4EL_FIT001) — 1 punto
- Clasificador de arenas (422_SD001) — 5 puntos (SCADA RLM A + horas, SI/NO, nivel)
- Separador de grasas (423_TD001) — 5 puntos
- Pozo bombeo desagüe grasas y arenas — 5 puntos
- Pozo bombeo de grasas 413A_PO002 — 6 puntos
- Pozo bombeo de grasas 413B_PO002 — 4 puntos
- Pozo vaciado desarenadores 321A_PO001A/B — 10 puntos

**Tab Bombeo Complementario:**
- Pozo vaciado 323A_PO001C — 4 puntos
- Pozos bombeo complementario 582A/B/C_PO001 — 12 puntos
- Sensor nivel 582_LIT001 — 3 puntos
- Caudalímetro salida 534_FIT0300 — 1 punto

**Tab Servicios Auxiliares:**
- Grupo presión agua servicios 702A_PO002 — 4 puntos
- Compresores aire 812A/B_CP001 — 10 puntos
- Compresores anti-incendio 444A/B — 8 puntos
- 8 ventiladores (711_CV001A, 711_CV002A, 311_CV001, 721_CV001, 731_CV001, 721_CV003, 711_CV002, 721_CV002) — 24 puntos
- Sistemas desodorización LIRAM/BPAR — 10 puntos
- Montacargas M1 — 3 puntos

**Tab Fangos:**
- Detector nivel fangos 344B_LT001 — 1 punto
- Sistema extracción flotantes 344B_PU001 — 3 puntos
- 5 válvulas PIC purga fangos (344A_V_0041-48) — 15 puntos
- Bomba flotantes 344A_PO002 — 6 puntos
- Impulsión de fangos 344A/B/C_PO001 — 15 puntos
- 4 válvulas motorizadas compuerta 444A_VM00x — 8 puntos
- Tamiz/tornillos sinfín salida/entrada — 9 puntos

**Tabs comunes:** Observaciones (textarea) + Registros Guardados (login admin) + modal revisión + barra acciones (Guardar/JSON/Excel)

Total estimado: **~130 puntos de control** (similar a Tardes con 130+ columnas)

### Lógica `NOCHE/js/app.js`

Diferencia clave con TARDES: recolección **genérica** en lugar de hardcodeada:
- `collectFormData()` recorre todos los `input[name]`, `input[id]`, `.scada-group`, `.status-select` y construye `data.campos = { nombre_campo: valor }`
- `buildExcelRows()` genera headers dinámicos a partir de todas las claves de `campos`
- `loadRecord()` / `autoLoadPreviousDay()` restauran campos iterando `campos` sin conocer la estructura fija
- Mantiene validación SCADA (2 checkboxes), `toggleEquipment`, `filterOperario2`, `showReviewModal`, `adminLogin`, persistencia con `DB`

### Persistencia `NOCHE/js/db.js`

- Clave `edar_noche_data` (vs `edar_checklist_data` en TARDE)
- Clave backup `edar_noche_last_backup`
- Datos de Tardes y Noches no se mezclan

### Enlace de vuelta al portal

- Añadido en `TARDE/index.html`: `<a href="../index.html">← Volver al selector de turno</a>` bajo el header
- Ya existía en `NOCHE/index.html` desde su generación

## Archivos creados

- `EDAR/index.html` — Portal
- `EDAR/NOCHE/index.html` — Formulario Noches
- `EDAR/NOCHE/css/styles.css` — Copia
- `EDAR/NOCHE/js/app.js` — Lógica genérica
- `EDAR/NOCHE/js/db.js` — Adaptado
- `EDAR/NOCHE/js/vendor/xlsx.full.min.js` — Copia
- `EDAR/NOCHE/img/logo_cabecera.png` — Copia
- `EDAR/NOCHE/db/seed_prueba.json` — Copia inicial

## Archivos modificados

- `EDAR/TARDE/index.html` — Título "(Tardes)" + enlace al portal

## Notas técnicas

- Imágenes mejoradas con Pillow (resize 3x LANCZOS + contraste 1.4 + sharpness 2.0) para transcripción
- Nombres de campos normalizados: `n_clasificador_scada`, `n_pozo_grasas_a_func`, etc. (prefijo `n_` para Noches)
- Cada `card` tiene su propio `status-select` (Funcionando/Parado/Defecto/No funciona) que deshabilita sus campos
- Excel de Noches genera columnas dinámicas (no fijas como Tardes) porque el esquema es más variable
- El portal no tiene JS ni almacenamiento; solo navega a la carpeta correspondiente

## Pendiente

- [ ] Validar nombres exactos de equipos con el operario (algunos códigos borrosos: 4EL_FIT001, 322_SD001 vs 422, etc.)
- [ ] Crear `db/seed_prueba.json` específico para Noches con datos reales de un turno
- [ ] Escribir `NOCHE/README.md` y `EDAR/README.md` global
- [ ] Decidir si `NOCHE/evolucion/` replica historial o inicia desde paso1 propio
- [ ] Probar persistencia y export Excel en NOCHE con datos reales
