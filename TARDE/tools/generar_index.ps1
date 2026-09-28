# Genera TARDE/index.html (Checklist Mantenimiento Preventivo - BIOLÓGICOS, turno de Tardes)
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File generar_index.ps1
param([string]$Salida = (Join-Path (Split-Path $PSScriptRoot -Parent) 'index.html'))
$ErrorActionPreference = 'Stop'

$SALIDA_ABS = [System.IO.Path]::GetFullPath($Salida)
$ENC = New-Object System.Text.UTF8Encoding($false)

$STATUS_SELECT = @'
                        <div class="equipment-status">
                            <label>Estado:</label>
                            <select class="status-select" onchange="toggleEquipment(this)">
                                <option value="funcionando">Funcionando</option>
                                <option value="parado">Parado</option>
                                <option value="defecto">Defecto eléctrico</option>
                                <option value="no_funciona">No funciona</option>
                            </select>
                        </div>
'@

function Card([string]$titulo, [string[]]$filas) {
    $s = New-Object System.Text.StringBuilder
    [void]$s.AppendLine('            <div class="card">')
    [void]$s.AppendLine('                <div class="section-header">' + $titulo + '</div>')
    [void]$s.AppendLine($STATUS_SELECT)
    [void]$s.AppendLine('                <table>')
    [void]$s.AppendLine('                    <thead><tr><th>Punto de Inspección</th><th>Control</th><th>Observaciones / Dato</th></tr></thead>')
    [void]$s.AppendLine('                    <tbody>')
    foreach ($f in $filas) { [void]$s.AppendLine('                        ' + $f) }
    [void]$s.AppendLine('                    </tbody>')
    [void]$s.AppendLine('                </table>')
    [void]$s.AppendLine('            </div>')
    return $s.ToString()
}

function Banner([string]$texto) {
    return ('            <div class="section-header" style="background:#fef9c3; color:#854d0e; padding:8px; border-radius:6px; margin:18px 0 10px 0;">{0}</div>' -f $texto)
}

function Row([string]$txt, [string]$ctrl, [string]$obs) {
    return ('<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>' -f $txt, $ctrl, $obs)
}

function CtrlScada4([string]$n) {
    $h = '<div class="scada-group">'
    foreach ($v in @('R', 'L', 'M', 'A')) {
        $h += '<label class="checkbox-label"><input type="checkbox" name="' + $n + '" value="' + $v + '"> ' + $v + '</label>'
    }
    return $h + '</div>'
}

function CtrlRadios([string]$n, [string[]]$vals) {
    $h = ''
    foreach ($v in $vals) {
        $h += '<label class="radio-label"><input type="radio" name="' + $n + '" value="' + $v + '"> ' + $v + '</label>'
    }
    return $h
}

function CtrlSino([string]$n) { return (CtrlRadios $n @('SI', 'NO')) }
function ObsInput { return '<input type="text" class="obs-input" placeholder="Obs.">' }
function NumInput([string]$id, [string]$ph) { return '<input type="number" id="' + $id + '" placeholder="' + $ph + '">' }
function TextInput([string]$id, [string]$ph) { return '<input type="text" id="' + $id + '" placeholder="' + $ph + '">' }

function SoplanteFilas([string]$b, [bool]$conDisplay) {
    $r = @()
    $r += (Row '1.- Estado del equipo en el SCADA (marcar lo que proceda)' (CtrlScada4 ($b + '_scada')) (NumInput ($b + '_horas') 'Nº horas:'))
    $r += (Row '2.- Inspección visual del equipo y limpieza correcto' (CtrlSino ($b + '_vision')) (ObsInput))
    $r += (Row '3.- Control de ruidos cuando esté en funcionamiento (si procede)' (CtrlSino ($b + '_ruidos')) (ObsInput))
    if ($conDisplay) {
        $cells = ''
        $campos = @(
            @('p', 'P:'), @('q', 'Q:'), @('t1', 'T1:'), @('t2', 'T2:'),
            @('n', 'N:'), @('dp', 'ΔP:'), @('pot', 'Potencia:')
        )
        foreach ($c in $campos) {
            $cells += ('<span style="margin-right:12px; white-space:nowrap;">{0} <input type="number" id="{1}_{2}" style="width:72px;"></span>' -f $c[1], $b, $c[0])
        }
        $r += (Row '4.- Anotar valores display' $cells '')
    }
    return $r
}

