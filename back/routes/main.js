/**
 * Created by Jordan3D on 3/22/2018.
 */
const express = require('express');
const router = express.Router();
const address = require('../commands/addres');

module.exports = function (app, http, User, path, nextRoot) {

    const io = require('socket.io')(http);
    const rootPath = app.rootPath + '/front/parts/main';
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

    app.use(path + '/static', express.static(rootPath));

    router.get('/', controller.rootHandler);

    router.get('/init', function (req, res) {
        console.log(address.getAddress(req));
        if(main.app && main.app.status().ready) {
            res.send(true);
        }else {
            res.send(false);
        }
    });

    router.post('/logout', controller.logoutHandler);

    router.post('/initiate', function (req, res) {
        main.init().then(function (result) {

            main.start().then(function (data) {

                // Передаем управление обратно в мейн
                main.app = new main.VacuumApplication(data);
                res.send({app: "started"});

            }).catch(function (err) {
                console.log(err);
            });
        });
    });

    io.on('connection', function (socket) {
        console.log('connected');

        socket.on('Steam ID load', function (socket) {

            main.app.steamId = socket.data.steamId;

            main.app.stage().then(function (data) {

                if(data.stage.ready){
                    console.log('READY');
                    io.emit('Steam ID loaded', {info: data.info});
                }
            });

            // cicle.start({action: gMHBSN.getFromREST, timing: 500}, function (data) {
            //     io.emit('data-transmission', data);
            //
            //     globalStatus.started = true; // статус "в работе"
            // });
        });
        socket.on('stop vacuum', function (socket) {
            main.app.vacuum.stop();
        });
        socket.on('start vacuum', function (socket) {
            if(main.app.status().ready){
                console.log("started");
                main.app.vacuum.start();
            }else {
                console.log("NOT started");
            }
        });
        socket.on('show matches', function (socket) {
            main.app.results().then(function (result) {
                io.emit('match-list', result);
            });
        })
    });


    return router;
};