const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const {authMiddleware} = require("../middleware/authMiddleware");

const {
  uploadResource,
  getTeacherResources,
  getStudentResources,
  getTeacherResourcesCount,
} = require("../controllers/resourceController");

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadResource
);

router.get(
  "/teacher",
  authMiddleware,
  getTeacherResources 
);

router.get(
  "/student",
  authMiddleware,
  getStudentResources
);
router.get(
  "/teacher/count",
  authMiddleware,
  getTeacherResourcesCount
);

module.exports = router;