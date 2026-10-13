document.addEventListener('DOMContentLoaded', () => {
    const readmeContent = document.getElementById('readme-content');
    
    // Здесь можно загрузить содержимое README из файла или API
    // Например, с помощью fetch
    fetch('https://raw.githubusercontent.com/Winnigames2024-Original/MyCafeMenuCreator/refs/heads/main/server/README.MD')
        .then(response => response.text())
        .then(data => {
            readmeContent.innerHTML = data;
        })
        .catch(error => {
            console.error('Ошибка при загрузке README:', error);
        });
});
