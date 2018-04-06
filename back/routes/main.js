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
        if(main.app){
            if(main.app.status() === 0){
                res.send({steam_id: "", status: "initiated"});
            }
            if(main.app.status() === 1){
                res.send({steam_id: main.app.steamId, status: "loaded"});
            }
            if(main.app.status() === 2){
                res.send({steam_id:  main.app.steamId, status: "vacuuming"});
            }
            if(main.app.status() === 3){
                res.send({steam_id:  main.app.steamId, status: "stoped"});
            }
        } else {
            res.send({
                steam_id: "",
                status: null
            });
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

        socket.on('Steam ID load', function (socket) {
            main.app.stage('loading').then(function (data) {

                if (!isProd) {
                    console.log("loaded");
                }

                io.emit('Steam ID loaded', {info: data.info});
            });
            main.app.steamId = socket.data.steamId;
        });
        socket.on('start vacuum', function (socket) {
            main.app.stage('starting').then(function (data) {

                if (!isProd) {
                    console.log("started");
                }

                io.emit('Vacuuming started');
            });
            main.app.vacuum.start(500);
        });
        socket.on('stop vacuum', function (socket) {
            main.app.stage('stopping').then(function (data) {

                if (!isProd) {
                    console.log("stopped");
                }
                io.emit('Vacuuming stoped');
            });
            main.app.vacuum.stop();
        });
        socket.on('show matches', function (socket) {
            main.app.results().then(function (result) {
                io.emit('match-list', result);
            });
        })
    });


    return router;
};