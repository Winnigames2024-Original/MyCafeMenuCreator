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
        
        // Кнопка «Разрешить доступ» на всякий случай ведет на прямую ссылку
        bypassLink.href = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

        // === РЕШЕНИЕ БЕЗ CLOUDFLARE ===
        // Если сайт передается как http:// или просто без протокола, 
        // мы пропускаем его через бесплатный публичный HTTPS-прокси corsproxy.io.
        // Он берет контент вашего сайта, заворачивает в HTTPS и срезает заголовки блокировки iframe.
        
        let cleanUrl = targetUrl;
        if (!cleanUrl.startsWith('http')) {
            cleanUrl = `https://${cleanUrl}`;
        }

        // Подключаем прокси-обходчик
        const wrappedUrl = `https://corsproxy.io{encodeURIComponent(cleanUrl)}`;
        
        console.log("Загрузка через HTTPS-прокси:", wrappedUrl);
        iframe.src = wrappedUrl;
    } else {
        document.getElementById('loader').innerText = "Ошибка: URL не указан";
        return;
    }

    // Если iframe успешно загрузился через прокси
    iframe.addEventListener('load', () => {
        isIframeLoaded = true;
        container.classList.add('loaded');
        errorNotice.classList.add('hidden'); 
    });

    // Запасной таймаут: если прокси не ответил за 4 секунды, покажем кнопку ручного перехода
    setTimeout(() => {
        if (!isIframeLoaded) {
            container.classList.add('loaded');
            errorNotice.classList.remove('hidden'); 
        }
    }, 4000);

    // Разбор остальных ваших параметров (site, free, nocontrols)
    if (rawParameters) {
        const paramsArray = rawParameters.split(';');
        paramsArray.forEach(param => {
            const cleanParam = param.trim().toLowerCase();
            switch (cleanParam) {
                case 'nocontrols':
                case 'disableiframegui':
                    container.classList.add('hide-gui');
                    break;
                case 'site':
                    container.classList.add('site-mode');
                    break;
                case 'free':
                    container.classList.add('free-mode');
                    if (badge) badge.innerText = "Бесплатно";
                    break;
            }
        });
    }

    if (viewMode === 'true') {
        document.title = `Просмотр: ${targetUrl}`;
    }
});
