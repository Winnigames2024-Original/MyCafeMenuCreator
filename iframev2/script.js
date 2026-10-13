document.addEventListener("DOMContentLoaded", () => {
    // 1. Получаем текущие параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    
    const targetUrl = urlParams.get('url'); // Извлекаем 'dsdsd'
    const viewMode = urlParams.get('view'); // Извлекаем 'true'
    const rawParameters = urlParams.get('parameters'); // Извлекаем 'nocontrols;disableiframegui;novideo;free'

    const container = document.getElementById('iframe-container');
    const iframe = document.getElementById('target-iframe');
    const badge = document.getElementById('status-badge');

    // 2. Устанавливаем адрес в iframe, если он передан
    if (targetUrl) {
        // Если url не имеет протокола (например, просто текст), здесь можно дополнить логику.
        // Для примера просто вставляем как есть:
        iframe.src = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    } else {
        console.warn("Параметр 'url' не найден в адресе.");
    }

    // 3. Обрабатываем список дополнительных параметров (разделенных через ';')
    if (rawParameters) {
        // Разделяем строку на массив флагов: ['nocontrols', 'disableiframegui', ...]
        const paramsArray = rawParameters.split(';');

        paramsArray.forEach(param => {
            const cleanParam = param.trim().toLowerCase();

            switch (cleanParam) {
                case 'nocontrols':
                case 'disableiframegui':
                    // Скрываем панель управления кнопками
                    container.classList.add('hide-gui');
                    break;
                    
                case 'novideo':
                    // Включаем режим без видео
                    container.classList.add('no-video');
                    break;
                    
                case 'free':
                    // Меням текст и стиль плашки на "Бесплатно"
                    container.classList.add('free-mode');
                    if (badge) badge.innerText = "Бесплатный доступ";
                    break;
            }
        });
    }

    // 4. Обработка флага просмотра (view)
    if (viewMode === 'true') {
        console.log("Включен режим отображения (view=true)");
    }
});
