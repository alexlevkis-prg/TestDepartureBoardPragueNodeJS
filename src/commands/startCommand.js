const messageHelper = require('../helpers/messageHelper');

const command = async (bot, chatId, language) => {
    const opts = {
        parse_mode: "HTML"
    }
    var dbWelcomeMessage = messageHelper.buildWelcomeMessage(language).split("\\r\\n");
    let result = [];
    dbWelcomeMessage.forEach(element => {
        if (element.startsWith("\\t")) {
            element = element.replace("\\t", "");
            result.push('\t');
        }
        result.push(element);
        result.push('\r\n');
    });
    bot.sendMessage(chatId, result.join(""), opts);
}

module.exports = { command }