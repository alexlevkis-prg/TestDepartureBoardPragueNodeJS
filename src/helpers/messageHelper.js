const emojiHelper = require('./emojiHelper');
function buildDepartureBoardMessage(departureBoard, stopName, infoTexts) {
    var stringBuilder = [];
    stringBuilder.push("<b>"+stopName.toUpperCase()+"</b> 🚏\r\n\r\n");
    if (infoTexts && infoTexts.length > 0) {
        var generalInfos = infoTexts.filter(f => f.display_type == "general");
        putInfoTexts(infoTexts, generalInfos);
    }
    if (departureBoard.length > 0) {
        departureBoard.forEach(db => {
            if (db.length > 0) {
                var platformCode = db[0].stop.platform_code;
                stringBuilder.push("<b>Platform "+platformCode+"</b>\r\n");
                db.forEach(platformDeparture => {
                    var platformInfoTexts = infoTexts.filter(i => i.related_stops.some(s => s === platformDeparture.stop.id));
                    putInfoTexts(platformInfoTexts, stringBuilder);
                    stringBuilder.push(emojiHelper.getTransportEmoji(platformDeparture.route.type));
                    stringBuilder.push(emojiHelper.getAdditionalVehicleEmojis(platformDeparture.vehicle));
                    stringBuilder.push("    ");
                    stringBuilder.push("<b>"+platformDeparture.route.short_name+"</b>  ->  ");
                    stringBuilder.push("<b>"+platformDeparture.trip.headsign+"</b>    ");
                    if (platformDeparture.trip.is_canceled) {
                        stringBuilder.push("<b>cancelled</b>❌");
                    } else {
                        var delayInMinutes = Math.round((platformDeparture.departure.delay_seconds ?? 0) / 60);
                        if (platformDeparture.departure.minutes === 0 && delayInMinutes === 0) {
                            stringBuilder.push("<b>arrived</b>✅");
                        } else if (platformDeparture.departure.minutes === 0 && delayInMinutes > 0) {
                            stringBuilder.push("delaying for "+delayInMinutes+" "+getMinuteTitle(delayInMinutes));
                        } else {
                            stringBuilder.push("in "+platformDeparture.departure.minutes+" "+getMinuteTitle(platformDeparture.departure.minutes)+" ");
                            if (delayInMinutes > 0) {
                                stringBuilder.push("(delay: <i>"+delayInMinutes+" "+getMinuteTitle(delayInMinutes)+"</i>)");
                            }
                        }
                    }
                    stringBuilder.push("\r\n");
                });
                stringBuilder.push("\r\n"); 
            }  
        });
    } else {
        stringBuilder.push("Sorry but there are no any available public transport at that moment. Please try another stop. \r\n");
    } 
    
    return stringBuilder.join("");
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

function getMinuteTitle(minutes) {
    return minutes > 1 ? "minutes" : "minute";
}

module.exports = { buildDepartureBoardMessage }