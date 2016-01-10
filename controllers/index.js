var User = require('../models/user');
var Team = require('../models/team');
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
console.log('login', req.body);
 async.waterfall([
    function(cb) {
      User.findOne({ email: req.body.email.toLowerCase() }).exec(cb);
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
    function(user, cb) {   	
	  Team.find({ 'users': { '$in': [user._id] } }).populate('users').exec(function(err, teams){
	  	if (err) return cb(err);
	  	user.teams = teams;
	  	cb(null, user);
	  });
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
      Team.findOne({ name: req.body.teamName }).exec(cb);
    },  	
    function(team, cb) {
      if (team) {
        res.send({ message: 'exiting team' });
      } else {
      	cb(null);
      }
    },    
    function(cb) {
      User.findOne({ email: req.body.email }).exec(cb);
    },
    function(user, cb) {
      if (user) {
        res.send({ message: 'exiting user' });
      } else {

        user = new User();
        team = new Team();        
        
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.password = req.body.password;
        user.teams.push(team._id);
        user.save(function(err, user){
          cb(err, user, team);
        });
      }
    },
    function(user, team, cb) {
	  team.name = req.body.teamName;
	  team.users.push(user._id);
	  team.save(function(err, team){
	  	cb(err, team, user);
	  });
    },
    function(team, user, cb) {   	
	  Team.find({ 'users': { '$in': [user._id] } }).populate('users').exec(function(err, teams){
	  	if (err) return cb(err);
	  	user.teams = teams;
	  	cb(null, user);
	  });
    },
  ], function(err, user) {
    if (err) console.log(err);
    var token = jwt.sign({ userId: user._id.toString() }, user._id.toString(), { expiresIn: 8.64e+7 * 30 }); // one month
    user.password = undefined;
    user.token = token;
    res.send(user);
    next();
  });
};