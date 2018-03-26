/**
 * Created by Jordan3D on 3/13/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchesSchema = new Schema({
    barracks_status_dire: {
        type: Number
    },
    barracks_status_radiant: {
        type: Number
    },
    cluster: {
        type: Number
    },
    dire_score: {
        type: Number
    },
    duration: {
        type: Number
    },
    engine: {
        type: Number
    },
    first_blood_time: {
        type: Number
    },
    flags: {
        type: Number
    },
    game_mode: {
        type: Number
    },
    human_players: {
        type: Number
    },
    leagueid: {
        type: Number
    },
    lobby_type: {
        type: Number
    },
    match_id: {
        type: Number
    },
    match_seq_num: {
        type: Number
    },
    negative_votes: {
        type: Number
    },
    players:{
        type: Array
    },
    positive_votes: {
        type: Number
    },
    pre_game_duration: {
        type: Number
    },
    radiant_score: {
        type: Number
    },
    radiant_win: {
        type: Number
    },
    start_time: {
        type: Number
    },
    tower_status_dire: {
        type: Number
    },
    tower_status_radiant: {
        type: Number
    }
}, {collection: 'matches'});

const matches = module.exports = mongoose.model('matches', matchesSchema);

// Get matches
module.exports.getMatches = function (options,cb, limit) {
     matches.find(options,cb).limit(limit);
};

// Add match
module.exports.addMatch = function (options,callback) {
    // matches.find({match_id: options.match_id}, function (err, match) {
    //    if(!match){
    //        matches.create(options,callback);
    //    }
    // });
    matches.create(options,callback);
};

// Get Max Id match
module.exports.getLatestMatch = function () {
     return matches.find({}, {match_seq_num: 1, _id:0}).sort({match_seq_num:-1}).limit(1);
};