function ValvulaFilas([string]$b) {
    $r = @()
    $r += (Row '1.- Estado del equipo en el SCADA (marcar lo que proceda)' (CtrlRadios ($b + '_estado') @('M', 'A')) (NumInput ($b + '_arr') 'Nº arranques:'))
    $r += (Row '2.- Indicar posición' (CtrlRadios ($b + '_pos') @('A', 'C')) (ObsInput))
    $r += (Row '3.- Se aprecian fugas de aire' (CtrlSino ($b + '_fugas')) (ObsInput))
    return $r
}

function MedidorFilas([string]$b, [string]$sensor) {
    if ($sensor -eq 'T') {
        return @((Row '1.- El medidor de temperatura funciona correctamente' (CtrlSino $b) (TextInput ($b + '_valor') 'Indicar valor T =')))
    }
    return @((Row '1.- El medidor de presión funciona correctamente' (CtrlSino $b) (TextInput ($b + '_valor') 'Indicar valor P =')))
}

function SinoFilas([string]$b, [string]$txt) {
    return @((Row $txt (CtrlSino $b) (ObsInput)))
}

function BombaFilas([string]$b, [bool]$trabadas, [bool]$singular) {
    $r = @()
    if ($singular) {
        $r += (Row '1.- Estado de la bomba en el SCADA (marcar lo que proceda)' (CtrlScada4 ($b + '_scada')) (NumInput ($b + '_horas') 'Nº horas:'))
        $r += (Row '2.- La bomba funciona correctamente. Extrae agua' (CtrlSino ($b + '_func')) (ObsInput))
        $r += (Row '3.- Presencia de ruidos, fugas o anomalías' (CtrlSino ($b + '_ruidos')) (ObsInput))
        $r += (Row '4.- La bomba se encuentra trabada' (CtrlSino ($b + '_trabada')) (ObsInput))
    } else {
        $r += (Row '1.- Estado de las bombas en el SCADA (marcar lo que proceda)' (CtrlScada4 ($b + '_scada')) (NumInput ($b + '_horas') 'Nº horas:'))
        $r += (Row '2.- Las bombas funcionan correctamente. Extraen agua' (CtrlSino ($b + '_func')) (ObsInput))
        $r += (Row '3.- Presencia de ruidos, fugas o anomalías' (CtrlSino ($b + '_ruidos')) (ObsInput))
        if ($trabadas) { $r += (Row '4.- Las bombas se encuentran trabadas' (CtrlSino ($b + '_trabadas')) (ObsInput)) }
    }
    return $r
}

function BoyasFilas([string]$b) {
    $r = @()
    $r += (Row '1.- Las boyas funciona correctamente' (CtrlSino ($b + '_func')) (ObsInput))
    $r += (Row '2.- Las boyas se encuentran limpias, sin trapos ni enredos' (CtrlSino ($b + '_limpias')) (ObsInput))
    return $r
}

function SensorNivelFilas([string]$b) {
    return @((Row '1.- El sensor de nivel funciona correctamente' (CtrlSino $b) (TextInput ($b + '_valor') 'Indicar valor %=')))
}

function CaudalFilas([string]$b) {
    return @((Row '1.- El caudalímetro funciona correctamente' (CtrlSino $b) (TextInput ($b + '_valor') 'Indicar valor Q =')))
}

function CaudalDobleFilas([string]$b) {
    $r = @()
    $r += (Row '1.- El caudalímetro funciona correctamente A' (CtrlSino ($b + 'a')) (TextInput ($b + 'a_valor') 'Indicar valor Q ='))
    $r += (Row '2.- El caudalímetro funciona correctamente B' (CtrlSino ($b + 'b')) (TextInput ($b + 'b_valor') 'Indicar valor Q ='))
    return $r
}

