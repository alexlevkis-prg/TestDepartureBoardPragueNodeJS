const messageHelper = require('../helpers/messageHelper');
const localizationHelper = require('../helpers/localizationHelper');
const config = require('../config');
const path = require('path');
const fullPath = path.resolve("data/userLangs.json");
const fs = require('fs');

require('dotenv').config();

const command = async (bot, chatId, query) => {
    var sb = [];
    sb.push('{\"key\":'+query.from.id);
    sb.push(',');
    sb.push('\"value\":\"'+query.data+'\"}');
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            var json = JSON.parse(data);
            var exist = json.find(x => x.key == query.from.id);
            if (!exist) {
                json.push(JSON.parse(sb.join("")));
                fs.writeFile(fullPath, JSON.stringify(json), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('User '+ query.from.id + ' added language setting');
                        localizationHelper.readLocalizedProperties('messages', query.data).then((localizedProperties) => {
                            bot.sendMessage(chatId ?? config.clientId, messageHelper.buildLanguageChangedMessage(localizedProperties));
                        }); 
                    }
                });
            } else if (exist.value !== query.data) {
                exist.value = query.data;
                fs.writeFile(fullPath, JSON.stringify(json), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('User '+ query.from.id + ' changed language setting');
                        localizationHelper.readLocalizedProperties('messages', query.data).then((localizedProperties) => {
                            bot.sendMessage(chatId ?? config.clientId, messageHelper.buildLanguageChangedMessage(localizedProperties));
                        });
                    }
                });
            }    
        }
    });
}

module.exports = { command }