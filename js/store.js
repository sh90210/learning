// Everything is saved on the tablet in IndexedDB. Writes happen after every
// answer, so closing the app never loses more than the current tap.
const DB_NAME = 'learning-theo-tay';
const DB_VERSION = 1;
let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('events')) db.createObjectStore('events', { autoIncrement: true });
      if (!db.objectStoreNames.contains('recordings')) db.createObjectStore('recordings', { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let result;
    Promise.resolve(fn(s)).then((r) => { result = r; });
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

function reqP(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }

export const store = {
  async get(key, fallback = null) {
    const v = await tx('kv', 'readonly', (s) => reqP(s.get(key)));
    return v === undefined ? fallback : v;
  },
  set(key, value) { return tx('kv', 'readwrite', (s) => { s.put(value, key); }); },
  del(key) { return tx('kv', 'readwrite', (s) => { s.delete(key); }); },
  addEvent(ev) { return tx('events', 'readwrite', (s) => { s.add({ t: Date.now(), ...ev }); }); },
  allEvents() { return tx('events', 'readonly', (s) => reqP(s.getAll())); },
  addRecording(rec) { return tx('recordings', 'readwrite', (s) => reqP(s.add({ t: Date.now(), ...rec }))); },
  async allRecordings() {
    return tx('recordings', 'readonly', (s) => new Promise((res, rej) => {
      const out = [];
      const c = s.openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out.push({ key: cur.key, ...cur.value }); cur.continue(); } else res(out); };
      c.onerror = () => rej(c.error);
    }));
  },
  deleteRecording(key) { return tx('recordings', 'readwrite', (s) => { s.delete(key); }); },
  async allKV() {
    return tx('kv', 'readonly', (s) => new Promise((res, rej) => {
      const out = {};
      const c = s.openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); };
      c.onerror = () => rej(c.error);
    }));
  },
  async replaceAll({ kv, events }) {
    await tx('kv', 'readwrite', (s) => { s.clear(); for (const [k, v] of Object.entries(kv || {})) s.put(v, k); });
    await tx('events', 'readwrite', (s) => { s.clear(); for (const e of events || []) s.add(e); });
  },
  async persist() {
    try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch (e) { /* ignore */ }
    return false;
  }
};
