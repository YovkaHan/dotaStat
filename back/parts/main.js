/**
 * Created by Jordan3D on 3/26/2018.
 */
const Promise = require('bluebird');
const commands = require('../commands');
const events = require('events');

function VacuumApplication(data) {

    let ps = {};
    for (let o in data) {
        ps[o] = data[o];
    }

    ps._getMHBSN = commands.GetMatchHistoryBtSequenceNum(ps.models);
    ps._getPS = commands.GetPlayerSummaries(ps.models);
    ps._requests = commands.requests(ps.models);
    ps._steamIds = null;
    ps._eventEmiter = new events.EventEmitter();
    ps._stage = 0;  // 0 - initiated; 1 - loaded; 2 - vacuuming; 3 - stoped

    Object.defineProperty(
        this,
        "steamId",
        {
            get: function () {
                if (ps._steamIds) {
                    return ps._steamIds.value;
                }
            },
            set: function (value) {
                // проверка на достоверность на сервах вальве
                ps._getPS.checkPlayer(
                    ps._requests.getFromREST(
                        "GetPlayerSummaries",
                        {GetPlayerSummaries: {steamids: value}},
                        ps.keyService
                    )
                ).then(function (result) {
                    ps._steamIds = result;

                    let match = ps.Timeline.getClosest(result.timecreated, ps.Timeline);

                    if (ps._steamIds.reqOptions.GetMatchHistoryBySequenceNum.start_at_match_seq_num === 0) {
                        ps._steamIds.reqOptions.GetMatchHistoryBySequenceNum.start_at_match_seq_num = "" + match.match_seq_num;
                    }

                    ps._stage = 1;

                    ps._eventEmiter.emit('stage: id checked');
                }).catch(function (e) {
                    console.log('checkPlayer Error: ');
                    console.log(e);
                });

            }
        });

    this.stage = function (name) {
        return new Promise(function (resolve, reject) {

            if (name === 'loading') {
                ps._eventEmiter.on('stage: id checked', resolving.bind({event: 1}));
            } else if (name === 'starting') {
                ps._eventEmiter.on('stage: vacuum started', resolving.bind({event: 2}));
            } else if (name === 'stopping') {
                ps._eventEmiter.on('stage: vacuum stopped', resolving.bind({event: 3}));
            }
            function resolving() {
                resolve({stage: ps._stage, info: ps._steamIds});

                switch (this.event) {
                    case 1:
                        ps._eventEmiter.removeListener('stage: id checked', resolving);
                        break;
                    case 2:
                        ps._eventEmiter.removeListener('stage: vacuum started', resolving);
                        break;
                    case 3:
                        ps._eventEmiter.removeListener('stage: vacuum stopped', resolving);
                        break;
                }
            }
        });
    };

    this.status = function () {
        return ps._stage;
    };

    this.vacuum = function () {
        const cicle = ps._getMHBSN.matchesCycle();

        function start(timing) {

            if (ps._stage === 1 || ps._stage === 3) {
                ps._eventEmiter.emit('stage: vacuum started');
                job();
            }

            function job() {
                ps._stage = 2;
                cicle.start({
                    action: ps._requests.getFromREST,
                    configToAction: {
                        request: "GetMatchHistoryBySequenceNum",
                        reqOptions: ps._steamIds.reqOptions,
                        keyManager: ps.keyService
                    },
                    actionInAction: function (results) {
                        ps.Timeline.searchHandle(results, ps.Timeline).then(function (result) {
                            if (result) {
                                ps.models.Timeline.addNew(result);
                            }
                        });
                    },
                    timing: timing
                });
            }
        }

        function stop() {

            if (ps._stage === 2) {
                ps._eventEmiter.emit('stage: vacuum stopped');
                job();
            }

            function job() {
                ps._stage = 3;
                cicle.stop({})
            }
        }

        return {
            start: start,
            stop: stop
        }
    }();
    
    this.results = function () {
        return new Promise(function (resolve, reject) {
            ps._getMHBSN.getMatchesFromDB(ps._steamIds.reqOptions.GetMatchHistory.ACCOUNT_ID).then(function (result) {
                resolve(result);
            }).catch(function (e) {
                console.log(e);
            });
        })
    }

}

module.exports = function () {

    const db = Promise.promisify(require('../db').main_db);
    const setups = {};
    const result = {
        init: function () {
            return new Promise(function (resolve, reject) {

                // Загрузил БД
                db().then(function (db) {
                    setups.models = db.main.models;
                    // Передал ключи
                    const keyList = Promise.promisify(setups.models.Key.getKeys);
                    const timeline = Promise.promisify(commands.timeline);

                    keyList().then(function (keys) {

                    });

                    Promise.all([keyList(), timeline(setups.models)]).spread(function (keys, Timeline) {
                        let keyArr = [];

                        keys.map(function (key) {
                            keyArr.push(key.value);
                        });

                        setups.keyService = commands.keysManager(keyArr);
                        setups.Timeline = Timeline;
                        setups.ready = true;

                        resolve({});
                    }).catch(function (e) {
                        reject(e);
                    });

                }).catch(function (err) {
                    console.log("Initiation Error: ");
                    console.log(err);
                });
            })
        },
        start: function () {
            return new Promise(function (resolve, reject) {

                if (setups.ready) {
                    resolve(setups);
                } else {
                    reject(new Error("Not ready to start"));
                }
            })
        },
        stop: function () {
            return new Promise(function (resolve, reject) {
                let data = {};
                resolve(data);
            })
        },
        VacuumApplication: VacuumApplication,
    };

    return result;
};