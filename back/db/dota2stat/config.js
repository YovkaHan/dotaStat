/**
 * Created by Jordan3D on 3/19/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const configSchema = new Schema({
    STEAM_KEY: {
        type: String
    },
    requests: {
        type: Object
    }
}, {collection: 'config'});

const config = module.exports = mongoose.model('config', configSchema);

module.exports.getConfig = function (cb) {
    config.find({},cb);
};
module.exports.setConfig = function (query, newData, cb) {
    config.findOneAndUpdate(query, newData, {upsert:true}, cb);
};