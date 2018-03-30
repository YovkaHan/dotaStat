/**
 * Created by Jordan3D on 3/22/2018.
 */
const mongoose = require('mongoose');

module.exports = function (connection, callback) {
    const timelineSchema = new mongoose.Schema({
        start_time: {
            type: Number
        },
        match_seq_num: {
            type: String
        }
    }, {collection: 'timeline'});

    timelineSchema.statics.getAll = function (cb) {
        Timeline.find({}, cb);
    };
    timelineSchema.statics.addNew = function (data,cb) {
        Timeline.create(data,cb);
    };
    timelineSchema.statics.findMax = function (callback) {
        Timeline.find({}) // 'this' now refers to the Member class
            .sort('-start_time')
            .limit(1)
            .exec(callback);
    };

    const Timeline = connection.model('Timeline', timelineSchema);

    callback(null, Timeline);
};
