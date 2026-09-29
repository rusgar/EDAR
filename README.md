# EDAR Gijón Este — Checklist Digital de Mantenimiento Preventivo

**Grupo Tragsa**

Aplicación web local para la recogida digital de datos de mantenimiento preventivo de la EDAR Gijón Este. Sin servidor, sin base de datos externa y sin necesidad de internet. **Opcional:** se puede publicar en Netlify para que varias tablets compartan los mismos datos (ver [Despliegue en Netlify](#despliegue-en-netlify-varias-tablets)).

## Estructura

```
EDAR/
├── index.html              # Portal selector de turno
├── admin.html              # Consola de administración (los 3 turnos, con contraseña)
├── README.md               # Este archivo
├── backups/                # Backups por día (JSON) para importar en cada checklist
│   └── backup_2026-09-27_{manana,tarde,noche}.json
├── netlify.toml            # Configuración de despliegue (publica la raíz)
├── netlify/functions/
│   └── api-datos.mjs       # API GET/POST /api/datos?turno=… (Netlify Blobs)
├── package.json            # Dependencia @netlify/blobs
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

Además, cualquier cambio del formulario se **guarda solo como borrador** al cerrar la app; al reabrir pregunta *"Se encontraron datos sin guardar del día X. ¿Recuperarlos?"* (y se borra automáticamente al pulsar Guardar). Ojo: ese almacenamiento vive en el **navegador y el PC** con el que se trabaje (OneDrive no lo sincroniza), así que hay que usar siempre el mismo navegador.

## Turnos

| Carpeta | Checklists | Puntos de control | Almacenamiento |
|---------|------------|-------------------|----------------|
| `MANANA/` | Tratamiento Terciario (13 equipos + tomamuestras) + Desarenadores A/B/C + Contenedor | ~95 puntos | `edar_manana_data` |
| `TARDE/` | Biológicos A-F + Tomamuestras + General (bombeo, lavado, recuperación) | 102 tarjetas / 360 campos | `edar_tarde_data` |
| `NOCHE/` | General + Bombeo complementario + Servicios auxiliares + Fangos | ~130 puntos | `edar_noche_data` |

Los datos de cada turno están aislados (claves distintas en localStorage).

## Despliegue en Netlify (varias tablets)

Para que varios trabajadores compartan los mismos datos desde sus tablets, el repo incluye una función serverless que guarda los registros en **Netlify Blobs** (`netlify/functions/api-datos.mjs`, endpoint `GET/POST /api/datos?turno=manana|tarde|noche`).

**Cómo funciona**

- Al abrir la app descarga los registros del turno desde el servidor y los mezcla con los locales (también se guardan en el navegador, así la app sigue funcionando sin conexión).
- Al pulsar **Guardar Local** el registro se sube al servidor: aviso *"…sincronizados con el servidor"* o *"…sin sincronizar con el servidor"* si no hay red.
- El **borrador** sigue siendo local de cada tablet; el **Excel/JSON** de descarga sigue funcionando igual.
- Abriendo los archivos con `file://` (uso local) no hay servidor: la app se comporta igual que siempre, solo local.

**Pasos para publicar**

1. Subir el repo a GitHub (ya está: `github.com/rusgar/EDAR`).
2. En [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → elegir el repo.
3. Netlify detecta `netlify.toml` (instala dependencias, empaqueta la function y publica la raíz) → **Deploy**.
4. La URL pública (`https://<sitio>.netlify.app`) es la que se abra en las tablets; usar siempre el mismo navegador en cada tablet.

**Notas**

- Los datos viven en Netlify Blobs (tienda `checklists-edar`), no en el repo; respaldo manual con **Exportar Excel/JSON**.
- La API no tiene contraseña: cualquiera con la URL puede leer/escribir. Para uso interno basta; si queréis, se añade un token.

## Consola de administración (`admin.html`)

Para que el admin/jefe vea **los 3 turnos desde cualquier equipo** sin abrir cada checklist: botón **🔒 Consola Admin** en el portal → `admin.html` (credenciales `admin` / `edar2026`, misma que la pestaña Registros).

- **Datos:** consulta `GET /api/datos?turno=manana|tarde|noche` (Netlify Blobs) y los mezcla en una sola vista; botón **⟳ Actualizar** para refrescar. Si se abre con `file://` (sin publicar) muestra un aviso y solo los registros de ese equipo.
- **Vista:** tabla resumen (Fecha, Turno, Operarios, Observaciones, nº de campos) + **detalle al pulsar una fila** (todos los campos y estados SCADA de ese registro).
- **Filtros:** fecha desde/hasta, turno, texto libre (operario u observación); chips con el recuento por turno.
- **Excel:** botón **⬇ Excel (3 turnos)** descarga un único `.xlsx` con hoja **Todos** (todo mezclado, con columna Turno) + hojas **Mañanas**, **Tardes** y **Noches**. Desde el detalle también se puede exportar el Excel de un solo registro.

## Tecnologías

- HTML5 + CSS3 (variables, Grid, Flexbox)
- JavaScript vanilla (sin frameworks)
- SheetJS (`xlsx.full.min.js` local, 882 KB) para Excel offline
- localStorage para persistencia (`file://` compatible)
- Netlify Functions + Netlify Blobs (opcional): `GET/POST /api/datos` para compartir datos entre tablets

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
