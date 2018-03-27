/**
 * Created by Jordan3D on 3/19/2018.
 */
const mongoose = require('mongoose');

module.exports = function (connection, callback) {
    const keysSchema = new mongoose.Schema({
        value: {
            type: String
        }
    }, {collection: 'keys'});

    keysSchema.statics.getKeys = function (callback) {
        Key.find({}).exec(function (err, keys) {
            if(err){
                callback(err);
            }else {
                callback(null, keys);
            }
        });
    };

    const Key = connection.model('Key', keysSchema);

    callback(null, Key);
};