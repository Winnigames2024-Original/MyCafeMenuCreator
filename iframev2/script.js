document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrlParam = urlParams.get('url');
    const viewMode = urlParams.get('view');
    const rawParameters = urlParams.get('parameters');

    // Получаем элементы. Если чего-то нет — просто не трогаем, скрипт не падает.
    const container = document.getElementById('iframe-container');
    const iframe = document.getElementById('target-iframe');
    const loader = document.getElementById('loader');
    const errorNotice = document.getElementById('error-notice');
    const bypassLink = document.getElementById('bypass-link');
    const statusBadge = document.getElementById('status-badge');
    const guiControls = document.getElementById('gui-controls');

    // Если нет самого iframe или кнопки-заглушки — смысла нет
    if (!iframe || !bypassLink) {
        console.error('Критические элементы DOM не найдены. Проверьте разметку.');
        return;
    }

    if (!targetUrlParam) {
        if (loader) loader.innerText = 'Ошибка: не указан параметр "url"';
        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            errorNotice.querySelector('h3').innerText = '⚠️ Ошибка конфигурации';
            errorNotice.querySelector('p').innerText = 'В адресной строке отсутствует параметр ?url=...';
        }
        return;
    }

    let cleanUrl = targetUrlParam.trim();

    // 1. Нормализация URL (добавляем https, если нет протокола)
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
    }

    // 2. Безопасная валидация (защита от javascript:alert(1) и т.п.)
    try {
        const parsed = new URL(cleanUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Недопустимый протокол');
        }
    } catch (e) {
        console.error('Некорректный URL', e);
        if (loader) loader.innerText = 'Ошибка: недопустимый адрес сайта';
        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            const h3 = errorNotice.querySelector('h3');
            const p = errorNotice.querySelector('p');
            if (h3) h3.innerText = '⚠️ Неверный адрес';
            if (p) p.innerText = 'Указанный URL не является корректным веб-адресом.';
        }
        return;
    }

    // --- НАСТРОЙКА РЕЖИМОВ (nocontrols, free, site) ---
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

    // Обновляем заголовок страницы, если нужно
    if (viewMode === 'true') {
        document.title = `Просмотр: ${cleanUrl}`;
    }

    // --- ГЛАВНАЯ ЛОГИКА: ЗАГРУЗКА IFRAME ---
    
    // Сначала показываем лоадер
    if (loader) loader.style.display = 'block';

    // Назначаем src iframe
    iframe.src = cleanUrl;

    // Слушаем событие загрузки iframe
    iframe.onload = () => {
        if (loader) loader.style.display = 'none'; // Скрываем лоадер при успехе
        if (container) container.classList.add('loaded');
        console.log('Iframe успешно загружен');
    };

    // Слушаем ошибку загрузки iframe (это и есть та самая "блокировка браузером")
    iframe.onerror = () => {
        handleIframeError();
    };

    // Также проверяем, не загрузился ли iframe с ошибкой (иногда onload срабатывает даже при ошибке)
    // Но самый надежный способ узнать о блокировке CORS/Mixed Content — это именно onerror или анализ содержимого.
    // Для простоты используем onerror + проверку после загрузки.

    function handleIframeError() {
        if (loader) loader.style.display = 'none';

        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            
            // Обновляем текст кнопки на понятный
            if (bypassLink) {
                bypassLink.href = cleanUrl;
                bypassLink.innerText = 'Открыть сайт в новой вкладке';
                bypassLink.target = '_blank';
                bypassLink.rel = 'noopener noreferrer';
            }

            // Подсказки для разных случаев можно менять здесь
            const h3 = errorNotice.querySelector('h3');
            const p = errorNotice.querySelector('p');
            if (h3) h3.innerText = '⚠️ Контент заблокирован браузером';
            if (p) {
                p.innerText = 'Браузер не позволяет отобразить этот сайт внутри страницы (CORS, Mixed Content или политика безопасности).';
            }
        }
        console.warn('Iframe не смог загрузить контент. Пользователь увидит кнопку перехода.');
    }
});
