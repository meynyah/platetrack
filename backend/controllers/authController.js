const bcrypt = require("bcryptjs");
const Enforcer = require("../models/Enforcer");
const Owner = require("../models/Owner");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
const generateToken = require("../utils/generateToken");

const SALT_ROUNDS = 10;

/* ---------------------------- ENFORCER ---------------------------- */

// POST /api/auth/enforcer/register
async function registerEnforcer(req, res) {
  try {
    const {
      fullName,
      email,
      badgeNumber,
      station,
      mobile,
      password
    } = req.body;

    if (!fullName || !email || !badgeNumber || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedBadgeNumber = String(badgeNumber).trim().toUpperCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    if (mobile && !/^09\d{9}$/.test(mobile)) {
      return res.status(400).json({
        message: "Please enter a valid 11-digit Philippine mobile number."
      });
    }

    const existing = await Enforcer.findOne({
      $or: [
        { email: normalizedEmail },
        { badgeNumber: normalizedBadgeNumber }
      ]
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email or badge number already exists."
      });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const enforcer = await Enforcer.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      badgeNumber: normalizedBadgeNumber,
      station: String(station || "").trim() || "Antipolo Traffic Management Office",
      mobile: mobile || undefined,
      password: hashed,
      status: "pending"
    });

    return res.status(201).json({
      message: "Registration submitted. Your registration will be reviewed by the PlateTrack Administrator. You can only sign in after your account has been approved.",
      enforcerId: enforcer._id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error during registration."
    });
  }
}

// POST /api/auth/enforcer/login
async function loginEnforcer(req, res) {
  try {
    const { email, password } = req.body;
    const enforcer = await Enforcer.findOne({ email: (email || "").toLowerCase() });

    if (!enforcer || !(await bcrypt.compare(password, enforcer.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (enforcer.status === "pending") {
      return res.status(403).json({
        message: "Your account is still under review by the PlateTrack Administrator.",
      });
    }
    if (enforcer.status === "rejected") {
      return res.status(403).json({
        message: "Your registration was not approved. Contact the PlateTrack Administrator for details.",
      });
    }

    const token = generateToken(enforcer._id, "enforcer");
    return res.json({
      token,
      user: {
        id: enforcer._id,
        fullName: enforcer.fullName,
        email: enforcer.email,
        badgeNumber: enforcer.badgeNumber,
        role: "enforcer",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login." });
  }
}

/* ----------------------------- OWNER ------------------------------ */

// POST /api/auth/owner/register
async function registerOwner(req, res) {
  try {
    const { fullName, email, plateNumber, contactNumber, password } = req.body;

    if (!fullName || !email || !plateNumber || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const existing = await Owner.findOne({ $or: [{ email }, { plateNumber: plateNumber.toUpperCase() }] });
    if (existing) {
      return res.status(409).json({ message: "An account with this email or plate number already exists." });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const owner = await Owner.create({
      fullName,
      email,
      plateNumber,
      contactNumber,
      password: hashed,
      status: "pending",
    });

    return res.status(201).json({
      message: "Registration submitted and is pending review by the PlateTrack Administrator.",
      ownerId: owner._id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during registration." });
  }
}

// POST /api/auth/owner/login
async function loginOwner(req, res) {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email: (email || "").toLowerCase() });

    if (!owner || !(await bcrypt.compare(password, owner.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (owner.status === "pending") {
      return res.status(403).json({ message: "Your account is still under review by the PlateTrack Administrator." });
    }
    if (owner.status === "rejected") {
      return res.status(403).json({ message: "Your registration was not approved." });
    }

    const token = generateToken(owner._id, "owner");
    return res.json({
      token,
      user: {
        id: owner._id,
        fullName: owner.fullName,
        email: owner.email,
        plateNumber: owner.plateNumber,
        role: "owner",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login." });
  }
}

/* ----------------------------- ADMIN ------------------------------ */

// POST /api/auth/admin/login
// Admin accounts are NOT self-registered through this API for security —
// create them with `npm run seed:admin` (see seed/createAdmin.js).
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: (email || "").toLowerCase() });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(admin._id, "admin");
    return res.json({
      token,
      user: { id: admin._id, fullName: admin.fullName, email: admin.email, role: "admin" },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login." });
  }
}

module.exports = { registerEnforcer, loginEnforcer, registerOwner, loginOwner, loginAdmin };