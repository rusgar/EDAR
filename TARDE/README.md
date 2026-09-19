# Checklist Digital de Mantenimiento Preventivo - Desarenadores

**EDAR Gijon Este - Grupo Tragsa**

Aplicacion web local para la recogida digital de datos de mantenimiento preventivo de los 3 desarenadores (A, B, C) de la Estacion Depuradora de Aguas Residuales de Gijon Este.

---

## Funcionalidades

### Formulario por secciones
- **Datos del turno:** Fecha, turno (Mananas/Tardes/Noches), operario 1 y operario 2 (desplegable con filtrado inteligente)
- **Desarenador A / B / C:** Cada uno con 5 secciones:
  - Compuerta de entrada (SCADA, limpieza, ruidos, arranques)
  - Puente (SCADA, horas, desplazamiento, rasquetas, anomalias, guias, finales de carrera, rozamientos, lonas)
  - Bomba de arenas (funcionamiento, ruidos/fugas)
  - Aireadores (SCADA, ruidos, horas por aireador A-E)
  - Compuerta de grasas (SCADA, limpieza, ruidos, electrovalvula)
- **Contenedor de arenas y grasas** (tubo agua, gavetas, cantidades)
- **Observaciones generales** del turno
- **Observaciones por campo** (48 inputs individuales por cada punto de inspeccion)

### Control de estado de equipos
Cada seccion tiene un selector de estado:
- Funcionando / Parado / Defecto electrico / No funciona
- Cuando el equipo NO esta funcionando, se deshabilitan y limpian automaticamente todos sus campos
- Validacion SCADA: cada grupo debe tener exactamente 2 opciones seleccionadas (R/L/M/A), saltada si el equipo no esta en funcionamiento

### Guardado y exportacion
- **Guardar Local:** Guarda en localStorage con revision previa y deteccion de anomalias
- **Exportar JSON:** Descarga un archivo `.json` con todos los datos del formulario
- **Exportar Excel:** Genera un archivo `.xlsx` con 130+ columnas usando SheetJS (libreria incluida offline en `js/vendor/`)

### Revision antes de guardar
Al pulsar "Guardar Local" se muestra un modal con:
- Resumen completo de todos los datos del formulario
- **Deteccion automatica de anomalias** en horas y arranques comparando con el ultimo registro guardado
- Avisos en amarillo si una variacion supera el 50% respecto al registro anterior

### Registros guardados (solo administrador)
- Acceso restringido con login (usuario/contrasena)
- Tabla con fecha, turno, operarios y acciones (descargar JSON / cargar en formulario)
- Boton "Cargar" que rellena todo el formulario con los datos de un registro guardado

### Auto-carga al iniciar
Al abrir la pagina en horario de mananas (6:00 - 14:00), se cargan automaticamente del ultimo registro:
- Turno y operarios
- Horas de puentes y aireadores de los 3 desarenadores

---

## Estructura del proyecto

```
TARDE/
├── index.html              # Pagina principal del formulario
├── css/
│   └── styles.css          # Estilos completos de la aplicacion
├── js/
│   ├── db.js               # Capa de persistencia (IndexedDB + backup)
│   ├── app.js              # Logica de la aplicacion (~940 lineas)
│   └── vendor/
│       └── xlsx.full.min.js  # SheetJS para exportacion Excel (offline)
├── img/
│   └── logo_cabecera.png   # Logo de Grupo Tragsa
├── seed.html               # Generador de datos de prueba (10 registros)
└── README.md               # Este archivo
```

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estructura del formulario |
| CSS3 | Estilos con variables CSS, Grid, Flexbox |
| JavaScript vanilla | Toda la logica (sin frameworks) |
| SheetJS (xlsx) | Exportacion a Excel offline |
| IndexedDB | Almacenamiento persistente de registros |
| File System Access API | Backup automatico a archivo JSON en disco |

No requiere servidor ni base de datos externa.

---

## Credenciales de administrador

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contrasena | `edar2026` |

Definidas en `js/app.js` lineas 7-8.

---

## Pasos de desarrollo

### Fase 1 - Estructura base
- [x] Separar HTML monolitico en `index.html` + `css/styles.css` + `js/app.js`
- [x] Anadir logo de Grupo Tragsa en cabecera
- [x] Crear pestañas para Desarenador A/B/C y Contenedor

### Fase 2 - Formulario y validacion
- [x] Implementar todos los campos de inspeccion (SCADA, radios, inputs, obs)
- [x] Control de estado de equipos (funcionando/parado/defecto/no funciona)
- [x] Convertir SCADA de radio buttons a checkboxes con validacion (2 seleccionados)
- [x] Añadir inputs de observacion individuales por campo (48 en total)

### Fase 3 - Datos y exportacion
- [x] Guardado en localStorage con coleccion de registros
- [x] Exportacion a JSON
- [x] Exportacion a Excel con SheetJS local (882KB offline)
- [x] Mapeo completo de 130+ columnas en el Excel
- [x] Incluir estado de contenedor y observaciones de campo en Excel

### Fase 4 - Gestion de registros
- [x] Tabla de registros guardados con acciones
- [x] Boton "Cargar" para rellenar formulario desde un registro guardado
- [x] Desplegables de operarios con 5 nombres y filtrado cruzado
- [x] Mostrar ambos operarios en la tabla de registros

### Fase 5 - Seguridad y validacion avanzada
- [x] Login de administrador para acceder a registros guardados
- [x] Modal de revision antes de guardar con resumen de datos
- [x] Deteccion de anomalias en horas y arranques (>50% variacion)
- [x] Auto-carga de horas del dia anterior al iniciar en turno de mananas

### Fase 6 - Persistencia de datos
- [x] Migracion de localStorage a IndexedDB (mas robusto)
- [x] Auto-backup a archivo JSON tras cada guardado
- [x] Migracion automatica de datos antiguos de localStorage a IndexedDB
- [x] Indicador de ultimo backup visible en la barra de acciones
- [x] Mensaje de "No hay datos" con boton para importar backup
- [x] Funcion de importar backup desde archivo JSON

### Fase 7 - Pendiente
- [ ] Adaptar plantilla para turno de Mananas
- [ ] Comparar plantillas Mananas vs Tardes y unificar diferencias
- [ ] Posible modo edicion de registros existentes

---

## Uso

1. Abrir `index.html` en un navegador (Chrome, Firefox o Edge)
2. Rellenar la fecha, turno y operarios
3. Ir pestaña a pestaña rellenando los datos de cada desarenador y el contenedor
4. Pulsar **Guardar Local** - se mostrara un resumen con validacion antes de confirmar
5. Para exportar todos los registros a Excel: **Exportar Excel**
6. Para ver registros guardados (requiere login): pestana **Registros Guardados**

---

## Notas tecnicas

- Las horas deben ser enteros (campo number sin decimales)
- El SCADA requiere exactamente 2 selecciones de las 4 opciones (R, L, M, A)
- Las horas del puentede A y B incluyen campo "rasquetas"; el desarenador C no lo tiene
- SheetJS esta descargado localmente en `js/vendor/` para funcionar sin internet
- Los datos se almacenan en IndexedDB con nombre `EDAR_Checklist`
- Se migra automaticamente datos antiguos de localStorage si existen
- Cada guardado descarga automaticamente un backup `.json` en la carpeta de Descargas
- Si no hay datos al iniciar, se muestra un boton para importar un backup anterior
