const DBN = 'lernkarten';
const DBV_VERSION = 1;
const STORES = ["user"];
class IndexedDbHandler {
    constructor() {
    }
    createObjectStores(db) {
        STORES.forEach(storename => {
            if (!db.objectStoreNames.contains(storename)) {
                db.createObjectStore(storename, {autoIncrement: true});
            }
        });
    }
    logIn(name) {
        this.store("user", name, 1);
    }
    logout() {
        this.emptyDatabase("user");
    }
    loggedIn() {
        return new Promise(resolve => {
            this.readAsPromise("user",1).then(result => {
                    resolve (result)
            })
        })
    }
    store(objectstorename, data, key) {
        let request = window.indexedDB.open(DBN, DBV_VERSION), db, tx, store, index;
        request.onsuccess = e => {
            db = request.result;
            tx = db.transaction(objectstorename, 'readwrite');
            store = tx.objectStore(objectstorename);

            db.onerror = e => {
                console.log('DB error: ' + e.target.errorCode);
            };
            if (!key) {
                store.put(data);
            } else {
                store.put(data, key);
            }
            tx.oncomplete = e => {
                db.close();
            };
        };
        request.onerror = e => {
            console.log(e);
        };
        request.onupgradeneeded = e => {
            this.createObjectStores(request.result);
        };
    }
    emptyDatabase(name) {
        console.log('emptyDatbase ' + name);
        let request = window.indexedDB.open(DBN, DBV_VERSION), db, tx, store;

        request.onsuccess = e => {
            db = request.result;
            tx = db.transaction(name, 'readwrite');
            store = tx.objectStore(name);
            store.clear();

            db.onerror = e => {
                console.log('DB error: ' + e.target.errorCode);
            };
        };
    }
    emptyDatabases() {
        STORES.forEach(name => {
            this.emptyDatabase(name);
        });
    }
    readAsPromise(objectstorename, key, ...callbackparameters) {
        return new Promise( (resolve, reject) => {
            let request = window.indexedDB.open(DBN, DBV_VERSION), db, tx, store, index;
            request.onerror = e => { reject(e); };
            request.onupgradeneeded = () => {
                this.createObjectStores(request.result);
            };
            request.onsuccess = (e) => {
                db = request.result;
                tx = db.transaction(objectstorename, 'readonly');
                store = tx.objectStore(objectstorename);

                if (!key) {
                    let cursorObject = store.getAll();
                    cursorObject.onsuccess = e => { resolve(e.target.result, ...callbackparameters);};
                } else {
                    let cursorObject = store.get(key);
                    cursorObject.onsuccess = e => { resolve(e.target.result, ...callbackparameters);};
                }
            };

        });
    }
}