function TomaFilas([string]$b) {
    $r = @()
    $r += (Row '1.- El equipo recoge muestras correctamente' (CtrlSino ($b + '_rec')) (ObsInput))
    $r += (Row '2.- Presencia de errores en pantalla' (CtrlSino ($b + '_err')) (ObsInput))
    $r += (Row '3.- Nivel de botellas correcto' (CtrlSino ($b + '_niv')) (TextInput ($b + '_bot') 'Anotar nº de botella en proceso de llenado:'))
    return $r
}

$VALVULAS = [ordered]@{
    '001' = 'ELECTROVÁLVULA ENTRADA AGUA A BIOFILTRO'
    '002' = 'ELECTROVÁLVULA VENTEO BIOFILTROS'
    '003' = 'ELECTROVÁLVULA ENTRADA AGUA DE LAVADO A BIOFILTRO'
    '004' = 'ELECTROVÁLVULA VACIADO PARCIAL'
    '005' = 'ELECTROVÁLVULA SALIDA AGUA DE LAVADO'
    '006' = 'ELECTROVÁLVULA ENTRADA AIRE DE LAVADO'
}

function Get-BioCards([string]$L) {
    $x = $L.ToLower()
    $cards = New-Object System.Collections.Generic.List[string]
    $cards.Add((Card ("SOPLANTE DE PROCESO (712{0}_CS001)" -f $L) (SoplanteFilas ("t_{0}_sopl" -f $x) $true)))
    $cards.Add((Card ("MEDIDOR DE TEMPERATURA EN COLECTOR AIRE DE PROCESO BIOFILTRO (712{0}_TI002)" -f $L) (MedidorFilas ("t_{0}_medt" -f $x) 'T')))
    foreach ($n in $VALVULAS.Keys) {
        $titulo = '{0} (492{1}_VA{2})' -f $VALVULAS[$n], $L, $n
        $cards.Add((Card $titulo (ValvulaFilas ("t_{0}_va{1}" -f $x, $n))))
    }
    $cards.Add((Card ("MEDIDOR DE PRESIÓN BAJO FALSO FONDO BIOFOR (492{0}_PIT001)" -f $L) (MedidorFilas ("t_{0}_pit" -f $x) 'P')))
    $cards.Add((Card ("BOYA DE NIVEL CANAL ENTRADA A BIOFOR (492{0}_LSHH002)" -f $L) (SinoFilas ("t_{0}_boya_ent" -f $x) '1.- La boya funciona correctamente')))
    $cards.Add((Card 'REJA CANAL ENTRADA A BIOFOR' (SinoFilas ("t_{0}_reja" -f $x) '1.- Inspección visual y limpieza correcto')))
    $cards.Add((Card ("BOYA DE NIVEL SALIDA AGUA BIOFOR (492{0}_LSHH003)" -f $L) (SinoFilas ("t_{0}_boya_sal" -f $x) '1.- La boya funciona correctamente')))
    return $cards
}

