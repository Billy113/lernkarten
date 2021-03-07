const DBN = 'lernkarten';
const DBV_VERSION = 2;
const STORES = ["user", "cats"];
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
    updateCats(cats) {
        this.cats().then( storedCats => {
            for(let cat of cats) {
                if(!(this.arrayIncludes(storedCats, cat.name))){
                    cat.selected = false;
                    this.store("cats", cat);
                }
            }
        })
    }

    arrayIncludes(array,name) {
        for(let arrName of array) {
            if(arrName.name == name){
                 return true;
            }
        }
        return false;
    }
    logIn(name) {
        this.store("user", name, 1);
    }
    logout() {
        this.emptyDatabase("user");
    }
    cats() {
        return new Promise(resolve => {
            this.readAsPromise("cats").then(cats => {
                resolve(cats);
            })
        })
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
        return new Promise (resolve => {
            let request = window.indexedDB.open(DBN, DBV_VERSION), db, tx, store;
            request.onsuccess = e => {
                db = request.result;
                tx = db.transaction(name, 'readwrite');
                store = tx.objectStore(name);
                store.clear();
                resolve();
                db.onerror = e => {
                    console.log('DB error: ' + e.target.errorCode);
                    resolve();
                };
            };
        })
    }
    emptyDatabases() {
        STORES.forEach(name => {
            this.emptyDatabase(name);
        });
    }
    toggleCat(catName) {
        return new Promise(resolve => {
            this.getCatKey(catName).then(key => {
                this.readAsPromise("cats").then(cats => {
                    for(let i = 0; i<cats.length; i++) {
                        if(cats[i].name == catName) {
                            cats[i].selected = !cats[i].selected;
                            this.store("cats", cats[i], key[i])
                            resolve(cats[i].selected);
                        }
                    }
                    resolve();
                })
            });
        })
    }
    getCatKey() {
        return new Promise(resolve => {
            let request = window.indexedDB.open(DBN, DBV_VERSION), db, tx, store, index;
            request.onsuccess = (e) => {
            db = request.result;
            tx = db.transaction("cats", 'readonly');
            store = tx.objectStore("cats");
            let getAllKeysRequest = store.getAllKeys();
                getAllKeysRequest.onsuccess = function() {

                resolve(getAllKeysRequest.result)
            }
            }
        })
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
            request.onupgradeneeded = e => {
                this.createObjectStores(request.result);
            };

        });
    }
}