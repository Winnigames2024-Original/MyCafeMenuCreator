document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    let targetUrl = urlParams.get('url'); 
    const viewMode = urlParams.get('view'); 
    const rawParameters = urlParams.get('parameters'); 

    const container = document.getElementById('iframe-container');
    const iframe = document.getElementById('target-iframe');
    const badge = document.getElementById('status-badge');
    const errorNotice = document.getElementById('error-notice');
    const bypassLink = document.getElementById('bypass-link');

    let isIframeLoaded = false;

    if (targetUrl) {
        targetUrl = targetUrl.trim();
        
        // Кнопка прямой ссылки на случай сбоя
        bypassLink.href = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

        // Исправленный обход Mixed Content / SSL блокировок через corsproxy.io
        let cleanUrl = targetUrl;
        if (!cleanUrl.startsWith('http')) {
            cleanUrl = `https://${cleanUrl}`;
        }

        const wrappedUrl = `https://corsproxy.io{encodeURIComponent(cleanUrl)}`;
        
        console.log("Загрузка через HTTPS-прокси:", wrappedUrl);
        iframe.src = wrappedUrl;
    } else {
        document.getElementById('loader').innerText = "Ошибка: URL не указан";
        return;
    }

    // Обработка успешного ответа от прокси
    iframe.addEventListener('load', () => {
        isIframeLoaded = true;
        if (container) container.classList.add('loaded');
        if (errorNotice) errorNotice.classList.add('hidden'); 
    });

    // Резервный таймер отображения заглушки (если прокси не ответил за 4 секунды)
    setTimeout(() => {
        if (!isIframeLoaded) {
            if (container) container.classList.add('loaded');
            if (errorNotice) errorNotice.classList.remove('hidden'); 
        }
    }, 4000);

    // Разбор остальных параметров вашего URL
    if (rawParameters) {
        const paramsArray = rawParameters.split(';');
        paramsArray.forEach(param => {
            const cleanParam = param.trim().toLowerCase();
            switch (cleanParam) {
                case 'nocontrols':
                case 'disableiframegui':
                    if (container) container.classList.add('hide-gui');
                    break;
                case 'site':
                    if (container) container.classList.add('site-mode');
                    break;
                case 'free':
                    if (container) container.classList.add('free-mode');
                    if (badge) badge.innerText = "Бесплатно";
                    break;
            }
        });
    }

    if (viewMode === 'true' && targetUrl) {
        document.title = `Просмотр: ${targetUrl}`;
    }
});
