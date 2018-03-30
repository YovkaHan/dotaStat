/**
 * Created by Jordan3D on 3/11/2018.
 */
require('dotenv').config();

const Promise = require('bluebird');
const express = require('express');
const app = require('express')();
app.rootPath = __dirname;
const path = require('path');
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const routes = require('./back/routes');
const port = process.env.PORT || 8080,
    ip = process.env.IP || '0.0.0.0';

const address = require('./back/commands').address;

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
    routes(app, http, db.auth.models.User);
}).catch(function (err) {

    // Возожные траблы с этим
    // MongoError: Topology was destroyed
    if(session.state == 'DESTROYED'){
        console.log(1);
    }
    if (err) {
        console.log(err);
    }
});

http.listen(port, ip, function () {
    console.log(`App is listening on *:${port}`);
    // console.log(matchShort.getLatestMatch());
});

module.exports = app;