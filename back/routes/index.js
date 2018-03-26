/**
 * Created by Jordan3D on 3/22/2018.
 */
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

module.exports = function (app, User) {

    const auth = require('./authentication')(app, User, '/auth', '../main');
    const main = require('./main')(app, User, '/main', '../auth');

    app.use(function (req,res,next) {
        console.log(req.originalUrl);
        next();
    });

    router.get('/', function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        //console.log(1);
                        return res.redirect('/auth');
                    } else {
                        //console.log(2);
                        return res.redirect('/main');
                    }
                }
            });
    });

    app.use('/auth', auth);
    app.use('/main', main);
    app.use('/',router);
};