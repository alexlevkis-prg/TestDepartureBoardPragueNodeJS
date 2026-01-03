const TelegramBot = require('node-telegram-bot-api');
const requestHelper = require('./helpers/requestHelper');
const emojiHelper = require('./helpers/emojiHelper');
const messageHelper = require('./helpers/messageHelper');
const suggestionHelper = require('./helpers/suggestionHelper');
const config = require('./config');
const fs = require('fs');

require('dotenv').config();
const token = config.clientToken;
const bot = new TelegramBot(token, {polling: true});
var locationMessageId = 0;
var suggestionMessageId = 0;
var textMessageId = 0;

bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id ?? process.env.clientId;
        if (msg.text == null || msg.text == undefined) {
            return;
        } else if (msg.text == "/start") {
            const opts = {
                parse_mode: "HTML"
            }
            bot.sendMessage(chatId, "Welcome to the <b>Departure Board</b>. Prague bot. \r\nTo start using it please type here the stop/station name in <b>Czech</b> language \r\nThe bot will return you info about the nearest public transport for your stop/station \r\nIf your stop/station has multiple transport types, the bot will suggest you to select particular one.", opts);
        } else {
            fs.readFile('stops.json', (err, data) => {
                if (err) {
                    console.error("Error reading file: ", err);
                    return;
                }
                const result = JSON.parse(data);
                console.log("File has been read");
                var stopNameVariations = suggestionHelper.getSuggestion(msg.text.toLowerCase());
                let stops = result.stopGroups.reduce((acc, sg) => {
                    if (stopNameVariations.some(s => sg.name.toLowerCase().includes(s)) 
                        && (sg.stops.every(p => p.zone.includes("P")) || sg.stops.every(p => (p.zone.includes("0") && p.zone !== "10") || sg.stops.every(p => p.zone.includes("B"))))) {
                        acc.push(sg);
                    }
                    return acc;
                }, []);
                if(stops.length > 1) {
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
                    bot.sendMessage(msg.chat.id, "Please select suggestion", options).then((m) =>{
                        suggestionMessageId = m.message_id
                    });
                }
            });     
        }
    } catch (ex) {
        console.error(ex.message);
    }
});

bot.on('callback_query', function onCallbackQuery(query) {
    try {
        const data = query.data;
        if (data.includes('Stop:')) { //processing selected stop
            var arr = data.split(':');
            var stopName = arr[arr.length - 1];
            suggestionMessageId = query.message.message_id;
            fs.readFile('stops.json', (err, d) => {
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
                            if (stop.stops[j].mainTrafficType != "unknown") {
                                if (j % 2 == 0) {
                                    buttonsArray.push([]); 
                                    buttonsArray[buttonsArray.length - 1]
                                        .push({
                                            text: emojiHelper.getTransportEmoji(stop.stops[j].mainTrafficType)+' Platform '+stop.stops[j].platform,
                                            callback_data: 'Platform:'+stop.stops[j].platform+';StopName:'+stop.name
                                        });
                                } else {
                                    buttonsArray[buttonsArray.length - 1]
                                        .push({
                                            text: emojiHelper.getTransportEmoji(stop.stops[j].mainTrafficType)+' Platform '+stop.stops[j].platform,
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
                        deleteMessages(query.message.chat.id ?? process.env.clientId).then(() => {
                            bot.sendLocation(query.message.chat.id ?? process.env.clientId, stop.avgLat, stop.avgLon).then((l) => {
                            locationMessageId = l.message_id
                                bot.sendMessage(query.message.chat.id ?? process.env.clientId, "<b>"+stop.name+"</b>. Please select stop", options).then((m) =>{
                                    textMessageId = m.message_id
                                });
                            });
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
                                var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, stopName, infoTextsObject);
                                deleteMessages(query.message.chat.id ?? process.env.clientId).then(() => {
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
                    bot.sendMessage(chatId, "Sorry but no any stops exist with typed text. Please try do another attempt with different text", opts);
                }
            })
        } else if (data.includes("Platform:")) { //processing platform
            var arr = data.split(';');
            var stop = arr[arr.length - 1];
            var platform = arr[0];
            var stopArr = stop.split(':');
            var stopName = stopArr[stopArr.length - 1];
            var platformArr = platform.split(':');
            var platformCode = platformArr[platformArr.length - 1];
            fs.readFile('stops.json', (err, d) => {
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
                            var departureBoardMessage = messageHelper.buildDepartureBoardMessage(departureBoardObject, selectedPlatform.altIdosName, infoTextsObject);
                            deleteMessages(query.message.chat.id ?? process.env.clientId).then(() => {
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
                    bot.sendMessage(chatId, "Sorry but no any stops exist with typed text. Please try do another attempt with different text", opts);
                }
            });
        }
    } catch (ex) {
        console.error(ex.message);
    }
});

function deleteMessages(chatId) {
    return new Promise((resolve, reject) => {
        if (textMessageId > 0) {
            bot.deleteMessage(chatId, textMessageId).then(() => {
                textMessageId = 0;
                if (locationMessageId > 0) {
                    bot.deleteMessage(chatId, locationMessageId).then(() => {
                        locationMessageId = 0;
                        if (suggestionMessageId > 0) {
                            bot.deleteMessage(chatId, suggestionMessageId).then(() => {
                                suggestionMessageId = 0;
                                resolve(1);
                            }).catch(() => {
                                reject(-1);
                            }); 
                        }
                        resolve(1);
                    }).catch(() => {
                        reject(-1);
                    }); 
                }
                resolve(1);
            }).catch(() => {
                reject(-1);
            });      
        } else if (locationMessageId > 0) {
            bot.deleteMessage(chatId, locationMessageId).then(() => {
                locationMessageId = 0;
                if (suggestionMessageId > 0) {
                    bot.deleteMessage(chatId, suggestionMessageId).then(() => {
                        suggestionMessageId = 0;
                        resolve(1);
                    }).catch(() => {
                        reject(-1);
                    }); 
                }
                resolve(1);
            }).catch(() => {
                reject(-1);
            });
        } else if (suggestionMessageId > 0) {
            bot.deleteMessage(chatId, suggestionMessageId).then(() => {
                suggestionMessageId = 0;
                resolve(1);
            }).catch(() => {
                reject(-1);
            }); 
        }   
    });
}