/**
 * Created by Jordan3D on 3/22/2018.
 */
const mongoose = require('mongoose');

module.exports = function (connection, callback) {
    const timelineSchema = new mongoose.Schema({
        start_time: {
            type: String
        },
        match_seq_num: {
            type: String
        }
    }, {collection: 'timeline'});

    const Timeline = connection.model('Timeline', timelineSchema);

    timelineSchema.statics.getAll = function (cb) {
        Timeline.find({}, cb);
    };
    timelineSchema.statics.addNew = function (data,cb) {
        timeline.create(data,cb);
    };

    callback(null, Timeline);
};
