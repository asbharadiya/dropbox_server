var express = require('express');
var router = express.Router();

var multer = require('multer');

var auth = require('./auth');
var asset = require('./asset');
var group = require('./group');

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

router.post('/api/create_group',group.createGroup);
router.post('/api/update_group',group.updateGroup);
router.post('/api/add_remove_member_group',group.addRemoveMemberGroup);
router.post('/api/delete_group',group.deleteGroup);
router.get('/api/get_group_by_id',group.getGroupById);
router.get('/api/get_groups',group.getGroups);
router.get('/api/search_groups',group.searchGroups);
router.get('/api/search_users',group.searchUsers);

module.exports = router;