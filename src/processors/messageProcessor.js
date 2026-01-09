const messageHelper = require('../helpers/messageHelper');
const suggestionHelper = require('../helpers/suggestionHelper');
const config = require('../config');
const dataService = require('../data/dataService');

require('dotenv').config();

const process = async (bot, message, chatId, messageId, language) => {
    try {
        if (message == null || message == undefined) {
            return;
        } else {
            let typedText = message;
            if (typedText.match(/\d/)) {
                bot.sendMessage(chatId ?? config.clientId, messageHelper.getInvalidSymbolsMessage(language));
                return;
            }
            let fromCallback = message.includes('m:');
            if (fromCallback) {
                typedText = message.split(':')[1];
            }
            if (typedText.match(/[a-z]/i)) {
                stopNameVariations = suggestionHelper.getSuggestion(typedText.toLowerCase());
            } else {
                var translit = suggestionHelper.translitCyrilicText(typedText.toLowerCase());
                stopNameVariations = suggestionHelper.getSuggestion(translit);
            }
            var stops = dataService.getStopSuggestions(stopNameVariations);
            if(stops.length >= 1) {
                let buttonsArray = [];
                for(let i = 0; i < stops.length; i++) {
                    if (i % 2 == 0) {
                        buttonsArray.push([]);
                        buttonsArray[buttonsArray.length - 1].push({text: stops[i].Name, callback_data: 'Stop:'+stops[i].Name+";sg:"+typedText});
                    } else {
                        buttonsArray[buttonsArray.length - 1].push({text: stops[i].Name, callback_data: 'Stop:'+stops[i].Name+";sg:"+typedText});
                    }
                }
                if (fromCallback) {
                    var options = {
                        chat_id: chatId ?? config.clientId,
                        message_id: messageId,
                        reply_markup: JSON.stringify({
                            inline_keyboard: buttonsArray
                        })
                    };
                    bot.editMessageText(messageHelper.getSelectSuggestionMessage(language), options);
                }
                else {
                    var options = {
                        reply_markup: JSON.stringify({
                            inline_keyboard: buttonsArray
                        })
                    };
                    bot.sendMessage(chatId ?? config.clientId, messageHelper.getSelectSuggestionMessage(language), options);
                } 
            } else {
                bot.sendMessage(chatId ?? config.clientId, messageHelper.getNoSuggestionsMessage(language));
            }    
        }
    } catch (ex) {
        console.error(ex.message);
    }
};

module.exports = { process }