var express = require('express');
var router = express.Router();

var multer = require('multer');

var auth = require('./auth');
var asset = require('./asset');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmp/')
    },
    filename: function (req, file, cb) {
    	cb(null, Date.now() + '-' +file.originalname)
    }
});
var upload = multer({storage:storage});

router.post('/api/signin', auth.signin);
router.post('/api/signup', auth.signup);
router.get('/api/check_session', auth.checkSession);
router.post('/api/logout', auth.logout);

router.post('/api/add_asset',upload.single('file'),asset.addAsset);
router.post('/api/get_assets',asset.getAssets);
router.post('/api/delete_asset',asset.deleteAsset);
router.post('/api/star_asset',asset.addOrRemoveStarredAsset);

module.exports = router;