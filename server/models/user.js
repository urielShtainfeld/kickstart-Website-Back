var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var CryptoJS = require("crypto-js");
var secretKey = 'Sk3Yi60jyz';
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    usertype: {
        type: String,
        required: true,
    }
});

//authenticate input against database
UserSchema.statics.authenticate = function (userName, password, callback) {

    User.findOne({username: userName})
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(getPassword(password), user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
};

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});
getPassword = function(password) {
    console.log(password);
    var bytes  = CryptoJS.AES.decrypt(password.toString(),secretKey);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    console.log(decryptedData);
    return decryptedData;
}
var User = mongoose.model('User', UserSchema);
module.exports = {User , getPassword: getPassword};