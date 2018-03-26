/**
 * Created by Jordan3D on 3/22/2018.
 */
const mongoose = require('mongoose');
const Promise = require('bluebird');

module.exports = function (callback) {
    const connection = mongoose.createConnection(process.env.AUTH_DB_URL);

    connection.on('error', function (err) {
        callback(err);
    });
    connection.once('open', function () {
        const User = Promise.promisify(require('./models/user'));

        Promise.all([User(connection)]).spread(function (User) {
            const models = {
                User: User
            };
            callback(null, {
                connection: connection,
                models: models
            });
        }).catch(function (e) {
            callback(e);
        });
    });
};