const requestHelper = require('../helpers/requestHelper');
const emojiHelper = require('../helpers/emojiHelper');
const messageHelper = require('../helpers/messageHelper');
const setLanguageCommand = require('../commands/setLanguageCommand');
const localizationHelper = require('../helpers/localizationHelper');
const path = require('path');
const fullPath = path.resolve("stops.json");
const fs = require('fs');
const config = require('../config');
const { text } = require('stream/consumers');

require('dotenv').config();

const process = async (bot, query, language) => {
    try {
        const data = query.data;
        if (data.includes('Stop:')) {
            var arr = data.split(';');
            var stopName = arr[0].split(':')[1];
            var typedText = arr[1].split(':')[1];
            localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) => {
                fs.readFile(fullPath, (err, data) => {
                    if (err) {
                        console.error("Error reading file: ", err);
                        return;
                    }
                    const result = JSON.parse(data);
                    console.log("File has been read");
                    let stop = result.stopGroups.find(sg => sg.name == stopName 
                        && (sg.stops.every(p => p.zone.includes("P")) || sg.stops.every(p => (p.zone.includes("0") && p.zone !== "10") || sg.stops.every(p => p.zone.includes("B")))));
                    if (stop) {
                        var stopLines = [];
                        stop.stops.forEach(s => {
                            if (s.lines && s.lines.length > 0) {
                                s.lines.forEach(line => {
                                    stopLines.push(line);
                                });
                            }
                        });
                        stopLines.sort((a, b) => {
                            if (a.type < b.type) {
                                return -1;
                            }
                            if (a.type > b.type) {
                                return 1;
                            }
                            return 0;
                        });
                        const grouped = stopLines.reduce((group, line) => {
                            const { id, type } = line;
                            if (!group[id]) {
                                group[id] = [];
                            }

                            if (!group[id]['line']) {
                                group[id]['line'] = [];
                            }

                            group[id]['line'].push(line);
                            return group;
                        }, []).filter(item => item);

                        //console.log(grouped);
                        let buttonsArray = [];
                        for (var i = 0; i < grouped.length; i++) {
                            if (i % 4 == 0) {
                                buttonsArray.push([]);
                            }
                            buttonsArray[buttonsArray.length - 1].push(
                                {
                                    text: emojiHelper.getTransportEmoji(grouped[i].line[0].type)+grouped[i].line[0].name,
                                    callback_data: 'S:'+stopName+';L:'+grouped[i].line[0].name+';T:'+grouped[i].line[0].type
                                }
                            );
                        }
                        buttonsArray.push([]);
                        buttonsArray[buttonsArray.length - 1].push({
                            text: messageHelper.getBackButtonTitle(localizedProperties),
                            callback_data: 'm:'+typedText
                        });

                        var options = {
                            chat_id: query.message.chat.id ?? config.clientId,
                            message_id: query.message.message_id,
                            reply_markup: JSON.stringify({
                                inline_keyboard: buttonsArray
                            }),
                            parse_mode: "HTML"
                        };
                        bot.editMessageText("<b>"+stop.name+".</b>"+messageHelper.getSelectLineMessage(localizedProperties), options);
                    }
                });
            });
        } else if (data.includes("L:") && data.includes("T:")) {
            var arr = data.split(';');
            var stopName = arr[0].split(':')[1];
            var line = arr[1].split(':')[1];
            var type = arr[2].split(':')[1];
            localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) =>{
                fs.readFile(fullPath, (err, data) => {
                    if (err) {
                        console.error("Error reading file: ", err);
                        return;
                    }
                    const result = JSON.parse(data);
                    console.log("File has been read");
                    let stop = result.stopGroups.find(sg => sg.name == stopName 
                        && (sg.stops.every(p => p.zone.includes("P")) || sg.stops.every(p => (p.zone.includes("0") && p.zone !== "10") || sg.stops.every(p => p.zone.includes("B")))));
                    if (stop) {
                        var stopLines = [];
                        stop.stops.forEach(s => {
                            if (s.lines && s.lines.length > 0) {
                                s.lines.forEach(line => {
                                    stopLines.push(line);
                                });
                            }
                        });
                        stopLines.sort((a, b) => {
                            if (a.type < b.type) {
                                return -1;
                            }
                            if (a.type > b.type) {
                                return 1;
                            }
                            return 0;
                        });
                        var directions = stopLines.filter(x => x.name == line && x.type == type);
                        var isNight = directions[0].isNight ?? false;
                        if (directions.length > 1) {
                            let buttonsArray = [];
                            buttonsArray.push([]);
                            directions.forEach(d => {
                                buttonsArray[0].push({
                                    text: '-> '+d.direction ?? d.direction2,
                                    callback_data: 'S:'+stopName+';L:'+d.name+';D:'+d.direction ?? d.direction2
                                });
                            });
                            var lastPrevButton = query.message.reply_markup.inline_keyboard[query.message.reply_markup.inline_keyboard.length - 1];
                            buttonsArray.push([]);
                            buttonsArray[buttonsArray.length - 1].push({
                                text: messageHelper.getBackButtonTitle(localizedProperties),
                                callback_data: 'Stop:'+stopName+';sg:'+lastPrevButton[0].callback_data.split(':')[1]
                            });


                            var options = {
                                chat_id: query.message.chat.id ?? config.clientId,
                                message_id: query.message.message_id,
                                reply_markup: JSON.stringify({
                                    inline_keyboard: buttonsArray
                                }),
                                parse_mode: "HTML"
                            };
                            bot.editMessageText(emojiHelper.getTransportEmoji(type)+emojiHelper.isNightLine(isNight)+"<b>"+line+".</b>"+messageHelper.getSelectDirectionMessage(localizedProperties), options);
                        } else {
                            var selectedPlatform = stop.stops.find(s => s.lines.some(l => l.name === line && l.type === type));
                            console.log(selectedPlatform);
                            var gtfsIds = selectedPlatform.gtfsIds;
                            var lat = selectedPlatform.lat;
                            var lon = selectedPlatform.lon;
                            requestHelper.getDepartureBoard(gtfsIds, line).then((departureBoard) => {
                                var departureBoardObject = JSON.parse(departureBoard);
                                requestHelper.getInfoTexts(gtfsIds).then((info) => {
                                    var infoTextsObject = JSON.parse(info).infotexts;
                                    var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, selectedPlatform.altIdosName ?? stopName, line, isNight, infoTextsObject, localizedProperties, type);
                                    messageHelper.deleteMessage(bot, query.message.chat.id ?? config.clientId, query.message.message_id).then(() => {
                                        bot.sendLocation(query.message.chat.id ?? config.clientId, lat, lon).then(() => {
                                            var opts = {
                                                parse_mode: "HTML"
                                            }
                                            bot.sendMessage(query.message.chat.id ?? config.clientId, departureBoardMessage, opts);
                                        });
                                    });
                                });
                            });
                        }
                    }
                });
            });
        } else if (data.includes("L:") && data.includes("D:")) {
            var arr = data.split(';');
            var stopName = arr[0].split(':')[1];
            var line = arr[1].split(':')[1];
            var direction = arr[2].split(':')[1];
            localizationHelper.readLocalizedProperties('messages', language).then((localizedProperties) => {
                fs.readFile(fullPath, (err, data) => {
                    if (err) {
                        console.error("Error reading file: ", err);
                        return;
                    }
                    const result = JSON.parse(data);
                    console.log("File has been read");
                    let stop = result.stopGroups.find(sg => sg.name == stopName 
                        && (sg.stops.every(p => p.zone.includes("P")) || sg.stops.every(p => (p.zone.includes("0") && p.zone !== "10") || sg.stops.every(p => p.zone.includes("B")))));
                    if (stop) {
                        var stopLines = [];
                        stop.stops.forEach(s => {
                            if (s.lines && s.lines.length > 0) {
                                s.lines.forEach(line => {
                                    stopLines.push(line);
                                });
                            }
                        });
                        stopLines.sort((a, b) => {
                            if (a.type < b.type) {
                                return -1;
                            }
                            if (a.type > b.type) {
                                return 1;
                            }
                            return 0;
                        });
                        var directions = stopLines.filter(x => x.name == line && (x.direction == direction || x.direction2 == direction));
                        var isNight = directions[0].isNight ?? false;
                        var selectedPlatform = stop.stops.find(s => s.lines.some(l => l.name === line && (l.direction === direction || l.direction2 === direction)));
                        console.log(selectedPlatform);
                        var gtfsIds = selectedPlatform.gtfsIds;
                        var lat = selectedPlatform.lat;
                        var lon = selectedPlatform.lon;
                        requestHelper.getDepartureBoard(gtfsIds, line).then((departureBoard) => {
                            var departureBoardObject = JSON.parse(departureBoard);
                            requestHelper.getInfoTexts(gtfsIds).then((info) => {
                                var infoTextsObject = JSON.parse(info).infotexts;
                                var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, selectedPlatform.altIdosName ?? stopName, line, isNight, infoTextsObject, localizedProperties, directions[0].type);
                                messageHelper.deleteMessage(bot, query.message.chat.id ?? config.clientId, query.message.message_id).then(() => {
                                    bot.sendLocation(query.message.chat.id ?? config.clientId, lat, lon).then(() => {
                                        var opts = {
                                            parse_mode: "HTML"
                                        }
                                        bot.sendMessage(query.message.chat.id ?? config.clientId, departureBoardMessage, opts);
                                    });
                                });
                            });
                        });
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