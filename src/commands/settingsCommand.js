const messageHelper = require('../helpers/messageHelper');
const localizationHelper = require('../helpers/localizationHelper');

const command = async (bot, chatId, language) => {
    localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) => {
        var settingsMessage = messageHelper.buildSettingsMessage(localizedProperties);
        let buttonsArray = [];
        buttonsArray.push([]);
        buttonsArray[0].push({
            text: '🇬🇧 English',
            callback_data: 'en'
        });
        buttonsArray.push([]);
        buttonsArray[1].push({
            text: '🇷🇺 Русский',
            callback_data: 'ru'
        });
        buttonsArray.push([]);
        buttonsArray[2].push({
            text: '🇺🇦 Українська',
            callback_data: 'uk'
        });
        const opts = {
            parse_mode: "HTML",
            reply_markup: JSON.stringify({
                inline_keyboard: buttonsArray,
                one_time_keyboard: true
            })
        }
        bot.sendMessage(chatId, settingsMessage, opts);
    });
}

module.exports = { command }