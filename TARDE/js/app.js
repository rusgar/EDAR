document.getElementById('fecha').value = new Date().toISOString().split('T')[0];

var loadingRecord = false;
var adminAutenticado = false;
var pendingSaveData = null;

var ADMIN_USER = 'admin';
var ADMIN_PASS = 'edar2026';

function filterOperario2() {
    var op1 = document.getElementById('operario1').value;
    var sel2 = document.getElementById('operario2');
    var options = sel2.options;
    for (var i = 1; i < options.length; i++) {
        options[i].disabled = (options[i].value === op1);
    }
    if (sel2.value === op1) {
        sel2.value = '';
    }
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (btn) {
        btn.classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn').forEach(b => {
            if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + tabId + "'")) {
                b.classList.add('active');
            }
        });
    }
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

function getEquipmentStatus(card) {
    const sel = card.querySelector('.status-select');
    return sel ? sel.value : 'funcionando';
}

function getRadioVal(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
}

function getCheckboxesVal(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
}

function getScadaVal(name) {
    const firstCb = document.querySelector(`input[name="${name}"]`);
    if (!firstCb) return null;
    const card = firstCb.closest('.card');
    const sel = card ? card.querySelector('.status-select') : null;
    const status = sel ? sel.value : 'funcionando';
    if (status !== 'funcionando') return null;
    const vals = getCheckboxesVal(name);
    const group = firstCb.closest('.scada-group');
    if (vals.length !== 2) {
        group.classList.add('has-error');
        return null;
    }
    group.classList.remove('has-error');
    return vals.join(', ');
}

function collectObservations() {
    const obs = {};
    document.querySelectorAll('.obs-input').forEach(input => {
        const row = input.closest('tr');
        const radio = row ? row.querySelector('input[type="radio"]') : null;
        const checkbox = row ? row.querySelector('input[type="checkbox"]') : null;
        const field = radio ? radio.name : (checkbox ? checkbox.name : null);
        if (field && input.value.trim()) {
            obs[field] = input.value.trim();
        }
    });
    return obs;
}

