# Checklist Digital de Mantenimiento Preventivo - Turno de Mañanas

**EDAR Gijón Este - Grupo Tragsa**

Aplicación web local para la recogida digital de datos de mantenimiento preventivo del turno de Mañanas: **Tratamiento Terciario** (bombeo, caudalímetros, filtro de discos, UV, medidores, tomamuestras) y **Desarenadores A, B y C** más el contenedor de arenas y grasas.

No requiere servidor, base de datos externa ni conexión a internet.

---

## Funcionalidades

### Formulario de inspección
- **Datos del turno:** Fecha, turno (Mañanas) y operario 1 / operario 2 (desplegable con filtrado cruzado)
- **7 pestañas:**
  1. **Tratamiento Terciario** — 13 equipos: bombeo 594A/594B_PO003, caudalímetros 524_FIT002/524_FIT001, filtro de discos 514_K001, desinfección UV 524_Q0001, turbidez 594_AIT001, pH 594_AIT002, sensor de nivel 594A_LIT001, grupo de presión 922A_PO002 y tomamuestras de entrada, salida y entrada a biofiltros
  2. **Desarenador A** — compuerta de entrada, puente, bomba de arenas, aireadores y compuerta de grasas (413A_*)
  3. **Desarenador B** — ídem (413B_*)
  4. **Desarenador C** — ídem (413C_*)
  5. **Contenedor** — tubo de drenaje, retirada de agua y vaciado de gavetas
  6. **Observaciones** generales del turno
  7. **Registros** guardados (acceso de administrador)
- **Observaciones por campo** en cada punto de inspección y campos numéricos (Q, P, Tu, pH, %, nº de horas, nº de arranques, nº de botella, cantidades extraídas)

### Control de estado de equipos
Cada equipo tiene un selector de estado (Funcionando / Parado / Defecto eléctrico / No funciona). Cuando el equipo NO está funcionando se deshabilitan y limpian automáticamente todos sus campos.

### Validación SCADA
Cada grupo SCADA debe tener exactamente 2 opciones seleccionadas de las 4 (R, L, M, A). La validación se salta si el equipo no está en funcionamiento.

### Guardado y exportación
- **Guardar Local:** guarda en el navegador con revisión previa y descarga de backup `.json`
- **Exportar JSON / Exportar Excel:** descarga directa de los registros (SheetJS incluido offline, ~140 columnas)

### Auto-carga al iniciar
Al abrir la página se recargan del último registro los datos del turno, operarios, estados de equipos y campos.

---

## Cómo usar

1. Abrir `EDAR/index.html` en el navegador y elegir **Turno de Mañanas**, o abrir directamente `MANANA/index.html`
2. Rellenar fecha, turno y operarios
3. Recorrer las pestañas rellenando los datos
4. Pulsar **Guardar Local** (muestra revisión antes de confirmar)
5. Para exportar todos los registros: **Exportar Excel** o **Exportar JSON**

---

## Credenciales de administrador

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `edar2026` |

---

## Estructura del proyecto

```
MANANA/
├── index.html                  # Formulario (7 pestañas, 29 tarjetas, 95 puntos)
├── css/styles.css              # Estilos de la aplicación
├── js/
│   ├── db.js                   # Capa de persistencia (localStorage)
│   ├── app.js                  # Lógica de la aplicación
│   └── vendor/
│       └── xlsx.full.min.js    # SheetJS para exportación Excel (offline)
├── img/logo_cabecera.png       # Logo de Grupo Tragsa
├── db/                         # Datos y backups (pendiente de seed propio)
└── evolucion/paso1.md          # Historial de cambios
```

Las fotos del checklist en papel están en `Img/manana/`.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura del formulario |
| CSS3 | Estilos con variables CSS, Grid, Flexbox |
| JavaScript vanilla | Toda la lógica (sin frameworks) |
| SheetJS (xlsx) | Exportación a Excel offline |
| localStorage | Almacenamiento persistente de registros |

---

## Notas técnicas

- Los datos se almacenan en localStorage con la clave **`edar_manana_data`** (TARDES: `edar_tarde_data`, NOCHES: `edar_noche_data`); el borrador sin guardar va en **`edar_manana_draft`**
- Prefijo de nombres de campo: **`m_`**
- Cada guardado descarga automáticamente un backup `.json`
- **Autoguardado de borrador:** cada cambio se guarda solo; al cerrar y reabrir la app pregunta *"Se encontraron datos sin guardar del día X. ¿Recuperarlos?"*. Al guardar, limpiar el formulario o importar un backup, el borrador se borra
- El almacenamiento es del **navegador y del PC** (no lo sincroniza OneDrive): usar siempre el mismo navegador
- Si no hay datos al iniciar, se muestra un botón para importar un backup anterior
- Base arquitectónica: `NOCHE/` (recolección genérica de campos sobre el DOM)

---

## Pendiente

- [ ] Añadir la foto de la página 1 de Tratamiento Terciario en `Img/manana/`
- [ ] Seed de datos de prueba con el esquema genérico `campos`
- [ ] Detección de anomalías en horas/arranques (portar `validateHours` de TARDE)
