const jwt = require("jsonwebtoken");

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userID: payload.userID,
      username: payload.username,
      email: payload.email,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "verification failed" });
  }
};

module.exports = authenticationMiddleware;