function Get-GeneralCards {
    $cards = New-Object System.Collections.Generic.List[string]
    $cards.Add((Card 'BOMBEO INTERMEDIO (581A_PO001)' (BombaFilas 't_g_581a' $true $false)))
    $cards.Add((Card 'BOMBEO INTERMEDIO (581B_PO001)' (BombaFilas 't_g_581b' $false $false)))
    $cards.Add((Card 'BOMBEO INTERMEDIO (581C_PO001)' (BombaFilas 't_g_581c' $false $false)))
    $cards.Add((Card 'BOYAS DE NIVEL BOMBEO INTERMEDIO (581A_LSLL001)' (BoyasFilas 't_g_581_boyas')))
    $cards.Add((Card 'SENSOR DE NIVEL BOMBEO INTERMEDIO (581_LIT002)' (SensorNivelFilas 't_g_581_lit')))
    $cards.Add((Card 'CAUDALÍMETRO BOMBEO INTERMEDIO A BIOFILTRACIÓN (581_FIT001)' (CaudalFilas 't_g_581_fit')))
    $cards.Add((Card 'BOYA DE NIVEL ALTO CANAL REPARTO A BIOFILTROS (492_LSHH001)' (SinoFilas 't_g_492_boya' '1.- La boya funciona correctamente')))
    $cards.Add((Card 'BOMBAS LAVADO BIOFILTROS (594A_PO001)' (BombaFilas 't_g_594a' $true $false)))
    $cards.Add((Card 'BOMBAS LAVADO BIOFILTROS (594B_PO001)' (BombaFilas 't_g_594b' $true $false)))
    $cards.Add((Card 'BOMBAS LAVADO BIOFILTROS (594C_PO001)' (BombaFilas 't_g_594c' $true $false)))
    $cards.Add((Card 'BOYAS DE NIVEL DEPÓSITO DE AGUA BIOFILTRADA (594_LSHH001 Y 594_LSLL002)' (BoyasFilas 't_g_594_boyas')))
    $cards.Add((Card 'SENSOR DE NIVEL DEPÓSITO DE AGUA BIOFILTRADA (594_LIT003)' (SensorNivelFilas 't_g_594_lit')))
    $cards.Add((Card 'CAUDALÍMETRO TUBERÍA AGUA DE LAVADO BIOFILTROS (594_FIT001)' (CaudalFilas 't_g_594_fit')))
    $cards.Add((Card 'SOPLANTES DE LAVADO (713A_CS001)' (SoplanteFilas 't_g_713a' $false)))
    $cards.Add((Card 'SOPLANTES DE LAVADO (713B_CS001)' (SoplanteFilas 't_g_713b' $false)))
    $cards.Add((Card 'SOPLANTES DE LAVADO (713C_CS001)' (SoplanteFilas 't_g_713c' $false)))
    $cards.Add((Card 'MEDIDOR DE TEMPERATURA EN COLECTOR AIRE DE LAVADO BIOFILTROS (713_TI002)' (MedidorFilas 't_g_713_medt' 'T')))
    $cards.Add((Card 'REJA CANAL ENTRADA A DEPÓSITO DE AGUA BIOFILTRADA' (SinoFilas 't_g_reja_dep' '1.- Inspección visual y limpieza correcto')))
    $cards.Add((Card 'BOMBAS RECUPERACIÓN DE AGUA SUCIA DE LAVADO (612A_PO001)' (BombaFilas 't_g_612a' $true $false)))
    $cards.Add((Card 'BOMBAS RECUPERACIÓN DE AGUA SUCIA DE LAVADO (612B_PO001)' (BombaFilas 't_g_612b' $true $false)))
    $cards.Add((Card 'BOMBAS RECUPERACIÓN DE AGUA SUCIA DE LAVADO (612C_PO001)' (BombaFilas 't_g_612c' $true $false)))
    $cards.Add((Card 'BOYAS DE NIVEL DEPÓSITO RECUPERACIÓN DE AGUA SUCIA DE LAVADO (612_LSLL001, 612_LSL002 Y 612_LSH003)' (BoyasFilas 't_g_612_boyas')))
    $cards.Add((Card 'CAUDALÍMETROS BOMBEO AGUA SUCIA DE LAVADO A DECANTACIÓN LAMELAR (612A/B_FIT001)' (CaudalDobleFilas 't_g_612_fit')))
    $cards.Add((Card 'BOMBA DE LAVADO DE OXAZUR (594_PO002)' (BombaFilas 't_g_oxazur' $true $true)))
    $cards.Add((Card 'BOMBEO DE VACIADOS DECANTADORES Y BIOLÓGICOS (921B_PO001A)' (BombaFilas 't_g_921a' $true $false)))
    $cards.Add((Card 'BOMBEO DE VACIADOS DECANTADORES Y BIOLÓGICOS (921B_PO001B)' (BombaFilas 't_g_921b' $true $false)))
    $cards.Add((Card 'BOYAS DE NIVEL BOMBEO DE VACIADOS DECANTADORES Y BIOLÓGICOS (921B_LSL001, 921B_LSH002)' (BoyasFilas 't_g_921_boyas')))
    return $cards
}

