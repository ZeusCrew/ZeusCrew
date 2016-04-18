var User = require('./userModel.js');
var Q = require('q');
var jwt = require('jwt-simple');

var findUser = Q.nbind(User.findOne, User);
var createUser = Q.nbind(User.create, User);

module.exports = {
  signin: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    
    findUser({username: username})
      .then(function(user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'route66');
                res.json({token: token});
              } else {
                return next(new Error('No User'));
              }
            });
        }
      })
      .fail(function(error) {
        next(error);
      });
  },
  
  signup: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    
    findUser({username: username})
      .then(function(user) {
        if (user) {
          next(new Error('User already exists'));
        } else {
          return createUser({
            username: username,
            password: password
          });
        }
      })
      .then(function(user) {
        // create token to send back for authorization
        var token = jwt.encode(user, 'route66');
        res.json({token: token});
      })
      .fail(function(error) {
        next(error);
      });
  },
  
  checkAuth: function(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'route66');
      findUser({username: user.username})
        .then(function(foundUser) {
          if (foundUser) {
            res.send(200);
          } else {
            res.send(401);
          }
        })
        .fail(function(error) {
          next(error);
        });
    }
  },
  
  getUser: function(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      // decode token
      var user = jwt.decode(token, 'route66');
      // check if user is in database
      
      findUser({username: user.username})
        .then(function(foundUser) {
          if (foundUser) {
            res.send({
              username: foundUser.username
            });
          } else {
            res.send(401);
          }
        })
        .fail(function(error) {
          next(error);
        });
    }
  },

  errorHandler: function (error, req, res, next) {
    res.send(500, {error: error.message});
  }
};