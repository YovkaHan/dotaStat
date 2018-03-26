/**
 * Created by Jordan3D on 3/26/2018.
 */
const Promise = require('bluebird');
const app = null;

Promise.promisify(require('./config'))
    .then(function (result) {
        Object.assign(app, result);

        appInit(app);
    })
    .catch(function (err) {
        throw err;
    });

function appInit(config) {

    config.http.listen(config.port, config.ip, function () {
        console.log(`App is listening on *:${config.port}`);
        // console.log(matchShort.getLatestMatch());
    });

    config.app.get('/init', function (req, res) {
        console.log(commands.address.getAddress(req));
        res.send(globalStatus);
    });
}