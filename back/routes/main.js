/**
 * Created by Jordan3D on 3/22/2018.
 */
const express = require('express');
const router = express.Router();

module.exports = function (app, User, path, nextRoot) {
    const rootPath = app.rootPath+'/front/parts/main';
    const main = require('../parts/main')();

    const controller = require('../controllers/mainPageController')
    ({
        User: User,
        path: path,
        nextRoot: nextRoot,
        rootPath: rootPath
    });

    app.use(controller.redirectToRoot);

    app.use(path, controller.crossRedirect);

    app.use(path+'/static', express.static(rootPath));

    router.get('/', controller.rootHandler);

    router.post('/logout', controller.logoutHandler);

    router.post('/initiate', function (req,res) {
        main.init().then(function (result) {

            main.start().then(function (data) {

            }).catch(function (err) {
                console.log(err);
            });
        });
    });

    return router;
};