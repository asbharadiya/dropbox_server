var express = require('express');
var router = express.Router();
var auth = require('./auth');

router.post('/api/signin', auth.signin);
router.post('/api/signup', auth.signup);
router.get('/api/check_session', auth.checkSession);

module.exports = router;