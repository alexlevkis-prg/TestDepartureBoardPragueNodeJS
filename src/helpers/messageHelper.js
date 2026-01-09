const emojiHelper = require('./emojiHelper');
const dataService = require('../data/dataService');

function buildDepartureBoardMessage(departureBoard, stopName, line, isNight, infoTexts, languageCode, type) {
    var stringBuilder = [];
    stringBuilder.push("<b>"+stopName.toUpperCase()+"</b> 🚏\r\n\r\n");
    if (infoTexts && infoTexts.length > 0) {
        var generalInfos = infoTexts.filter(f => f.display_type == "general");
        putInfoTexts(infoTexts, generalInfos);
    }
    if (departureBoard.length > 0) {
        if (departureBoard.every(x => x.length == 0)) {
            stringBuilder.push(getNotAvailableLineMessagePart1(languageCode)
                +emojiHelper.getTransportEmoji(type)+emojiHelper.isNightLine(isNight)
                +line+getNotAvailableLineMessagePart2(languageCode));
        } else {
            departureBoard.forEach(db => {
                if (db.length > 0) {
                    var platformCode = db[0].stop.platform_code;
                    stringBuilder.push("<b>"+getOnlyPlatformTitle(languageCode, db[0].route.type)+" "+platformCode+"</b>\r\n");
                    db.forEach(platformDeparture => {
                        var platformInfoTexts = infoTexts.filter(i => i.related_stops.some(s => s === platformDeparture.stop.id));
                        putInfoTexts(platformInfoTexts, stringBuilder);
                        stringBuilder.push(emojiHelper.getTransportEmoji(platformDeparture.route.type));
                        if (isNight) {
                            stringBuilder.push(emojiHelper.isNightLine(isNight));
                        }
                        stringBuilder.push(emojiHelper.getAdditionalVehicleEmojis(platformDeparture.vehicle));
                        stringBuilder.push("    ");
                        stringBuilder.push("<b>"+platformDeparture.route.short_name+"</b>  ->  ");
                        stringBuilder.push("<b>"+platformDeparture.trip.headsign+"</b>    ");
                        if (platformDeparture.trip.is_canceled) {
                            stringBuilder.push("<b>"+getCancelledTitle(languageCode)+"</b>❌");
                        } else {
                            var delayInMinutes = Math.round((platformDeparture.departure.delay_seconds ?? 0) / 60);
                            if (platformDeparture.departure.minutes === 0 && delayInMinutes === 0) {
                                stringBuilder.push("<b>"+getArrivedTitle(languageCode)+"</b>✅");
                            } else if (platformDeparture.departure.minutes === 0 && delayInMinutes > 0) {
                                stringBuilder.push(getDelayingForTitle(languageCode)+" "+delayInMinutes+" "+getMinuteTitle(delayInMinutes, languageCode, false));
                            } else {
                                stringBuilder.push(getInTitle(languageCode)+" "+platformDeparture.departure.minutes+" "+getMinuteTitle(platformDeparture.departure.minutes, languageCode, false)+" ");
                                if (delayInMinutes > 0) {
                                    stringBuilder.push("("+getDelayTitle(languageCode)+": <i>"+delayInMinutes+" "+getMinuteTitle(delayInMinutes, languageCode, true)+"</i>)");
                                }
                            }
                        }
                        stringBuilder.push("\r\n");
                    });
                    stringBuilder.push("\r\n"); 
                }  
            });
        }
    } else {
        stringBuilder.push(getNoPublicTransportMessage(languageCode));
    } 
    return stringBuilder.join("");
}

function buildSettingsMessage(languageCode) {
    return dataService.getMessageLocalization('SettingsMessage', languageCode)?.Value ?? '';
}

function putInfoTexts(infos, sb) {
    if (infos && infos.length > 0) {
        var czechTexts = infos.filter(f => f.text);
        var englishTexts = infos.filter(f => f.text_en);
        sb.push("🇨🇿⚠️");
        czechTexts.forEach(czt => {
            sb.push(czt+"\r\n");
        });
        sb.push("\r\n");
        englishTexts.forEach(ent => {
            sb.push(ent+"\r\n");
        });
    }
}

function getNoSuggestionsMessage(languageCode) {
    return dataService.getMessageLocalization('NoSuggestionMessage', languageCode)?.Value ?? '';
}

function getSelectSuggestionMessage(languageCode) {
    return dataService.getMessageLocalization('SelectSuggestionMessage', languageCode)?.Value ?? '';
}

function getSelectStopMessage(languageCode) {
    return dataService.getMessageLocalization('SelectStopMessage', languageCode)?.Value ?? '';
}

function getSelectLineMessage(languageCode) {
    return dataService.getMessageLocalization('SelectLineMessage', languageCode)?.Value ?? '';
}

function getSelectDirectionMessage(languageCode) {
    return dataService.getMessageLocalization('SelectDirectionMessage', languageCode)?.Value ?? '';
}