# ---------------------------------------------------------------- esqueleto
$head = @'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checklist Tardes - EDAR Gijón Este</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
<div class="container">
    <header>
        <div class="header-content">
            <div class="header-text">
                <h1>EDAR GIJÓN ESTE - Grupo Tragsa</h1>
                <p>Checklist Mantenimiento Preventivo - Turno de Tardes (Biológicos)</p>
            </div>
            <img src="img/logo_cabecera.png" alt="Grupo Tragsa" class="header-logo">
        </div>
    </header>
    <div style="margin:10px 0;">
        <a href="../index.html" style="color:var(--primary); text-decoration:none; font-size:0.9rem;">← Volver al selector de turno</a>
    </div>
    <form id="checklistForm">
        <div class="card">
            <div class="card-title">Información del Turno y Control</div>
            <div class="grid-2">
                <div class="form-group"><label>Fecha</label><input type="date" id="fecha" required></div>
                <input type="hidden" id="turno" value="Tardes">
                <div class="form-group"><label>Operario 1</label><select id="operario1" required onchange="filterOperario2()"><option value="">Seleccionar operario...</option><option value="Ana">Ana</option><option value="Carlos">Carlos</option><option value="Edu">Edu</option><option value="Luis">Luis</option><option value="Sara">Sara</option></select></div>
                <div class="form-group"><label>Operario 2</label><select id="operario2"><option value="">Seleccionar operario...</option><option value="Ana">Ana</option><option value="Carlos">Carlos</option><option value="Edu">Edu</option><option value="Luis">Luis</option><option value="Sara">Sara</option></select></div>
            </div>
        </div>
        <div class="tabs">
            <button type="button" class="tab-btn active" onclick="switchTab('bioA', this)">Biológico A</button>
            <button type="button" class="tab-btn" onclick="switchTab('bioB', this)">Biológico B</button>
            <button type="button" class="tab-btn" onclick="switchTab('bioC', this)">Biológico C</button>
            <button type="button" class="tab-btn" onclick="switchTab('bioD', this)">Biológico D</button>
            <button type="button" class="tab-btn" onclick="switchTab('bioE', this)">Biológico E</button>
            <button type="button" class="tab-btn" onclick="switchTab('bioF', this)">Biológico F</button>
            <button type="button" class="tab-btn" onclick="switchTab('general', this)">General</button>
            <button type="button" class="tab-btn" onclick="switchTab('observaciones', this)">Observaciones</button>
            <button type="button" class="tab-btn" onclick="switchTab('resumenTab', this)">Registros</button>
        </div>
'@

