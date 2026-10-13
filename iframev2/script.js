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

    if (targetUrl) {
        targetUrl = targetUrl.trim();
        
        // Формируем чистый корректный адрес
        let cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
        
        // Настраиваем ссылку на кнопке на случай, если браузер заблокирует автоматическое всплывающее окно
        if (bypassLink) bypassLink.href = cleanUrl;

        // === ГЛАВНОЕ ИЗМЕНЕНИЕ: СРАЗУ В НОВУЮ ВКЛАДКУ ===
        // Открываем целевой сайт в новой вкладке сразу при загрузке страницы iframev2
        const newWindow = window.open(cleanUrl, '_blank');

        // Если браузер пользователя заблокировал pop-up (всплывающее окно)
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            console.warn("Автоматическое открытие заблокировано браузером. Показываем кнопку перехода.");
            if (container) container.classList.add('loaded');
            if (errorNotice) {
                errorNotice.classList.remove('hidden');
                // Меняем текст заглушки под нашу новую логику
                errorNotice.querySelector('h3').innerText = "Переход на сайт";
                errorNotice.querySelector('p').innerText = "Нажмите на кнопку ниже, чтобы открыть сайт в новой вкладке.";
                if (bypassLink) bypassLink.innerText = "Открыть сайт";
            }
        } else {
            // Если вкладка успешно открылась, мы можем оставить саму страницу iframev2 пустой или написать, что переход выполнен
            document.getElementById('loader').innerText = "Перенаправление выполнено в новую вкладку...";
            if (container) container.classList.add('loaded');
        }
    } else {
        document.getElementById('loader').innerText = "Ошибка: URL не указан";
        return;
    }

    // Разбор ваших стандартных параметров (site, free, nocontrols)
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
                    if (badge) badge.innerText = "Бесплатно";
                    break;
            }
        });
    }

    if (viewMode === 'true' && targetUrl) {
        document.title = `Редирект: ${targetUrl}`;
    }
});
