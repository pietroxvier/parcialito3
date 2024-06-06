const CACHE_NAME = 'my-cache-v1';
const FILES_TO_CACHE = [
    '/progressbar.html',
    '/script/script2.js',
    '/styles/style2.css',
    // Adicione outros arquivos necessários para o cache aqui
];

// Instalando o service worker e cacheando os arquivos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Ativando o service worker e removendo caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Interceptando as requisições e retornando os arquivos do cache se possível
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate' && event.request.url.endsWith('/progressbar.html')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/progressbar.html');
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});
