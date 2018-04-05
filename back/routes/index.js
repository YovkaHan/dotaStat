/**
 * Created by Jordan3D on 3/22/2018.
 */
const express = require('express');
const router = express.Router();

module.exports = function (app, htpp, User) {

    const controller = require('../controllers/rootController')(User);
    const auth = require('./authentication')(app, User, '/auth', '../main');
    const main = require('./main')(app, htpp, User, '/main', '../auth');

    if(!isProd) {
        app.use(controller.otputOriginalUrl);
    }

    router.get('/', controller.rootUrlHandler);

    app.use('/auth', auth);
    // Разделение на пользователей на рассмотрение здесь
    app.use('/main', main);
    //
    app.use('/',router);
};