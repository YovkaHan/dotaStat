const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

module.exports = function (connection, callback) {

    const UserSchema = new mongoose.Schema({
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
        }
    }, {collection: 'users'});

//authenticate input against database
    UserSchema.statics.authenticate = function (username, password, callback) {
        User.findOne({username: username})
            .exec(function (err, user) {
                if (err) {
                    return callback(err)
                } else if (!user) {
                    var err = new Error('User not found.');
                    err.status = 401;
                    return callback(err);
                }
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result === true) {
                        return callback(null,user);
                    } else {
                        return callback();
                    }
                })
            });
    }

//hashing a password before saving it to the database
    UserSchema.pre('save', function (next) {
        var user = this;
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        })
    });

    const User = connection.model('User', UserSchema);
    callback(null, User);
};

