window._dataCache = [];
var loadingRecord = false;
var adminAutenticado = false;
var pendingSaveData = null;
var ADMIN_USER = 'admin';
var ADMIN_PASS = 'edar2026';

function getDataList() { return window._dataCache; }
function loadDataFromDB(callback) {
    DB.getAll(function(list) {
        if (list && list.length > 0) {
            window._dataCache = list;
            if (callback) callback();
            return;
        }
        var local = DB.getLocalBackup();
        if (local && local.length > 0) {
            window._dataCache = local;
            DB.saveAll(local, function() { if (callback) callback(); });
        } else {
            window._dataCache = [];
            if (callback) callback();
        }
    });
}
function persistData(callback) {
    DB.saveAll(window._dataCache, function(ok) {
        DB.updateBackupStatus();
        if (callback) callback(ok);
    });
}
function filterOperario2() {
    var op1 = document.getElementById('operario1').value;
    var sel2 = document.getElementById('operario2');
    for (var i = 1; i < sel2.options.length; i++) {
        sel2.options[i].disabled = (sel2.options[i].value === op1);
    }
    if (sel2.value === op1) sel2.value = '';
}
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (btn) btn.classList.add('active');
    else document.querySelectorAll('.tab-btn').forEach(b => { if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + tabId + "'")) b.classList.add('active'); });
    if (tabId === 'resumenTab') {
        if (adminAutenticado) {
            document.getElementById('loginGate').style.display = 'none';
            document.getElementById('recordsPanel').style.display = '';
            loadSavedRecords();
        } else {
            document.getElementById('loginGate').style.display = '';
            document.getElementById('recordsPanel').style.display = 'none';
        }
    }
}
function toggleEquipment(select) {
    const card = select.closest('.card');
    const isWorking = select.value === 'funcionando';
    card.querySelectorAll('.scada-group').forEach(g => g.classList.remove('has-error'));
    card.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(el => {
        el.disabled = !isWorking;
        if (!isWorking) el.value = '';
    });
    card.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(el => {
        el.disabled = !isWorking;
        if (!isWorking) el.checked = false;
    });
}
function getScadaVal(name) {
    const firstCb = document.querySelector(`input[name="${name}"]`);
    if (!firstCb) return null;
    const card = firstCb.closest('.card');
    const sel = card ? card.querySelector('.status-select') : null;
    const status = sel ? sel.value : 'funcionando';
    if (status !== 'funcionando') return null;
    const vals = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
    const group = firstCb.closest('.scada-group');
    if (vals.length !== 2) { group.classList.add('has-error'); return null; }
    group.classList.remove('has-error');
    return vals.join(', ');
}
function collectFormData() {
    // Recolección genérica: recorre todos los inputs del formulario
    const data = {
        id: 'CHECK_' + Date.now(),
        fecha: document.getElementById('fecha').value,
        turno: document.getElementById('turno').value,
        operario1: document.getElementById('operario1').value,
        operario2: document.getElementById('operario2').value,
        observaciones_generales: document.getElementById('observaciones_generales').value,
        timestamp: new Date().toISOString(),
        campos: {}
    };
    // SCADA checkboxes
    const scadaGroups = {};
    document.querySelectorAll('.scada-group input[type="checkbox"]').forEach(cb => {
        if (!scadaGroups[cb.name]) scadaGroups[cb.name] = true;
    });
    Object.keys(scadaGroups).forEach(name => {
        data.campos[name] = getScadaVal(name);
    });
    // Radios
    const radioGroups = {};
    document.querySelectorAll('input[type="radio"]').forEach(r => { radioGroups[r.name] = true; });
    Object.keys(radioGroups).forEach(name => {
        if (scadaGroups[name]) return;
        const el = document.querySelector(`input[name="${name}"]:checked`);
        data.campos[name] = el ? el.value : null;
    });
    // Inputs con id (number, text)
    document.querySelectorAll('input[type="number"], input[type="text"].obs-input, input[id$="_valor"], input[id$="_horas"], input[id$="_num"]').forEach(el => {
        if (el.id) data.campos[el.id] = el.value || null;
    });
    // Text extras por id
    document.querySelectorAll('input[type="text"][id]').forEach(el => {
        if (el.id && !(el.id in data.campos)) data.campos[el.id] = el.value || null;
    });
    // Obs por radio name
    document.querySelectorAll('.obs-input').forEach(input => {
        if (input.id) return; // ya capturado
        const row = input.closest('tr');
        const radio = row ? row.querySelector('input[type="radio"]') : null;
        const name = radio ? radio.name : null;
        if (name && input.value.trim()) {
            data.campos[name + '_obs'] = input.value.trim();
        }
    });
    // Estados de equipos
    data.campos['_estados'] = {};
    document.querySelectorAll('.card .status-select').forEach((sel, idx) => {
        const card = sel.closest('.card');
        const title = card.querySelector('.section-header');
        const key = title ? title.textContent.trim().substring(0,60) + '_' + idx : 'equipo_' + idx;
        data.campos['_estados'][key] = sel.value;
    });
    return data;
}
function validateScada() {
    let valid = true;
    document.querySelectorAll('.scada-group').forEach(group => {
        const card = group.closest('.card');
        const sel = card ? card.querySelector('.status-select') : null;
        const status = sel ? sel.value : 'funcionando';
        if (status !== 'funcionando') { group.classList.remove('has-error'); return; }
        const checked = group.querySelectorAll('input[type="checkbox"]:checked').length;
        if (checked !== 2) { group.classList.add('has-error'); valid = false; }
        else group.classList.remove('has-error');
    });
    return valid;
}
function saveToLocalStorage() {
    if (!validateScada()) { alert('Cada grupo SCADA debe tener exactamente 2 opciones seleccionadas.'); return; }
    pendingSaveData = collectFormData();
    showReviewModal(pendingSaveData);
}
function exportJSON() {
    const data = collectFormData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist_noches_${data.fecha}.json`;
    a.click();
}
function buildExcelRows(list) {
    // Headers dinámicos: fecha, turno, operarios + todos los campos
    const baseHeaders = ['Fecha','Turno','Operario 1','Operario 2','Observaciones','Fecha/Hora registro'];
    const allKeys = new Set();
    list.forEach(r => { if (r.campos) Object.keys(r.campos).forEach(k => { if (k !== '_estados') allKeys.add(k); }); });
    const sortedKeys = Array.from(allKeys).sort();
    const headers = [...baseHeaders, ...sortedKeys];
    return {
        headers,
        data: list.map(record => {
            const row = {
                'Fecha': record.fecha,
                'Turno': record.turno,
                'Operario 1': record.operario1,
                'Operario 2': record.operario2 || '',
                'Observaciones': record.observaciones_generales || '',
                'Fecha/Hora registro': record.timestamp
            };
            sortedKeys.forEach(k => {
                const v = record.campos ? record.campos[k] : null;
                row[k] = v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : v);
            });
            return row;
        })
    };
}
function exportExcel() {
    var list = getDataList();
    if (list.length === 0) { alert('No hay registros guardados para exportar.'); return; }
    const { headers, data } = buildExcelRows(list);
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    ws['!cols'] = headers.map(h => ({ wch: Math.min(Math.max(h.length + 4, 10), 30) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `checklist_noches_${fecha}.xlsx`);
}
function loadSavedRecords() {
    var list = getDataList();
    const container = document.getElementById('savedRecordsTable');
    if (list.length === 0) { container.innerHTML = '<p style="color:var(--text-muted);">No hay registros guardados aún.</p>'; return; }
    let html = `<table><thead><tr><th>Fecha</th><th>Turno</th><th>Operario 1</th><th>Operario 2</th><th>Acciones</th></tr></thead><tbody>`;
    list.forEach((item, index) => {
        html += `<tr><td>${item.fecha}</td><td>${item.turno}</td><td>${item.operario1}</td><td>${item.operario2||''}</td><td><button class="btn btn-primary" style="padding:4px 8px; font-size:0.8rem;" onclick="downloadSingleJSON(${index})">JSON</button> <button class="btn btn-success" style="padding:4px 8px; font-size:0.8rem;" onclick="loadRecord(${index})">Cargar</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
function downloadSingleJSON(index) {
    var list = getDataList();
    const data = list[index];
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist_${data.fecha}_${data.turno}.json`;
    a.click();
}
function loadRecord(index) {
    loadingRecord = true;
    try {
        var list = getDataList();
        var r = list[index];
        if (!r) { alert('Registro no encontrado.'); return; }
        if (!confirm('Cargar registro del ' + r.fecha + ' (' + (r.turno||'') + ')? Se perderán los datos actuales.')) { loadingRecord = false; return; }
        document.getElementById('fecha').value = r.fecha || '';
        document.getElementById('turno').value = r.turno || '';
        document.getElementById('operario1').value = r.operario1 || '';
        filterOperario2();
        document.getElementById('operario2').value = r.operario2 || '';
        document.getElementById('observaciones_generales').value = r.observaciones_generales || '';
        const campos = r.campos || {};
        // Restaurar estados
        if (campos._estados) {
            const selects = document.querySelectorAll('.card .status-select');
            const vals = Object.values(campos._estados);
            selects.forEach((sel, i) => { if (vals[i]) { sel.value = vals[i]; toggleEquipment(sel); } });
        }
        // Radios
        Object.keys(campos).forEach(k => {
            if (k === '_estados') return;
            const v = campos[k];
            if (v == null || v === '') return;
            // es SCADA?
            const cbs = document.querySelectorAll(`input[name="${k}"]`);
            if (cbs.length > 0 && cbs[0].type === 'checkbox') {
                cbs.forEach(cb => cb.checked = false);
                if (typeof v === 'string' && v.includes(',')) {
                    v.split(',').forEach(part => {
                        const t = part.trim();
                        const el = document.querySelector(`input[name="${k}"][value="${t}"]`);
                        if (el) el.checked = true;
                    });
                }
            } else {
                const radio = document.querySelector(`input[name="${k}"][value="${v}"]`);
                if (radio) radio.checked = true;
                else {
                    const inp = document.getElementById(k);
                    if (inp) inp.value = v;
                }
            }
            // obs suffix
            if (k.endsWith('_obs')) {
                const base = k.replace('_obs','');
                const radio = document.querySelector(`input[name="${base}"]`);
                if (radio) {
                    const row = radio.closest('tr');
                    const obs = row ? row.querySelector('.obs-input') : null;
                    if (obs) obs.value = v;
                }
            }
        });
        switchTab('general');
        alert('Registro cargado correctamente.');
    } catch(e) { alert('Error al cargar: ' + e.message); }
    loadingRecord = false;
}
function showReviewModal(data) {
    let html = '';
    html += '<div class="section-title">Datos del Turno</div>';
    html += reviewRow('Fecha', data.fecha);
    html += reviewRow('Turno', data.turno);
    html += reviewRow('Operario 1', data.operario1);
    html += reviewRow('Operario 2', data.operario2||'---');
    html += '<div class="section-title">Campos registrados: ' + Object.keys(data.campos).length + '</div>';
    Object.keys(data.campos).forEach(k => {
        if (k === '_estados') return;
        const v = data.campos[k];
        if (v != null && v !== '') html += reviewRow(k, String(v).substring(0,80));
    });
    if (data.observaciones_generales) {
        html += '<div class="section-title">Observaciones</div><p style="font-size:0.88rem;">' + data.observaciones_generales + '</p>';
    }
    document.getElementById('reviewContent').innerHTML = html;
    document.getElementById('reviewWarnings').innerHTML = '';
    document.getElementById('reviewModal').classList.add('active');
}
function reviewRow(label, value) { return '<div class="review-row"><span class="label">' + label + '</span><span class="value">' + (value||'---') + '</span></div>'; }
function closeReviewModal() { document.getElementById('reviewModal').classList.remove('active'); pendingSaveData = null; }
function confirmSave() {
    if (!pendingSaveData) return;
    window._dataCache.push(pendingSaveData);
    persistData(function() {
        DB.exportToFile();
        closeReviewModal();
        alert('Datos guardados. Backup descargado.');
        pendingSaveData = null;
    });
}
function adminLogin() {
    var user = document.getElementById('adminUser').value.trim();
    var pass = document.getElementById('adminPass').value.trim();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        adminAutenticado = true;
        document.getElementById('loginGate').style.display = 'none';
        document.getElementById('recordsPanel').style.display = '';
        document.getElementById('loginError').style.display = 'none';
        loadSavedRecords();
    } else document.getElementById('loginError').style.display = '';
}
function adminLogout() {
    adminAutenticado = false;
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    document.getElementById('loginGate').style.display = '';
    document.getElementById('recordsPanel').style.display = 'none';
}
function autoLoadPreviousDay() {
    var list = getDataList();
    if (list.length === 0) return;
    var prev = list[list.length - 1];
    if (!prev || !prev.campos) return;
    loadingRecord = true;
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('turno').value = prev.turno || 'Noches';
    document.getElementById('operario1').value = prev.operario1 || '';
    filterOperario2();
    document.getElementById('operario2').value = prev.operario2 || '';
    document.getElementById('observaciones_generales').value = prev.observaciones_generales || '';
    const campos = prev.campos || {};
    if (campos._estados) {
        const selects = document.querySelectorAll('.card .status-select');
        const vals = Object.values(campos._estados);
        selects.forEach((sel,i)=>{ if(vals[i]){ sel.value=vals[i]; toggleEquipment(sel); }});
    }
    Object.keys(campos).forEach(k=>{
        if(k==='_estados') return;
        const v=campos[k];
        if(v==null||v==='') return;
        const cbs=document.querySelectorAll(`input[name="${k}"]`);
        if(cbs.length>0 && cbs[0].type==='checkbox'){
            cbs.forEach(cb=>cb.checked=false);
            if(typeof v==='string' && v.includes(',')){
                v.split(',').forEach(p=>{ const t=p.trim(); const el=document.querySelector(`input[name="${k}"][value="${t}"]`); if(el) el.checked=true; });
            }
        } else {
            const radio=document.querySelector(`input[name="${k}"][value="${v}"]`);
            if(radio) radio.checked=true;
            else { const inp=document.getElementById(k); if(inp) inp.value=v; }
        }
        if(k.endsWith('_obs')){
            const base=k.replace('_obs','');
            const radio=document.querySelector(`input[name="${base}"]`);
            if(radio){ const row=radio.closest('tr'); const obs=row?row.querySelector('.obs-input'):null; if(obs) obs.value=v; }
        }
    });
    loadingRecord=false;
}
function importBackupFile() {
    var input=document.getElementById('backupFileInput');
    if(input.files.length===0){ alert('Seleccione un archivo .json'); return; }
    DB.importFromFile(input.files[0], function(ok){
        if(ok){ loadDataFromDB(function(){ DB.updateBackupStatus(); var e=document.getElementById('emptyDataMsg'); if(e) e.style.display='none'; if(adminAutenticado) loadSavedRecords(); autoLoadPreviousDay(); }); }
        input.value='';
    });
}
function resetForm() {
    if(confirm('¿Desea limpiar todos los campos?')){
        document.getElementById('checklistForm').reset();
        document.getElementById('fecha').value=new Date().toISOString().split('T')[0];
        document.querySelectorAll('.scada-group').forEach(g=>g.classList.remove('has-error'));
        var sel2=document.getElementById('operario2');
        for(var i=1;i<sel2.options.length;i++) sel2.options[i].disabled=false;
    }
}
document.getElementById('fecha').addEventListener('change', function(){
    if(loadingRecord) return;
    var list=getDataList();
    if(list.length===0) return;
    var prev=list[list.length-1];
    if(!prev||!prev.fecha) return;
    if(this.value > prev.fecha) autoLoadPreviousDay();
    this.dataset.prevFecha=this.value;
});
document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('fecha').value=new Date().toISOString().split('T')[0];
    document.getElementById('fecha').dataset.prevFecha=document.getElementById('fecha').value;
    document.querySelectorAll('.scada-group input[type="checkbox"]').forEach(cb=>{
        cb.addEventListener('change', function(){
            const group=this.closest('.scada-group');
            const checked=group.querySelectorAll('input[type="checkbox"]:checked').length;
            if(checked>2) this.checked=false;
            if(checked===2) group.classList.remove('has-error');
        });
    });
    loadDataFromDB(function(){
        DB.updateBackupStatus();
        var count=window._dataCache.length;
        var emptyMsg=document.getElementById('emptyDataMsg');
        if(emptyMsg) emptyMsg.style.display=count===0?'':'none';
        if(count>0) autoLoadPreviousDay();
    });
});