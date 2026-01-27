const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET /api/trainer/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Trainer not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/trainer/profile
// Allows updating profile + email (email needs password confirmation)
exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      "name",
      "phone",
      "bio",
      "expertise",
      "experienceYears",
      "linkedin",
      "website",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findOne({ _id: req.user.id, role: "trainer" });
    if (!user) return res.status(404).json({ message: "Trainer not found" });

    // ✅ EMAIL CHANGE (optional)
    const newEmail = req.body.email?.trim()?.toLowerCase();
    if (newEmail && newEmail !== user.email) {
      // require password confirmation to change email
      const passwordConfirm = req.body.passwordConfirm;
      if (!passwordConfirm) {
        return res
          .status(400)
          .json({ message: "passwordConfirm is required to change email" });
      }

      const ok = await bcrypt.compare(passwordConfirm, user.password);
      if (!ok) {
        return res.status(400).json({ message: "Password confirmation is incorrect" });
      }

      // prevent duplicates
      const exists = await User.findOne({ email: newEmail });
      if (exists) return res.status(400).json({ message: "Email already in use" });

      user.email = newEmail;
    }

    // apply other updates
    Object.assign(user, updates);
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/trainer/profile/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Trainer not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
