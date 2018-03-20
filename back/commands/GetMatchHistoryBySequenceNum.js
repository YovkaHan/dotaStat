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
const https = require('https');

const Promise = require('promise');  //+
const matchShort = require('../db/dota2stat/matchShort');
const config = require('../db/dota2stat/config');


const requestOptions = (function () {
    let returned = {
        data: {}
    };
    let promise = new Promise(function (resolve, reject) {
        config.getConfig(function (err, config) {
            if (err) {
                reject(err);
            }
            resolve(config);
        })
    });
    promise.then(function (result) {
        returned.data = result[0];
    }, function (error) {
        console.log(error);
    });

    return returned;
})();

const REQS = {
    GetMatchHistory: "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1?key=STEAM_KEY&start_at_match_seq_num=SEQ_NUM"
};
const makeOptions = function (reqStr) {

    return {
        host: 'api.steampowered.com',
        port: 443,
        path: reqStr,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
};

const requestString = function (request) {
    let str = "/IDOTA2Match_570/";
    if (requestOptions.data.requests.hasOwnProperty(request)) {
        let req = requestOptions.data.requests[request];

        str = addKey(str + request);

        for (let x in req) {
            str += `&${x}=${req[x]}`;
        }
    } else {
        console.log('oops');
    }

    return str;

    function addKey(str) {
        return str + `/v1?key=${requestOptions.data.STEAM_KEY}`;
    }
}

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

function matchesCicle() {
    let closure = {
        flag: true,
        interval: null
    };
    return {
        start: function (config) {
            config.timing =  config.timing || 1000;
            closure.interval = setInterval(function () {
                if (closure.flag) {
                    closure.flag = !closure.flag;
                    getMatchesCicle(config.action, config.ioAction).then(function (res) {
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
function getMatchesCicle(action = getFromREST, ioAction = undefined) {
    return new Promise(function (resolve, reject) {
        action().then(function (result) {
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
                    requestOptions.data.requests.GetMatchHistoryBySequenceNum.start_at_match_seq_num = ""+match.match_seq_num;
                    resolve({});
                }
            });
        }, function (rejected) {
            resolve({});
        });
    });
}

function getFromREST() {
    return new Promise(function (resolve, reject) {
        let options = makeOptions(requestString('GetMatchHistoryBySequenceNum'));
        https.get(options, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                let endData = null;
                try {
                    endData = JSON.parse(data);
                } catch (err) {
                    reject(err);
                }
                resolve(endData);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err);
        });
    });
}

function stopMatchesCicle() {
    saveJob(requestOptions.data.requests)
}

function saveJob(data) {
    new Promise(function (resolve, reject) {
        config.setConfig({_id: requestOptions.data._id}, {requests:data}, function (err, config) {
            if (err) {
                reject(err);
                console.log(err);
            }
            resolve(config);
        })
    });
}

const GetMatchHistoryBtSequenceNum = module.exports = {
    getMatchesFromDB: getMatchesFromDB,
    matchesCicle: matchesCicle,
    stopMatchesCicle: stopMatchesCicle,
    getFromREST: getFromREST
}

