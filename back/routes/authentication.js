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

    const controller = require('../controllers/authenticationController')
    ({
        User: User,
        nextRoot: nextRoot,
        path: path,
        rootPath: rootPath
    });

    app.use(controller.redirectToRoot);

    app.use(path, controller.crossRedirect);

    app.use(path+'/static', express.static(rootPath));

    router.get('/', controller.rootHandler);

    router.post('/inputForm', urlencodedParser, controller.authInputFormHandler);

    // router.get('/new', controller.rootNewHandler);
    // router.post('/new/inputForm', urlencodedParser, controller.newInputFormHandler);

    return router;
};