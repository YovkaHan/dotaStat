/**
 * Created by Jordan3D on 3/22/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timelineSchema = new Schema({
    start_time: {
        type: String
    },
    match_seq_num: {
        type: String
    }
}, {collection: 'timeline'});

const timeline = module.exports = mongoose.model('timeline', timelineSchema);

module.exports.getAll = function (cb) {
    timeline.find({},cb);
};
module.exports.addNew = function (data,cb) {
    timeline.create(data,cb);
};