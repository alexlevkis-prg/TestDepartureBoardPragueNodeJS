const messageHelper = require('../helpers/messageHelper');
const config = require('../config');
const dataService = require('../data/dataService');

require('dotenv').config();

const command = async (bot, chatId, query, language) => {
    var exist = dataService.getUserLanguage(query.from.id);
    if (exist) {
        dataService.setUserLanguage(query.from.id, language, true);
    } else {
        dataService.setUserLanguage(query.from.id, language, false)
    }
    var opts = {
        chat_id: chatId ?? config.clientId,
        message_id: query.message.message_id,
        reply_markup: null,
        parse_mode: "HTML"
    };
    bot.editMessageText(messageHelper.buildLanguageChangedMessage(language), opts);
}

module.exports = { command }