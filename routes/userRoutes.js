const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.post('/register',userCtrl.register);
router.post('/login',userCtrl.login);
router.get('/logout',userCtrl.logout);
router.get('/refresh_token',userCtrl.refreshToken);

router.get("/infor",auth,userCtrl.getUser);
router.patch('/addcart', auth, userCtrl.addCart)
router.get('/history', auth, userCtrl.history)


module.exports = router;