function collectFormData() {
    function getEquipStatus(prefix) {
        const firstInput = document.querySelector(`input[name="${prefix}_scada"], input[name="${prefix}_func"], input[name="${prefix}_ruidos"]`);
        if (!firstInput) return 'funcionando';
        const card = firstInput.closest('.card');
        const sel = card ? card.querySelector('.status-select') : null;
        return sel ? sel.value : 'funcionando';
    }

    const data = {
        id: 'CHECK_' + Date.now(),
        fecha: document.getElementById('fecha').value,
        turno: document.getElementById('turno').value,
        operario1: document.getElementById('operario1').value,
        operario2: document.getElementById('operario2').value,

        desarenador_A: {
            compuerta_entrada: {
                estado: getEquipStatus('a_comp'),
                scada: getScadaVal('a_comp_scada'),
                limpieza: getRadioVal('a_comp_limpieza'),
                ruidos: getRadioVal('a_comp_ruidos'),
                arranques: document.getElementById('a_comp_arranques').value
            },
            puente: {
                estado: getEquipStatus('a_puente'),
                scada: getScadaVal('a_puente_scada'),
                horas: document.getElementById('a_puente_horas').value,
                desplazamiento: getRadioVal('a_puente_despl'),
                rasquetas: getRadioVal('a_puente_rasquetas'),
                anomalias: getRadioVal('a_puente_anomalias'),
                guias_ruedas: getRadioVal('a_puente_guias'),
                finales_carrera: getRadioVal('a_puente_fcarrera'),
                rozamientos: getRadioVal('a_puente_rozamientos'),
                lonas_limpias: getRadioVal('a_puente_lonas'),
                lonas_sujeciones: getRadioVal('a_puente_sujeciones')
            },
            bomba_arenas: {
                estado: getEquipStatus('a_bomba'),
                funcionamiento: getRadioVal('a_bomba_func'),
                ruidos_fugas: getRadioVal('a_bomba_ruidos')
            },
            aireadores: {
                estado: getEquipStatus('a_aireadores'),
                scada: getScadaVal('a_aireadores_scada'),
                ruidos: getRadioVal('a_aireadores_ruidos'),
                horas: {
                    a: document.getElementById('a_horas_a').value,
                    b: document.getElementById('a_horas_b').value,
                    c: document.getElementById('a_horas_c').value,
                    d: document.getElementById('a_horas_d').value,
                    e: document.getElementById('a_horas_e').value
                }
            },
            compuerta_grasas: {
                estado: getEquipStatus('a_grasas'),
                scada: getScadaVal('a_grasas_scada'),
                arranques: document.getElementById('a_grasas_arranques1').value,
                limpieza: getRadioVal('a_grasas_limpieza'),
                ruidos: getRadioVal('a_grasas_ruidos'),
                electrovalvula: getRadioVal('a_grasas_electrov'),
                electrovalvula_arranques: document.getElementById('a_grasas_arranques2').value
            }
        },

        desarenador_B: {
            compuerta_entrada: {
                estado: getEquipStatus('b_comp'),
                scada: getScadaVal('b_comp_scada'),
                limpieza: getRadioVal('b_comp_limpieza'),
                ruidos: getRadioVal('b_comp_ruidos'),
                arranques: document.getElementById('b_comp_arranques').value
            },
            puente: {
                estado: getEquipStatus('b_puente'),
                scada: getScadaVal('b_puente_scada'),
                horas: document.getElementById('b_puente_horas').value,
                desplazamiento: getRadioVal('b_puente_despl'),
                rasquetas: getRadioVal('b_puente_rasquetas'),
                anomalias: getRadioVal('b_puente_anomalias'),
                guias_ruedas: getRadioVal('b_puente_guias'),
                finales_carrera: getRadioVal('b_puente_fcarrera'),
                rozamientos: getRadioVal('b_puente_rozamientos'),
                lonas_limpias: getRadioVal('b_puente_lonas'),
                lonas_sujeciones: getRadioVal('b_puente_sujeciones')
            },
            bomba_arenas: {
                estado: getEquipStatus('b_bomba'),
                funcionamiento: getRadioVal('b_bomba_func'),
                ruidos_fugas: getRadioVal('b_bomba_ruidos')
            },
            aireadores: {
                estado: getEquipStatus('b_aireadores'),
                scada: getScadaVal('b_aireadores_scada'),
                ruidos: getRadioVal('b_aireadores_ruidos'),
                horas: {
                    a: document.getElementById('b_horas_a').value,
                    b: document.getElementById('b_horas_b').value,
                    c: document.getElementById('b_horas_c').value,
                    d: document.getElementById('b_horas_d').value,
                    e: document.getElementById('b_horas_e').value
                }
            },
            compuerta_grasas: {
                estado: getEquipStatus('b_grasas'),
                scada: getScadaVal('b_grasas_scada'),
                arranques: document.getElementById('b_grasas_arranques1').value,
                limpieza: getRadioVal('b_grasas_limpieza'),
                ruidos: getRadioVal('b_grasas_ruidos'),
                electrovalvula: getRadioVal('b_grasas_electrov'),
                electrovalvula_arranques: document.getElementById('b_grasas_arranques2').value
            }
        },

        desarenador_C: {
            compuerta_entrada: {
                estado: getEquipStatus('c_comp'),
                scada: getScadaVal('c_comp_scada'),
                limpieza: getRadioVal('c_comp_limpieza'),
                ruidos: getRadioVal('c_comp_ruidos'),
                arranques: document.getElementById('c_comp_arranques').value
            },
            puente: {
                estado: getEquipStatus('c_puente'),
                scada: getScadaVal('c_puente_scada'),
                horas: document.getElementById('c_puente_horas').value,
                desplazamiento: getRadioVal('c_puente_despl'),
                anomalias: getRadioVal('c_puente_anomalias'),
                guias_ruedas: getRadioVal('c_puente_guias'),
                finales_carrera: getRadioVal('c_puente_fcarrera'),
                rozamientos: getRadioVal('c_puente_rozamientos'),
                lonas_limpias: getRadioVal('c_puente_lonas'),
                lonas_sujeciones: getRadioVal('c_puente_sujeciones')
            },
            bomba_arenas: {
                estado: getEquipStatus('c_bomba'),
                funcionamiento: getRadioVal('c_bomba_func'),
                ruidos_fugas: getRadioVal('c_bomba_ruidos')
            },
            aireadores: {
                estado: getEquipStatus('c_aireadores'),
                scada: getScadaVal('c_aireadores_scada'),
                ruidos: getRadioVal('c_aireadores_ruidos'),
                horas: {
                    a: document.getElementById('c_horas_a').value,
                    b: document.getElementById('c_horas_b').value,
                    c: document.getElementById('c_horas_c').value,
                    d: document.getElementById('c_horas_d').value,
                    e: document.getElementById('c_horas_e').value
                }
            },
            compuerta_grasas: {
                estado: getEquipStatus('c_grasas'),
                scada: getScadaVal('c_grasas_scada'),
                arranques: document.getElementById('c_grasas_arranques1').value,
                limpieza: getRadioVal('c_grasas_limpieza'),
                ruidos: getRadioVal('c_grasas_ruidos'),
                electrovalvula: getRadioVal('c_grasas_electrov'),
                electrovalvula_arranques: document.getElementById('c_grasas_arranques2').value
            }
        },

        contenedor_arenas_grasas: {
            estado: (() => {
                const sel = document.querySelector('#contenedor .card .status-select');
                return sel ? sel.value : 'funcionando';
            })(),
            tubo_agua: getRadioVal('cont_tubo_agua'),
            retirar_agua: getRadioVal('cont_retirar_agua'),
            cant_agua: document.getElementById('cont_cant_agua').value,
            vaciado_gavetas: getRadioVal('cont_vaciado_gavetas'),
            cant_gavetas: document.getElementById('cont_cant_gavetas').value
        },

        observaciones_generales: document.getElementById('observaciones_generales').value,
        observaciones_campo: collectObservations(),
        timestamp: new Date().toISOString()
    };
    return data;
}

