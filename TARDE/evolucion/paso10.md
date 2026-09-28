# Paso 10 — Nuevo checklist de Tardes: BIOLÓGICOS (28/09/2026)

## Motivo

El checklist en papel del turno de Tardes cambió: ya **no es el de desarenadores** (esos están en el turno de Mañanas, `../MANANA/`), sino el titulado **"CHECKLIST MANTENIMIENTO PREVENTIVO — BIOLÓGICOS"**, con turno/hora impreso "TARDES".

## Fotos del checklist

7 fotos descargadas de WhatsApp (`07/…` del 28/09/2026) copiadas a `../Img/tarde/`:

| Archivo | Contenido |
|---|---|
| `biologicos_pag1.jpg` | Cabecera + Biológico A completo + inicio de Biológico B |
| `biologicos_pag2.jpg` | Electroválvulas de B + inicio de Biológico C |
| `biologicos_pag3.jpg` | Final de C + Biológico D completo + inicio de E |
| `biologicos_pag4.jpg` | Final de E + inicio de F |
| `biologicos_pag5.jpg` | Final de F + tomamuestras + observaciones |
| `general_pag1.jpg` | Hoja GENERAL BIOLÓGICOS (581, 594, soplines 713A/B) |
| `general_pag2.jpg` | GENERAL BIOLÓGICOS (713C, 612, oxazur, 921B, firmas) |

Para transcribir códigos y textos se usó OCR local (Windows.Media.Ocr desde PowerShell) sobre las copias de `Img/tarde/`, ya que la lectura visual directa de las imágenes daba resultados poco fiables.

## Cambios realizados

1. **Reemplazo completo de `TARDE/`**: se borró la implementación anterior de desarenadores (`index.html` con `app.js` con identificadores hardcodeados, `seed.html`, `db/seed_prueba.json`). Los datos antiguos siguen en localStorage con la clave `edar_checklist_data`.
2. **Arquitectura genérica**: `TARDE/js/app.js` y `TARDE/js/db.js` son ahora los mismos que `MANANA/`/`NOCHE/` (recolección dinámica recorriendo el DOM), con:
   - claves nuevas: `edar_tarde_data` y `edar_tarde_last_backup`
   - prefijos de campo `t_…`
   - literales `checklist_tardes_*`, turno por defecto `Tardes`, pestaña inicial `bioA`
3. **Nuevo `TARDE/index.html`** generado por `TARDE/tools/generar_index.ps1`:
   - 9 pestañas: Biológico A–F, General, Observaciones, Registros
   - 102 tarjetas, 21 grupos SCADA (R/L/M/A con "exactamente 2"), 216 grupos de radio, 360 campos
   - 6 electroválvulas por biológico con selección única `M`/`A` (estado SCADA), `A`/`C` (posición) y SI/NO de fugas
   - tomamuestras al final del Biológico F y la hoja General completa al final
4. **Portal `index.html`**: la tarjeta "Turno de Tardes" describe ahora Biológicos A–F + General.
5. **Documentación**: `README.md` raíz y `TARDE/README.md` actualizados; fotos de Mañanas renombradas (`terciario_01_bombeo.jpg`, `terciario_02_tomamuestras.jpg`).

## Validación

Prueba con Chrome headless (`--headless --dump-dom` sobre un HTML de prueba temporal, ya eliminado):

- `tabs=9`, `tabBtns=9`, `cardsConEstado=102`, `scadaGroups=21`, `gruposRadio=216`
- `idsDuplicados=[]`
- `validateScada=true` con 2 marcados por grupo y `validateVacio=false` con grupos vacíos
- `campos=360` (94 de la pestaña General), `estados=102`
- valores de prueba recogidos correctamente (`t_a_sopl_horas`, `t_a_va001_estado/pos`, `t_toma_ent_bot`, `t_g_581a_func`, SCADA `t_a_sopl_scada="R, L"`)
- `toggleEquipment` deshabilita/reactiva los campos de una tarjeta
- persistencia OK: 1 registro en `edar_tarde_data` y `edar_tarde_last_backup` marcada
- cambio de pestañas (`general`, `bioF`) y observaciones operativos

## Regenerar el HTML

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File TARDE/tools/generar_index.ps1
```

Si la plantilla en papel cambia, se edita el script (títulos, códigos, filas) y se vuelve a ejecutar; no editar `index.html` a mano.

## Pendiente

- [ ] Confirmar con el operario los códigos de boyas `612_LSL002`, `612_LSH003` y `921B_LSL001` (leídos por OCR)
