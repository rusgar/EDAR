# Paso 4 - Gestion de registros y operarios

**Fecha:** Dia 3-4
**Objetivo:** Tabla de registros, carga de registros y gestion de operarios

## Que se hizo

- Tabla de registros guardados con acciones (descargar JSON / cargar en formulario)
- Boton "Cargar" que rellena todo el formulario con los datos de un registro guardado
- Desplegables de operarios con 5 nombres (Ana, Carlos, Edu, Luis, Sara)
- Filtrado cruzado de operarios (no se puede seleccionar el mismo en ambos)
- Mostrar ambos operarios en la tabla de registros

## Cambio de inputs a selects para operarios

Los operarios originalmente eran campos de texto libre. Se cambiaron a `<select>` con opciones predefinidas.

### Razon del cambio
- Consistencia: todos los operarios escriben el mismo nombre
- Facilita filtros y busquedas en el Excel
- Evita errores de ortografia

### Opciones disponibles
- Ana, Carlos, Edu, Luis, Sara

### Filtrado cruzado
Cuando se selecciona un operario en "Operario 1", ese mismo nombre se deshabilita en "Operario 2" para evitar duplicados.

## Funcion loadRecord()

Funcion que carga un registro guardado en el formulario completo:
- Cabecera (fecha, turno, operarios)
- Todos los campos de los 3 desarenadores
- Estados de los equipos (activa/desactiva campos segun estado)
- Checkboxes SCADA
- Observaciones por campo
- Datos del contenedor

### Precauciones implementadas
- Flag `loadingRecord` para evitar que el cambio de fecha interfiera durante la carga
- `try/catch` para detectar errores
- Confirmacion antes de cargar (pierde datos actuales del formulario)

## Archivos modificados

- `js/app.js` - Funciones `loadRecord()`, `filterOperario2()`, `loadSavedRecords()`
- `index.html` - Selects de operarios con `onchange="filterOperario2()"`
- `css/styles.css` - Estilos de la tabla de registros

## Notas tecnicas

- `switchTab()` se arreglo para aceptar parametro `btn` y funcionar programaticamente
- La tabla muestra fecha, turno, operario 1, operario 2 y acciones
- El boton "Cargar" genera un `confirm()` antes de sobreescribir el formulario
