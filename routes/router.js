var express = require('express');
var router = express.Router();
var auth = require('./auth');

var login = require('./login');

router.post('/api/login', auth.login);

//test
router.get('/', function(req, res, next) {
  	res.render('login', { title: 'Express' });
});
router.get('/homepage',login.redirectToHomepage);
router.post('/checklogin',login.checklogin);
router.post('/logout',login.logout);

module.exports = router;