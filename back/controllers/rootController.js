/**
 * Created by Jordan3D on 3/26/2018.
 */
module.exports = function(User){

    function rootUrlHandler (req,res,next) {
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
    }

    function otputOriginalUrl (req,res,next) {
        console.log(req.originalUrl);
        next();
    }

    return {
        rootUrlHandler: rootUrlHandler,
        otputOriginalUrl: otputOriginalUrl
    }
};