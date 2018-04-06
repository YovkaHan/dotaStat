/**
 * Created by Jordan3D on 3/22/2018.
 */
const Promise = require('bluebird');

module.exports = function(models, callback){

    const privates = {
        sIdSample: "76561198214476941",
        all: [],
        minDate: 1299121489,
        targetDate: null
    };

    Object.defineProperty(
        privates,
        'nextDate',
        {
            get: function () {
                return privates.targetDate;
            },
            set: function (date) {
                privates.targetDate = date + (60*60*24*10);
            }
        }
    );
    const Timeline = {
        getClosest: getClosest,
        getNextDate: function() { return privates.nextDate},
        setNextDate: function (date) {privates.nextDate = date},
        getAll: function () {return privates.all.slice()},
        pushToAll: function (match) {privates.all.push({start_time: match.start_time, match_seq_num: match.match_seq_num})},
        searchHandle: searchHandle,
        reqOptions: null
    };

    init(callback);

    function init(callback) {
        models.Timeline.getAll(function (err, all) {
            if(!err){

                if(all.length){
                    privates.all = all;

                    models.Timeline.findMax(function (err, max) {
                        let _max = max[0];
                        if(!err){
                            if(!isProd) {
                                console.log(_max);
                            }
                            privates.nextDate = _max.start_time;

                            Timeline.reqOptions = reqOptions(privates.sIdSample, _max.match_seq_num);

                            callback(null, Timeline);
                        }else {
                            callback(err);
                            console.log("TIMELINE ERROR");
                        }
                    })
                }else {
                    privates.nextDate = privates.minDate;
                    Timeline.reqOptions = reqOptions(privates.sIdSample, 0);
                    callback(null, Timeline);
                }
            } else {
                callback(err);
            }
        })
    }

    function getClosest(toDate, TimelineObject) {
        if(toDate < privates.minDate){
            return privates.minDate;
        }

        const all = TimelineObject.getAll();
        let result = (toDate - all[0].start_time);

        all.map(function (m) {
            let check = toDate - m.start_time;
            if(check >= 0 && check < result){
                result = m;
            }
        });
        return result;
    }
    
    function reqOptions(id, start_at_match_seq_num) {
       let options = models.SteamId.makeReqOptions(id);
       options.GetMatchHistoryBySequenceNum = ""+start_at_match_seq_num;
       return options
    }

    function searchHandle(searchRes, TimelineObject) {

        return new Promise(function (resolve, reject) {

            const last = searchRes[searchRes.length-1];
            const dateToFind = TimelineObject.getNextDate();

            //console.log(`dateToFind is ${dateToFind}`);

            if(last.start_time >= dateToFind){
                if(last.start_time === dateToFind){
                    TimelineObject.setNextDate(last.start_time);
                    TimelineObject.pushToAll(last);

                    resolve(last);
                }else {
                    for (let s in searchRes) {
                        if (searchRes[s].start_time >= dateToFind) {
                            TimelineObject.setNextDate(searchRes[s].start_time);
                            TimelineObject.pushToAll(searchRes[s]);

                            resolve(searchRes[s]);
                            break;
                        }
                    }
                }
            }else {

                resolve(false);
            }
        });
    }
};

/*
+Проверить наличие записаных данных
    Найти последнюю запись
    Создать объект reqOptions и перенести данные : start_at_match_seq_num
    Создать переменную (+ 10 дней к start_time)
    --
    Создать объект reqOptions

Начать поиск
    Получить данные
   + Сверить значение свойства start_time в последнем объекте с аналогичной переменной
   + Значение в 100-ом объекте больше/равно
       + Поиск от 1-го пока не будет найдено большее значение
        Запись в бд большего значения и его match_seq_num
       + Создать переменную (+ 10 дней к start_time)
        Продолжить поиск
    Значение в 100-ом объекте меньше
        Продолжить поиск
* */