# EDAR Gijón Este — Checklist Digital de Mantenimiento Preventivo

**Grupo Tragsa**

Aplicación web local para la recogida digital de datos de mantenimiento preventivo de la EDAR Gijón Este. Sin servidor, sin base de datos externa y sin necesidad de internet.

## Estructura

```
EDAR/
├── index.html              # Portal selector de turno
├── README.md               # Este archivo
├── backups/                # Backups por día (JSON) para importar en cada checklist
│   └── backup_2026-09-27_{manana,tarde,noche}.json
├── Img/                    # Imágenes de referencia (logo, fotos checklist papel)
│   ├── noche/              # Fotos del checklist de Noches (6 páginas)
│   ├── manana/             # Fotos del checklist de Mañanas (4 páginas)
│   └── tarde/              # Fotos del checklist de Tardes (7 páginas: 5 Biológicos + 2 General)
├── MANANA/                 # Turno de Mañanas — Tratamiento Terciario + Desarenadores A/B/C
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js, db.js, vendor/xlsx.full.min.js
│   ├── img/logo_cabecera.png
│   ├── evolucion/paso1.md
│   └── README.md
├── TARDE/                  # Turno de Tardes — Biológicos A-F + General
│   ├── index.html          # Generado por tools/generar_index.ps1
│   ├── css/styles.css
│   ├── js/app.js, db.js, vendor/xlsx.full.min.js
│   ├── img/logo_cabecera.png
│   ├── tools/generar_index.ps1
│   ├── evolucion/paso1-10.md
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
   - **Mañanas** → Tratamiento Terciario (bombeo, caudalímetros, filtro de discos, UV, medidores, tomamuestras) + Desarenadores A/B/C + contenedor. Ver `MANANA/README.md`.
   - **Tardes** → Biológicos A-F (soplantes, medidores, electroválvulas, boyas, tomamuestras) + General (bombeo intermedio, lavado y recuperación). Ver `TARDE/README.md`.
   - **Noches** → Checklist GENERAL (caudalímetros, clasificador, separador, pozos de bombeo, servicios auxiliares, fangos, etc.)
3. Dentro de cada checklist: rellenar fecha/turno/operarios → pestañas → **Guardar Local** (con revisión) → **Exportar Excel/JSON**

El desplegable "Turno" ya no existe: el turno se fija al entrar desde el portal. Para cargar un día guardado, abrir el checklist con el navegador sin datos y pulsar **Importar backup** (enlace que aparece cuando no hay registros) eligiendo el JSON de `backups/`: los datos se cargan **en la fecha de hoy**. Al guardar un día y abrir la app al día siguiente (o al cambiar la fecha a un día posterior), **aparece un mensaje preguntando** si quieres cargar los datos del día anterior como base; al aceptar, los datos se cargan **con la fecha que tú hayas elegido** (no se sobreescribe con la de hoy).

## Turnos

| Carpeta | Checklists | Puntos de control | Almacenamiento |
|---------|------------|-------------------|----------------|
| `MANANA/` | Tratamiento Terciario (13 equipos + tomamuestras) + Desarenadores A/B/C + Contenedor | ~95 puntos | `edar_manana_data` |
| `TARDE/` | Biológicos A-F + Tomamuestras + General (bombeo, lavado, recuperación) | 102 tarjetas / 360 campos | `edar_tarde_data` |
| `NOCHE/` | General + Bombeo complementario + Servicios auxiliares + Fangos | ~130 puntos | `edar_noche_data` |

Los datos de cada turno están aislados (claves distintas en localStorage).

## Tecnologías

- HTML5 + CSS3 (variables, Grid, Flexbox)
- JavaScript vanilla (sin frameworks)
- SheetJS (`xlsx.full.min.js` local, 882 KB) para Excel offline
- localStorage para persistencia (`file://` compatible)

## Notas

- El portal `EDAR/index.html` es estático, sin lógica ni almacenamiento
- Los JSON de `backups/` se pueden crear con **Exportar JSON** de cada checklist y renombrarlos con la fecha (`backup_AAA-MM-DD_turno.json`); el formato es un array de registros, igual que el que genera el propio backup automático
- Cada turno tiene su propio histórico en `evolucion/` y sus datos aislados en localStorage
- `TARDE/index.html` se genera con `powershell -ExecutionPolicy Bypass -File TARDE/tools/generar_index.ps1` (si cambia la plantilla en papel, se regenera)
- Ver `TARDE/evolucion/paso9.md` para el detalle de la arquitectura multi-turno y `TARDE/evolucion/paso10.md` para el checklist de Biológicos

## Pendiente

- [ ] Validar códigos exactos del checklist de Noches con operario (algunos borrosos)
- [ ] Seed específico para NOCHE con datos reales (esquema genérico `campos`)
- [ ] README de NOCHE
- [ ] Verificar con el operario los códigos de boyas 612_LSL002 / 612_LSH003 y 921B_LSL001 (OCR del checklist de Tardes)
