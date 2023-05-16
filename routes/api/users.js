const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/user");
const resentMailController = require("../../controllers/auth");

router.get("/verify/:token", UserController.verifyUser);
router.post("/verify/", resentMailController.resendVerificationEmail);

module.exports = router;
