const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const enforcer = require("../controllers/enforcerController");

router.use(verifyToken, requireRole("enforcer"));

router.post("/violations", enforcer.submitViolation);
router.get("/violations/mine", enforcer.myViolations);

router.get("/notifications", enforcer.myNotifications);
router.patch("/notifications/:id/read", enforcer.markNotificationRead);

module.exports = router;
