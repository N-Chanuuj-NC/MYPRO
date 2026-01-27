require("dotenv").config();
const mongoose = require("mongoose");

// models
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Feedback = require("../models/Feedback");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");

  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
}

async function main() {
  await connectDB();

  const trainerEmail = process.env.SEED_TRAINER_EMAIL;
  if (!trainerEmail) throw new Error("SEED_TRAINER_EMAIL missing in .env");

  // 1) Find trainer
  const trainer = await User.findOne({ email: trainerEmail, role: "trainer" });
  if (!trainer) throw new Error("Trainer not found. Check SEED_TRAINER_EMAIL and role.");

  console.log("✅ Trainer:", trainer.email);

  // 2) Pick one course (first course of that trainer)
  
  let course = await Course.findOne({ trainerId: trainer._id }).sort({ createdAt: -1 });

if (!course) {
  course = await Course.create({
    trainerId: trainer._id,
    title: "Ai",
    category: "Web Development",
    level: "beginner",
    price: 0,
    status: "published",
    description: "Seed course created automatically for feedback testing.",
  });

  console.log("✅ No course found, created course:", course.title);
}


  console.log("✅ Course:", course.title);

  // 3) Create/find sample students (as User role=student)
  const sampleStudents = [
    { name: "Ayesha Khan", email: "ayesha@gmail.com" },
    { name: "Kumar Silva", email: "kumar@gmail.com" },
    { name: "Sana Perera", email: "sana@gmail.com" },
  ];

  const students = [];
  for (const s of sampleStudents) {
    let user = await User.findOne({ email: s.email });

    if (!user) {
      // simple password for seed; you can change later
      user = await User.create({
        name: s.name,
        email: s.email,
        password: "Student@123", // must satisfy your password rules
        role: "student",
      });
      console.log("✅ Created student:", s.email);
    } else {
      // ensure role is student (optional)
      if (user.role !== "student") {
        user.role = "student";
        await user.save();
      }
      console.log("✅ Found student:", s.email);
    }

    students.push(user);
  }

  // 4) Ensure enrollments exist for selected course
  for (const st of students) {
    const exists = await Enrollment.findOne({
      trainerId: trainer._id,
      courseId: course._id,
      studentId: st._id,
    });

    if (!exists) {
      await Enrollment.create({
        trainerId: trainer._id,
        courseId: course._id,
        studentId: st._id,
        status: "active",
        progressPercent: Math.floor(Math.random() * 80), // random progress
        enrolledAt: new Date(),
        profile: {
          fullName: st.name,
          email: st.email,
        },
      });
      console.log("✅ Enrolled:", st.email);
    } else {
      console.log("✅ Already enrolled:", st.email);
    }
  }

  // 5) Create feedback (avoid duplicates)
  const feedbackSamples = [
    { rating: 5, comment: "Great course! Very clear explanation." },
    { rating: 4, comment: "Good content. Please add more examples." },
    { rating: 3, comment: "Nice, but quizzes could be improved." },
  ];

  // delete old feedback for these students for same course (optional clean)
  await Feedback.deleteMany({
    trainerId: trainer._id,
    courseId: course._id,
    studentId: { $in: students.map((x) => x._id) },
  });

  // insert new feedback
  for (let i = 0; i < students.length; i++) {
    await Feedback.create({
      trainerId: trainer._id,
      courseId: course._id,
      studentId: students[i]._id,
      rating: feedbackSamples[i].rating,
      comment: feedbackSamples[i].comment,
      trainerReply: "",
      resolved: false,
    });
  }

  console.log("✅ Seed feedback created successfully!");
  await mongoose.disconnect();
  console.log("✅ Done. MongoDB disconnected");
}

main().catch(async (err) => {
  console.error("❌ Seed failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