function getNotAvailableLineMessagePart1(languageCode) {
    return dataService.getMessageLocalization('NotAvailableLineMessagePart1', languageCode)?.Value ?? '';
}

function getNotAvailableLineMessagePart2(languageCode) {
    return dataService.getMessageLocalization('NotAvailableLineMessagePart2', languageCode)?.Value ?? '';
}

function getNoPublicTransportMessage(languageCode) {
    return dataService.getMessageLocalization('NoPublicTransportMessage', languageCode)?.Value ?? '';
}

function getDelayTitle(languageCode) {
    return dataService.getMessageLocalization('DelayTitle', languageCode)?.Value ?? '';
}

function getInTitle(languageCode) {
    return dataService.getMessageLocalization('InTitle', languageCode)?.Value ?? '';
}

function getDelayingForTitle(languageCode) {
    return dataService.getMessageLocalization('DelayingForTitle', languageCode)?.Value ?? '';
}

function getArrivedTitle(languageCode) {
    return dataService.getMessageLocalization('ArrivedTitle', languageCode)?.Value ?? '';
}

function getBackButtonTitle(languageCode) {
    return dataService.getMessageLocalization('Back', languageCode)?.Value ?? '<<';
}

function getInvalidSymbolsMessage(languageCode) {
    return dataService.getMessageLocalization('InvalidSymbols', languageCode)?.Value ?? '';
}

function getOnlyPlatformTitle(languageCode, transportType) {
    if (transportType.includes("metro")) {
        return dataService.getMessageLocalization('TrackTitle', languageCode)?.Value ?? '';
    } else if(transportType.includes("train")) { 
        return dataService.getMessageLocalization('StationTitleFull', languageCode)?.Value ?? '';
    } else {
        return dataService.getMessageLocalization('PlatformTitleFull', languageCode)?.Value ?? '';
    }
}

function getPlatformTitle(languageCode, platform, stopName) {
    if (stopName != platform.altIdosName) {
        var point = '';
        if (platform.mainTrafficType.includes("metro")) {
            point = 'MetroTitleShort'
        } else if (platform.mainTrafficType.includes("train")) {
            point = 'StationTitleShort'
        } else {
            point = 'PlatformTitleShort'
        }
        var localizedPlatformTitle = dataService.getMessageLocalization(point, languageCode)?.Value ?? '';
        return localizedPlatformTitle+" "+platform.platform+" "+platform.altIdosName.replace(stopName, '').trim();
    }
    var point = '';
        if (platform.mainTrafficType.includes("metro")) {
            point = 'MetroTitleFull'
        } else if (platform.mainTrafficType.includes("train")) {
            point = 'StationTitleFull'
        } else {
            point = 'PlatformTitleFull'
        }
    var localizedPlatformTitle = dataService.getMessageLocalization(point, languageCode)?.Value ?? '';
    return localizedPlatformTitle+" "+platform.platform
}

function getCancelledTitle(languageCode) {
    return dataService.getMessageLocalization('CancelledTitle', languageCode)?.Value ?? '';
}

function getMinuteTitle(minutes, languageCode, nominative) {
    var result = '';
    if (minutes == 1 && nominative) {
        result = dataService.getMessageLocalization('MinuteTitleNominative', languageCode)?.Value ?? '';
    } else if (minutes == 1 && !nominative) {
        result = dataService.getMessageLocalization('MinuteTitleNonNominative', languageCode)?.Value ?? '';
    } else if (minutes >= 2 && minutes <= 4) {
        result = dataService.getMessageLocalization('Minutes2to4Title', languageCode)?.Value ?? '';
    } else {
        result = dataService.getMessageLocalization('MinutesMore5Title', languageCode)?.Value ?? '';
    }
    return result;
}

function buildLanguageChangedMessage(languageCode) {
    return dataService.getMessageLocalization('LanguageChangedMessage', languageCode)?.Value ?? '';
}

function buildWelcomeMessage(languageCode) {
    return dataService.getMessageLocalization('WelcomeMessage', languageCode)?.Value ?? '';
}

function buildHelpMessage(languageCode) {
    return dataService.getMessageLocalization('HelpMessage', languageCode)?.Value ?? '';
}

function deleteMessage(bot, chatId, messageId) {
    return new Promise((resolve, reject) => {
        if (messageId > 0) {
            bot.deleteMessage(chatId, messageId).then(() => {
                resolve(true);
            }).catch((ex) => {
                console.error(ex.message);
                reject(false);
            });
        } else {
            resolve(true)
        }
    });
}

module.exports = { 
    buildDepartureBoardMessage,
    buildWelcomeMessage,
    getSelectSuggestionMessage,
    getNoSuggestionsMessage,
    deleteMessage,
    getPlatformTitle,
    getOnlyPlatformTitle,
    getSelectStopMessage,
    getSelectLineMessage,
    getSelectDirectionMessage,
    getBackButtonTitle,
    buildSettingsMessage,
    buildLanguageChangedMessage,
    getInvalidSymbolsMessage,
    buildHelpMessage
}