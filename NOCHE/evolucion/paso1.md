# Paso 1 - Creación del checklist de Noches (GENERAL)

**Fecha:** Día 8-9
**Origen:** Checklist en papel "CHECKLIST MANTENIMIENTO PREVENTIVO - GENERAL / SERVICIOS AUXILIARES / FANGOS" (6 páginas, turno NOCHES)

## Qué se hizo

Se creó la carpeta `NOCHE/` como proyecto independiente dentro de `EDAR/`, con estructura copiada de `TARDE/` y formulario transcrito de las imágenes `Img/noche/13782-13787.jpg`.

## Estructura creada

```
NOCHE/
├── index.html              # Formulario completo (6 tabs, ~130 puntos)
├── css/styles.css          # Copia de TARDE
├── js/app.js               # Lógica genérica (campos dinámicos)
├── js/db.js                # Persistencia con clave edar_noche_data
├── js/vendor/xlsx.full.min.js
├── img/logo_cabecera.png
├── db/seed_prueba.json     # Copia inicial de TARDE
└── evolucion/paso1.md      # Este archivo
```

## Contenido del formulario

Ver `TARDE/evolucion/paso9.md` para el detalle completo de equipos y puntos de control (General, Bombeo Complementario, Servicios Auxiliares, Fangos).

## Lógica genérica vs TARDES

- TARDES: `collectFormData()` hardcodea `desarenador_A/B/C` con estructura fija
- NOCHES: `collectFormData()` recorre todo el DOM y guarda en `data.campos = { clave: valor }`, permitiendo añadir/quitar equipos sin tocar JS

## Claves de almacenamiento

- `edar_noche_data` / `edar_noche_last_backup` (aisladas de TARDES)

## Pendiente

- Validar códigos exactos con operario
- Crear seed específico de Noches
- Probar guardado y Excel con datos reales
