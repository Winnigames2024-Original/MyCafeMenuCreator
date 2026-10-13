# Cafe Terminal API Setup Guide / Руководство по настройке

Инструкция по развертыванию серверной части для проекта `cafe-bot` на **Debian / Linux**.  
Deployment guide for the `cafe-bot` server-side application on **Debian / Linux**.

---

## 🛠 Зависимости / Dependencies

| RU (Русский) | EN (English) |
| :--- | :--- |
| **Node.js** (включая `npm`) | **Node.js** (including `npm`) |
| **PM2** (`npm install -g pm2`) | **PM2** (`npm install -g pm2`) |
| **UFW** (`sudo apt install ufw`) | **UFW** (`sudo apt install ufw`) |

---

## 🚀 Пошаговое развертывание / Step-by-Step Deployment

### 1. Подготовка окружения / Environment Setup
```bash
# [RU] Обновление пакетов и установка зависимостей в Debian/Linux
# [EN] Update packages and install dependencies in Debian/Linux
sudo apt update && sudo apt install -y curl git ufw
curl -fsSL https://nodesource.com | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# [RU] Создание папки проекта и переход в нее
# [EN] Create project folder and navigate into it
sudo mkdir -p /var/www/cafe-bot/
sudo chown -R $USER:$USER /var/www/cafe-bot/
cd /var/www/cafe-bot/

# [RU] Инициализация проекта и установка Express
# [EN] Initialize project and install Express
npm init -y
npm install express
```

### 2. Создание файла `server.js` / Creating `server.js`
```javascript
// /var/www/cafe-bot/server.js
const express = require('express');
const path = require('path');
const app = express();

// [RU] Настроено на порт 3033 в соответствии с фаерволом
// [EN] Configured to port 3033 to match firewall settings
const PORT = process.env.PORT || 3033;

// [RU] Раздача статических файлов из текущей директории
// [EN] Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// [RU] Главный маршрут
// [EN] Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'update.html'));
});

// [RU] Запуск сервера
// [EN] Start server
app.listen(PORT, () => {
    console.log(`[Cafe API] Server running on port ${PORT}`);
});
```

### 3. Управление процессом через PM2 / Process Management via PM2
```bash
# [RU] Запуск сервера под управлением PM2
# [EN] Start server under PM2 management
sudo pm2 start server.js --name "cafe-terminal-api"

# [RU] Сохранение конфигурации для автозапуска
# [EN] Save configuration for autostart
sudo pm2 save

# [RU] Настройка автозапуска PM2 при перезагрузке ОС
# [EN] Setup PM2 autostart on OS reboot
sudo pm2 startup
```

### 4. Настройка если у вас есть ufw / Setting up if you have ufw
```bash
# [RU] Включение фаервола UFW
# [EN] Enable UFW firewall
sudo ufw enable

# [RU] Открытие порта 3033 для подключения терминалов
# [EN] Open port 3033 for terminal connections
sudo ufw allow 3033

# [RU] Перезагрузка правил фаервола
# [EN] Reload firewall rules
sudo ufw reload
```
