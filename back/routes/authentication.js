/**
 * Created by Jordan3D on 3/22/2018.
 */
const express = require('express');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function (app, User, path, nextRoot) {
    const rootPath = app.rootPath+'/front/parts/authentication';

    app.use(function (req, res, next) {
        if(req.originalUrl.length > 1 && req.originalUrl.slice(-1) === '/'){
            res.redirect(path);
        }else {
            next();
        }
    });

    app.use(path, function (req,res,next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    throw error;
                } else {
                    if (user === null) {
                        next();
                    } else {
                        //console.log('redirect');
                        res.redirect(nextRoot);
                    }
                }
            });
    });

    app.use(path+'/static', express.static(rootPath));

    router.get('/',function (req,res) {
        res.sendFile(rootPath + '/index.html');
    });
    router.post('/inputForm', urlencodedParser, function (req,res) {

        if (req.body.username && req.body.password) {
            User.authenticate(req.body.username, req.body.password, function (error, user) {
                if (error || !user) {
                    let err = new Error('Wrong username or password.');
                    err.status = 401;
                    res.send(err);
                } else {
                    req.session.userId = user._id;
                    res.redirect(nextRoot);
                }
            });
        } else {
            let err = new Error('All fields required.');
            err.status = 400;
            throw err;
        }
    });
    // router.get('/new', function (req, res) {
    //     res.sendFile(rootPath+'/new.html');
    // });
    // router.post('/new/inputForm', urlencodedParser, function (req, res) {
    //     console.log(req.body);
    //     if (req.body.username && req.body.password) {
    //         console.log('User trying to register');
    //         var userData = {
    //             username: req.body.username,
    //             password: req.body.password
    //         };
    //
    //         User.create(userData, function (error, user) {
    //             if (error) {
    //                 console.log('User creation error');
    //                 res.send(err);
    //             } else {
    //                 console.log('User created');
    //                 req.session.userId = user._id;
    //                 res.redirect(nextRoot);
    //             }
    //         });
    //
    //     } else {
    //         var err = new Error('All fields required.');
    //         err.status = 400;
    //         throw err;
    //     }
    // });
    return router;
};