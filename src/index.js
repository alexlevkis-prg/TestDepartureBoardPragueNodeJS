const TelegramBot = require('node-telegram-bot-api');
const messageProcessor = require('./processors/messageProcessor');
const callbackProcessor = require('./processors/callbackProcessor');
const startCommand = require('./commands/startCommand');
const settingsCommand = require('./commands/settingsCommand');
const helpCommand = require('./commands/helpCommand');
const dataService = require('./data/dataService');
const config = require('./config');
const crypto = require('crypto');
const supportedLanguages = dataService.getSupportedLanguages();

require('dotenv').config();
console.log(dataService.getApplicationSetting('clientToken').SettingValue);
const tk = dataService.getApplicationSetting('clientToken').SettingValue;
const token = decrypt(tk);
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
    if (msg.text) {
        if (msg.text.startsWith("/")) {
            return;
        }
        var lang = dataService.getUserLanguage(msg.from.id)?.LanguageCode;
        var userLang = supportedLanguages.find(x => x.LanguageCode == lang)?? msg.from.language_code;
        messageProcessor.process(bot, msg.text, msg.chat.id, null, userLang.LanguageCode ?? 'en'); 
    }
});

bot.on('callback_query', async function onCallbackQuery(query) {
    if (supportedLanguages.some(sl => sl.LanguageCode == query.data)) {
        callbackProcessor.setLanguage(bot, query.message.chat.id, query, query.data);
    } else {
        var lang = dataService.getUserLanguage(query.from.id)?.LanguageCode;
        var userLang = supportedLanguages.find(x => x.LanguageCode == lang)?? query.from.language_code;
        if (query.data.includes('m:')) {
            messageProcessor.process(bot, query.data, query.message.chat.id, query.message.message_id, userLang.LanguageCode ?? 'en')
        }
        else {
            callbackProcessor.process(bot, query, userLang.LanguageCode ?? 'en');
        }
    }
});

bot.onText(/\/start/, (msg, match) => {
    var lang = dataService.getUserLanguage(msg.from.id)?.LanguageCode;
    var userLang = supportedLanguages.find(x => x.LanguageCode == lang) ?? msg.from.language_code;
    startCommand.command(bot, msg.chat.id ?? config.clientId, userLang.LanguageCode ?? 'en');
});

bot.onText(/\/settings/, (msg, match) => {
    var lang = dataService.getUserLanguage(msg.from.id)?.LanguageCode;
    var userLang = supportedLanguages.find(x => x.LanguageCode == lang) ?? msg.from.language_code;
    settingsCommand.command(bot, msg.chat.id ?? config.clientId, userLang.LanguageCode ?? 'en');
});

bot.onText(/\/help/, (msg, match) => {
    var lang = dataService.getUserLanguage(msg.from.id)?.LanguageCode;
    var userLang = supportedLanguages.find(x => x.LanguageCode == lang) ?? msg.from.language_code;
    helpCommand.command(bot, msg.chat.id ?? config.clientId, userLang.LanguageCode ?? 'en');
});

function decrypt(data) {
    const secretKey = 'dkq71MCtPKLpjVYS';
    const algorithm = "aes-256-cbc";
    const key = crypto
    .createHash("sha512")
    .update(secretKey)
    .digest("hex")
    .substring(0, 32);
    const inputIV = data.slice(0, 32)
    const encrypted = data.slice(32)
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(key),
        Buffer.from(inputIV, "hex"),
    );
    let decrypted = decipher.update(encrypted, "hex", "utf-8")
    decrypted += decipher.final("utf-8")
    return decrypted
}
