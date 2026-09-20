# Checklist Digital de Mantenimiento Preventivo - Desarenadores

**EDAR Gijon Este - Grupo Tragsa**

Aplicacion web local para la recogida digital de datos de mantenimiento preventivo de los 3 desarenadores (A, B, C) de la Estacion Depuradora de Aguas Residuales de Gijon Este.

---

## Que es esta aplicacion

Herramienta interna para el personal de mantenimiento de la EDAR Gijon Este que sustituye los formularios en papel por un checklist digital. Permite registrar, guardar, consultar y exportar los datos de inspeccion de los desarenadores A, B y C.

No requiere servidor, base de datos externa ni conexion a internet.

---

## Funcionalidades

### Formulario de inspeccion
- **Datos del turno:** Fecha, turno (Mananas/Tardes/Noches), operario 1 y operario 2 (desplegable con filtrado cruzado)
- **3 Desarenadores (A/B/C):** Cada uno con 5 secciones de inspeccion:
  - Compuerta de entrada (SCADA, limpieza, ruidos, arranques)
  - Puente (SCADA, horas, desplazamiento, rasquetas, anomalias, guias, finales de carrera, rozamientos, lonas)
  - Bomba de arenas (funcionamiento, ruidos/fugas)
  - Aireadores (SCADA, ruidos, horas por aireador A-E)
  - Compuerta de grasas (SCADA, limpieza, ruidos, electrovalvula)
- **Contenedor de arenas y grasas** (tubo agua, gavetas, cantidades)
- **Observaciones generales** del turno
- **Observaciones por campo** (48 inputs individuales por cada punto de inspeccion)

### Control de estado de equipos
Cada seccion tiene un selector de estado (Funcionando / Parado / Defecto electrico / No funciona). Cuando el equipo NO esta funcionando, se deshabilitan y limpian automaticamente todos sus campos.

### Validacion SCADA
Cada grupo SCADA debe tener exactamente 2 opciones seleccionadas de las 4 disponibles (R, L, M, A). La validacion se salta si el equipo no esta en funcionamiento.

### Guardado y exportacion
- **Guardar Local:** Guarda en el navegador con revision previa y deteccion de anomalias
- **Exportar JSON:** Descarga un archivo `.json` con todos los datos del formulario
- **Exportar Excel:** Genera un archivo `.xlsx` con 130+ columnas (SheetJS incluido offline)

### Revision antes de guardar
Modal con resumen completo de datos y deteccion automatica de anomalias en horas y arranques (variaciones superiores al 50% respecto al registro anterior).

### Registros guardados (solo administrador)
Acceso restringido con login. Tabla con fecha, turno, operarios y acciones (descargar JSON / cargar en formulario).

### Auto-carga al iniciar
Al abrir la pagina, se cargan automaticamente del ultimo registro guardado las horas de puentes y aireadores de los 3 desarenadores.

---

## Como usar

1. Abrir `index.html` en un navegador (Chrome, Firefox o Edge)
2. Rellenar la fecha, turno y operarios
3. Ir pestana a pestana rellenando los datos de cada desarenador y el contenedor
4. Pulsar **Guardar Local** - se mostrara un resumen con validacion antes de confirmar
5. Para exportar todos los registros a Excel: **Exportar Excel**
6. Para ver registros guardados (requiere login): pestana **Registros Guardados**

---

## Credenciales de administrador

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contrasena | `edar2026` |

---

## Estructura del proyecto

```
TARDE/
├── index.html                  # Pagina principal del formulario
├── css/
│   └── styles.css              # Estilos de la aplicacion
├── js/
│   ├── db.js                   # Capa de persistencia (localStorage)
│   ├── app.js                  # Logica de la aplicacion
│   └── vendor/
│       └── xlsx.full.min.js    # SheetJS para exportacion Excel (offline)
├── img/
│   └── logo_cabecera.png       # Logo de Grupo Tragsa
├── db/                         # Datos y backups
│   └── seed_prueba.json        # Datos de prueba para testing
├── evolucion/                  # Historial de cambios dia a dia
│   ├── paso1.md
│   ├── paso2.md
│   └── ...
├── seed.html                   # Generador de datos de prueba
└── README.md                   # Este archivo
```

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estructura del formulario |
| CSS3 | Estilos con variables CSS, Grid, Flexbox |
| JavaScript vanilla | Toda la logica (sin frameworks) |
| SheetJS (xlsx) | Exportacion a Excel offline |
| localStorage | Almacenamiento persistente de registros |

---

## Notas tecnicas

- Las horas deben ser enteros (campo number sin decimales)
- El SCADA requiere exactamente 2 selecciones de las 4 opciones (R, L, M, A)
- SheetJS esta descargado localmente en `js/vendor/` para funcionar sin internet
- Los datos se almacenan en localStorage con la clave `edar_checklist_data`
- Cada guardado puede descargar automaticamente un backup `.json`
- Si no hay datos al iniciar, se muestra un boton para importar un backup anterior
- El generador de datos de prueba (`seed.html`) crea 10 registros secuenciales

---

## Pendiente

- [ ] Adaptar plantilla para turno de Mananas
- [ ] Comparar plantillas Mananas vs Tardes y unificar diferencias
- [ ] Posible modo edicion de registros existentes
