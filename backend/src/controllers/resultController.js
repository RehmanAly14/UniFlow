const axios = require("axios");
const prisma = require("../config/prisma");

exports.getStudentResult = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);

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

    const response = await axios.get(
      `https://uaflmsapi.vercel.app/api/v1/lmsresult?registration_number=${user.agNumber}`,
      {
        headers: {
          "x-api-key": process.env.UAF_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};