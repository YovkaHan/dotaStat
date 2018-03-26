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

        const Config = Promise.promisify(require('./models/config'));
        const Matches = Promise.promisify(require('./models/matches'));
        const SteamIds = Promise.promisify(require('./models/steam_ids'));
        const Timeline = Promise.promisify(require('./models/timeline'));

        Promise.all(
            [
                Config(connection),
                Matches(connection),
                SteamIds(connection),
                Timeline(connection)
            ]).spread(function () {
            const models = {
                Config: User,
                Matches: Matches,
                SteamIds: SteamIds,
                Timeline: Timeline
            };
            callback(null,{
                connection: connection,
                models: models
            });
        });
    });
};