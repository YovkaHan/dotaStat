/**
 * Created by Jordan3D on 3/22/2018.
 */
const express = require('express');
const router = express.Router();

module.exports = function (app, User) {

    const controller = require('../controllers/rootController')(User);
    const auth = require('./authentication')(app, User, '/auth', '../main');
    const main = require('./main')(app, User, '/main', '../auth');

    app.use(controller.otputOriginalUrl);

    router.get('/', controller.rootUrlHandler);

    app.use('/auth', auth);
    app.use('/main', main);
    app.use('/',router);
};