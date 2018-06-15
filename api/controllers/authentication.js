var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {

  // if(!req.body.name || !req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }

  var user = new User();

  user.name = req.body.name;
  user.username = req.body.username;

  user.setPassword(req.body.password);

  user.save(function(err) {
    if (err) {
      console.error(err);
      res.send(500, {message: "Oops, something went wrong"});
    } else {
      var token;
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    }
  });

};

module.exports.login = function(req, res) {

  // if(!req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }
  console.log(req.body);

  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};

// TODO: add blacklist approach to this functionality
module.exports.logout = function(req, res) {
  const userToken = req.body.token;

  if (!userToken || !req.body.username) {
    console.log();
    res.send(401, {message: "User not authorized"});
  } else {
    return User.findOne({username: req.body.username})
      .then(user => {
        res.send(200, {message: "Log out successfull!"});
      })
      .catch(err => {
        console.log(err);
        res.send(500, {message: "Oops, something went wrong"});
      });
  }
};
