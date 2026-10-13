document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrlParam = urlParams.get('url');
    const viewMode = urlParams.get('view');
    const rawParameters = urlParams.get('parameters');

    // Получаем элементы
    const container = document.getElementById('iframe-container');
    const iframe = document.getElementById('target-iframe');
    const loader = document.getElementById('loader');
    const errorNotice = document.getElementById('error-notice');
    
    // ВАЖНО: Проверяем кнопку отдельно, чтобы избежать ошибки null
    const bypassLink = document.getElementById('bypass-link'); 
    const statusBadge = document.getElementById('status-badge');
    const guiControls = document.getElementById('gui-controls');

    // Если нет iframe или кнопки-заглушки — смысла продолжать нет
    if (!iframe) {
        console.error('Элемент #target-iframe не найден. Проверьте HTML.');
        return;
    }

    if (!targetUrlParam) {
        if (loader) loader.innerText = 'Ошибка: не указан параметр "url"';
        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            const h3 = errorNotice.querySelector('h3');
            if (h3) h3.innerText = '⚠️ Ошибка конфигурации';
        }
        return;
    }

    let cleanUrl = targetUrlParam.trim();

    // Нормализация URL
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
    }

    // Валидация URL
    try {
        const parsed = new URL(cleanUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Недопустимый протокол');
        }
    } catch (e) {
        console.error('Некорректный URL', e);
        if (loader) loader.innerText = 'Ошибка: недопустимый адрес сайта';
        if (errorNotice) errorNotice.classList.remove('hidden');
        return;
    }

    // Обработка параметров (nocontrols, free, site)
    if (rawParameters) {
        const paramsArray = rawParameters.split(';');
        paramsArray.forEach(param => {
            const cleanParam = param.trim().toLowerCase();
            switch (cleanParam) {
                case 'nocontrols':
                case 'disableiframegui':
                    if (guiControls) guiControls.style.display = 'none';
                    break;
                case 'site':
                    if (container) container.classList.add('site-mode');
                    break;
                case 'free':
                    if (statusBadge) statusBadge.innerText = 'Бесплатно';
                    if (container) container.classList.add('free-mode');
                    break;
            }
        });
    }

    if (viewMode === 'true') {
        document.title = `Просмотр: ${cleanUrl}`;
    }

    // --- ЛОГИКА IFRAME ---
    if (loader) loader.style.display = 'block';
    iframe.src = cleanUrl;

    iframe.onload = () => {
        if (loader) loader.style.display = 'none';
        if (container) container.classList.add('loaded');
        console.log('Iframe успешно загружен');
    };

    iframe.onerror = handleIframeError;

    function handleIframeError() {
        if (loader) loader.style.display = 'none';

        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            
            // 👇 ВОТ ЗДЕСЬ БЫЛА ОШИБКА: теперь проверяем bypassLink перед использованием
            if (bypassLink) {
                bypassLink.href = cleanUrl;
                bypassLink.innerText = 'Открыть сайт в новой вкладке';
                bypassLink.target = '_blank';
                bypassLink.rel = 'noopener noreferrer';
            } else {
                console.warn('Элемент #bypass-link не найден! Кнопка перехода не будет создана.');
            }

            const h3 = errorNotice.querySelector('h3');
            const p = errorNotice.querySelector('p');
            if (h3) h3.innerText = '⚠️ Контент заблокирован браузером';
            if (p) {
                p.innerText = 'Сайт запрещает встраивание. Используйте кнопку ниже для перехода.';
            }
        }
        console.warn('Iframe не смог загрузить контент.');
    }
});
