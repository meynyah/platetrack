const bcrypt = require("bcryptjs");
const Enforcer = require("../models/Enforcer");
const Owner = require("../models/Owner");
const Admin = require("../models/Admin");
const PasswordReset = require("../models/PasswordReset");
const sendEmail = require("../utils/sendEmail");

const SALT_ROUNDS = 10;
const CODE_EXPIRY_MINUTES = 10;

const roleModels = { enforcer: Enforcer, owner: Owner, admin: Admin };

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
}

// POST /api/auth/forgot-password
// body: { email, role }
async function requestPasswordReset(req, res) {
  try {
    const { email, role } = req.body;

    if (!email || !role || !roleModels[role]) {
      return res.status(400).json({ message: "Email and valid role are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const Model = roleModels[role];

    const account = await Model.findOne({ email: normalizedEmail });
    if (!account) {
      return res.status(404).json({
        message: `No ${role} account was found for this email address.`,
      });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await PasswordReset.findOneAndUpdate(
      { email: normalizedEmail, role },
      { code, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    await sendEmail(
      normalizedEmail,
      "PlateTrack Password Reset Code",
      `<p>Your PlateTrack verification code is:</p><h2>${code}</h2><p>This code expires in ${CODE_EXPIRY_MINUTES} minutes.</p>`
    );

    return res.json({ message: "A verification code has been sent to your email address." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while sending verification code." });
  }
}

// POST /api/auth/verify-reset-code
// body: { email, role, code }
async function verifyResetCode(req, res) {
  try {
    const { email, role, code } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const record = await PasswordReset.findOne({ email: normalizedEmail, role });

    if (!record || record.code !== String(code)) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "This verification code has expired. Please request a new one." });
    }

    record.verified = true;
    await record.save();

    return res.json({ message: "Code verified. You may now reset your password." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while verifying code." });
  }
}

// POST /api/auth/reset-password
// body: { email, role, newPassword }
async function resetPassword(req, res) {
  try {
    const { email, role, newPassword } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const record = await PasswordReset.findOne({ email: normalizedEmail, role });
    if (!record || !record.verified) {
      return res.status(403).json({ message: "Please verify your code before resetting your password." });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "This verification session has expired. Please start over." });
    }

    const Model = roleModels[role];
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await Model.findOneAndUpdate({ email: normalizedEmail }, { password: hashed });

    await PasswordReset.deleteOne({ _id: record._id });

    return res.json({ message: "Your password has been reset successfully." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while resetting password." });
  }
}

module.exports = { requestPasswordReset, verifyResetCode, resetPassword };