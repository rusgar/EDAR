var DB = (function() {
    var STORAGE_KEY = 'edar_noche_data';
    var BACKUP_KEY = 'edar_noche_last_backup';

    function getAll() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            var list = JSON.parse(raw);
            return Array.isArray(list) ? list : [];
        } catch(e) {
            console.error('Error leyendo localStorage:', e);
            return [];
        }
    }

    function saveAll(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            localStorage.setItem(BACKUP_KEY, new Date().toISOString());
            return true;
        } catch(e) {
            console.error('Error guardando en localStorage:', e);
            alert('Error al guardar. El almacenamiento del navegador puede estar lleno.');
            return false;
        }
    }

    function addRecord(record) {
        var list = getAll();
        list.push(record);
        return saveAll(list);
    }

    function exportToFile() {
        var list = getAll();
        if (list.length === 0) return;
        try {
            var jsonStr = JSON.stringify(list, null, 2);
            var blob = new Blob([jsonStr], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            var fecha = new Date().toISOString().split('T')[0];
            a.download = 'edar_backup_' + fecha + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            localStorage.setItem(BACKUP_KEY, new Date().toISOString());
        } catch(e) {
            console.error('Error exportando:', e);
        }
    }

    function importFromFile(file, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var list = JSON.parse(e.target.result);
                if (!Array.isArray(list)) {
                    alert('Formato de archivo no valido.');
                    if (callback) callback(false);
                    return;
                }
                var ok = saveAll(list);
                if (ok) {
                    alert('Se importaron ' + list.length + ' registros correctamente.');
                } else {
                    alert('Error al importar los datos.');
                }
                if (callback) callback(ok);
            } catch(err) {
                alert('Error al leer el archivo: ' + err.message);
                if (callback) callback(false);
            }
        };
        reader.readAsText(file);
    }

    function updateBackupStatus() {
        var el = document.getElementById('backupStatus');
        if (!el) return;
        var last = localStorage.getItem(BACKUP_KEY);
        if (last) {
            var d = new Date(last);
            el.textContent = 'Ultimo guardado: ' + d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES');
            el.style.display = '';
        } else {
            el.textContent = '';
            el.style.display = 'none';
        }
    }

    function getLocalBackup() {
        return getAll();
    }

    return {
        getAll: function(callback) {
            var result = getAll();
            if (callback) callback(result);
            return result;
        },
        saveAll: function(list, callback) {
            var ok = saveAll(list);
            if (callback) callback(ok);
            return ok;
        },
        addRecord: function(record, callback) {
            var ok = addRecord(record);
            if (callback) callback(ok);
            return ok;
        },
        exportToFile: exportToFile,
        importFromFile: importFromFile,
        updateBackupStatus: updateBackupStatus,
        getLocalBackup: getLocalBackup
    };
})();

