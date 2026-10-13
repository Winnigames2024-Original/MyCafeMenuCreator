# Cafe Terminal API Setup Guide / Руководство по настройке

Deployment guide for the `cafe-bot` server-side application on **Debian / Linux**.  
Инструкция по развертыванию серверной части для проекта `cafe-bot` на **Debian / Linux**.

---

## 🛠 Dependencies / Зависимости

| EN (English) | RU (Русский) |
| :--- | :--- |
| **Node.js** (including `npm`) | **Node.js** (включая `npm`) |
| **PM2** (`npm install -g pm2`) | **PM2** (`npm install -g pm2`) |
| **UFW** (`sudo apt install ufw`) | **UFW** (`sudo apt install ufw`) |

---

## 🚀 Step-by-Step Deployment / Пошаговое развертывание

### 1. Environment Setup / Подготовка окружения
```bash
# [EN] Update packages and install system dependencies in Debian/Linux
# [RU] Обновление пакетов и установка зависимостей в Debian/Linux
sudo apt update && sudo apt install -y curl git ufw
curl -fsSL https://nodesource.com | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# [EN] Create project folder and navigate into it
# [RU] Создание папки проекта и переход в нее
sudo mkdir -p /var/www/cafe-bot/
sudo chown -R $USER:$USER /var/www/cafe-bot/
cd /var/www/cafe-bot/

# [EN] Initialize project and install dependencies
# [RU] Инициализация проекта и установка зависимостей
npm init -y
npm install express vk-io
```

### 2. Creating `server.js` via `cat` / Создание файла `server.js` через `cat`
```bash
# [EN] Copy and paste this entire block into your terminal to safely generate server.js
# [RU] Скопируйте и вставьте весь этот блок в терминал для безопасной генерации файла server.js

cat << 'EOF' > /var/www/cafe-bot/server.js
const express = require('express');
const { VK, Keyboard } = require('vk-io');

// === VK AND NETWORK SETTINGS ===
const VK_TOKEN = 'YOUR_VR_TOKEN';
const ADMIN_VK_ID = 0; // Replace with your VK ID
const PORT = 3033;

const app = express();
const vk = new VK({ token: VK_TOKEN });

const activeOrders = {};

// 1. DATA RECEIVER FROM C# TERMINAL
app.get('/order', (req, res) => {
    const orderNum = req.query.num;
    const itemId = req.query.item;
    const itemName = req.query.name;

    if (!orderNum || !itemId) return res.status(400).send('Missing params');

    const cleanOrderNum = orderNum.trim().toUpperCase();
    const cleanItemId = itemId.trim();
    const cleanItemName = itemName ? itemName.trim() : `Товар [${cleanItemId}]`;

    if (!activeOrders[cleanOrderNum]) {
        activeOrders[cleanOrderNum] = {
            id: cleanOrderNum,
            items: [],
            status: 'Принят сервером', 
            createdAt: new Date().toLocaleTimeString('ru-RU'),
            timerId: null
        };
        console.log(`[NEW  ORDER] Инициализирован заказ #${cleanOrderNum}`);
    }

    activeOrders[cleanOrderNum].items.push({ id: cleanItemId, name: cleanItemName });

    if (activeOrders[cleanOrderNum].timerId) clearTimeout(activeOrders[cleanOrderNum].timerId);
    activeOrders[cleanOrderNum].timerId = setTimeout(() => {
        sendOrderToVK(cleanOrderNum);
    }, 1500);

    res.sendStatus(200);
});

