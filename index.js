/**
 * Created by Jordan3D on 4/5/2018.
 */
/*
* При логауте после инициализации и логине обратно не срабатывает инициализация
* Все логи вынести в режим дева
* Поигратся с фронтом
* */

const theApp = require('./app');

const prod = (process.env.PRODUCTION === 'true') || false;
const test = (process.env.TEST === 'true') || false;

const config = {
    isProd: prod,
    isTest: test
};

theApp(config);

