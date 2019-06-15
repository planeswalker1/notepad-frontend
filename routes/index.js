const express = require('express');
const request = require('request');
const app = express();

const router = express.Router();
const config = require('../app/models/config');
const auths = require('./auth');

router.param('id', (req, res, next, id) => {
  // console.log('param middleware ran');
  // console.log('incoming id', id, typeof id);
  if (typeof Number(id) !== 'number')
    return res.status(400).send('Invalid Note');
  next();
});

// home page
router.get('/', function (req, res, next) {
  return res.render('index', { title: config.indexTitle });
});

// register page
router.get('/register', function (req, res, next) {
  return res.render('register', { title: config.registerTitle });
});

// send request to register a user
router.post('/register', function (req, res, next) {
  // console.log('someone requested to register');
  // console.log('req.body', req.body);
  // console.log('apiUrl', config.apiUrl + '/users');
  return request.post(config.apiUrl + '/users', { form: req.body }).pipe(res);
});

// login page
router.get('/login', function (req, res, next) {
  return res.render('login', { title: config.loginTitle });
});

// send request to login a user
router.post('/login', function (req, res, next) {
  // console.log('someone requested to login');
  return request.post(config.apiUrl + '/auth/token', { form: req.body }).pipe(res);
});

// send request logout a user
router.put('/logout', auths.userRequired, function (req, res, next) {
  // console.log('somone requested to logout');
  // console.log('their token', req.token);
  request.put({
    url: config.apiUrl + '/logout',
    headers: {
      'x-access-token': req.token
    }
  }).pipe(res);
});

// user's notes page
router.get('/notes', auths.userRequired, function (req, res, next) {
  // console.log('/notes hit');
  // console.log('getting user from backend');
  request.get({
    url: config.apiUrl + '/users',
    headers: {
      'x-access-token': req.token
    }
  }, function (err, response, body) {
    // console.log('body in GET /notes', body);
    // console.log('notes in GET /notes', JSON.parse(body).pages);
    if (response.statusCode === 200) {
      // console.log('login success');
      return res.render('notes', {
        token: req.token,
        notes: JSON.parse(body).pages
      });
    } else {
      // console.log('login error');
      return res.render('login', { 
        title: config.loginTitle
      });
    }
  }); 
}); 

// form page to create a new note 
router.get('/notes/create', auths.userRequired, function (req, res, next) {
  // console.log('req.token in GET /notes/create', req.token);
  return res.render('createnote', {
    title: config.createTitle,
    token: req.token
  });
});

// send request to create a new note
router.post('/notes', auths.userRequired, function (req, res, next) {
  // console.log('req.token in POST /notes', req.token);
  request.post({
    url: config.apiUrl + '/pages',
    form: req.body,
    headers: {
      'x-access-token': req.token,
      'Content-type': 'application/json'
    }
  }).pipe(res);
});

// form page to update a note
router.get('/notes/update/:id', auths.userRequired, function (req, res, next) {
  // console.log('/notes/update/:id hit');
  // console.log('expected id of note', req.params.id);
  request.get({
    url: config.apiUrl + '/pages/' + req.params.id,
    headers: {
      'x-access-token': req.token
    }
  }, function (err, response, body) {
    // console.log('request body returned');
    if (response.statusCode === 200) {
      // console.log('found a note to update', JSON.parse(body));
      return res.render('updatenote', {
        token: req.token,
        note: JSON.parse(body)
      });
    } else {
      // console.log('no note to update found');
      res.redirect(404, '/notes?token=' + req.token);
    } 
  });
});

// send request to update a new note
router.put('/notes/:id', auths.userRequired, function (req, res, next) {
  // console.log('sending PUT request me middle man');
  // console.log('me send request to this', config.apiUrl + '/pages/' + req.params.id);
  return request.put({
    url: config.apiUrl + '/pages/' + req.params.id,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': req.token
    },
    form: req.body
  }).pipe(res);
});

// confirm page to delete a note page
router.get('/notes/delete/:id', auths.userRequired, function (req, res, next) {
  // console.log('getting confirm delete form');
  // console.log('expected page id', req.params.id);
  request.get({
    url: config.apiUrl + '/pages/' + req.params.id,
    headers: {
      'x-access-token': req.token
    }
  }, function (err, response, body) {
    // console.log('request returned');
    if (response.statusCode === 200) {
      // console.log('found note to delete', JSON.parse(body));
      return res.render('deletenote', {
        token: req.token,
        note: JSON.parse(body)
      });
    } else {
      // console.log('no note to delete found');
      return res.redirect(404, '/notes?token=' + req.token);
    }
  });
});

// send request to delete a note
router.delete('/notes/:id', auths.userRequired, function (req, res, next) {
  // console.log('sending request to delete page');
  // console.log('expected id', req.params.id);
  request.delete({
    url: config.apiUrl + '/pages/' + req.params.id,
    headers: {
      'x-access-token': req.token
    }
  }).pipe(res);
});

module.exports = router;