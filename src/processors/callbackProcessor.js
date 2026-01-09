const requestHelper = require('../helpers/requestHelper');
const emojiHelper = require('../helpers/emojiHelper');
const messageHelper = require('../helpers/messageHelper');
const setLanguageCommand = require('../commands/setLanguageCommand');
const dataService = require('../data/dataService');
const config = require('../config');

require('dotenv').config();

const process = async (bot, query, language) => {
    try {
        const data = query.data;
        if (data.includes('Stop:')) {
            var arr = data.split(';');
            var stopName = arr[0].split(':')[1];
            var typedText = arr[1].split(':')[1];
            var stopWithPlatforms = dataService.getStopWithPlatforms(stopName);
            if (stopWithPlatforms) {
                let stopLines = [];
                stopWithPlatforms.forEach(stop => {
                    var lines = dataService.getPlatformLines(stop.Id);
                    stopLines.push.apply(stopLines, lines);
                });
                var lineNames = stopLines.reduce((acc, obj) =>{
                    if (!acc.some(o => o.LineName === obj.LineName && o.Type === obj.Type)) {
                        acc.push({LineName: obj.LineName, Type: obj.Type});
                    }
                    return acc;
                }, []);
                let buttonsArray = [];
                for (var i = 0; i < lineNames.length; i++) {
                    if (i % 4 == 0) {
                        buttonsArray.push([]);
                    }
                    buttonsArray[buttonsArray.length - 1].push(
                        {
                            text: emojiHelper.getTransportEmoji(lineNames[i].Type)+lineNames[i].LineName,
                            callback_data: 'S:'+stopName+';L:'+lineNames[i].LineName+';T:'+lineNames[i].Type
                        }
                    );
                }
                buttonsArray.push([]);
                buttonsArray[buttonsArray.length - 1].push({
                    text: messageHelper.getBackButtonTitle(language),
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
                bot.editMessageText("<b>"+stopName+".</b>"+messageHelper.getSelectLineMessage(language), options);
            }
        } else if (data.includes("L:") && data.includes("T:")) {
            var arr = data.split(';');
            var stopName = arr[0].split(':')[1];
            var line = arr[1].split(':')[1];
            var type = arr[2].split(':')[1];
            var stopWithPlatforms = dataService.getStopWithPlatforms(stopName);
            if (stopWithPlatforms) {
                let stopLines = [];
                stopWithPlatforms.forEach(stop => {
                    var lines = dataService.getPlatformLines(stop.Id);
                    stopLines.push.apply(stopLines, lines);
                });
                var directions = stopLines.filter(sl => sl.LineName === line);
                var isNight = directions[0].IsNight == 0 ? false : true;
                if (directions.length > 1) {
                    let buttonsArray = [];
                    buttonsArray.push([]);
                    directions.forEach(d => {
                        buttonsArray[0].push({
                            text: '-> '+d.Direction,
                            callback_data: 'S:'+stopName+';L:'+d.LineName+';D:'+d.Direction
                        });
                    });
                    var lastPrevButton = query.message.reply_markup.inline_keyboard[query.message.reply_markup.inline_keyboard.length - 1];
                    buttonsArray.push([]);
                    buttonsArray[buttonsArray.length - 1].push({
                        text: messageHelper.getBackButtonTitle(language),
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
                    bot.editMessageText(emojiHelper.getTransportEmoji(type)+emojiHelper.isNightLine(isNight)+"<b>"+line+".</b>"+messageHelper.getSelectDirectionMessage(language), options);
                } else {
                    var selectedPlatform = stopWithPlatforms.find(swp => swp.Id == directions[0].PlatformId);
                    let gtfsIds = [];
                    gtfsIds.push(selectedPlatform.GtfsIds);
                    var lat = selectedPlatform.Latitude;
                    var lon = selectedPlatform.Longitude;
                    requestHelper.getDepartureBoard(gtfsIds, line).then((departureBoard) => {
                        var departureBoardObject = JSON.parse(departureBoard);
                        requestHelper.getInfoTexts(gtfsIds).then((info) => {
                            var infoTextsObject = JSON.parse(info).infotexts;
                            var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, selectedPlatform.Name ?? stopName, line, isNight, infoTextsObject, language, type);
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
        } else if (data.includes("L:") && data.includes("D:")) {
            var arr = data.split(';');
            var stopName = arr[0].split(':')[1];
            var line = arr[1].split(':')[1];
            var direction = arr[2].split(':')[1];
            var stopWithPlatforms = dataService.getStopWithPlatforms(stopName);
            if (stopWithPlatforms) {
                let stopLines = [];
                stopWithPlatforms.forEach(stop => {
                    var lines = dataService.getPlatformLines(stop.Id);
                    stopLines.push.apply(stopLines, lines);
                });
                var directions = stopLines.filter(sl => sl.LineName == line && sl.Direction == direction);
                var isNight = directions[0].IsNight == 0 ? false : true;
                var selectedPlatform = stopWithPlatforms.find(swp => swp.Id == directions[0].PlatformId);
                let gtfsIds = [];
                gtfsIds.push(selectedPlatform.GtfsIds);
                var lat = selectedPlatform.Latitude;
                var lon = selectedPlatform.Longitude;
                requestHelper.getDepartureBoard(gtfsIds, line).then((departureBoard) => {
                    var departureBoardObject = JSON.parse(departureBoard);
                    requestHelper.getInfoTexts(gtfsIds).then((info) => {
                        var infoTextsObject = JSON.parse(info).infotexts;
                        var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, selectedPlatform.Name ?? stopName, line, isNight, infoTextsObject, language, directions[0].Type);
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
    } catch (ex) {
        console.error(ex.message);
    }
}

const setLanguage = async (bot, chatId, query, language) => {
    try {
        setLanguageCommand.command(bot, chatId, query, language);
    } catch (ex) {
        console.error(ex);
    }
}

module.exports = { process, setLanguage }