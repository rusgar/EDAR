# Paso 1 - Creación del checklist de Mañanas

**Fecha:** 28-09-2026
**Origen:** Checklist en papel "CHECKLIST MANTENIMIENTO PREVENTIVO - TRATAMIENTO TERCARIO" (2 páginas) y "CHECKLIST MANTENIMIENTO PREVENTIVO - DESARENADORES" (2 páginas), turno MAÑANAS, EDAR Gijón Este.

## Qué se hizo

Se creó la carpeta `MANANA/` como proyecto independiente dentro de `EDAR/`, con la estructura copiada de `NOCHE/` (no de `TARDE/`) y el formulario transcrito de las 4 imágenes del turno de mañana.

Motivo de partir de `NOCHE/`: su `collectFormData()` es genérico (recorre el DOM y guarda `data.campos = { clave: valor }`), mientras que `TARDE/js/app.js` tiene los ids del checklist hardcodeados en 6 funciones distintas (`collectFormData`, `buildExcelRows`, `loadRecord`, `showReviewModal`, `validateHours`, `autoLoadPreviousDay`), lo que obligaría a reescribir ~800 líneas.

## Estructura creada

```
MANANA/
├── index.html              # Formulario (7 tabs, 29 tarjetas, 95 puntos)
├── css/styles.css          # Copia byte a byte de NOCHE
├── js/app.js               # Lógica genérica de NOCHE + literales del turno
├── js/db.js                # Persistencia con clave edar_manana_data
├── js/vendor/xlsx.full.min.js
├── img/logo_cabecera.png
├── db/                     # Vacío (pendiente de seed propio)
└── evolucion/paso1.md      # Este archivo
```

Las fotos de origen se guardaron en `Img/manana/`.

## Transcripción del checklist

### Tab 1 - Tratamiento Terciario (13 tarjetas, 33 puntos)

| Equipo | Código | Puntos |
|---|---|---|
| Bombeo a tratamiento terciario | 594A_PO003 | 4 (SCADA + nº horas) |
| Bombeo a tratamiento terciario | 594B_PO003 | 4 (SCADA + nº horas) |
| Caudalímetro tubería entrada agua a terciario | 524_FIT002 | 1 (valor Q) |
| Filtro de discos | 514_K001 | 5 (incl. valor P manómetro) |
| Equipo de desinfección UV | 524_Q0001 | 2 |
| Medidor de turbidez colector salida agua UV | 594_AIT001 | 1 (valor Tu) |
| Medidor de pH colector salida agua UV | 594_AIT002 | 1 (valor pH) |
| Caudalímetro tubería salida agua a terciario | 524_FIT001 | 1 (valor Q) |
| Sensor de nivel depósito agua tratada | 594A_LIT001 | 1 (valor %) |
| Grupo de presión salida de terciario | 922A_PO002 | 4 (incl. valor P) |
| Tomamuestras entrada / salida / entrada biofiltros | — | 3 × 3 (con nº de botella) |

### Tab 2-4 - Desarenadores A, B y C (5 tarjetas cada uno)

- Compuerta de entrada (SCADA + nº arranques, limpieza, ruidos)
- Puente desarenador (SCADA + nº horas + 8 puntos; **A y B tienen 9 puntos**, C no incluye "Las rasquetas suben y bajan correctamente")
- Bomba de extracción de arenas (2 puntos)
- Aireadores Aeroflo (SCADA, ruidos y horas por aireador A-E)
- Compuerta de grasas (SCADA + nº arranques, limpieza, ruidos, electroválvula + nº arranques)

### Tab 5 - Contenedor (1 tarjeta, 3 puntos)

Tubo de drenaje, retirada de agua y vaciado de gavetas, con cantidades extraídas.
Nota del papel: "Al finalizar el turno las gavetas deben quedar vacías".

### Tab 6-7 - Observaciones y Registros

Idénticas a NOCHE (textarea de observaciones + login de administrador).

## Cambios respecto a NOCHE

| Archivo | Cambio |
|---|---|
| `js/db.js:2-3` | `edar_noche_data` → `edar_manana_data`, `edar_noche_last_backup` → `edar_manana_last_backup` |
| `js/app.js:164,202` | Nombres de descarga `checklist_noches_*` → `checklist_mananas_*` |
| `js/app.js:281` | `switchTab('general')` → `switchTab('terciario')` (primera pestaña) |
| `js/app.js:343` | Turno por defecto `'Noches'` → `'Mañanas'` |
| `index.html` | Títulos, turno `Mañanas` y transcripción completa del checklist |

Prefijo de nombres de campo: **`m_`** (NOCHE usa `n_`).

## Claves de almacenamiento

- `edar_manana_data` / `edar_manana_last_backup` (aisladas de TARDES y NOCHES)

## Diferencias detectadas con el checklist de Tardes

La plantilla de Desarenadores de Mañanas es prácticamente idéntica a la de `TARDE/` (mismos códigos y número de puntos), con estos matices de redacción del papel de Mañanas:

- "Inspección visual **del equipo** y limpieza correcto" (TARDE: "Inspección visual y limpieza correcta")
- "Control de ruidos **cuando esté en funcionamiento**" (TARDE: "Control de ruidos en funcionamiento")
- "BOMBA **DE** EXTRACCIÓN DE ARENAS" (TARDE: "BOMBA EXTRACCIÓN ARENAS")
- Desarenador A: fila 3 de compuertas con "(si procede)"; Desarenador B: idem en compuerta de entrada; Desarenador C: "(si procede)" solo en compuerta de grasas

## Validación realizada

Prueba funcional con Chrome headless sobre `MANANA/index.html`:

- 29 tarjetas con selector de estado, 14 grupos SCADA, 81 grupos SI/NO
- `validateScada()` → true, `collectFormData()` → 138 campos, 29 estados
- Las 7 pestañas cambian correctamente
- Guardado en `localStorage['edar_manana_data']` + backup, y auto-carga posterior con `turno = Mañanas`
- 0 errores de JavaScript

## Pendiente

- [ ] Guardar en `Img/manana/` la foto de la **página 1 de Tratamiento Terciario** (la de BOMBEO A TRATAMIENTO TERCARIO … GRUPO DE PRESIÓN): en Descargas solo están las páginas 2 y las de Desarenadores
- [ ] Validar códigos y grafías exactas con el operario (el papel dice "TRATAMIENTO TERCIOARIO" y "manometro"; se han corregido a "TERCIARIO" y "manómetro")
- [ ] Crear `db/seed_prueba.json` con el esquema genérico `campos` (no copiar el de TARDE, que usa otro esquema)
- [ ] Añadir detección de anomalías en horas/arranques (`validateHours` de TARDE), si se quiere el mismo control que en Tardes
