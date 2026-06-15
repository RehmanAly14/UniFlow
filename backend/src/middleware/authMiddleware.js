const supabase = require("../config/supabase");

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    req.user = user; // IMPORTANT

    next();
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};