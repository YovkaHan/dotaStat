/**
 * Created by Jordan3D on 3/11/2018.
 */
require('dotenv').config();

const Promise = require('bluebird');
const express = require('express');
const app = require('express')();
app.rootPath = __dirname;
const https = require('https');
const path = require('path');
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const routes = require('./back/routes');
const port = process.env.PORT || 8080,
    ip = process.env.IP || '0.0.0.0';

const io = require('socket.io')(http);

const globalStatus = {
    started: false
};

app.use(bodyParser.json());

// загрузка бд для аутентификации
const db = Promise.promisify(require('./back/db').auth_db);
db().then(function (db) {
    app.use(session({
        secret: 'light and bark',
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: db.auth.connection
        })
    }));
    routes(app, db.auth.models.User);
}).catch(function (err) {
    if (err) {
        console.log(err);
    }
});


 const commands = require('./back/commands');
// const gMHBSN = commands.GetMatchHistoryBtSequenceNum;
// const cicle = gMHBSN.matchesCicle();

// io.on('connection', function (socket) {
//     console.log('connected');
//
//     socket.on('vacuum init', function (socket) {
//         //io.emit('block-action', {data: true});
//
//         // получение АЙДИшника и его последующая валидация
//         commands.initConfig(socket.steamId);
//
//         cicle.start({action: gMHBSN.getFromREST, timing: 500}, function (data) {
//             io.emit('data-transmission', data);
//
//             globalStatus.started = true; // статус "в работе"
//         });
//     });
//     socket.on('vacuum stop', function (socket) {
//         cicle.stop();
//         globalStatus.started = false;  // статус "пауза/готов"
//     });
//     socket.on('show matches', function (socket) {
//         gMHBSN.getMatchesFromDB().then(function (result) {
//             io.emit('match-list', result);
//         });
//     })
// });

http.listen(port, ip, function () {
    console.log(`App is listening on *:${port}`);
    // console.log(matchShort.getLatestMatch());
});

app.get('/init', function (req, res) {
    console.log(commands.address.getAddress(req));
    res.send(globalStatus);
});

module.exports = app;