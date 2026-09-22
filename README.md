# EDAR Gijón Este — Checklist Digital de Mantenimiento Preventivo

**Grupo Tragsa**

Aplicación web local para la recogida digital de datos de mantenimiento preventivo de la EDAR Gijón Este. Sin servidor, sin base de datos externa y sin necesidad de internet.

## Estructura

```
EDAR/
├── index.html              # Portal selector de turno
├── README.md               # Este archivo
├── Img/                    # Imágenes de referencia (logo, fotos checklist papel)
│   └── noche/              # Fotos del checklist de Noches (6 páginas)
├── TARDE/                  # Turno de Tardes — Desarenadores A, B, C
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js, db.js, vendor/xlsx.full.min.js
│   ├── img/logo_cabecera.png
│   ├── db/seed_prueba.json
│   ├── evolucion/paso1-9.md
│   └── README.md
└── NOCHE/                  # Turno de Noches — Checklist GENERAL
    ├── index.html
    ├── css/styles.css
    ├── js/app.js, db.js, vendor/xlsx.full.min.js
    ├── img/logo_cabecera.png
    ├── db/seed_prueba.json
    ├── evolucion/paso1.md
    └── (README pendiente)
```

## Uso

1. Abrir `EDAR/index.html` en el navegador (Chrome, Firefox o Edge)
2. Elegir turno:
   - **Tardes** → Desarenadores A/B/C (compuertas, puentes, bombas, aireadores, contenedor). Ver `TARDE/README.md`.
   - **Noches** → Checklist GENERAL (caudalímetros, clasificador, separador, pozos de bombeo, servicios auxiliares, fangos, etc.)
3. Dentro de cada checklist: rellenar fecha/turno/operarios → pestañas → **Guardar Local** (con revisión) → **Exportar Excel/JSON**

## Turnos

| Carpeta | Checklists | Puntos de control | Almacenamiento |
|---------|------------|-------------------|----------------|
| `TARDE/` | Desarenadores A, B, C + Contenedor | ~130 columnas Excel | `edar_checklist_data` |
| `NOCHE/` | General + Bombeo complementario + Servicios auxiliares + Fangos | ~130 puntos | `edar_noche_data` |

Los datos de cada turno están aislados (claves distintas en localStorage).

## Tecnologías

- HTML5 + CSS3 (variables, Grid, Flexbox)
- JavaScript vanilla (sin frameworks)
- SheetJS (`xlsx.full.min.js` local, 882 KB) para Excel offline
- localStorage para persistencia (`file://` compatible)

## Notas

- El portal `EDAR/index.html` es estático, sin lógica ni almacenamiento
- Cada turno tiene su propio histórico en `evolucion/` y su propio `db/seed_prueba.json`
- Ver `TARDE/evolucion/paso9.md` para el detalle de la arquitectura multi-turno y la transcripción del checklist de Noches

## Pendiente

- [ ] Validar códigos exactos del checklist de Noches con operario (algunos borrosos)
- [ ] Seed específico para NOCHE con datos reales
- [ ] README de NOCHE y revisión del README de TARDE
