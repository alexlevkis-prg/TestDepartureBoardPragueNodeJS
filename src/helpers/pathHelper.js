function getLocalizationPath(language) {
    switch (language) {
        case 'en': {
            return 'localization/en';
        }
        case 'ru': {
            return 'localization/ru';
        }
        case 'uk': {
            return 'localization/uk';
        }
        case 'cs': {
            return 'localization/cs';
        }
        default: {
            return 'localization/en';
        }
    }
}

module.exports = { getLocalizationPath }