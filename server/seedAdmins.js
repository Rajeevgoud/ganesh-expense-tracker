const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({
  path: "./server/.env"
});

const User = require("./models/User");

const admins = [
  {
    name: process.env.ADMIN1_NAME,
    email: process.env.ADMIN1_EMAIL,
    password: process.env.ADMIN1_PASSWORD,
  },
  {
    name: process.env.ADMIN2_NAME,
    email: process.env.ADMIN2_EMAIL,
    password: process.env.ADMIN2_PASSWORD,
  },
  {
    name: process.env.ADMIN3_NAME,
    email: process.env.ADMIN3_EMAIL,
    password: process.env.ADMIN3_PASSWORD,
  },
  {
    name: process.env.ADMIN4_NAME,
    email: process.env.ADMIN4_EMAIL,
    password: process.env.ADMIN4_PASSWORD,
  },
];

async function seedAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    for (const admin of admins) {
      if (!admin.name || !admin.email || !admin.password) {
        console.log("Skipping incomplete admin configuration");
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);

      const existingAdmin = await User.findOne({ email: admin.email });

      if (existingAdmin) {
        existingAdmin.name = admin.name;
        existingAdmin.password = hashedPassword;
        existingAdmin.role = "admin";

        await existingAdmin.save();
        console.log(`Updated admin: ${admin.email}`);
      } else {
        await User.create({
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: "admin",
        });

        console.log(`Created admin: ${admin.email}`);
      }
    }

    console.log("All admin accounts processed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exit(1);
  }
}

seedAdmins();
