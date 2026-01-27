const jwt = require("jsonwebtoken");

// Accepts either:
// - Authorization: Bearer <token>
// - x-auth-token: <token>
exports.protect = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const xToken = req.headers["x-auth-token"];

    let token = null;
    if (header && header.startsWith("Bearer ")) token = header.split(" ")[1];
    else if (xToken) token = xToken;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support both payload shapes:
    //  - { user: { id, role, email } }
    //  - { id, role, email }
    req.user = decoded.user || decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Only trainers can access
exports.trainerOnly = (req, res, next) => {
  if (req.user?.role !== "trainer") {
    return res.status(403).json({ message: "Trainer access only" });
  }
  next();
};
