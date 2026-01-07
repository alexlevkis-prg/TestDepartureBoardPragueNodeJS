const emojiHelper = require('./emojiHelper');

function buildDepartureBoardMessage(departureBoard, stopName, line, isNight, infoTexts, localizedProperties, type) {
    var stringBuilder = [];
    stringBuilder.push("<b>"+stopName.toUpperCase()+"</b> 🚏\r\n\r\n");
    if (infoTexts && infoTexts.length > 0) {
        var generalInfos = infoTexts.filter(f => f.display_type == "general");
        putInfoTexts(infoTexts, generalInfos);
    }
    if (departureBoard.length > 0) {
        if (departureBoard.every(x => x.length == 0)) {
            stringBuilder.push(getNotAvailableLineMessagePart1(localizedProperties)
                +emojiHelper.getTransportEmoji(type)+emojiHelper.isNightLine(isNight)
                +line+getNotAvailableLineMessagePart2(localizedProperties));
        } else {
            departureBoard.forEach(db => {
                if (db.length > 0) {
                    var platformCode = db[0].stop.platform_code;
                    stringBuilder.push("<b>"+getOnlyPlatformTitle(localizedProperties, db[0].route.type)+" "+platformCode+"</b>\r\n");
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
                            stringBuilder.push("<b>"+getCancelledTitle(localizedProperties)+"</b>❌");
                        } else {
                            var delayInMinutes = Math.round((platformDeparture.departure.delay_seconds ?? 0) / 60);
                            if (platformDeparture.departure.minutes === 0 && delayInMinutes === 0) {
                                stringBuilder.push("<b>"+getArrivedTitle(localizedProperties)+"</b>✅");
                            } else if (platformDeparture.departure.minutes === 0 && delayInMinutes > 0) {
                                stringBuilder.push(getDelayingForTitle(localizedProperties)+" "+delayInMinutes+" "+getMinuteTitle(delayInMinutes, localizedProperties, false));
                            } else {
                                stringBuilder.push(getInTitle(localizedProperties)+" "+platformDeparture.departure.minutes+" "+getMinuteTitle(platformDeparture.departure.minutes, localizedProperties, false)+" ");
                                if (delayInMinutes > 0) {
                                    stringBuilder.push("("+getDelayTitle(localizedProperties)+": <i>"+delayInMinutes+" "+getMinuteTitle(delayInMinutes, localizedProperties, true)+"</i>)");
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
        stringBuilder.push(getNoPublicTransportMessage(localizedProperties));
    } 
    return stringBuilder.join("");
}

function buildSettingsMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key ==='SettingsMessage')?.value ?? '';
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

function getNoSuggestionsMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'NoSuggestionsMessage')?.value ?? '';
}

function getSelectSuggestionMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'SelectSuggestionMessage')?.value ?? '';
}

function getSelectStopMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'SelectStopMessage')?.value ?? '';
}

function getSelectLineMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'SelectLineMessage')?.value ?? '';
}

function getSelectDirectionMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'SelectDirectionMessage')?.value ?? '';
}

function getNotAvailableLineMessagePart1(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'NotAvailableLineMessagePart1')?.value ?? '';
}

function getNotAvailableLineMessagePart2(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'NotAvailableLineMessagePart2')?.value ?? '';
}

function getNoPublicTransportMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'NoPublicTransportMessage')?.value ?? '';
}

function getDelayTitle(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'DelayTitle')?.value ?? '';
}

function getInTitle(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'InTitle')?.value ?? '';
}

function getDelayingForTitle(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'DelayingForTitle')?.value ?? '';
}

function getArrivedTitle(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'ArrivedTitle')?.value ?? '';
}

function getBackButtonTitle(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'Back')?.value ?? '<<';
}

function getOnlyPlatformTitle(localizedProperties, transportType) {
    if (transportType.includes("metro")) {
        return localizedProperties.find(lp => lp.key === 'TrackTitle')?.value ?? '';
    } else if(transportType.includes("train")) { 
        return localizedProperties.find(lp => lp.key === 'StationTitleFull')?.value ?? '';
    } else {
        return localizedProperties.find(lp => lp.key === 'PlatformTitleFull')?.value ?? '';
    }
}

function getPlatformTitle(localizedProperties, platform, stopName) {
    if (stopName != platform.altIdosName) {
        var point = '';
        if (platform.mainTrafficType.includes("metro")) {
            point = 'MetroTitleShort'
        } else if (platform.mainTrafficType.includes("train")) {
            point = 'StationTitleShort'
        } else {
            point = 'PlatformTitleShort'
        }
        var localizedPlatformTitle = localizedProperties.find(lp => lp.key === point)?.value ?? '';
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
    var localizedPlatformTitle = localizedProperties.find(lp => lp.key === point)?.value ?? '';
    return localizedPlatformTitle+" "+platform.platform
}

function getCancelledTitle(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'CancelledTitle')?.value ?? '';
}

function getMinuteTitle(minutes, localizedProperties, nominative) {
    var result = '';
    if (minutes == 1 && nominative) {
        result = localizedProperties.find(x => x.key == 'MinuteTitleNominative')?.value ?? '';
    } else if (minutes == 1 && !nominative) {
        result = localizedProperties.find(x => x.key == 'MinuteTitleNonNominative')?.value ?? '';
    } else if (minutes >= 2 && minutes <= 4) {
        result = localizedProperties.find(x => x.key == 'Minutes2to4Title')?.value ?? '';
    } else {
        result = localizedProperties.find(x => x.key == 'MinutesMore5Title')?.value ?? '';
    }
    return result;
}

function buildLanguageChangedMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'LanguageChangedMessage')?.value ?? '';
}

function buildWelcomeMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'WelcomeMessage')?.value ?? '';
}

function buildHelpMessage(localizedProperties) {
    return localizedProperties.find(lp => lp.key === 'HelpMessage')?.value ?? '';
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
    buildHelpMessage
}