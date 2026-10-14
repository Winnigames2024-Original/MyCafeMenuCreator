document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrlParam = urlParams.get('url');
    
    const iframe = document.getElementById('target-iframe');
    const loader = document.getElementById('loader');
    const errorNotice = document.getElementById('error-notice');
    const bypassLink = document.getElementById('bypass-link');
    const errorMessage = document.getElementById('error-message');

    if (!iframe) return;

    // Если нет параметра url — сразу ошибка
    if (!targetUrlParam) {
        if (loader) loader.style.display = 'none';
        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            errorMessage.innerText = 'Ошибка: не указан параметр ?url= в адресной строке.';
        }
        return;
    }

    let cleanUrl = targetUrlParam.trim();

    // ВАЖНО: Мы НЕ меняем http на https вручную.
    // Если сайт на HTTP, а родитель на HTTPS — Mixed Content неизбежен.
    // Мы просто передаём ссылку как есть, чтобы браузер честно её заблокировал.
    
    try {
        new URL(cleanUrl); // Простая валидация
    } catch (e) {
        if (loader) loader.style.display = 'none';
        if (errorNotice) {
            errorNotice.classList.remove('hidden');
            errorMessage.innerText = 'Некорректный URL.';
        }
        return;
    }

    // Показываем лоадер
    if (loader) loader.style.display = 'block';

    // Пытаемся загрузить
    iframe.src = cleanUrl;

    iframe.onload = () => {
        if (loader) loader.style.display = 'none';
        console.log('Iframe загружен');
    };

    iframe.onerror = () => handleIframeError(cleanUrl);

    function handleIframeError(url) {
        // Скрываем лоадер
        if (loader) loader.style.display = 'none';

        if (errorNotice) {
            errorNotice.classList.remove('hidden');

            // Настраиваем кнопку
            if (bypassLink) {
                bypassLink.href = url;
                bypassLink.innerText = 'Открыть сайт в новой вкладке';
            }

            // Пишем понятное сообщение
            const isHttp = url.startsWith('http://') && !url.startsWith('https://');
            if (isHttp) {
                errorMessage.innerText = 'Сайт использует незащищённое соединение (HTTP). Браузер блокирует его отображение внутри страницы из соображений безопасности.';
            } else {
                errorMessage.innerText = 'Сайт запрещает встраивание в другие страницы (CORS / X-Frame-Options).';
            }
        }
    }
});
