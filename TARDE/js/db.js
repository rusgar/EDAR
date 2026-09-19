var DB = (function() {
    var DB_NAME = 'EDAR_Checklist';
    var STORE_NAME = 'registros';
    var DB_VERSION = 1;
    var db = null;
    var ready = false;

    function open(callback) {
        if (db && ready) { callback(db); return; }
        try {
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function(e) {
                var database = e.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            req.onsuccess = function(e) {
                db = e.target.result;
                ready = true;
                callback(db);
            };
            req.onerror = function(e) {
                console.error('Error abriendo IndexedDB:', e);
                callback(null);
            };
        } catch(err) {
            console.error('Error IndexedDB:', err);
            callback(null);
        }
    }

    function getAll(callback) {
        open(function(database) {
            if (!database) { callback([]); return; }
            try {
                var tx = database.transaction(STORE_NAME, 'readonly');
                var store = tx.objectStore(STORE_NAME);
                var req = store.getAll();
                req.onsuccess = function() { callback(req.result || []); };
                req.onerror = function() { callback([]); };
            } catch(e) { callback([]); }
        });
    }

    function saveAll(list, callback) {
        open(function(database) {
            if (!database) { if (callback) callback(false); return; }
            try {
                var tx = database.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.clear();
                list.forEach(function(item) {
                    store.put(item);
                });
                tx.oncomplete = function() {
                    localStorage.setItem('edar_last_backup', new Date().toISOString());
                    if (callback) callback(true);
                };
                tx.onerror = function(e) {
                    console.error('Error guardando en IndexedDB:', e);
                    if (callback) callback(false);
                };
            } catch(e) {
                console.error('Error en saveAll:', e);
                if (callback) callback(false);
            }
        });
    }

    function addRecord(record, callback) {
        getAll(function(list) {
            list.push(record);
            saveAll(list, callback);
        });
    }

    function exportToFile() {
        getAll(function(list) {
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
                localStorage.setItem('edar_last_backup', new Date().toISOString());
            } catch(e) { console.error('Error exportando:', e); }
        });
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
                saveAll(list, function(ok) {
                    if (ok) {
                        alert('Se importaron ' + list.length + ' registros correctamente.');
                    } else {
                        alert('Error al importar los datos.');
                    }
                    if (callback) callback(ok);
                });
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
        var last = localStorage.getItem('edar_last_backup');
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
        try {
            var old = localStorage.getItem('desarenadores_data');
            if (!old) return null;
            var list = JSON.parse(old);
            if (!Array.isArray(list) || list.length === 0) return null;
            return list;
        } catch(e) { return null; }
    }

    return {
        open: open,
        getAll: getAll,
        saveAll: saveAll,
        addRecord: addRecord,
        exportToFile: exportToFile,
        importFromFile: importFromFile,
        updateBackupStatus: updateBackupStatus,
        getLocalBackup: getLocalBackup
    };
})();
