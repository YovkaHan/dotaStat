/**
 * Created by Jordan3D on 3/13/2018.
 */

/*
 сделать запрос в бд
 узнать последний id матча
 присвоить это значение в specObject.SEQ_NUM
 составить запрос в соответствии с полученными данными
 послать пробный запрос - есть ли результаты

 цикл:
 послать запрос
 обработать запрос
 записать результаты в бд

 ошибка:
 вывести на экран
 повторить запрос

 */
const root = require('./');

const steamIds = require('../db/dota2stat/models/steam_ids');

const Promise = require('promise');
const matchShort = require('../db/dota2stat/models/matches');



function getMatchesFromDB() {
    return new Promise(function (resolve, reject) {
        matchShort.getMatches({}, function (err, matches) {
            if (err) {
                reject(err);
            }
            resolve(matches);
        });
    });
}

function matchesCycle() {
    let closure = {
        flag: true,
        interval: null
    };
    return {
        start: function (config) {
            config.timing = config.timing || 1000;
            closure.interval = setInterval(function () {
                if (closure.flag) {
                    closure.flag = !closure.flag;
                    getMatchesCycle(config.action).then(function (res) {
                        closure.flag = !closure.flag;
                    });
                }
            }, config.timing);
        },
        stop: function () {
            clearInterval(closure.interval);
            stopMatchesCicle();
        }
    };
}

function getMatchesCycle(action = getFromREST, actionConfig = {reqStr: 'GetMatchHistoryBySequenceNum'}, ioAction = undefined) {
    return new Promise(function (resolve, reject) {
        action(actionConfig).then(function (result) {
            result.result.matches.map(function (match, i, list) {
                for (let m in match.players) {
                    if (match.players[m].hasOwnProperty('account_id') && match.players[m].account_id == requestOptions.data.requests.GetMatchHistory.ACCOUNT_ID) {
                        matchShort.addMatch(match, function (err, match) {
                            // if (!err) {
                            //     ioAction(match);
                            // } else {
                            //
                            // }
                        });
                    }
                }
                if (i === list.length - 1) {
                    requestOptions.data.requests.GetMatchHistoryBySequenceNum.start_at_match_seq_num = "" + match.match_seq_num;
                    resolve({});
                }
            });
        }, function (rejected) {
            resolve({});
        });
    });
}

function stopMatchesCycle() {
    saveJob(root.initConfig.requestOptions.data.reqOptions);
}

function saveJob(data) {
    new Promise(function (resolve, reject) {
        steamIds.saveOptions({_id: requestOptions.data._id}, {reqOptions: data}, function (err, res) {
            if (err) {
                reject(err);
                console.log(err);
            }
            resolve(res);
        })
    });
}

const GetMatchHistoryBtSequenceNum = module.exports = {
    getMatchesFromDB: getMatchesFromDB,
    matchesCycle: matchesCycle,
    stopMatchesCycle: stopMatchesCycle
};

