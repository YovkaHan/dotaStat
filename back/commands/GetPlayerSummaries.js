/**
 * Created by Jordan3D on 3/21/2018.
 */
const Promise = require('bluebird');

module.exports = function (models) {

    function aboutPlayer(getRest) {
       return new Promise(function (resolve, reject) {
           getRest.then(function (data) {
               resolve(data.response.players[0]);
           });
       });
    }
    // По результатам запроса сверяет с бд и при необходимости делает запись
    // и возвращает объект steam_ids
    function checkPlayer(getRest) {
        return new Promise(function (resolve, reject) {
            aboutPlayer(getRest).then(function (data) {
                models.SteamId.getById(data.steamid, function (err, steam_ids) {
                    if(!err && steam_ids){
                        resolve(steam_ids); // Если запись есть в бд
                        console.log('Есть запись в бд');
                    }else if(!err && !steam_ids && data.timecreated){
                        console.log('Нет записи в бд');
                        models.SteamId.setNew(data.steamid, data.timecreated, function (err, steam_idss) {
                            if(!err){
                                resolve(steam_idss);  // Если нет записи в бд
                            }
                        });
                    }else {
                        console.log('REJECTED');
                        reject(false);  // Если ошибка
                    }
                });
            });
        });
    }

    return {
        aboutPlayer: aboutPlayer,
        checkPlayer: checkPlayer
    }
};