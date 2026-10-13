document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');
    const viewMode = urlParams.get('view');
    const rawParameters = urlParams.get('parameters');

    // Получаем элементы, но НЕ выбрасываем ошибку, если их нет
    const container = document.getElementById('iframe-container');
    const badge = document.getElementById('status-badge');
    const errorNotice = document.getElementById('error-notice');
    const bypassLink = document.getElementById('bypass-link');
    const loader = document.getElementById('loader');

    // Если самой кнопки нет — смысла продолжать нет, выходим тихо
    if (!bypassLink) {
        console.warn('Элемент #bypass-link не найден. Кнопка перехода не будет создана.');
        return;
    }

    if (!targetUrl) {
        if (loader) loader.innerText = 'Ошибка: параметр "url" не указан';
        showError('Не передан параметр url в адресной строке.');
        return;
    }

    let cleanUrl = targetUrl.trim();

    // Нормализация URL: добавляем https, если нет протокола
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
    }

    // Безопасная валидация URL (защита от javascript:, data: и т.д.)
    try {
        const parsed = new URL(cleanUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Недопустимый протокол');
        }
    } catch (e) {
        console.error('Некорректный URL', e);
        showError('Указан недопустимый адрес сайта. Проверьте параметр url.');
        return;
    }

    // --- ГЛАВНАЯ ЛОГИКА: ПРОСТО КНОПКА ---
    // Никаких window.open при загрузке, никаких внешних прокси
    bypassLink.href = cleanUrl;
    bypassLink.innerText = 'Перейти на сайт';
    bypassLink.style.display = 'inline-block'; // Показываем кнопку

    if (container) container.classList.add('loaded');
    if (loader) loader.innerText = 'Нажмите кнопку ниже, чтобы перейти на сайт.';

    // Обработка параметров (nocontrols, site, free)
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
                    if (badge) badge.innerText = 'Бесплатно';
                    break;
            }
        });
    }

    // Обновление заголовка страницы
    if (viewMode === 'true') {
        document.title = `Переход: ${cleanUrl}`;
    }

    // Функция для показа ошибок (не ломает скрипт, если элементов нет)
    function showError(message) {
        if (!errorNotice) return; // Тихо выходим, если блока ошибок нет
        errorNotice.classList.remove('hidden');
        
        const h3 = errorNotice.querySelector('h3');
        const p = errorNotice.querySelector('p');
        
        if (h3) h3.innerText = 'Внимание';
        if (p) p.innerText = message;
    }
});
