const requestHelper = require('../helpers/requestHelper');
const emojiHelper = require('../helpers/emojiHelper');
const messageHelper = require('../helpers/messageHelper');
const setLanguageCommand = require('../commands/setLanguageCommand');
const localizationHelper = require('../helpers/localizationHelper');
const path = require('path');
const fullPath = path.resolve("stops.json");
const fs = require('fs');

require('dotenv').config();

const process = async (bot, query, language) => {
    try {
        const data = query.data;
        if (data.includes('Stop:')) { //processing selected stop
            var arr = data.split(':');
            var stopName = arr[arr.length - 1];
            suggestionMessageId = query.message.message_id;
            localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) => {
                fs.readFile(fullPath, (err, d) => {
                    if (err) {
                        console.error("Error reading file: ", err);
                        return;
                    }
                    const result = JSON.parse(d);
                    console.log("File has been read");
                    let stop = result.stopGroups.find(sg => sg.name == stopName 
                        && (sg.stops.every(p => p.zone.includes("P")) || sg.stops.every(p => (p.zone.includes("0") && p.zone !== "10") || sg.stops.every(p => p.zone.includes("B")))));
                    if (stop){
                        if (stop.stops.length > 2) {
                            let buttonsArray = [];
                            for(let j = 0; j < stop.stops.length; j++) {
                                if (stop.stops[j].mainTrafficType !== "unknown" || stop.stops[j].mainTrafficType !== "undefined") {
                                    if (j % 2 == 0) {
                                        buttonsArray.push([]); 
                                        buttonsArray[buttonsArray.length - 1]
                                            .push({
                                                text: emojiHelper.getTransportEmoji(stop.stops[j].mainTrafficType)+' '+messageHelper.getPlatformTitle(localizedProperties)+' '+stop.stops[j].platform,
                                                callback_data: 'Platform:'+stop.stops[j].platform+';StopName:'+stop.name
                                            });
                                    } else {
                                        buttonsArray[buttonsArray.length - 1]
                                            .push({
                                                text: emojiHelper.getTransportEmoji(stop.stops[j].mainTrafficType)+' '+messageHelper.getPlatformTitle(localizedProperties)+' '+stop.stops[j].platform,
                                                callback_data: 'Platform:'+stop.stops[j].platform+';StopName:'+stop.name
                                            });
                                    }
                                }                     
                            }
                            var options = {
                                reply_markup: JSON.stringify({
                                    inline_keyboard: buttonsArray
                                }),
                                parse_mode: "HTML"
                            };
                            messageHelper.deleteMessage(bot, query.message.chat.id ?? process.env.clientId, query.message.message_id).then(() => {
                                bot.sendMessage(query.message.chat.id ?? process.env.clientId, "<b>"+stop.name+"</b>. "+messageHelper.getSelectStopMessage(localizedProperties), options); 
                            });
                        } else {
                            var gtfsIds = [];
                            stop.stops.forEach(p => {
                                gtfsIds.push(p.gtfsIds);
                            });
                            requestHelper.getDepartureBoard(gtfsIds).then((departureBoard) => {
                                var departureBoardObject = JSON.parse(departureBoard);
                                requestHelper.getInfoTexts(gtfsIds).then((info) => {
                                    var infoTextsObject = JSON.parse(info).infotexts;
                                    var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, stopName, infoTextsObject, localizedProperties);
                                    messageHelper.deleteMessage(bot, query.message.chat.id ?? process.env.clientId, query.message.message_id).then(() => {
                                        bot.sendLocation(query.message.chat.id ?? process.env.clientId, stop.avgLat, stop.avgLon).then(() => {
                                            var opts = {
                                                parse_mode: "HTML"
                                            }
                                            bot.sendMessage(query.message.chat.id ?? process.env.clientId, departureBoardMessage, opts);
                                        });
                                    });
                                });
                            });
                        }
                    } else {
                        var opts = {
                            parse_mode: "HTML"
                        }
                        bot.sendMessage(chatId, messageHelper.getNoSuggestionsMessage(localizedProperties), opts);
                    }
                })
            });
        } else if (data.includes("Platform:")) { //processing platform
            var arr = data.split(';');
            var stop = arr[arr.length - 1];
            var platform = arr[0];
            var stopArr = stop.split(':');
            var stopName = stopArr[stopArr.length - 1];
            var platformArr = platform.split(':');
            var platformCode = platformArr[platformArr.length - 1];
            localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) => {
                fs.readFile(fullPath, (err, d) => {
                    if (err) {
                        console.error("Error reading file: ", err);
                        return;
                    }
                    const result = JSON.parse(d);
                    console.log("File has been read");
                    let stop = result.stopGroups.find(sg => sg.name == stopName && sg.municipality == "Praha");
                    var selectedPlatform = stop.stops.find(s => s.platform === platformCode);
                    if (stop) {
                        var gtfsIds = stop.stops.find(p => p.platform == platformCode).gtfsIds;
                        var lat = stop.stops.find(p => p.platform == platformCode).lat;
                        var lon = stop.stops.find(p => p.platform == platformCode).lon;
                        requestHelper.getDepartureBoard(gtfsIds).then((departureBoard) => {
                            var departureBoardObject = JSON.parse(departureBoard);
                            requestHelper.getInfoTexts(gtfsIds).then((info) => {
                                var infoTextsObject = JSON.parse(info).infotexts;
                                var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, selectedPlatform.altIdosName, infoTextsObject, localizedProperties);
                                messageHelper.deleteMessage(bot, query.message.chat.id ?? process.env.clientId, query.message.message_id).then(() => {
                                    bot.sendLocation(query.message.chat.id ?? process.env.clientId, lat, lon).then(() => {
                                        var opts = {
                                            parse_mode: "HTML"
                                        }
                                        bot.sendMessage(query.message.chat.id ?? process.env.clientId, departureBoardMessage, opts);
                                    });
                                });
                            });
                        });
                        
                    } else {
                        var opts = {
                            parse_mode: "HTML"
                        }
                        bot.sendMessage(chatId, messageHelper.getNoSuggestionsMessage(localizedProperties), opts);
                    }
                });
            });
        }
    } catch (ex) {
        console.error(ex.message);
    }
}

const setLanguage = async (bot, chatId, query) => {
    try {
        setLanguageCommand.command(bot, chatId, query);
    } catch (ex) {
        console.error(ex);
    }
}

module.exports = { process, setLanguage }