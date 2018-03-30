/**
 * Created by Jordan3D on 3/21/2018.
 */
const mongoose = require('mongoose');

const reqOptions = {
    GetMatchHistoryBySequenceNum : {
        start_at_match_seq_num: "0"
    },
    GetMatchHistory: {
        ACCOUNT_ID: "0"
    },
    GetPlayerSummaries: {
        steamids: ""
    }
};

module.exports = function (connection, callback) {
    const steamIdSchema = new mongoose.Schema({
        value: {
            type: String
        },
        timecreated: {
            type: Number
        },
        reqOptions: {
            type: Object
        }
    }, {collection: 'steam_ids'});

    steamIdSchema.statics.getById = function (id,cb) {
        SteamId.findOne({ "value": id},cb);
    };
    steamIdSchema.statics.saveOptions = function (query, newData, cb) {
        SteamId.findOneAndUpdate(query, newData, {upsert:true}, cb);
    };
    steamIdSchema.statics.setNew = function (id, tc, cb) {
        let object = {value: ""+id, timecreated: tc, reqOptions: makeReqOptions(id)};
        console.log(object);
        SteamId.create(object, cb);
    };

    const SteamId = connection.model('SteamId', steamIdSchema);

    SteamId.makeReqOptions = makeReqOptions;

    callback(null, SteamId);
};

function makeReqOptions(id) {
    Int64 = require('node-int64');
    let x = new Int64(dec2hex(id).slice(-9));
    let y = new Int64('0xfffffffff');
    let cReqOptions = Object.assign({},reqOptions);
    cReqOptions.GetMatchHistory.ACCOUNT_ID = new String(x & y);
    cReqOptions.GetPlayerSummaries.steamids = id;
    return cReqOptions;
}
function dec2hex(str){ // .toString(16) only works up to 2^53
    let dec = str.toString().split(''), sum = [], hex = [], i, s;
    while(dec.length){
        s = 1 * dec.shift();
        for(i = 0; s || i < sum.length; i++){
            s += (sum[i] || 0) * 10;
            sum[i] = s % 16;
            s = (s - sum[i]) / 16;
        }
    }
    while(sum.length){
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}