const router = require("express").Router();
const Payments = require("../models/paymentModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const paymentCtrl = require("../controllers/paymentCtrl");
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");   

router.route('/payment')
    .get(auth,authAdmin, paymentCtrl.getPayments)
    .post(auth, paymentCtrl.createPayments);


module.exports = router;