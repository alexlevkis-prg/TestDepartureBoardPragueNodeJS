const messageHelper = require('../helpers/messageHelper');
const suggestionHelper = require('../helpers/suggestionHelper');
const localizationHelper = require('../helpers/localizationHelper');
const path = require('path');
const fullPath = path.resolve("stops.json");
const fs = require('fs');
const config = require('../config');

require('dotenv').config();

const process = async (bot, message, chatId, messageId, language) => {
    try {
        if (message == null || message == undefined) {
            return;
        } else {
            let typedText = message;
            if (typedText.match('\d')) {
                bot.sendMessage(chatId ?? config.clientId, messageHelper.getInvalidSymbolsMessage(localizedProperties));
                return;
            }
            let fromCallback = message.includes('m:');
            if (fromCallback) {
                typedText = message.split(':')[1];
            }
            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    console.error("Error reading file: ", err);
                    return;
                }
                const result = JSON.parse(data);
                console.log("File has been read");
                let stopNameVariations = [];
                if (message.match(/[a-z]/i)) {
                    stopNameVariations = suggestionHelper.getSuggestion(typedText.toLowerCase());
                } else {
                    var translit = suggestionHelper.translitCyrilicText(typedText.toLowerCase());
                    stopNameVariations = suggestionHelper.getSuggestion(translit);
                }
                if (result.stopGroups && result.stopGroups.length > 0) {
                    let stops = result.stopGroups.reduce((acc, sg) => {
                    if (stopNameVariations.some(s => sg.name.toLowerCase().includes(s)) 
                        && (sg.stops.every(p => p.zone.includes("P")) || sg.stops.every(p => (p.zone.includes("0") && p.zone !== "10") || sg.stops.every(p => p.zone.includes("B"))))) {
                        acc.push(sg);
                    }
                    return acc;
                    }, []);
                    localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) => {
                        if(stops.length >= 1) {
                            let buttonsArray = [];
                            for(let i = 0; i < stops.length; i++) {
                                if (i % 2 == 0) {
                                    buttonsArray.push([]);
                                    buttonsArray[buttonsArray.length - 1].push({text: stops[i].name, callback_data: 'Stop:'+stops[i].name+";sg:"+typedText});
                                } else {
                                    buttonsArray[buttonsArray.length - 1].push({text: stops[i].name, callback_data: 'Stop:'+stops[i].name+";sg:"+typedText});
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
                                bot.editMessageText(messageHelper.getSelectSuggestionMessage(localizedProperties), options);
                            }
                            else {
                                var options = {
                                    reply_markup: JSON.stringify({
                                        inline_keyboard: buttonsArray
                                    })
                                };
                                bot.sendMessage(chatId ?? config.clientId, messageHelper.getSelectSuggestionMessage(localizedProperties), options);
                            }   
                        } else {
                            bot.sendMessage(chatId ?? config.clientId, messageHelper.getNoSuggestionsMessage(localizedProperties));
                        }
                    });
                } else {
                    console.info("no any data has been read");
                }
                
            });     
        }
    } catch (ex) {
        console.error(ex.message);
    }
};

module.exports = { process }