# Paso 2 - Formulario y validacion SCADA

**Fecha:** Dia 1-2
**Objetivo:** Implementar todos los campos de inspeccion y validacion

## Que se hizo

- Se implementaron todos los campos de inspeccion para los 3 desarenadores:
  - Compuerta de entrada (SCADA, limpieza, ruidos, arranques)
  - Puente (SCADA, horas, desplazamiento, rasquetas, anomalias, guias, finales de carrera, rozamientos, lonas)
  - Bomba de arenas (funcionamiento, ruidos/fugas)
  - Aireadores (SCADA, ruidos, horas por aireador A-E)
  - Compuerta de grasas (SCADA, limpieza, ruidos, electrovalvula)
- Se implemento el contenedor de arenas y grasas
- Se anadieron 48 inputs de observaciones individuales por campo

## Cambio de SCADA: Radio a Checkboxes

El SCADA original usaba radio buttons (solo 1 seleccion). Se cambio a checkboxes con validacion de exactamente 2 selecciones.

### Razon del cambio
En el sistema SCADA real, los equipos pueden tener multiples estados simultaneos (R+L, M+A, etc.). Radio buttons no permitian esto.

### Validacion
- Cada grupo SCADA debe tener exactamente 2 opciones seleccionadas (R, L, M, A)
- Si el equipo NO esta en funcionamiento, la validacion se salta
- Se anadio feedback visual (borde rojo) cuando no hay 2 seleccionados

## Control de estado de equipos

Se implemento un selector de estado en cada seccion:
- Funcionando / Parado / Defecto electrico / No funciona
- Cuando el equipo NO esta funcionando, se deshabilitan y limpian automaticamente todos sus campos
- Esto evita errores de relleno cuando un equipo esta fuera de servicio

## Archivos modificados

- `index.html` - Todos los campos del formulario
- `js/app.js` - Funciones `toggleEquipment()`, `getScadaVal()`, `validateScada()`
- `css/styles.css` - Estilos de SCADA group, equipment status

## Notas tecnicas

- El SCADA requiere exactamente 2 selecciones de 4 opciones (R, L, M, A)
- Las horas son campos number sin decimales
- Cada equipo tiene su propio selector de estado independiente
