/**
 * Created by Jordan3D on 3/26/2018.
 */
module.exports = function(callback){
    require('dotenv').config();
    const express = require('express');
    const app = require('express')();
    app.rootPath = __dirname;
    const http = require('http').Server(app);
    const port = process.env.PORT || 8080,
        ip = process.env.IP || '0.0.0.0';

    callback(null,{
        express: express,
        app: app,
        http: http,
        port: port,
        ip: ip
    })
};