const prisma = require("./src/config/prisma");

async function test() {
  try {
    const user = await prisma.user.create({
      data: {
        id: "123",
        email: "test@test.com",
        fullName: "Test User",
        role: "STUDENT",
      },
    });

    console.log(user);
  } catch (err) {
    console.error(err);
  }
}

test();