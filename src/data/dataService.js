const database = require('better-sqlite3');
require('dotenv').config();

function getStopSuggestions(suggestions) {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        let result = [];
        var sql = 'SELECT Name FROM Stops WHERE Name LIKE ';
        suggestions.forEach(sug => {
            var rows = db.prepare(sql+'\'%'+sug+'%\'').all();
            result.push.apply(result, rows);
        });
        db.close();
        return result;
    } catch (ex) {
        console.error(ex.message);
    }
}

function getApplicationSetting(settingName) {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        var sql = 'SELECT SettingValue FROM Application WHERE SettingName = \'' + settingName + '\'';
        var result = db.prepare(sql).get();
        db.close();
        console.log(result);
        return result;
    } catch (ex) {
        console.error(ex.message);
    }
}

function getSupportedLanguages() {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        var sql = 'SELECT LanguageCode, LanguageName FROM Languages';
        var result = db.prepare(sql).all();
        db.close();
        return result;
    } catch (ex) {
        console.error(ex.message);
    }
}

function getUserLanguage(userId) {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        var sql = 'SELECT LanguageCode FROM UserSettings WHERE UserId = '+userId;
        var result = db.prepare(sql).get();
        db.close();
        return result;
    } catch (ex) {
        console.error(ex.message);
    }
}

function setUserLanguage(userId, language, isUpdate) {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        let sql = '';
        if (isUpdate) {
            sql = 'UPDATE UserSettings SET LanguageCode = \''+language+'\' WHERE UserId = '+userId;
        } else {
            sql = 'INSERT INTO UserSettings (UserId, LanguageCode) VALUES (\''+language+'\', '+userId+')';
        }
        db.exec(sql);
        db.close();
    }
    catch (ex) {
        console.error(ex.message);
    }
}

function getMessageLocalization(key, languageCode) {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        var sql = 'SELECT ML.Value FROM MessageLocalizations ML JOIN Messages M ON M.Id = ML.MessageKey WHERE ML.LanguageCode = \''+languageCode+'\' AND M.Key = \'' + key + '\'';
        var result = db.prepare(sql).get();
        db.close();
        return result;
    } catch (ex) {
        console.error(ex.message);
    }
}

function getStopWithPlatforms(stopName) {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        var sql = 'SELECT P.[Id], P.[PlatformCode], P.[Name], P.[GtfsIds], P.[Zone], P.[StopId], P.[Latitude], P.[Longitude] FROM Platforms P JOIN Stops S ON S.Id = P.StopId WHERE S.Name = \'' + stopName + '\'';
        var result = db.prepare(sql).all();
        db.close();
        return result;
    } catch (ex) {
        console.error(ex.message);
    }
}

function getPlatformLines(platformId) {
    try {
        const db = new database(process.env.dbPath, { verbose: console.error });
        var sql = 'SELECT [Id], [PlatformId], [Direction], [LineNumber], [LineName], [Type], [IsNight] FROM PlatformLines WHERE PlatformId = ' + platformId;
        var result = db.prepare(sql).all();
        db.close();
        return result;
    } catch (ex) {
        console.error(ex.message);
    }
}

module.exports = {
     getStopSuggestions,
     getStopWithPlatforms,
     getPlatformLines,
     getApplicationSetting,
     getSupportedLanguages,
     getMessageLocalization,
     getUserLanguage,
     setUserLanguage
}