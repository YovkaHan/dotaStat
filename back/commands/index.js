/**
 * Created by Jordan3D on 3/17/2018.
 */
const address = require('./addres');
const GetMatchHistoryBtSequenceNum = require('./GetMatchHistoryBySequenceNum');
const GetPlayerSummaries = require('./GetPlayerSummaries');
const keysManager = require('./keysManager');
const requests = require('./requests');
const timeline = require('./timeline');




module.exports = {
    address: address,
    GetPlayerSummaries: GetPlayerSummaries, //  (models)
    keysManager: keysManager, // (keys)
    requests: requests,       // (models)
    timeline: timeline,     // (models)
    GetMatchHistoryBtSequenceNum: GetMatchHistoryBtSequenceNum // (models)
};