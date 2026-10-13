document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');
    const viewMode = urlParams.get('view');
    const rawParameters = urlParams.get('parameters');

    const container = document.getElementById('iframe-container');
    const badge = document.getElementById('status-badge');
    const errorNotice = document.getElementById('error-notice');
    const bypassLink = document.getElementById('bypass-link');
    const loader = document.getElementById('loader');

    // Проверка обязательных элементов
    if (!bypassLink) {
        console.error('Элемент #bypass-link не найден — кнопка перехода не будет работать');
        return;
    }

    if (targetUrl) {
        let cleanUrl = targetUrl.trim();

        // Добавляем https, если нет протокола
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }

        // Базовая валидация URL (защита от javascript:, data:, file: и т. д.)
        try {
            const parsed = new URL(cleanUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                throw new Error('Недопустимый протокол');
            }
            // Опционально: можно добавить белый список доменов, если нужно
        } catch (e) {
            console.error('Некорректный URL', e);
            showError('Ошибка: указан недопустимый адрес сайта.');
            return;
        }

        // Сразу показываем кнопку перехода (без попытки window.open)
        if (bypassLink) {
            bypassLink.href = cleanUrl;
            bypassLink.innerText = 'Открыть сайт';
        }

        if (container) {
            container.classList.add('loaded');
        }
        if (loader) {
            loader.innerText = 'Нажмите кнопку ниже, чтобы перейти на сайт.';
        }

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

        // Обновление заголовка
        if (viewMode === 'true' && targetUrl) {
            document.title = `Переход: ${targetUrl}`;
        }
    } else {
        if (loader) loader.innerText = 'Ошибка: параметр url не указан';
        showError('Не передан параметр url в адресной строке.');
    }

    function showError(message) {
        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            const h3 = errorNotice.querySelector('h3');
            const p = errorNotice.querySelector('p');
            if (h3) h3.innerText = 'Внимание';
            if (p) p.innerText = message;
        }
    }
});
