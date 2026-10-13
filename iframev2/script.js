document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const targetUrl = urlParams.get('url'); 
    const viewMode = urlParams.get('view'); 
    const rawParameters = urlParams.get('parameters'); 

    const container = document.getElementById('iframe-container');
    const iframe = document.getElementById('target-iframe');
    const badge = document.getElementById('status-badge');
    const errorNotice = document.getElementById('error-notice');
    const bypassLink = document.getElementById('bypass-link');

    let isIframeLoaded = false;

    // 2. Валидация и установка URL в iframe
if (targetUrl) {
    let cleanUrl = targetUrl.trim();
    
    // Если передан чистый http://, принудительно перенаправляем через публичный HTTPS-прокси
    if (cleanUrl.startsWith('http://')) {
        console.warn("Обнаружен небезопасный HTTP URL. Используем HTTPS-прокси для обхода Mixed Content.");
        // Используем один из публичных прокси-серверов анонимайзеров/зеркал (например, через images/iframe-отзеркаливание)
        // Для полноценных сайтов лучше использовать специализированный reverse-proxy, либо просто убрать http://
        cleanUrl = cleanUrl.replace('http://', 'https://'); 
    } else if (!cleanUrl.startsWith('http')) {
        cleanUrl = `https://${cleanUrl}`;
    }
    
    iframe.src = cleanUrl;
    bypassLink.href = cleanUrl;
} else {
    document.getElementById('loader').innerText = "Ошибка: URL не указан";
    return;
}


    // Если iframe смог успешно загрузиться
    iframe.addEventListener('load', () => {
        isIframeLoaded = true;
        // Проверяем, не пустой ли iframe из-за блокировки браузера
        try {
            if (iframe.contentWindow.location.href === "about:blank") {
                // Если браузер заблокировал загрузку, адрес сбросится
                showError();
            } else {
                container.classList.add('loaded');
                errorNotice.classList.add('hidden');
            }
        } catch (e) {
            // Если сработал Cross-Origin (сайт начал загружаться, но упал по SSL)
            container.classList.add('loaded');
            errorNotice.classList.add('hidden');
        }
    });

    // Функция вывода заглушки с кнопкой перехода
    function showError() {
        container.classList.add('loaded'); // убираем бесконечный спиннер
        errorNotice.classList.remove('hidden'); // показываем кнопку помощи
    }

    // Жесткий таймаут: если за 3 секунды сайт вообще не подал признаков жизни
    setTimeout(() => {
        if (!isIframeLoaded) {
            showError();
        }
    }, 3000);

    // Разбор параметров
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