// 2. LIVE REFRESH TRACKING PAGE FOR CLIENT
app.get('/track/:id', (req, res) => {
    const orderId = req.params.id.toUpperCase();
    const order = activeOrders[orderId];

    if (!order) {
        return res.send(`
            <style>body{background:#1e1e1e;color:#fff;font-family:sans-serif;text-align:center;padding-top:10%}</style>
            <h1>⚠️ Заказ не найден</h1>
            <p>Возможно, заказ слишком старый или еще не был отправлен с терминала.</p>
        `);
    }

    let statusColor = '#ff6b00'; 
    if (order.status === 'Готовится') statusColor = '#ffc107';
    if (order.status === 'Готово!') statusColor = '#00ff0a';

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Отслеживание заказа #${order.id}</title>
            <style>
                body { background: #121214; color: #fff; font-family: 'Segoe UI', sans-serif; text-align: center; margin: 0; padding: 20px; }
                .card { background: #1a1a24; border-radius: 16px; padding: 30px; margin: 40px auto; max-width: 450px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 1px solid #282836; }
                h1 { font-weight: 900; font-size: 28px; margin-bottom: 5px; color: #00ffa0; }
                .session { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #fff; background: #242434; padding: 10px; border-radius: 8px; display: inline-block; margin: 15px 0; }
                .status-box { font-size: 22px; font-weight: 900; text-transform: uppercase; color: ${statusColor}; margin: 25px 0; padding: 15px; border: 2px solid ${statusColor}; border-radius: 12px; background: rgba(0,0,0,0.2); }
                .time { color: #888; font-style: italic; }
                .loader { display: inline-block; width: 30px; height: 30px; border: 4px solid #fff; border-radius: 50%; border-top-color: #ff6b00; animation: spin 1s ease-in-out infinite; margin-top: 15px; }
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
            <script>
                setInterval(() => { location.reload(); }, 5000);
            </script>
        </head>
        <body>
            <div class="card">
                <h1>СТАТУС ЗАКАЗА</h1>
                <div class="session">#${order.id}</div>
                <div class="status-box">${order.status}</div>
                <p class="time">Время оформления: ${order.createdAt}</p>
                ${order.status !== 'Готово!' ? '<div class="loader"></div>' : '🎉 Приятного аппетита!'}
            </div>
        </body>
        </html>
    `);
});

// 3. SEND ORDER CARD WITH INTERACTIVE BUTTONS TO VK
function sendOrderToVK(orderNum) {
    const order = activeOrders[orderNum];
    if (!order) return;

    const itemCounts = {};
    order.items.forEach(item => {
        if (!itemCounts[item.id]) itemCounts[item.id] = { name: item.name, count: 0 };
        itemCounts[item.id].count++;
    });

    let msg = `🍔 **ПОСТУПИЛ НОВЫЙ ЗАКАЗ С ТЕРМИНАЛА!**\n\n`;
    msg += `📝 Чек: #${order.id}\n`;
    msg += `🕒 Время: ${order.createdAt}\n`;
    msg += `⚙️ Текущий статус: **${order.status}**\n`;
    msg += `─────────────────────────\n`;

    let idx = 1;
    for (const [itemId, info] of Object.entries(itemCounts)) {
        msg += `${idx}. 🔥 **${info.name}** [ID: ${itemId}] — ${info.count} шт.\n`;
        idx++;
    }
    msg += `─────────────────────────\n`;
    msg += `👉 Выберите действие ниже, чтобы изменить статус заказа на телефоне клиента:`;

    const keyboard = Keyboard.builder()
        .callbackButton({ label: '👨‍🍳 Начинаем', payload: { action: 'set_status', id: orderNum, value: 'Начинаем готовить' }, color: Keyboard.PRIMARY_COLOR })
        .callbackButton({ label: '⏳ Готовится', payload: { action: 'set_status', id: orderNum, value: 'Готовится' }, color: Keyboard.PRIMARY_COLOR })
        .row()
        .callbackButton({ label: '✅ ГОТОВО!', payload: { action: 'set_status', id: orderNum, value: 'Готово!' }, color: Keyboard.POSITIVE_COLOR })
        .inline();

    vk.api.messages.send({
        peer_id: ADMIN_VK_ID,
        message: msg,
        keyboard: keyboard,
        random_id: Math.floor(Math.random() * 1000000)
    })
    .then(() => console.log(`[УСПЕХ VK] Заказ #${orderNum} с кнопками управления отправлен.`))
    .catch(err => console.error(`[СБОЙ VK] Ошибка отправки:`, err.message));
}

// 4. VK MESSAGE EVENT BUTTON HANDLER
vk.updates.on('message_event', async (ctx) => {
    const payload = ctx.eventPayload;

    if (payload && payload.action === 'set_status') {
        const orderNum = payload.id;
        const newStatus = payload.value;
        const order = activeOrders[orderNum];

        if (!order) {
            return ctx.answer({ type: 'show_snackbar', text: '⚠️ Ошибка: Заказ уже удален из памяти сервера.' });
        }

        order.status = newStatus;
        console.log(`[СТАТУС ИЗМЕНЕН] Заказ #${orderNum} переведен в статус: "${newStatus}"`);

        await ctx.answer({
            type: 'show_snackbar',
            text: `🎯 Статус заказа #${orderNum} изменен на "${newStatus}"`
        });

        let updateMsg = `⚙️ **Статус заказа #${orderNum} обновлен администратором!**\n` +
                          `Новый статус на экране трекера клиента: 👉 **${newStatus}**`;

        await vk.api.messages.send({
            peer_id: ctx.userId,
            message: updateMsg,
            random_id: Math.floor(Math.random() * 1000000)
        });
    }
});

vk.updates.start()
    .then(() => console.log('🤖 Бот ВКонтакте успешно запущен с жестким ID админа и трекером!'))
    .catch(console.error);

app.listen(PORT, () => console.log('🚀 Сервер приема параметров и генератор страниц запущен на порту ' + PORT));
EOF
```

### 3. Process Management via PM2 / Управление процессом через PM2
```bash
# [EN] Start server under PM2 management
# [RU] Запуск сервера под управлением PM2
pm2 start server.js --name "cafe-terminal-api"

# [EN] Save configuration for automatic launch on reboot
# [RU] Сохранение конфигурации для автозапуска
pm2 save

# [EN] Generate and configure startup script for your system
# [RU] Генерация конфигурации автозапуска при перезагрузке ОС
pm2 startup
```

### 4. Setting up if you have UFW / Настройка если у вас есть UFW
```bash
# [EN] Enable SSH access BEFORE activating UFW to prevent getting locked out
# [RU] Разрешите доступ по SSH ДО включения UFW, чтобы не потерять доступ к серверу
sudo ufw allow ssh

# [EN] Enable UFW firewall
# [RU] Включение фаервола UFW
sudo ufw enable

# [EN] Open port 3033 for terminal and customer tracking page connections
# [RU] Открытие порта 3033 для подключения терминалов и клиентов
sudo ufw allow 3033

