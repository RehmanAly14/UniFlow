const express = require("express");
const router = express.Router();

const {authMiddleware} = require("../middleware/authMiddleware");

const {
  getStudentResult,
} = require("../controllers/resultController");

router.get(
  "/student",
  authMiddleware,
  getStudentResult
);

module.exports = router;