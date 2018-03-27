/**
 * Created by Jordan3D on 3/13/2018.
 */
const mongoose = require('mongoose');

module.exports = function (connection, callback) {
    const matchesSchema = new mongoose.Schema({
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
    const Match = connection.model('Match', matchesSchema);

    matchesSchema.statics.getMatches = function (options, limit, cb) {
        Match.find(options,cb).limit(limit);
    };
    matchesSchema.statics.addMatch = function (options,callback) {
        // matches.find({match_id: options.match_id}, function (err, match) {
        //    if(!match){
        //        matches.create(options,callback);
        //    }
        // });
        Match.create(options,callback);
    };

    // Get Max Id match
    matchesSchema.statics.getLatestMatch = function (callback) {
        callback(matches.find({}, {match_seq_num: 1, _id:0}).sort({match_seq_num:-1}).limit(1));
    };

    callback(null, Match);
};