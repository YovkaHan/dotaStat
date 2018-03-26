/**
 * Created by Jordan3D on 3/21/2018.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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

const steamIdsSchema = new Schema({
    value: {
        type: String
    },
    requests: {
        type: Object
    }
}, {collection: 'steam_ids'});

const steamIds = module.exports = mongoose.model('steamIds', steamIdsSchema);

module.exports.getById = function (id,cb) {
    steamIds.findOne({ "value": id},cb);
};
module.exports.saveOptions = function (query, newData, cb) {
    steamIds.findOneAndUpdate(query, newData, {upsert:true}, cb);
};
module.exports.setNew = function (id, cb) {
    let object = {value: ""+id, reqOptions: makeReqOptions(id)};
    steamIds.insert(object, cb);
};

function makeReqOptions(id) {
    Int64 = require('node-int64');
    let x = new Int64(dec2hex(id).slice(-9));
    let y = new Int64('0xfffffffff');
    let cReqOptions = Object.assign({},reqOptions);
    cReqOptions.GetMatchHistory.ACCOUNT_ID = new String(x & y);
    cReqOptions.GetPlayerSummaries.steamids = cReqOptions.GetMatchHistory.ACCOUNT_ID;
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