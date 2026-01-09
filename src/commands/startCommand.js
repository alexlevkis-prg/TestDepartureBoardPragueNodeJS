const messageHelper = require('../helpers/messageHelper');

const command = async (bot, chatId, language) => {
    const opts = {
        parse_mode: "HTML"
    }

    var welcomeMessage = messageHelper.buildWelcomeMessage(language);
    bot.sendMessage(chatId, welcomeMessage, opts);
}

module.exports = { command }