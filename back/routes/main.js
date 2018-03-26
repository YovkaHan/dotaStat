/**
 * Created by Jordan3D on 3/22/2018.
 */
const express = require('express');
const router = express.Router();

module.exports = function (app, User, path, nextRoot) {
    const rootPath = app.rootPath+'/front/parts/main';

    app.use(function (req, res, next) {
        if(req.originalUrl.length > 1 && req.originalUrl.slice(-1) === '/'){
            res.redirect(path);
        } else {
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
                       // console.log('redirect');
                        res.redirect(nextRoot);
                    } else {
                        next();
                    }
                }
            });
    });

    app.use(path, function (req,res,next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    throw error;
                } else {
                    if (user === null) {
                        //console.log('redirect');
                        res.redirect(nextRoot);
                    } else {
                       next();
                    }
                }
            });
    });

    app.use(path+'/static', express.static(rootPath));

    router.get('/',function (req,res) {
        res.sendFile(rootPath+'/index.html');
    });
    router.post('/logout', function (req, res, next) {
        req.session.destroy(function (err) {
            if (err) {
                throw err;
            } else {
               // console.log('logout');
                res.send({redirect: req.protocol + '://' + req.get('host')});
            }
        });
    });
    router.post('/initiate', function (req, res, next) {
        res.send({});
    });

    return router;
};