const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

exports.uploadResource = async (req, res) => {
  try {
   const {
  title,
  description,
  subjectCode,
  degree,
  semester,
  section,
} = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: "File is required",
      });
    }

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "uniflow_resources",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(stream);
      });

    const uploadedFile = await uploadStream();
    console.log(uploadedFile);

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        subjectCode,
        degree,
        semester: parseInt(semester),
        section,

        fileUrl: uploadedFile.secure_url,
        filePublicId: uploadedFile.public_id,

        teacherId: req.user.id,
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getTeacherResources = async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        teacherId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(resources);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getStudentResources = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const resources = await prisma.resource.findMany({
      where: {
        degree: user.degree,
        semester: user.semester,
        section: user.section,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(resources);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getTeacherResourcesCount = async (req, res) => {
  try {
    const count = await prisma.resource.count({
      where: {
        teacherId: req.user.id,
      },
    });

    res.status(200).json({
      count,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};