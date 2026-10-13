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

    // Устанавливаем ссылку для обхода ошибки (откроется в новой вкладке)
    if (targetUrl) {
        const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
        iframe.src = cleanUrl;
        bypassLink.href = cleanUrl;
    } else {
        document.getElementById('loader').innerText = "Ошибка: URL не указан";
        return;
    }

    // Если iframe успешно загрузился
    iframe.addEventListener('load', () => {
        isIframeLoaded = true;
        container.classList.add('loaded');
        errorNotice.classList.add('hidden'); // На всякий случай прячем ошибку
    });

    // Умный таймер ожидания загрузки (в обход ограничений браузера на ERR_CERT)
    setTimeout(() => {
        if (!isIframeLoaded) {
            // Если за 4 секунды iframe не загрузился, скорее всего сработал ERR_CERT_AUTHORITY_INVALID
            container.classList.add('loaded'); // убираем бесконечный лоадер
            errorNotice.classList.remove('hidden'); // показываем кнопку помощи
            console.warn("Подозрение на ошибку SSL-сертификата (нет ответа от фрейма).");
        }
    }, 4000); // 4 секунды ожидания

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
