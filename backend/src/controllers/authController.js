const supabase = require("../config/supabase");
const prisma = require("../config/prisma");

exports.signup = async (req, res) => {
  try {
    console.log("SIGNUP API HIT");

    const {
      email,
      password,
      fullName,
      role,
      agNumber,
      degree,
      semester,
      section,
      teacherId,
    } = req.body;

    const userRole = role?.toUpperCase();

    // CREATE SUPABASE USER
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          role: userRole,
          agNumber: userRole === "STUDENT" ? agNumber : null,
          degree: userRole === "STUDENT" ? degree : null,
          semester: userRole === "STUDENT" ? parseInt(semester) : null,
          section: userRole === "STUDENT" ? section : null,
          teacherId: userRole === "TEACHER" ? teacherId : null,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    if (!data.user) {
      return res.status(400).json({
        error: "User creation failed",
      });
    }

    console.log("SUPABASE USER:", data.user.id);

    // CREATE PRISMA USER
    const newUser = await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        fullName,
        role: userRole,

        agNumber:
          userRole === "STUDENT" ? agNumber : null,

        degree:
          userRole === "STUDENT" ? degree : null,

        semester:
          userRole === "STUDENT"
            ? parseInt(semester)
            : null,

        section:
          userRole === "STUDENT" ? section : null,

        teacherId:
          userRole === "TEACHER"
            ? teacherId
            : null,
      },
    });

    return res.status(201).json({
      message: "Signup successful",
      user: newUser,
    });
  } catch (error) {
    console.log("SIGNUP ERROR:");
    console.dir(error, { depth: null });

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: data.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.status(200).json({
      message: "Login successful",
      session: data.session,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};