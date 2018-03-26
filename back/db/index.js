/**
 * Created by Jordan3D on 3/13/2018.
 */
const Promise = require('bluebird');

module.exports.auth_db = function (callback) {
    const auth = Promise.promisify(require('./authentication'));

    Promise.all([auth()]).spread(function (auth) {
        callback(null, {
            auth: auth
        });
    }).catch(function (e) {
        callback(e);
    });
};

module.exports.main_db = function (callback) {
    const main = Promise.promisify(require('./dota2stat'));

    Promise.all([main()]).spread(function (main) {
        callback(null, {
            main: main
        });
    }).catch(function (e) {
        callback(e);
    });
};