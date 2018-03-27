/**
 * Created by Jordan3D on 3/26/2018.
 */

module.exports = function(configArg){
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
                        // console.log('redirect');
                        res.redirect(config.nextRoot);
                    } else {
                        next();
                    }
                }
            });
    }

    function rootHandler(req, res) {
        res.sendFile(config.rootPath + '/index.html');
    }

    function logoutHandler(req, res, next) {
        req.session.destroy(function (err) {
            if (err) {
                throw err;
            } else {
                // console.log('logout');
                res.send({redirect: req.protocol + '://' + req.get('host')});
            }
        });
    }

    // function initiateHandler(req, res, next) {
    //     res.send({});
    // }

    return {
        redirectToRoot: redirectToRoot,
        crossRedirect: crossRedirect,
        rootHandler: rootHandler,
        logoutHandler: logoutHandler/*,
        initiateHandler: initiateHandler*/
    }
};