/**
 * Created by Jordan3D on 3/22/2018.
 */
const mongoose = require('mongoose');
const Promise = require('bluebird');

module.exports = function (callback) {
    const connection = mongoose.createConnection(process.env.MAIN_DB_URL);

    connection.on('error', function (err) {
        callback(err);
    });
    connection.once('open', function () {
        const Key = Promise.promisify(require('./models/keys'));
        const Match = Promise.promisify(require('./models/matches'));
        const SteamId = Promise.promisify(require('./models/steam_ids'));
        const Timeline = Promise.promisify(require('./models/timeline'));

        Promise.all(
            [
                Key(connection),
                Match(connection),
                SteamId(connection),
                Timeline(connection)
            ]).spread(function (Key, Match, SteamId, Timeline) {
            const models = {
                Key: Key,
                Matches: Match,
                SteamIds: SteamId,
                Timeline: Timeline
            };
            callback(null,{
                connection: connection,
                models: models
            });
        });
    });
};