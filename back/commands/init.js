/**
 * Created by Jordan3D on 3/21/2018.
 */
const Promise = require('promise');
const https = require('https');
const config = require('../db/dota2stat/models/config');

function reqOptConstructor(id) {
    let self = this;
    self.data = null;
    let promise = new Promise(function (resolve, reject) {
        steamIds.getById(id, function (err, result) {
            if (err) {
                reject(err);
            }
            if (result === null) {
                steamIds.setNew(id, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            }
            resolve(result);
        })
    });
    promise.then(function (result) {
        self.data = result[0];
    }, function (error) {
        console.log(error);
    });
}

module.exports = function () {
    const requestOptions = function (id) {

    };
    const keys = (function () {
        let memory = {
            keys: [],
            usedKeys : [],
            index: 0,
            ready: false
        };
        let returned = {
            getNext: getNext
        };

        config.getConfig(function (err, config) {
            memory.keys = config.STEAM_KEYS;
            memory.ready = true;
        });

        function getNext() {
            if(memory.ready === false){
                return null;
            }
            if(memory.keys.length === memory.usedKeys.length){
                memory.usedKeys = [];
                memory.index = 0;
            }
            return memory.keys[memory.index++];
        }

        return returned;
    })();

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
        let str = "";
        if (request === "GetPlayerSummaries") {
            str += "ISteamUser/GetPlayerSummaries/v0002/"
        } else if (request === "GetMatchHistoryBySequenceNum") {
            str += "/IDOTA2Match_570/v1/";
        }

        str = propertyAdd(str, request);

        return str;

        function propertyAdd(str, request) {
            if (requestOptions.data.reqOptions.hasOwnProperty(request)) {
                let req = requestOptions.data.reqOptions[request];
                str = addKey(str + request);
                for (let x in req) {
                    str += `&${x}=${req[x]}`;
                }
            } else {
                console.log('oops');
            }
        }

        function addKey(str) {
            return str + `?key=${keys.getNext()}`;
        }
    };
    const getFromREST = function (config) {
        return new Promise(function (resolve, reject) {
            let options = makeOptions(requestString(config.reqStr));
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
    };

    return {
        requestOptions: requestOptions,
        getFromREST: getFromREST
    };
};

