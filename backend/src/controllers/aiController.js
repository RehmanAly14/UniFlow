const axios = require("axios");
const prisma = require("../config/prisma");

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
     const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    await prisma.chatMessage.create({
  data: {
    userId: user.id,
    role: "user",
    content: message,
  },
});

   
    const timetable = await prisma.timetable.findMany({
  where: {
    degree: user.degree,
    semester: user.semester,
    section: user.section,
  },
});
const timetableText = timetable
  .map(
    (t) =>
      `${t.day} | ${t.subjectCode} | ${t.startTime}-${t.endTime}`
  )
  .join("\n");
  const resources = await prisma.resource.findMany({
  where: {
    degree: user.degree,
    semester: user.semester,
    section: user.section,
  },
  take: 20,
});
const resourceText = resources
  .map((r) => r.title)
  .join("\n");

  const history = await prisma.chatMessage.findMany({
  where: {
    userId: user.id,
  },
  orderBy: {
    createdAt: "asc",
  },
  take: 20,
});

    const prompt = `
You are UniFlow AI.

Student Information:
Name: ${user.fullName}
Degree: ${user.degree}
Semester: ${user.semester}
Section: ${user.section}

Current Timetable:
${timetableText}

Available Resources:
${resourceText}

Instructions:
- Help with studies
- Help with GPA improvement
- Help with timetable planning
- Help with exam preparation
- Help with assignments
- Be concise
- Use bullet points when useful

Student Question:
${message}
`;

const messages = [
  {
    role: "system",
    content: "You are an academic assistant.",
  },
];

history.forEach((msg) => {
  messages.push({
    role: msg.role,
    content: msg.content,
  });
});

messages.push({
  role: "user",
  content: prompt,
});
console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);
console.log("USER:", user?.fullName);
console.log("MESSAGES COUNT:", messages.length);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
     const aiReply = response.data.choices[0].message.content;

await prisma.chatMessage.create({
  data: {
    userId: user.id,
    role: "assistant",
    content: aiReply,
  },
});

    res.json({
      reply:
        response.data.choices[0].message.content,
    });
   
  } catch (error) {
  console.log("===== FULL ERROR =====");
  console.log(error);

  console.log("MESSAGE:");
  console.log(error.message);

  console.log("STACK:");
  console.log(error.stack);

  res.status(500).json({
    error: error.message,
  });
}
};


exports.getChatHistory = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
   const messages = await prisma.chatMessage.findMany({
  where: {
    userId: req.user.id,
  },
  select: {
    role: true,
    content: true,
    createdAt: true,
  },
  orderBy: {
    createdAt: "asc",
  },
});

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};