/**
 * Created by Jordan3D on 3/11/2018.
 */
require('dotenv').config();

const express = require('express');
const app = require('express')();
const https = require('https');
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = 4000;

const io = require('socket.io')(http);

const globalStatus = {
    started: false
}

require('./back/db').mongo_db(function (err, suc) {
    if(err){
        console.log(err);
    }
});
const commands = require('./back/commands');
const gMHBSN = commands.GetMatchHistoryBtSequenceNum;
const cicle = gMHBSN.matchesCicle();


app.use(bodyParser.json());

io.on('connection', function (socket) {
    console.log('connected');

    socket.on('vacuum init', function (socket) {
        //io.emit('block-action', {data: true});
        globalStatus.started = true;
        cicle.start(gMHBSN.getFromREST, function (data) {
            io.emit('data-transmission', data);
        });
    });
    socket.on('vacuum stop', function (socket) {
        cicle.stop();
        globalStatus.started = false;
    });
    socket.on('show matches', function (socket) {
        gMHBSN.getMatchesFromDB().then(function (result) {
            io.emit('match-list', result);
        });
    })
});

http.listen(port, function () {
    console.log(`listening on *:${port}`);
    // console.log(matchShort.getLatestMatch());
});

app.use(express.static(__dirname + '/app/public'));

app.get('/init', function (req, res) {
    console.log(commands.address.getAddress(req));
    res.send(globalStatus);
});
// app.get('/api/generate', function (req, res) {
//     https.get('https://api.steampowered.com/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1?key=1DD49C788FB4658D001B1C14C175E0EE', (resp) => {
//         let data = '';
//
//         // A chunk of data has been recieved.
//         resp.on('data', (chunk) => {
//             data += chunk;
//         });
//
//         // The whole response has been received. Print out the result.
//         resp.on('end', () => {
//             let endData = JSON.parse(data);
//             res.send(endData.result.matches);
//         });
//
//     }).on("error", (err) => {
//         console.log("Error: " + err.message);
//     });
// });
// app.post('/api/check', function (req, res) {
//     console.dir(req.body);
//     res.send("test");
// });