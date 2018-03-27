/**
 * Created by Jordan3D on 3/26/2018.
 */

module.exports = function (configArg) {

    const config = {};

    Object.assign(config, configArg);

    function redirectToRoot(req, res, next) {
        if (req.originalUrl.length > 1 && req.originalUrl.slice(-1) === '/') {
            res.redirect(config.path);
        } else {
            next();
        }
    }

    function crossRedirect(req, res, next) {
        config.User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    throw error;
                } else {
                    if (user === null) {
                        next();
                    } else {
                        //console.log('redirect');
                        res.redirect(config.nextRoot);
                    }
                }
            });
    }

    function rootHandler(req, res) {
        res.sendFile(config.rootPath + '/index.html');
    }

    function rootNewHandler(req, res) {
        res.sendFile(config.rootPath + '/new.html');
    }

    function authInputFormHandler(req, res) {

        if (req.body.username && req.body.password) {
            config.User.authenticate(req.body.username, req.body.password, function (error, user) {
                if (error || !user) {
                    let err = new Error('Wrong username or password.');
                    err.status = 401;
                    res.send(err);
                } else {
                    req.session.userId = user._id;
                    res.redirect(config.nextRoot);
                }
            });
        } else {
            let err = new Error('All fields required.');
            err.status = 400;
            throw err;
        }
    }

    function newInputFormHandler(req, res) {
        if (req.body.username && req.body.password) {
            console.log('User trying to register');
            let userData = {
                username: req.body.username,
                password: req.body.password
            };

            config.User.create(userData, function (error, user) {
                if (error) {
                    console.log('User creation error');
                    res.send(error);
                } else {
                    console.log('User created');
                    req.session.userId = user._id;
                    res.redirect(config.nextRoot);
                }
            });

        } else {
            let err = new Error('All fields required.');
            err.status = 400;
            throw err;
        }
    }

    return {
        redirectToRoot: redirectToRoot,
        crossRedirect: crossRedirect,
        rootHandler: rootHandler,
        rootNewHandler: rootNewHandler,
        authInputFormHandler: authInputFormHandler,
        newInputFormHandler: newInputFormHandler
    }
};