function validateScada() {
    const scadaFields = document.querySelectorAll('.scada-group');
    let valid = true;
    scadaFields.forEach(group => {
        const card = group.closest('.card');
        const sel = card ? card.querySelector('.status-select') : null;
        const status = sel ? sel.value : 'funcionando';
        if (status !== 'funcionando') {
            group.classList.remove('has-error');
            return;
        }
        const checked = group.querySelectorAll('input[type="checkbox"]:checked').length;
        if (checked !== 2) {
            group.classList.add('has-error');
            valid = false;
        } else {
            group.classList.remove('has-error');
        }
    });
    return valid;
}

function saveToLocalStorage() {
    if (!validateScada()) {
        alert('Cada grupo SCADA debe tener exactamente 2 opciones seleccionadas.');
        return;
    }
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
    a.download = `checklist_desarenadores_${data.fecha}_${data.turno}.json`;
    a.click();
}

function buildExcelRows(list) {
    const letters = ['A', 'B', 'C'];
    const deviceCols = [
        ['Compuerta Estado', 'compuerta_entrada', 'estado'],
        ['Compuerta SCADA', 'compuerta_entrada', 'scada'],
        ['Compuerta Limpieza', 'compuerta_entrada', 'limpieza'],
        ['Compuerta Ruidos', 'compuerta_entrada', 'ruidos'],
        ['Compuerta Arranques', 'compuerta_entrada', 'arranques'],
        ['Puente Estado', 'puente', 'estado'],
        ['Puente SCADA', 'puente', 'scada'],
        ['Puente Horas', 'puente', 'horas'],
        ['Puente Desplazamiento', 'puente', 'desplazamiento'],
        ['Puente Rasquetas', 'puente', 'rasquetas'],
        ['Puente Anomalias', 'puente', 'anomalias'],
        ['Puente Guias/Ruedas', 'puente', 'guias_ruedas'],
        ['Puente Finales Carrera', 'puente', 'finales_carrera'],
        ['Puente Rozamientos', 'puente', 'rozamientos'],
        ['Puente Lonas Limpias', 'puente', 'lonas_limpias'],
        ['Puente Lonas Sujeciones', 'puente', 'lonas_sujeciones'],
        ['Bomba Estado', 'bomba_arenas', 'estado'],
        ['Bomba Funcionamiento', 'bomba_arenas', 'funcionamiento'],
        ['Bomba Ruidos/Fugas', 'bomba_arenas', 'ruidos_fugas'],
        ['Aireadores Estado', 'aireadores', 'estado'],
        ['Aireadores SCADA', 'aireadores', 'scada'],
        ['Aireadores Ruidos', 'aireadores', 'ruidos'],
        ['Aireador A (hrs)', 'aireadores_horas', 'a'],
        ['Aireador B (hrs)', 'aireadores_horas', 'b'],
        ['Aireador C (hrs)', 'aireadores_horas', 'c'],
        ['Aireador D (hrs)', 'aireadores_horas', 'd'],
        ['Aireador E (hrs)', 'aireadores_horas', 'e'],
        ['Grasas Estado', 'compuerta_grasas', 'estado'],
        ['Grasas SCADA', 'compuerta_grasas', 'scada'],
        ['Grasas Arranques', 'compuerta_grasas', 'arranques'],
        ['Grasas Limpieza', 'compuerta_grasas', 'limpieza'],
        ['Grasas Ruidos', 'compuerta_grasas', 'ruidos'],
        ['Grasas Electrovalvula', 'compuerta_grasas', 'electrovalvula'],
        ['Grasas Arranques EV', 'compuerta_grasas', 'electrovalvula_arranques']
    ];

    const headers = ['Fecha', 'Turno', 'Operario 1', 'Operario 2'];
    letters.forEach(L => deviceCols.forEach(([name]) => headers.push(`${L} - ${name}`)));

    const sharedCols = [
        ['Contenedor - Estado', 'estado'],
        ['Contenedor - Tubo con agua', 'tubo_agua'],
        ['Contenedor - Retirar agua', 'retirar_agua'],
        ['Contenedor - Cantidad extraida', 'cant_agua'],
        ['Contenedor - Vaciado gavetas', 'vaciado_gavetas'],
        ['Contenedor - Cantidad gavetas', 'cant_gavetas']
    ];
    sharedCols.forEach(([name]) => headers.push(name));

    const obsSections = [
        { name: 'Compuerta', keys: ['comp_limpieza', 'comp_ruidos'] },
        { name: 'Puente', keys: ['puente_despl', 'puente_rasquetas', 'puente_anomalias', 'puente_guias', 'puente_fcarrera', 'puente_rozamientos', 'puente_lonas', 'puente_sujeciones'] },
        { name: 'Bomba', keys: ['bomba_func', 'bomba_ruidos'] },
        { name: 'Aireadores', keys: ['aireadores_ruidos'] },
        { name: 'Grasas', keys: ['grasas_limpieza', 'grasas_ruidos', 'grasas_electrov'] }
    ];
    const contObsKeys = ['cont_tubo_agua', 'cont_retirar_agua', 'cont_vaciado_gavetas'];

    letters.forEach(L => obsSections.forEach(s => headers.push(`${L} - Obs ${s.name}`)));
    headers.push('Contenedor - Obs');
    headers.push('Observaciones', 'Fecha/Hora registro');

    return {
        headers,
        data: list.map(record => {
            const row = {
                'Fecha': record.fecha,
                'Turno': record.turno,
                'Operario 1': record.operario1,
                'Operario 2': record.operario2 || ''
            };
            letters.forEach(L => {
                const d = record[`desarenador_${L}`] || {};
                const ah = (d.aireadores && d.aireadores.horas) ? d.aireadores.horas : {};
                deviceCols.forEach(([name, group, field]) => {
                    let value = (group === 'aireadores_horas')
                        ? ah[field]
                        : (d[group] || {})[field];
                    row[`${L} - ${name}`] = value == null ? '' : value;
                });
            });
            const cont = record.contenedor_arenas_grasas || {};
            sharedCols.forEach(([name, field]) => {
                row[name] = cont[field] == null ? '' : cont[field];
            });
            const obs = record.observaciones_campo || {};
            letters.forEach(L => {
                const l = L.toLowerCase();
                obsSections.forEach(s => {
                    const vals = s.keys
                        .map(k => obs[`${l}_${k}`])
                        .filter(v => v && v.trim());
                    row[`${L} - Obs ${s.name}`] = vals.join('; ');
                });
            });
            const contObsVals = contObsKeys
                .map(k => obs[k])
                .filter(v => v && v.trim());
            row['Contenedor - Obs'] = contObsVals.join('; ');
            row['Observaciones'] = record.observaciones_generales || '';
            row['Fecha/Hora registro'] = record.timestamp;
            return row;
        })
    };
}

