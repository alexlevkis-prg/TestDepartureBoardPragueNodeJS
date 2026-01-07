function getTransportEmoji(transport) {
    switch(transport) {
        case "bus": return '🚌';
        case "trolleybus": return '🚎';
        case "tram": return '🚊';
        case "metro": return '🚇';
        case "metroA": return '🚇';
        case "metroB": return '🚇';
        case "metroC": return '🚇';
        case "ferry": return '⛴';
        case "train": return '🚋';
        case "funicular": return '🚠';
        case "ext_miscellaneous": return '🚐';
        default: return '🚐';
    }
}

function getAdditionalVehicleEmojis(vehicle) {
    var sb = [];
    if (vehicle.is_wheelchair_accessible) {
        sb.push("♿️");
    }
    if (vehicle.is_air_conditioned) {
        sb.push("❄️");
    }
    if (vehicle.has_charger) {
        sb.push("🔋");
    }
    return sb.join("");
}

function isNightLine(isNight) {
    if (isNight) {
        return "🌙";
    }
    return "";
}

function getAdditionalPlatformEmojis(platform) {
    if (platform.wheelchairAccess && platform.wheelchairAccess === "possible") {
        return "♿️";
    } else {
        return "";
    }
}

module.exports = { getTransportEmoji, getAdditionalVehicleEmojis, getAdditionalPlatformEmojis, isNightLine }