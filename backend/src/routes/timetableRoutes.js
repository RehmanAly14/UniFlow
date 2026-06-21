const express = require("express");
const router = express.Router();

const {
  uploadTimetable,
  getStudentTimetable,
  getTeacherTimetable,
  getAllTimetables,
  getTeacherTodayClasses,
} = require("../controllers/timetableController");

const upload = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/upload", upload.single("file"), uploadTimetable);

router.get("/student", authMiddleware, getStudentTimetable);

router.get("/teacher", authMiddleware, getTeacherTimetable);

router.get("/all", authMiddleware, getAllTimetables);
router.get(
  "/teacher/today",
  authMiddleware,
  getTeacherTodayClasses
);

module.exports = router;