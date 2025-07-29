require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@creatorconnect.com",
    });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@creatorconnect.com",
      password: "admin123", // This will be hashed by the pre-save middleware
      role: "admin",
      isVerified: true,
      profileComplete: true,
      botVerificationStatus: "verified",
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@creatorconnect.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdminUser();
  mongoose.connection.close();
  console.log("Database connection closed");
};

main();