function exportExcel() {
    const list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
    if (list.length === 0) {
        alert('No hay registros guardados para exportar.');
        return;
    }
    const { headers, data } = buildExcelRows(list);
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 4, 12) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `checklist_desarenadores_${fecha}.xlsx`);
}

function loadSavedRecords() {
    const list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
    const container = document.getElementById('savedRecordsTable');
    if (list.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No hay registros guardados aun.</p>';
        return;
    }
    let html = `<table><thead><tr><th>Fecha</th><th>Turno</th><th>Operario 1</th><th>Operario 2</th><th>Acciones</th></tr></thead><tbody>`;
    list.forEach((item, index) => {
        html += `<tr>
            <td>${item.fecha}</td>
            <td>${item.turno}</td>
            <td>${item.operario1}</td>
            <td>${item.operario2 || ''}</td>
            <td>
                <button class="btn btn-primary" style="padding:4px 8px; font-size:0.8rem;" onclick="downloadSingleJSON(${index})">JSON</button>
                <button class="btn btn-success" style="padding:4px 8px; font-size:0.8rem;" onclick="loadRecord(${index})">Cargar</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function downloadSingleJSON(index) {
    const list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
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
        var list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
        var r = list[index];
        if (!r) { alert('Registro no encontrado.'); return; }
        if (!confirm('Cargar registro del ' + r.fecha + ' (' + (r.turno || '') + ')? Se perderán los datos actuales del formulario.')) { loadingRecord = false; return; }

        document.getElementById('fecha').value = r.fecha || '';
        document.getElementById('turno').value = r.turno || '';
        document.getElementById('operario1').value = r.operario1 || '';
        filterOperario2();
        document.getElementById('operario2').value = r.operario2 || '';
        document.getElementById('observaciones_generales').value = r.observaciones_generales || '';

        var obs = r.observaciones_campo || {};

        function setRadio(name, value) {
            if (!value) return;
            var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
            if (el) el.checked = true;
        }

        function setCheckboxes(name, csv) {
            document.querySelectorAll('input[name="' + name + '"]').forEach(function(cb) { cb.checked = false; });
            if (!csv) return;
            csv.split(',').forEach(function(v) {
                var trimmed = v.trim();
                var el = document.querySelector('input[name="' + name + '"][value="' + trimmed + '"]');
                if (el) el.checked = true;
            });
        }

        function setInput(id, value) {
            var el = document.getElementById(id);
            if (el && value != null && value !== '') el.value = value;
        }

        function setObsInput(radioName, value) {
            if (!value) return;
            var radio = document.querySelector('input[name="' + radioName + '"]');
            if (!radio) return;
            var row = radio.closest('tr');
            if (!row) return;
            var obsInput = row.querySelector('.obs-input');
            if (obsInput) obsInput.value = value;
        }

        function findCard(firstInputName) {
            var el = document.querySelector('input[name="' + firstInputName + '"]');
            return el ? el.closest('.card') : null;
        }

        function setSectionStatus(card, status) {
            if (!card) return;
            var sel = card.querySelector('.status-select');
            if (sel) {
                sel.value = status || 'funcionando';
                toggleEquipment(sel);
            }
        }

    ['A', 'B', 'C'].forEach(function(L) {
        var l = L.toLowerCase();
        var d = r['desarenador_' + L] || {};

        var comp = d.compuerta_entrada || {};
        setSectionStatus(findCard(l + '_comp_scada'), comp.estado);
        setCheckboxes(l + '_comp_scada', comp.scada);
        setRadio(l + '_comp_limpieza', comp.limpieza);
        setRadio(l + '_comp_ruidos', comp.ruidos);
        setInput(l + '_comp_arranques', comp.arranques);
        setObsInput(l + '_comp_limpieza', obs[l + '_comp_limpieza']);
        setObsInput(l + '_comp_ruidos', obs[l + '_comp_ruidos']);

        var pte = d.puente || {};
        setSectionStatus(findCard(l + '_puente_scada'), pte.estado);
        setCheckboxes(l + '_puente_scada', pte.scada);
        setInput(l + '_puente_horas', pte.horas);
        setRadio(l + '_puente_despl', pte.desplazamiento);
        setRadio(l + '_puente_rasquetas', pte.rasquetas);
        setRadio(l + '_puente_anomalias', pte.anomalias);
        setRadio(l + '_puente_guias', pte.guias_ruedas);
        setRadio(l + '_puente_fcarrera', pte.finales_carrera);
        setRadio(l + '_puente_rozamientos', pte.rozamientos);
        setRadio(l + '_puente_lonas', pte.lonas_limpias);
        setRadio(l + '_puente_sujeciones', pte.lonas_sujeciones);
        setObsInput(l + '_puente_despl', obs[l + '_puente_despl']);
        setObsInput(l + '_puente_rasquetas', obs[l + '_puente_rasquetas']);
        setObsInput(l + '_puente_anomalias', obs[l + '_puente_anomalias']);
        setObsInput(l + '_puente_guias', obs[l + '_puente_guias']);
        setObsInput(l + '_puente_fcarrera', obs[l + '_puente_fcarrera']);
        setObsInput(l + '_puente_rozamientos', obs[l + '_puente_rozamientos']);
        setObsInput(l + '_puente_lonas', obs[l + '_puente_lonas']);
        setObsInput(l + '_puente_sujeciones', obs[l + '_puente_sujeciones']);

        var bomba = d.bomba_arenas || {};
        setSectionStatus(findCard(l + '_bomba_func'), bomba.estado);
        setRadio(l + '_bomba_func', bomba.funcionamiento);
        setRadio(l + '_bomba_ruidos', bomba.ruidos_fugas);
        setObsInput(l + '_bomba_func', obs[l + '_bomba_func']);
        setObsInput(l + '_bomba_ruidos', obs[l + '_bomba_ruidos']);

        var air = d.aireadores || {};
        setSectionStatus(findCard(l + '_aireadores_scada'), air.estado);
        setCheckboxes(l + '_aireadores_scada', air.scada);
        setRadio(l + '_aireadores_ruidos', air.ruidos);
        var ah = air.horas || {};
        setInput(l + '_horas_a', ah.a);
        setInput(l + '_horas_b', ah.b);
        setInput(l + '_horas_c', ah.c);
        setInput(l + '_horas_d', ah.d);
        setInput(l + '_horas_e', ah.e);
        setObsInput(l + '_aireadores_ruidos', obs[l + '_aireadores_ruidos']);

        var grasas = d.compuerta_grasas || {};
        setSectionStatus(findCard(l + '_grasas_scada'), grasas.estado);
        setCheckboxes(l + '_grasas_scada', grasas.scada);
        setInput(l + '_grasas_arranques1', grasas.arranques);
        setRadio(l + '_grasas_limpieza', grasas.limpieza);
        setRadio(l + '_grasas_ruidos', grasas.ruidos);
        setRadio(l + '_grasas_electrov', grasas.electrovalvula);
        setInput(l + '_grasas_arranques2', grasas.electrovalvula_arranques);
        setObsInput(l + '_grasas_limpieza', obs[l + '_grasas_limpieza']);
        setObsInput(l + '_grasas_ruidos', obs[l + '_grasas_ruidos']);
        setObsInput(l + '_grasas_electrov', obs[l + '_grasas_electrov']);
    });

    var cont = r.contenedor_arenas_grasas || {};
    var contCard = document.querySelector('#contenedor .card');
    setSectionStatus(contCard, cont.estado);
    setRadio('cont_tubo_agua', cont.tubo_agua);
    setRadio('cont_retirar_agua', cont.retirar_agua);
    setInput('cont_cant_agua', cont.cant_agua);
    setRadio('cont_vaciado_gavetas', cont.vaciado_gavetas);
    setInput('cont_cant_gavetas', cont.cant_gavetas);
    setObsInput('cont_tubo_agua', obs.cont_tubo_agua);
    setObsInput('cont_retirar_agua', obs.cont_retirar_agua);
    setObsInput('cont_vaciado_gavetas', obs.cont_vaciado_gavetas);

    switchTab('desarenadorA');
    alert('Registro cargado correctamente.');
    } catch(e) {
        alert('Error al cargar el registro: ' + e.message);
    }
    loadingRecord = false;
}

function loadPreviousHours() {
    const list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
    if (list.length === 0) return;
    const prev = list[list.length - 1];
    const hourFields = [
        'a_puente_horas', 'b_puente_horas', 'c_puente_horas',
        'a_horas_a', 'a_horas_b', 'a_horas_c', 'a_horas_d', 'a_horas_e',
        'b_horas_a', 'b_horas_b', 'b_horas_c', 'b_horas_d', 'b_horas_e',
        'c_horas_a', 'c_horas_b', 'c_horas_c', 'c_horas_d', 'c_horas_e'
    ];
    const map = {};
    if (prev.desarenador_A) {
        map['a_puente_horas'] = prev.desarenador_A.puente && prev.desarenador_A.puente.horas;
        map['a_horas_a'] = prev.desarenador_A.aireadores && prev.desarenador_A.aireadores.horas && prev.desarenador_A.aireadores.horas.a;
        map['a_horas_b'] = prev.desarenador_A.aireadores && prev.desarenador_A.aireadores.horas && prev.desarenador_A.aireadores.horas.b;
        map['a_horas_c'] = prev.desarenador_A.aireadores && prev.desarenador_A.aireadores.horas && prev.desarenador_A.aireadores.horas.c;
        map['a_horas_d'] = prev.desarenador_A.aireadores && prev.desarenador_A.aireadores.horas && prev.desarenador_A.aireadores.horas.d;
        map['a_horas_e'] = prev.desarenador_A.aireadores && prev.desarenador_A.aireadores.horas && prev.desarenador_A.aireadores.horas.e;
    }
    if (prev.desarenador_B) {
        map['b_puente_horas'] = prev.desarenador_B.puente && prev.desarenador_B.puente.horas;
        map['b_horas_a'] = prev.desarenador_B.aireadores && prev.desarenador_B.aireadores.horas && prev.desarenador_B.aireadores.horas.a;
        map['b_horas_b'] = prev.desarenador_B.aireadores && prev.desarenador_B.aireadores.horas && prev.desarenador_B.aireadores.horas.b;
        map['b_horas_c'] = prev.desarenador_B.aireadores && prev.desarenador_B.aireadores.horas && prev.desarenador_B.aireadores.horas.c;
        map['b_horas_d'] = prev.desarenador_B.aireadores && prev.desarenador_B.aireadores.horas && prev.desarenador_B.aireadores.horas.d;
        map['b_horas_e'] = prev.desarenador_B.aireadores && prev.desarenador_B.aireadores.horas && prev.desarenador_B.aireadores.horas.e;
    }
    if (prev.desarenador_C) {
        map['c_puente_horas'] = prev.desarenador_C.puente && prev.desarenador_C.puente.horas;
        map['c_horas_a'] = prev.desarenador_C.aireadores && prev.desarenador_C.aireadores.horas && prev.desarenador_C.aireadores.horas.a;
        map['c_horas_b'] = prev.desarenador_C.aireadores && prev.desarenador_C.aireadores.horas && prev.desarenador_C.aireadores.horas.b;
        map['c_horas_c'] = prev.desarenador_C.aireadores && prev.desarenador_C.aireadores.horas && prev.desarenador_C.aireadores.horas.c;
        map['c_horas_d'] = prev.desarenador_C.aireadores && prev.desarenador_C.aireadores.horas && prev.desarenador_C.aireadores.horas.d;
        map['c_horas_e'] = prev.desarenador_C.aireadores && prev.desarenador_C.aireadores.horas && prev.desarenador_C.aireadores.horas.e;
    }
    for (const [id, val] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el && val != null && val !== '') el.value = val;
    }
}

function showReviewModal(data) {
    var list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
    var warnings = validateHours(data, list);

    var html = '';
    html += '<div class="section-title">Datos del Turno</div>';
    html += reviewRow('Fecha', data.fecha);
    html += reviewRow('Turno', data.turno);
    html += reviewRow('Operario 1', data.operario1);
    html += reviewRow('Operario 2', data.operario2 || '---');

    var letters = ['A', 'B', 'C'];
    letters.forEach(function(L) {
        var d = data['desarenador_' + L] || {};
        html += '<div class="section-title">Desarenador ' + L + '</div>';
        var comp = d.compuerta_entrada || {};
        html += reviewRow('Compuerta - Estado', comp.estado);
        html += reviewRow('Compuerta - SCADA', comp.scada || '---');
        html += reviewRow('Compuerta - Arranques', comp.arranques || '---');
        var pte = d.puente || {};
        html += reviewRow('Puente - Estado', pte.estado);
        html += reviewRow('Puente - Horas', pte.horas || '---');
        var air = d.aireadores || {};
        html += reviewRow('Aireadores - Estado', air.estado);
        var ah = air.horas || {};
        html += reviewRow('Aireadores - Horas', (ah.a||'-') + ' / ' + (ah.b||'-') + ' / ' + (ah.c||'-') + ' / ' + (ah.d||'-') + ' / ' + (ah.e||'-'));
        var grasas = d.compuerta_grasas || {};
        html += reviewRow('Grasas - Estado', grasas.estado);
        html += reviewRow('Grasas - Arranques', grasas.arranques || '---');
    });

    html += '<div class="section-title">Contenedor</div>';
    var cont = data.contenedor_arenas_grasas || {};
    html += reviewRow('Estado', cont.estado);
    html += reviewRow('Cant. agua extraida', cont.cant_agua || '---');
    html += reviewRow('Cant. gavetas', cont.cant_gavetas || '---');

    var obsText = data.observaciones_generales || '';
    if (obsText) {
        html += '<div class="section-title">Observaciones</div>';
        html += '<p style="font-size:0.88rem;">' + obsText + '</p>';
    }

    document.getElementById('reviewContent').innerHTML = html;

    var warnHtml = '';
    if (warnings.length > 0) {
        warnings.forEach(function(w) {
            warnHtml += '<div class="warning-box"><strong>Atencion:</strong> ' + w + '</div>';
        });
    }
    document.getElementById('reviewWarnings').innerHTML = warnHtml;

    document.getElementById('reviewModal').classList.add('active');
}

function reviewRow(label, value) {
    return '<div class="review-row"><span class="label">' + label + '</span><span class="value">' + (value || '---') + '</span></div>';
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.remove('active');
    pendingSaveData = null;
}

function confirmSave() {
    if (!pendingSaveData) return;
    var list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
    list.push(pendingSaveData);
    localStorage.setItem('desarenadores_data', JSON.stringify(list));
    closeReviewModal();
    alert('Datos guardados con exito.');
    pendingSaveData = null;
}

function validateHours(data, list) {
    var warnings = [];
    if (list.length < 2) return warnings;

    var prev = list[list.length - 1];
    var letters = ['A', 'B', 'C'];

    letters.forEach(function(L) {
        var d = data['desarenador_' + L] || {};
        var p = prev['desarenador_' + L] || {};

        var newPuenteH = parseFloat((d.puente || {}).horas);
        var oldPuenteH = parseFloat((p.puente || {}).horas);
        if (!isNaN(newPuenteH) && !isNaN(oldPuenteH) && oldPuenteH > 0) {
            var diff = Math.abs(newPuenteH - oldPuenteH);
            if (diff > oldPuenteH * 0.5) {
                warnings.push('Desarenador ' + L + ' - Puente horas: ' + oldPuenteH + ' &rarr; ' + newPuenteH + ' (variacion de ' + diff.toFixed(1) + 'h). Verifique que es correcto.');
            }
        }

        var newAir = ((d.aireadores || {}).horas || {});
        var oldAir = ((p.aireadores || {}).horas || {});
        ['a', 'b', 'c', 'd', 'e'].forEach(function(k) {
            var nv = parseFloat(newAir[k]);
            var ov = parseFloat(oldAir[k]);
            if (!isNaN(nv) && !isNaN(ov) && ov > 0) {
                var dif = Math.abs(nv - ov);
                if (dif > ov * 0.5) {
                    warnings.push('Desarenador ' + L + ' - Aireador ' + k.toUpperCase() + ' horas: ' + ov + ' &rarr; ' + nv + ' (variacion de ' + dif.toFixed(1) + 'h). Verifique.');
                }
            }
        });

        var newCompArr = parseInt((d.compuerta_entrada || {}).arranques);
        var oldCompArr = parseInt((p.compuerta_entrada || {}).arranques);
        if (!isNaN(newCompArr) && !isNaN(oldCompArr) && oldCompArr > 0) {
            var diffA = Math.abs(newCompArr - oldCompArr);
            if (diffA > oldCompArr * 0.5) {
                warnings.push('Desarenador ' + L + ' - Compuerta arranques: ' + oldCompArr + ' &rarr; ' + newCompArr + ' (variacion de ' + diffA + '). Verifique.');
            }
        }
    });

    return warnings;
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
    } else {
        document.getElementById('loginError').style.display = '';
    }
}

function adminLogout() {
    adminAutenticado = false;
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    document.getElementById('loginGate').style.display = '';
    document.getElementById('recordsPanel').style.display = 'none';
}

function autoLoadPreviousDay() {
    var list = JSON.parse(localStorage.getItem('desarenadores_data') || '[]');
    if (list.length === 0) return;
    var now = new Date();
    var hour = now.getHours();
    if (hour >= 6 && hour < 14) {
        var prev = list[list.length - 1];
        if (prev && prev.fecha) {
            document.getElementById('turno').value = prev.turno || '';
            document.getElementById('operario1').value = prev.operario1 || '';
            filterOperario2();
            document.getElementById('operario2').value = prev.operario2 || '';
            var letters = ['A', 'B', 'C'];
            letters.forEach(function(L) {
                var l = L.toLowerCase();
                var d = prev['desarenador_' + L] || {};
                var pte = d.puente || {};
                if (pte.horas) { var el = document.getElementById(l + '_puente_horas'); if (el) el.value = pte.horas; }
                var ah = (d.aireadores || {}).horas || {};
                ['a', 'b', 'c', 'd', 'e'].forEach(function(k) {
                    if (ah[k]) { var e = document.getElementById(l + '_horas_' + k); if (e) e.value = ah[k]; }
                });
            });
        }
    }
}

function resetForm() {
    if (confirm('Desea limpiar todos los campos del formulario?')) {
        document.getElementById('checklistForm').reset();
        document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.scada-group').forEach(g => g.classList.remove('has-error'));
        var sel2 = document.getElementById('operario2');
        for (var i = 1; i < sel2.options.length; i++) {
            sel2.options[i].disabled = false;
        }
    }
}

document.getElementById('fecha').addEventListener('change', function () {
    if (loadingRecord) return;
    const prevFecha = this.dataset.prevFecha;
    if (prevFecha && prevFecha !== this.value) {
        if (confirm('Cambio de fecha detectado. Desea cargar las horas del registro anterior?')) {
            loadPreviousHours();
        }
    }
    this.dataset.prevFecha = this.value;
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('fecha').dataset.prevFecha = document.getElementById('fecha').value;
    document.querySelectorAll('.scada-group input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function () {
            const group = this.closest('.scada-group');
            const checked = group.querySelectorAll('input[type="checkbox"]:checked').length;
            if (checked > 2) {
                this.checked = false;
            }
            if (checked === 2) {
                group.classList.remove('has-error');
            }
        });
    });
    autoLoadPreviousDay();
});