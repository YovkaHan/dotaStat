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

const Promise = require('bluebird');

module.exports = function (models) {

    function getMatchesFromDB(account_id) {
        return new Promise(function (resolve, reject) {
            models.Match.getMatches({'players.account_id': account_id*1}, function (err, matches) {
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
                config.timing = config.timing || 500;
                closure.interval = setInterval(function () {
                    if (closure.flag) {
                        closure.flag = !closure.flag;
                        getMatchesCycle(config.action, config.configToAction, config.actionInAction).then(function (res) {
                            closure.flag = !closure.flag;
                        });
                    }
                }, config.timing);
            },
            stop: function () {
                clearInterval(closure.interval);
                //stopMatchesCicle();
            }
        };
    }

    function getMatchesCycle(action, config, actionInAction) {
        return new Promise(function (resolve, reject) {
            action(config).then(function (result) {
                actionInAction(result.result.matches);
                result.result.matches.map(function (match, i, list) {
                    for (let m in match.players) {
                        if (match.players[m].hasOwnProperty('account_id') && match.players[m].account_id == config.reqOptions.GetMatchHistory.ACCOUNT_ID) {
                            models.Match.addMatch(match, function (err, match) {
                                // if (!err) {
                                //     ioAction(match);
                                // } else {
                                //
                                // }
                            });
                        }
                    }
                    if (i === list.length - 1) {
                        config.reqOptions.GetMatchHistoryBySequenceNum.start_at_match_seq_num = "" + match.match_seq_num;
                        console.log(config.reqOptions.GetMatchHistoryBySequenceNum.start_at_match_seq_num);
                        stopMatchesCycle(config);
                        resolve({});
                    }
                });
            }).catch(function (err) {
                console.log('getMatchesCycle Error: ');
                console.log(err);
                resolve({});
            })
        });
    }

    function stopMatchesCycle(config) {
        saveJob(config);
    }

    function saveJob(config) {
        new Promise(function (resolve, reject) {

            models.SteamId.saveOptions({value: config.reqOptions.GetPlayerSummaries.steamids}, {reqOptions: config.reqOptions}, function (err, res) {
                if (err) {
                    reject(err);
                    console.log(err);
                }
                resolve(res);
            })
        });
    }

    return {
        getMatchesFromDB: getMatchesFromDB,
        matchesCycle: matchesCycle,
        stopMatchesCycle: stopMatchesCycle
    };
}
