document.addEventListener("DOMContentLoaded", () => {
    // 1. Извлекаем параметры из адресной строки (URL)
    const urlParams = new URLSearchParams(window.location.search);
    
    const targetUrl = urlParams.get('url'); // 'https://winnigames2024.ru'
    const viewMode = urlParams.get('view'); // 'true'
    const rawParameters = urlParams.get('parameters'); // 'nocontrols;disableiframegui;site;free'

    const container = document.getElementById('iframe-container');
    const iframe = document.getElementById('target-iframe');
    const badge = document.getElementById('status-badge');

    // Скрываем лоадер, когда фрейм полностью загрузился
    iframe.addEventListener('load', () => {
        container.classList.add('loaded');
    });

    // 2. Валидация и установка URL в iframe
    if (targetUrl) {
        // Убеждаемся, что адрес содержит протокол, если нет — добавляем https
        iframe.src = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    } else {
        console.error("Параметр 'url' отсутствует в адресе.");
        document.getElementById('loader').innerText = "Ошибка: URL не указан";
    }

    // 3. Разбор дополнительных параметров через точку с запятой
    if (rawParameters) {
        const paramsArray = rawParameters.split(';');

        paramsArray.forEach(param => {
            const cleanParam = param.trim().toLowerCase();

            switch (cleanParam) {
                case 'nocontrols':
                case 'disableiframegui':
                    // Полностью убираем панели управления iframev2
                    container.classList.add('hide-gui');
                    break;
                    
                case 'site':
                    // Включаем режим отображения "Сайт/Приложение" (не видео)
                    container.classList.add('site-mode');
                    console.log("Режим: Интерактивный сайт/игра");
                    break;
                    
                case 'free':
                    // Применяем бесплатный статус
                    container.classList.add('free-mode');
                    if (badge) badge.innerText = "Бесплатно";
                    break;
            }
        });
    }

    // 4. Обработка флага view
    if (viewMode === 'true') {
        document.title = `Просмотр: ${targetUrl || 'iframev2'}`;
    }
});
