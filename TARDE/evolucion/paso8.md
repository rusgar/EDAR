# Paso 8 - Auto-carga completa del registro anterior

**Fecha:** Dia 7-8
**Objetivo:** Que el formulario se auto-rellene con los datos del dia anterior al abrir, sin accion manual del operario

## Problema detectado

Los operarios no saben usar usuario/contrasena y no deberian ir a "Registros Guardados" a cargar datos manualmente. El programa debe detectar automaticamente que ha pasado un dia y cargarse solo.

## Que se cambio

### `autoLoadPreviousDay()` - Reescrita completamente

**Antes:** Solo cargaba horas de puentes y aireadores (15 campos), y requeria confirmacion del usuario.

**Ahora:** Carga TODOS los campos del ultimo registro:
- Cabecera: turno, operario 1, operario 2, observaciones generales
- Desarenadores A/B/C completos:
  - Compuerta: estado, SCADA, limpieza, ruidos, arranques
  - Puente: estado, SCADA, horas, desplazamiento, rasquetas, anomalias, guias, finales de carrera, rozamientos, lonas
  - Bomba: estado, funcionamiento, ruidos/fugas
  - Aireadores: estado, SCADA, ruidos, horas A-E
  - Grasas: estado, SCADA, arranques, limpieza, ruidos, electrovalvula
- Contenedor: estado, tubo agua, retirar agua, cantidades, gavetas
- Observaciones por campo (48 inputs)

### Eliminacion de `loadPreviousHours()`

Funcion obsoleta que solo cargaba horas. Reemplazada por la nueva `autoLoadPreviousDay()` que carga todo.

### Handler de fecha (`change`)

**Antes:** Pedia confirmacion con `confirm('Dia anterior tiene registro...')` antes de cargar.

**Ahora:** Auto-carga silenciosamente sin preguntar. Si el usuario cambia la fecha a un dia posterior, se cargan los datos automaticamente.

### Fecha automatica

Al abrir la pagina, la fecha se pone automaticamente a hoy. Antes tambien lo hacia, pero ahora va ligado con la auto-carga completa.

## Flujo del usuario

```
1. Abre index.html
2. Fecha = hoy (automatico)
3. Se cargan todos los datos del ultimo registro (automatico, sin alertas)
4. Operario solo actualiza horas y lo que haya cambiado
5. Pulsa "Guardar Local"
6. Confirma en el modal
7. Listo
```

## Por que sin confirmacion

Los operarios de campo no tienen experiencia tecnica. Cualquier `confirm()` o `alert()` les confunde y les hace pensar que algo va mal. La auto-carga debe ser completamente transparente.

## Archivos modificados

- `js/app.js` - Funciones `autoLoadPreviousDay()` (reescrita), handler `fecha.change` (simplificado), eliminada `loadPreviousHours()`
- `index.html` - Version de script actualizada (`?v=8`)

## Notas tecnicas

- Se reutilizaron las funciones auxiliares de `loadRecord()`: `setRadio()`, `setCheckboxes()`, `setInput()`, `setObsInput()`, `findCard()`, `setSectionStatus()`
- El flag `loadingRecord` se usa para evitar que el handler de fecha interfiera durante la carga
- La fecha siempre se pone a hoy, NO a la del registro anterior (el operario registra para el dia actual)
