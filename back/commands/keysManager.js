/**
 * Created by Jordan3D on 3/26/2018.
 */
const Promise = require('bluebird');
const events = require('events');

/*
 * Промис на ключ
 * Добавить евент на промис
 * Запрос на ключ
 * Если есть свободные ключи - последний евент на промис выполняется
 * Если нет свободных запрос на запрос добавляется в очередь запросов
 * Очередь запросов срабатывает как только освобождается ключ
 * */

module.exports = function (keys) {
    const manager = {
        freeKeys: keys,
        inUseKeys: [],
        reqStack: [],
        keyReqs: 0,
        eventEmitter: new events.EventEmitter()
    };

    const kM = {};

    kM.passKey = function () {
        return new Promise(function (resolve, reject) {
            const id = manager.addEvent();

            manager.eventEmitter.on(id, keyPass);
            manager.eventEmitter.emit('key request');

            function keyPass() {
                //console.log('Passing key');
                manager.eventEmitter.removeListener(id, keyPass);
                resolve(manager.getKey());
            }
        });
    };

    kM.freeKey = function (key) {
        // console.log('free');
        // console.log(manager.freeKeys);
        let index = manager.inUseKeys.indexOf(key);
        if (index >= 0) {
            let key = manager.inUseKeys.splice(index, 1)[0];
            manager.freeKeys.unshift(key);
            manager.eventEmitter.emit('free key');
        } else {
            manager.eventEmitter.emit('free key mistake');
        }
    };

    manager.eventEmitter.on('key request', function () {
        if (manager.freeKeys.length) {
            //console.log('Key request Handler');
            manager.eventEmitter.emit(manager.reqStack.pop());
        } else {
            manager.keyReqs++;
        }
    });
    manager.eventEmitter.on('free key', function () {
        if (manager.keyReqs > 0) {
            manager.eventEmitter.emit(manager.reqStack.pop());
            manager.keyReqs--;
        }
    });
    manager.eventEmitter.on('free key mistake', function () {
        console.log('Error! Free key mistake.');
    });

    manager.getKey = function () {
        let key = manager.freeKeys.pop();
        manager.inUseKeys.push(key);
        return key;
    };
    manager.addEvent = function () {
        let id = 0;
        if (manager.reqStack.length) {
            id = manager.reqStack[manager.reqStack.length - 1];
        }
        manager.reqStack.push(++id);
        return '' + id;
    };
    manager.reqStackGet = function () {
        if (manager.reqStack.length) {
            return manager.reqStack.pop();
        }
        return null;
    };


    return kM;
};