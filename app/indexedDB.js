// indexeddb.js
export const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('inventoryDB', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('IndexedDB failed to open'));
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
      };
    });
  };
  
  export const saveProductToIndexedDB = async (product) => {
    const db = await openIndexedDB();
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    store.put(product);
  };
  
  export const getProductsFromIndexedDB = async () => {
    const db = await openIndexedDB();
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const products = await store.getAll();
    return products;
  };
  
  export const clearProductsFromIndexedDB = async () => {
    const db = await openIndexedDB();
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    store.clear();
  };
  