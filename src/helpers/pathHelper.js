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
        default: {
            return 'localization/en';
        }
    }
}

module.exports = { getLocalizationPath }