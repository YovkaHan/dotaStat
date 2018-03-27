/**
 * Created by Jordan3D on 3/26/2018.
 */
const Promise = require('bluebird');
const commands = require('../commands');

module.exports = function () {

    const db = Promise.promisify(require('../db').main_db);
    const setups = {};

  return {
      init: function () {
          return new Promise(function (resolve, reject) {

              // Загрузил БД
              db().then(function (db) {
                  setups.models = db.main.models;
                  // Передал ключи
                  const keyList = Promise.promisify(setups.models.Key.getKeys);

                  keyList().then(function (keys) {
                      let keyArr = [];

                      keys.map(function (key) {
                          keyArr.push(key.value);
                      });

                      setups.keyService = commands.keysManager(keyArr);
                      setups.ready = true;

                      resolve({});
                  });
              }).catch(function (err) {
                  console.log(err);
              });
          })
      },
      start: function () {
          return new Promise(function (resolve, reject) {

              if(setups.ready){
                 resolve(setups);
              } else {
                  reject('Not ready');
              }
          })
      },
      stop: function () {
          return new Promise(function (resolve, reject) {
              let data = {};
              resolve(data);
          })
      }
  }
};