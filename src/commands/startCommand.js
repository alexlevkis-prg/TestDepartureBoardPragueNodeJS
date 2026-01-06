const messageHelper = require('../helpers/messageHelper');
const localizationHelper = require('../helpers/localizationHelper');

const command = async (bot, chatId, language) => {
    const opts = {
        parse_mode: "HTML"
    }
    localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) => {
        var welcomeMessage = messageHelper.buildWelcomeMessage(localizedProperties);
        bot.sendMessage(chatId, welcomeMessage, opts);
    });
}

module.exports = { command }