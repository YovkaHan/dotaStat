/**
 * Created by Jordan3D on 3/27/2018.
 */
const https = require('https');

module.exports = function () {
    return {
        getFromREST: getFromREST,
    }
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

// return Promise   getFromREST(config) || getFromREST(request, reqOptions, keyManager)
const getFromREST = function (request, reqOptions, keyManager) {

    // config initialization
    let config = {};
    if(arguments.length === 1){
        config = arguments[0];
    }else {
        config.request = request;
        config.reqOptions = reqOptions;
        config.keyManager = keyManager;
    }

    return new Promise(function (resolve, reject) {
        config.keyManager.passKey().then(function (key) {

            let options = makeOptions(
                requestString(
                    config.request,
                    config.reqOptions,
                    key
                )
            );

            https.get(options, (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    let endData = null;
                    config.keyManager.freeKey(key);
                    try {
                        endData = JSON.parse(data);
                    } catch (err) {
                        reject(err);
                    }
                    resolve(endData);
                });

            }).on("error", (err) => {
                if(!isProd) {
                    console.log("Error: " + err.message);
                }
                reject(err);
            });
        });
    });
};


const requestString = function (request, reqOptions, key) {
    let str = "";
    if (request === "GetPlayerSummaries") {
        str += "/ISteamUser/GetPlayerSummaries/v0002/"
    } else if (request === "GetMatchHistoryBySequenceNum") {
        str += "/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1/";
    }

    str = propertyAdd(str, request, reqOptions, key);

    return str;

    function propertyAdd(str, request, reqOptions, key) {
        if (reqOptions.hasOwnProperty(request)) {
            let req = reqOptions[request];
            str = addKey(str, key);
            for (let x in req) {
                str += `&${x}=${req[x]}`;
            }
        } else {
            console.log('oops');
        }

        return str;
    }

    function addKey(str, key) {
        return str + `?key=${key}`;
    }
};