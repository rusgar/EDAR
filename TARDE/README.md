# Checklist Digital de Mantenimiento Preventivo — Biológicos (Turno de Tardes)

**EDAR Gijón Este — Grupo Tragsa**

Aplicación web local para la recogida digital del checklist en papel **"CHECKLIST MANTENIMIENTO PREVENTIVO — BIOLÓGICOS"** (turno TARDES) de la Estación Depuradora de Aguas Residuales de Gijón Este. Sustituye los formularios en papel por un checklist digital. No requiere servidor, base de datos externa ni conexión a internet.

> El checklist de Tardes **cambió**: antes contenía los desarenadores (ahora están en `../MANANA/`) y ahora es el de **Biológicos A-F + General Biológicos**. Ver `evolucion/paso10.md`.

---

## Contenido del checklist

### Pestañas

| Pestaña | Contenido |
|---------|-----------|
| Biológico A … F | Por cada biológico (A-F): soplante de proceso (`712X_CS001`), medidor de temperatura (`712X_TI002`), 6 electroválvulas (`492X_VA001-VA006`), medidor de presión (`492X_PIT001`), 2 boyas (`492X_LSHH002/003`) y reja de entrada |
| Biológico F (final) | + Tomamuestras de entrada, salida y entrada a biofiltro |
| General | Hoja "GENERAL BIOLÓGICOS": bombeo intermedio `581A/B/C`, boyas/sensor/caudalímetro 581, boya `492_LSHH001`, bombas de lavado `594A/B/C`, depósito 594, soplines `713A/B/C`, medidor `713_TI002`, recuperación de agua sucia `612A/B/C`, caudalímetros `612A/B_FIT001`, bomba de oxazur `594_PO002`, bombeo de vaciados `921B_PO001A/B` y sus boyas |
| Observaciones | Observaciones generales del turno (y firmas en el registro) |
| Registros | Acceso de administrador para ver, cargar y exportar registros |

Totales: **9 pestañas, 102 tarjetas de equipo, 21 grupos SCADA, 216 grupos de radio, 360 campos**.

### Control de estado de equipos
Cada tarjeta tiene un selector de estado (Funcionando / Parado / Defecto eléctrico / No funciona). Cuando el equipo no está funcionando se deshabilitan y limpian sus campos.

### Validación SCADA
Los grupos SCADA de tipo `R, L, M, A` (soplantes y bombas) exigen **exactamente 2 opciones** marcadas; se salta la validación si el equipo no está funcionando. Las electroválvulas usan selección única (`M`/`A` en SCADA y `A`/`C` en posición) porque son dos estados excluyentes.

### Guardado y exportación
- **Guardar Local:** revisión previa en modal y guardado en el navegador + descarga de backup `.json`
- **Exportar JSON / Exportar Excel:** SheetJS incluido en `js/vendor/` (funciona sin internet)
- **Registros:** login de administrador, carga de registros y exportación
- **Auto-carga:** al abrir, toma la fecha y los datos del último registro guardado

---

## Cómo usar

1. Abrir `index.html` en un navegador (Chrome, Firefox o Edge)
2. Rellenar fecha, turno (Tardes) y operarios
3. Recorrer las pestañas Biológico A → F → General
4. **Guardar Local** (muestra el resumen antes de confirmar)
5. **Exportar Excel** o **Exportar JSON** para sacar los datos

## Credenciales de administrador

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `edar2026` |

---

## Estructura

```
TARDE/
├── index.html                  # Formulario (generado por tools/generar_index.ps1)
├── tools/
│   └── generar_index.ps1       # Regenera index.html si cambia el checklist en papel
├── css/styles.css
├── js/
│   ├── db.js                   # Persistencia (clave localStorage edar_tarde_data)
│   ├── app.js                  # Lógica genérica (recorre el DOM)
│   └── vendor/xlsx.full.min.js # SheetJS offline
├── img/logo_cabecera.png
├── evolucion/paso1.md … paso10.md
└── README.md
```

Las fotos del checklist en papel están en `../Img/tarde/`:

| Archivo | Página |
|---|---|
| `biologicos_pag1.jpg` | Biológico A + inicio de B |
| `biologicos_pag2.jpg` | Final de B + inicio de C |
| `biologicos_pag3.jpg` | Final de C + Biológico D + inicio de E |
| `biologicos_pag4.jpg` | Final de E + inicio de F |
| `biologicos_pag5.jpg` | Final de F + tomamuestras + observaciones |
| `general_pag1.jpg` | General Biológicos (cabecera, 581, 594, 713A/B) |
| `general_pag2.jpg` | General Biológicos (713C, 612, oxazur, 921B + firmas) |

---

## Regenerar el HTML

Si cambia la plantilla en papel:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File TARDE/tools/generar_index.ps1
```

El script genera `TARDE/index.html` (UTF-8). No editar el HTML a mano: cambiar códigos o añadir equipos se hace en el script.

---

## Notas técnicas

- Claves de almacenamiento: `edar_tarde_data` (registros) y `edar_tarde_last_backup` (último guardado)
- Los registros antiguos de desarenadores siguen en `edar_checklist_data` y no se mezclan
- Prefijos de campo: `t_a_…` … `t_f_…` (biológicos), `t_toma_…` (tomamuestras), `t_g_…` (general)
- Las horas y arranques son campos numéricos; los valores con coma (`1,5`) se guardan como texto
- SheetJS está en local: la exportación a Excel funciona sin internet
