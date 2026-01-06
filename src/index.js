const TelegramBot = require('node-telegram-bot-api');
const messageProcessor = require('./processors/messageProcessor');
const callbackProcessor = require('./processors/callbackProcessor');
const startCommand = require('./commands/startCommand');
const settingsCommand = require('./commands/settingsCommand');
const helpCommand = require('./commands/helpCommand');
const config = require('./config');
const path = require('path');
const fullPath = path.resolve("data/userLangs.json");

const fs = require('fs');

require('dotenv').config();
const token = config.clientToken;
const bot = new TelegramBot(token, {polling: true});
bot.setMyCommands([
    { 
        command: '/start',
        description: 'Starts bot conversation'
    },
    { 
        command: '/help',
        description: 'Help information'
    },
    { 
        command: '/settings',
        description: 'Bot settings'
    }
]);

bot.on('message', async (msg) => {
    if (msg.text.startsWith("/")) {
        return;
    }
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            var userLangs = JSON.parse(data);
            var userLang = userLangs.find(x => x.key == msg.from.id)?.value ?? msg.from.language_code;
            messageProcessor.process(bot, msg, userLang ?? 'en', process.env.stopsUrl);
        }
    });
});

bot.on('callback_query', async function onCallbackQuery(query) {
    if (config.supportedLanguage.includes(query.data)) {
        callbackProcessor.setLanguage(bot, query.message.chat.id, query, process.env.stopsUrl);
    } else {
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                var userLangs = JSON.parse(data);
                var userLang = userLangs.find(x => x.key == query.from.id)?.value ?? query.from.language_code;
                callbackProcessor.process(bot, query, userLang ?? 'en');
            }
        });
    }
});

bot.onText(/\/start/, (msg, match) => {
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            var userLangs = JSON.parse(data);
            var userLang = userLangs.find(x => x.key == msg.from.id)?.value ?? msg.from.language_code;
            startCommand.command(bot, msg.chat.id ?? config.clientId, userLang ?? 'en');
        }
    });
});

bot.onText(/\/settings/, (msg, match) => {
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            var userLangs = JSON.parse(data);
            var userLang = userLangs.find(x => x.key == msg.from.id)?.value ?? msg.from.language_code;
            settingsCommand.command(bot, msg.chat.id ?? config.clientId, userLang ?? 'en');
        }
    });
});

bot.onText(/\/help/, (msg, match) => {
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            var userLangs = JSON.parse(data);
            var userLang = userLangs.find(x => x.key == msg.from.id)?.value ?? msg.from.language_code;
            helpCommand.command(bot, msg.chat.id ?? config.clientId, userLang ?? 'en');
        }
    });
});
