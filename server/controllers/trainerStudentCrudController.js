const mongoose = require("mongoose");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");
const Submission = require("../models/Submission"); // if you have it

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/trainer/students?search=
exports.listStudents = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const query = { role: "student" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const students = await User.find(query).select("name email role createdAt").sort({ createdAt: -1 });

    const ids = students.map((s) => s._id);
    const profiles = await StudentProfile.find({ userId: { $in: ids } });
    const map = new Map(profiles.map((p) => [String(p.userId), p]));

    const result = students.map((s) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      role: s.role,
      createdAt: s.createdAt,
      profile: map.get(String(s._id)) || null,
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/trainer/students/:studentId
exports.getStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid studentId" });

    const student = await User.findOne({ _id: studentId, role: "student" }).select("name email role createdAt");
    if (!student) return res.status(404).json({ message: "Student not found" });

    let profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: studentId,
        fullName: student.name || "",
        phone: "",
        address: "",
        dob: null,
        updatedByRole: "trainer",
      });
    }

    return res.json({ student, profile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/students
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, fullName, phone, address, dob } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const cleanEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    // NOTE: We pass plain password. Your User model should hash it (common MERN setup).
    const student = await User.create({
      name: name || fullName || "Student",
      email: cleanEmail,
      password,
      role: "student",
    });

    const profile = await StudentProfile.create({
      userId: student._id,
      fullName: (fullName || name || "").trim(),
      phone: (phone || "").trim(),
      address: (address || "").trim(),
      dob: dob ? new Date(dob) : null,
      updatedByRole: "trainer",
    });

    return res.status(201).json({ student, profile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/trainer/students/:studentId
exports.updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid studentId" });

    const { name, fullName, phone, address, dob } = req.body;

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (name !== undefined) student.name = String(name).trim();
    await student.save();

    let profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      profile = await StudentProfile.create({ userId: studentId });
    }

    if (fullName !== undefined) profile.fullName = String(fullName).trim();
    if (phone !== undefined) profile.phone = String(phone).trim();
    if (address !== undefined) profile.address = String(address).trim();
    if (dob !== undefined) profile.dob = dob ? new Date(dob) : null;

    profile.updatedByRole = "trainer";
    await profile.save();

    return res.json({ student: { _id: student._id, name: student.name, email: student.email }, profile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/students/:studentId
exports.deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ message: "Invalid studentId" });

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Clean related data to avoid broken records
    await StudentProfile.deleteOne({ userId: studentId });
    await Enrollment.deleteMany({ studentId });

    // If you use Submission model
    if (Submission?.deleteMany) {
      await Submission.deleteMany({ studentId });
    }

    await User.deleteOne({ _id: studentId });

    return res.json({ message: "Student deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
