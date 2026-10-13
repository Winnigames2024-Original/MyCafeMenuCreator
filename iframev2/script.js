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
        // Очищаем пробелы и принудительно переводим в корректный вид
        targetUrl = targetUrl.trim();
        
        // Устанавливаем прямую ссылку на кнопку "Разрешить доступ" на всякий случай
        bypassLink.href = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

        // Обход блокировок (Mixed Content / X-Frame-Options) через публичный анонимайзер-прокси
        // Этот прокси принимает HTTPS запрос от GitHub Pages и отображает ваш HTTP/HTTPS сайт без блокировок браузера
        const proxyUrl = `https://corsproxy.io{encodeURIComponent(targetUrl)}`;
        
        iframe.src = proxyUrl;
    } else {
        document.getElementById('loader').innerText = "Ошибка: URL не указан";
        return;
    }

    // Если iframe успешно обработал адрес
    iframe.addEventListener('load', () => {
        isIframeLoaded = true;
        container.classList.add('loaded');
        errorNotice.classList.add('hidden'); 
    });

    // Функция показа ошибки, если прокси тоже не справился за 4 секунды
    function showError() {
        container.classList.add('loaded');
        errorNotice.classList.remove('hidden'); 
    }

    setTimeout(() => {
        if (!isIframeLoaded) {
            showError();
        }
    }, 4000);

    // Разбор параметров (оставляем без изменений)
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
