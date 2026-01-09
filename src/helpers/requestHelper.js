const https = require('https');
const config = require('../config');
const dataService = require('../data/dataService');

function getDepartureBoard(gtfsIds, routeShortName) {
    return new Promise(function(resolve, reject) {
         var options = {
            headers: {
                "X-Access-Token": dataService.getApplicationSetting('apiToken').SettingValue
            }  
        }
        var parameters = [];
        parameters.push("?");
        for (let index = 0; index < gtfsIds.length; index++) {
            parameters.push("stopIds[]={\"");
            parameters.push(index);
            parameters.push("\": [")
            parameters.push("\""+gtfsIds[index]+"\"");
            parameters.push("]}");
            if (gtfsIds.length - index > 1) {
                parameters.push("&");
            }
        }
        parameters.push("&routeShortNames="+routeShortName);
        parameters.push("&limit=3");
        parameters.push("&minutesAfter=60");
        var paramString = parameters.join('');
        https.get(config.apiUrl+'/v2/public/departureboards'+paramString, options, response => {
            if (response.statusCode != 200) {
                reject("Bad request");
            } else {
                let data = '';
                response.on('data', function(chunk) {
                    data += chunk;
                });

                response.on('end', () => {
                    console.log('done');
                    resolve(data);
                });
            } 
        }).on(
            'error', (err) =>{
                console.log(err.message);
                reject(err);
            }
        );
    });
}

function getInfoTexts(gtfsIds) {
    return new Promise(function(resolve, reject) {
        var options = {
            headers: {
                "X-Access-Token": dataService.getApplicationSetting('apiToken').SettingValue
            }  
        }
        var parameters = [];
        parameters.push("?");
        for(let index = 0; index < gtfsIds.length; index++) {
            parameters.push("ids[]="+gtfsIds[index]);
            if (gtfsIds.length - index > 1) {
                parameters.push("&");
            }
        }
        parameters.push("&minutesBefore=10&minutesAfter=60&preferredTimezone=Europe_Prague&mode=departures&order=real&filter=routeOnce&limit=20&total=0&offset=0");
        var paramString = parameters.join('');
        https.get(config.apiUrl+'/v2/pid/departureboards'+paramString, options, response => {
            if (response.statusCode != 200) {
                reject("Bad request");
            } else {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    console.log('done');
                    resolve(data);
                });
            }  
        }).on(
            'error', (err) =>{
                console.log(err.message);
                reject(err);
            }
        );
    });
}

module.exports = { getDepartureBoard, getInfoTexts }