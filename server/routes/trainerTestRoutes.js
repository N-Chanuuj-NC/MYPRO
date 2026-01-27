const router = require("express").Router();
const { protect, trainerOnly } = require("../middleware/auth");

router.get("/me", protect, trainerOnly, (req, res) => {
  res.json({
    message: "Trainer route works ✅",
    user: req.user,
  });
});

module.exports = router;
