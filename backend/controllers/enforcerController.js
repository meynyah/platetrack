const Violation = require("../models/Violation");
const Owner = require("../models/Owner");
const Notification = require("../models/Notification");

// POST /api/enforcer/violations
// This is how "lahat ng reports ng traffic enforcer" reach the admin — every
// report an enforcer submits is written straight to the shared database that
// the admin dashboard reads from.
async function submitViolation(req, res) {
  try {
    const { plateNumber, violationType, location, dateTime, photoUrl, notes } = req.body;
    if (!plateNumber || !violationType) {
      return res.status(400).json({ message: "plateNumber and violationType are required." });
    }

    const owner = await Owner.findOne({ plateNumber: plateNumber.toUpperCase() });

    const violation = await Violation.create({
      enforcer: req.user.id,
      plateNumber,
      owner: owner ? owner._id : null,
      violationType,
      location,
      dateTime: dateTime || new Date(),
      photoUrl,
      notes,
    });

    res.status(201).json({ message: "Violation report submitted.", violation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit violation report." });
  }
}

// GET /api/enforcer/violations/mine
async function myViolations(req, res) {
  try {
    const violations = await Violation.find({ enforcer: req.user.id }).sort({ dateTime: -1 });
    res.json(violations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load your reports." });
  }
}

// GET /api/enforcer/notifications
// Where announcements from the admin (requirement 5) show up.
async function myNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.user.id, recipientModel: "Enforcer" }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load notifications." });
  }
}

// PATCH /api/enforcer/notifications/:id/read
async function markNotificationRead(req, res) {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found." });
    res.json(notif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update notification." });
  }
}

module.exports = { submitViolation, myViolations, myNotifications, markNotificationRead };
