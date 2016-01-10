var User = require('../models/user');
var jwt = require('jsonwebtoken');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');

var comparePassword = function(enteredPassword, hashedPassword, cb) {
  bcrypt.compare(enteredPassword, hashedPassword, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

exports.login = function(req, res, next) {
 async.waterfall([
    function(cb) {
      User.findOne({ email: req.body.email }).exec(cb);
    },
    function(user, cb) {
      if (!user) {
        res.send({ message: 'no user found' });
      } else {
        
        comparePassword(req.body.password, user.password, function(err, isMatch){
          if (err) return cb(err);
          if (!isMatch) return res.send({ message: 'invalid password'});
          cb(null, user);
        });
      }
    },
  ], function(err, user) {
    if (err) console.log(err);
    var token = jwt.sign({ userId: user._id.toString() }, user._id.toString(), { expiresIn: 8.64e+7 * 30 }); // one month
    user.password = undefined;
    user.token = token;
    res.send(user);
  });
};

exports.signup = function(req, res, next) {
  async.waterfall([
    function(cb) {
      User.findOne({ email: req.body.email }).exec(cb);
    },
    function(user, cb) {
      if (user) {
        res.send({ message: 'exiting user' });
      } else {
        var user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        user.save(cb)
      }
    },
  ], function(err, user) {
    if (err) return next(err);
    var token = jwt.sign({ userId: user._id.toString() }, user._id.toString(), { expiresIn: 8.64e+7 * 30 }); // one month
    user.password = undefined;
    user.token = token;
    res.send(user);
    next();
  });
};