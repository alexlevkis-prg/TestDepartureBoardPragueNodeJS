const messageHelper = require('../helpers/messageHelper');
const dataService = require('../data/dataService');

const command = async (bot, chatId, language) => {
    var settingsMessage = messageHelper.buildSettingsMessage(language);
    var supportedLanguages = dataService.getSupportedLanguages();
    let buttonsArray = [];
    for(var i = 0; i < supportedLanguages.length; i++){
        buttonsArray.push([]);
        buttonsArray[i].push({
            text: supportedLanguages[i].LanguageName,
            callback_data: supportedLanguages[i].LanguageCode
        })
    }

    const opts = {
        parse_mode: "HTML",
        reply_markup: JSON.stringify({
            inline_keyboard: buttonsArray,
            one_time_keyboard: true
        })
    }
    bot.sendMessage(chatId, settingsMessage, opts);
}

module.exports = { command }