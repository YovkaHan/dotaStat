/**
 * Created by Jordan3D on 3/19/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const keysSchema = new Schema({
    _STEAM_KEYS: {
        type: Boolean
    },
    STEAM_KEYS: {
        type: Array
    }
}, {collection: 'config'});

const config = {
    keys: mongoose.model('keys', keysSchema),
};
module.exports = config;

config.keys.getConfig = function (cb) {
    config.keys.findOne({_STEAM_KEYS: true}, cb);
};
// module.exports.setConfig = function (query, newData, cb) {
//     config.findOneAndUpdate(query, newData, {upsert:true}, cb);
// };