$footer = @'
        <div id="observaciones" class="tab-content">
            <div class="card">
                <div class="section-header">OBSERVACIONES GENERALES DEL TURNO</div>
                <div class="form-group"><textarea id="observaciones_generales" rows="6" placeholder="Escriba aquí incidencias, anomalías detectadas, mantenimientos realizados..."></textarea></div>
                <p style="font-size:0.85rem; color:var(--warning); font-weight:600;">Nota: Al finalizar el turno dejar constancia de cualquier incidencia. Firmas de los operarios en el registro del turno.</p>
            </div>
        </div>
        <div id="resumenTab" class="tab-content">
            <div class="card" id="loginGate" style="display:none;">
                <div class="card-title">Acceso Restringido - Administrador</div>
                <p style="font-size:0.9rem; margin-bottom:15px;">Introduzca credenciales para acceder a los registros.</p>
                <div class="grid-2">
                    <div class="form-group"><label>Usuario</label><input type="text" id="adminUser" placeholder="Usuario"></div>
                    <div class="form-group"><label>Contraseña</label><input type="password" id="adminPass" placeholder="Contraseña"></div>
                </div>
                <div style="margin-top:12px;"><button type="button" class="btn btn-primary" onclick="adminLogin()">Entrar</button><span id="loginError" style="color:var(--danger); font-size:0.85rem; margin-left:10px; display:none;">Credenciales incorrectas.</span></div>
            </div>
            <div class="card" id="recordsPanel" style="display:none;">
                <div class="card-title">Registros Almacenados <button type="button" class="btn btn-secondary" style="padding:4px 10px; font-size:0.8rem;" onclick="adminLogout()">Cerrar sesión</button></div>
                <div id="savedRecordsTable"></div>
            </div>
        </div>
        <div id="reviewModal" class="modal">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="color:var(--primary);">Revisión antes de guardar</h3>
                    <button type="button" class="btn btn-secondary" style="padding:4px 10px;" onclick="closeReviewModal()">Cerrar</button>
                </div>
                <div id="reviewContent"></div>
                <div id="reviewWarnings" style="margin-top:12px;"></div>
                <div style="margin-top:16px; text-align:right; display:flex; gap:10px; justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="closeReviewModal()">Cancelar</button>
                    <button type="button" class="btn btn-success" onclick="confirmSave()">Confirmar Guardado</button>
                </div>
            </div>
        </div>
        <div class="actions-bar">
            <div style="flex:1; display:flex; align-items:center; gap:12px;">
                <span id="backupStatus" style="font-size:0.75rem; color:var(--text-muted);"></span>
                <span id="emptyDataMsg" style="display:none; font-size:0.8rem; color:var(--danger); font-weight:600;">No hay datos. <label for="backupFileInput" style="text-decoration:underline; cursor:pointer; color:var(--primary);">Importar backup</label><input type="file" id="backupFileInput" accept=".json" style="display:none;" onchange="importBackupFile()"></span>
            </div>
            <button type="button" class="btn btn-secondary" onclick="resetForm()">Limpiar</button>
            <button type="button" class="btn btn-primary" onclick="saveToLocalStorage()">Guardar Local</button>
            <button type="button" class="btn btn-success" onclick="exportJSON()">Exportar JSON</button>
            <button type="button" class="btn btn-warning" onclick="exportExcel()">Exportar Excel</button>
        </div>
    </form>
</div>
<script src="js/vendor/xlsx.full.min.js"></script>
<script src="js/db.js?v=1"></script>
<script src="js/app.js?v=1"></script>
</body>
</html>
'@

# ---------------------------------------------------------------- ensamblado
$out = New-Object System.Text.StringBuilder
[void]$out.Append($head)

foreach ($L in @('A', 'B', 'C', 'D', 'E', 'F')) {
    $id = 'bio' + $L
    $active = ''
    if ($L -eq 'A') { $active = ' active' }
    [void]$out.AppendLine(('        <div id="{0}" class="tab-content{1}">' -f $id, $active))
    [void]$out.AppendLine((Banner ("BIOLÓGICO {0}" -f $L)))
    foreach ($c in (Get-BioCards $L)) { [void]$out.AppendLine($c) }
    if ($L -eq 'F') {
        [void]$out.AppendLine((Banner 'TOMAMUESTRAS'))
        [void]$out.AppendLine((Card 'TOMAMUESTRAS ENTRADA' (TomaFilas 't_toma_ent')))
        [void]$out.AppendLine((Card 'TOMAMUESTRAS SALIDA' (TomaFilas 't_toma_sal')))
        [void]$out.AppendLine((Card 'TOMAMUESTRAS ENTRADA BIOFILTRO' (TomaFilas 't_toma_bio')))
    }
    [void]$out.AppendLine('        </div>')
}

[void]$out.AppendLine('        <div id="general" class="tab-content">')
[void]$out.AppendLine((Banner 'GENERAL BIOLÓGICOS'))
foreach ($c in (Get-GeneralCards)) { [void]$out.AppendLine($c) }
[void]$out.AppendLine('        </div>')

[void]$out.Append($footer)

[System.IO.File]::WriteAllText($SALIDA_ABS, $out.ToString(), $ENC)
$cards = ([regex]::Matches($out.ToString(), '<div class="card">')).Count
$inputs = ([regex]::Matches($out.ToString(), '<input ')).Count
Write-Output ("Generado: " + $SALIDA_ABS)
Write-Output ("Lineas: " + ([regex]::Matches($out.ToString(), "`n")).Count + " | tarjetas: " + $cards + " | inputs: " + $inputs)
