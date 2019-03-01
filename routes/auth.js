const jwt = require('jsonwebtoken');
const config = require('../app/models/config');

exports.userRequired = function (req, res, next) {
  console.log('userRequired ran'); 
  validateToken(req, res, next);
};

function validateToken(req, res, next) {
  console.log('userRequired function in frontend ran');
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  console.log('token in userRequired', token);

  if (!token) return res.redirect(403, '/');

  try {
    var decoded = jwt.decode(token, config.secret);
  } catch (err) {
    return res.redirect(403, '/');
  }

  if (!decoded.id) return res.redirect(403, '/');

  req.user = decoded;
  console.log('req.user in userRequired', req.user);
  req.token = token;
  console.log('req.token in userRequired', req.token);
  next();
}