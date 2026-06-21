const XLSX = require("xlsx");
const prisma = require("../config/prisma");

exports.uploadTimetable = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload an Excel file",
      });
    }

    // Read workbook
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    // First sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert sheet into 2D array
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    // Debug
    console.log("TOTAL ROWS:", rows.length);

    // Time slot row
    const timeSlots = rows[1];

    const timetableData = [];

    // Start after headers
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];

      // Clean day
      const day = String(row[0] || "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Clean room
      const room = String(row[1] || "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Skip invalid rows
      if (!day || !room) {
        continue;
      }

      // Loop timetable columns
      for (let j = 2; j < row.length; j++) {
        const cell = row[j];

        // Skip empty cells
        if (!cell) continue;

        // Skip break
        if (
          String(cell)
            .toLowerCase()
            .includes("break")
        ) {
          continue;
        }

        // Get time slot
        const timeRange = String(timeSlots[j] || "").trim();

        if (!timeRange.includes("-")) {
          continue;
        }

        // Parse time
        const [startTime, endTime] = timeRange
          .split("-")
          .map((t) => t.trim());

        // Parse cell lines
        const parts = String(cell)
          .split("\n")
          .map((p) =>
            String(p)
              .replace(/\r?\n|\r/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          )
          .filter(Boolean);

        // Expected:
        // CS-506-T
        // BSCS-6th-M3
        // Ms.Nimra Razzaq

        const subjectCode = String(parts[0] || "").trim();

        const classInfo = String(parts[1] || "").trim();

        const teacherName = String(parts[2] || "").trim();

        // Skip invalid timetable cells
        if (!subjectCode || !classInfo || !teacherName) {
          continue;
        }

        // Parse class info
        // Example: BSCS-6th-M3

        let degree = "";
        let semester = null;
        let section = "";

        const classParts = classInfo.split("-");

        if (classParts.length >= 3) {
          degree = String(classParts[0] || "").trim();

          semester = parseInt(
            String(classParts[1] || "").replace(/\D/g, "")
          );

          section = String(classParts[2] || "").trim();
        }

        // Skip invalid semester
        if (!semester || isNaN(semester)) {
          continue;
        }

        // Push clean object
        timetableData.push({
          day,
          room,
          startTime,
          endTime,
          subjectCode,
          degree,
          semester,
          section,
          teacherName,
        });
      }
    }

    // No valid rows
    if (timetableData.length === 0) {
      return res.status(400).json({
        error: "No valid timetable data found",
      });
    }

    // Debug first row
    console.log("FIRST ENTRY:");
    console.log(timetableData[0]);

    // Insert into DB
    await prisma.timetable.createMany({
      data: timetableData,
      skipDuplicates: true,
    });

    return res.status(201).json({
      message: "Timetable uploaded successfully",
      total: timetableData.length,
    });

  } catch (error) {
    console.error("TIMETABLE UPLOAD ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};


exports.getStudentTimetable = async (req, res) => {
  try {
    const { degree, semester, section } = req.query;

    const timetable = await prisma.timetable.findMany({
      where: {
        degree,
        semester: parseInt(semester),
        section,
      },
      orderBy: [
        { day: "asc" },
        { startTime: "asc" },
      ],
    });

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getTeacherTimetable = async (req, res) => {
  try {
    const { teacherName } = req.query;

    const timetable = await prisma.timetable.findMany({
      where: {
        teacherName: {
          contains: teacherName.trim(),
        },
      },
    });

    res.status(200).json(timetable);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getAllTimetables = async (req, res) => {
  try {
    const timetable = await prisma.timetable.findMany({
      orderBy: [
        { day: "asc" },
        { startTime: "asc" },
      ],
    });

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


exports.getTeacherTodayClasses = async (req, res) => {
  try {
    const days = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ];

    const today = "Mon";

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    const classes = await prisma.timetable.findMany({
      where: {
        teacherName: {
          contains: user.fullName,
          mode: "insensitive",
        },
        day: today,
      },
    });

    res.status(200).json({
      count: classes.length,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};