const express = require("express");
const router = express.Router();
const {
  registerEnforcer,
  loginEnforcer,
  registerOwner,
  loginOwner,
  loginAdmin,
} = require("../controllers/authController");

// idagdag mo itong bagong import
const {
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} = require("../controllers/passwordResetController");

router.post("/enforcer/register", registerEnforcer);
router.post("/enforcer/login", loginEnforcer);

router.post("/owner/register", registerOwner);
router.post("/owner/login", loginOwner);

router.post("/admin/login", loginAdmin);

// idagdag mo itong bagong routes
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

module.exports = router;