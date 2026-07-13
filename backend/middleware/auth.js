const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized_No_ID" });
      }
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized_No_User" });
      }
      req.user = user; 
      return next();

    } catch (error) {
      return res.status(401).json({ success: false, message: "Unauthorized_Invalid_Token" });
    }
  }
   return res.status(401).json({ success: false, message: "Missing_Token_Header" });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};
module.exports = { protect, authorize };