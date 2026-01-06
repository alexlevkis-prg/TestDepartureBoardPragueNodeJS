const pathHelper = require('./pathHelper');
const path = require('path');
const fs = require('fs');

function readLocalizedProperties(fileName, language) {
    return new Promise((resolve, reject) => {
        var localizationPath = pathHelper.getLocalizationPath(language);
        var filePath = path.resolve(localizationPath+'/'+fileName+'.json');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                var object = JSON.parse(data);
                if (object) {
                    resolve(object);
                } else {
                    resolve('');
                }
            } 
        });
    });
}

module.exports = { readLocalizedProperties }