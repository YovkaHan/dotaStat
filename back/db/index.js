/**
 * Created by Jordan3D on 3/13/2018.
 */
const mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost/dota2stats');
//const db = mongoose.connection;

let mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL === null && process.env.DATABASE_SERVICE_NAME) {
    const mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD'],
        mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

    }
}
let db = null,
    dbDetails = new Object();

const initDb = function(callback) {
    if (mongoURL == null) return;

    mongoose.connect(mongoURL, function(err, conn) {
        if (err) {
            callback(err);
            return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        console.log('Connected to MongoDB at: %s', mongoURL);
        callback({},{
            db: db,
            dbDetails: dbDetails
        });
    });
};


//Bind connection to error event (to get notification of connection errors)
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports.mongo_db = function (callback) {
    initDb(callback);
};