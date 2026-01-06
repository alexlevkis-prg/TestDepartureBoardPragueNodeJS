const messageHelper = require('../helpers/messageHelper');
const suggestionHelper = require('../helpers/suggestionHelper');
const localizationHelper = require('../helpers/localizationHelper');
const path = require('path');
const fullPath = path.resolve("stops.json");
const fs = require('fs');

require('dotenv').config();

const process = async (bot, message, language) => {
    try {
        if (message.text == null || message.text == undefined) {
            return;
        } else {
            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    console.error("Error reading file: ", err);
                    return;
                }
                const result = JSON.parse(data);
                console.log("File has been read");
                let stopNameVariations = [];
                if (message.text.match(/[a-z]/i)) {
                    stopNameVariations = suggestionHelper.getSuggestion(message.text.toLowerCase());
                } else {
                    var translit = '';
                    if (language == 'uk') {
                        translit = suggestionHelper.translitRussianText(message.text.toLowerCase());
                    }
                    if (language == 'ru') {
                        translit = suggestionHelper.translitRussianText(message.text.toLowerCase());
                    }
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
                                    buttonsArray[buttonsArray.length - 1].push({text: stops[i].name, callback_data: 'Stop:'+stops[i].name});
                                } else {
                                    buttonsArray[buttonsArray.length - 1].push({text: stops[i].name, callback_data: 'Stop:'+stops[i].name});
                                }
                            }
                            var options = {
                                reply_markup: JSON.stringify({
                                    inline_keyboard: buttonsArray
                                })
                            };
                            bot.sendMessage(message.chat.id ?? process.env.clientId, messageHelper.getSelectSuggestionMessage(localizedProperties), options);
                        } else {
                            bot.sendMessage(message.chat.id ?? process.env.clientId, messageHelper.getNoSuggestionsMessage(localizedProperties));
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