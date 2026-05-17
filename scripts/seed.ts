import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../src/lib/mongodb";
import { User } from "../src/models/User";

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
    verified: true,
    isSeedUser: true,
  },
  {
    name: "Manager User",
    email: "manager@test.com",
    role: "manager",
    verified: true,
    isSeedUser: true,
  },
  {
    name: "Employee User",
    email: "employee@test.com",
    role: "employee",
    verified: true,
    isSeedUser: true,
  },
];

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.DB_NAME;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    // Connect to MongoDB using Mongoose connection utility
    await connectDB();
    console.log("Connected to MongoDB");

    for (const userData of seedUsers) {
      // Check if email already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        // Skip duplicates and print readable console logs
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      // Create user
      await User.create(userData);
      
      const roleCapitalized = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
      console.log(`${roleCapitalized} user created`);
    }

    // Temporary development bypass mode
    if (process.env.NODE_ENV === "development") {
      // Allow seed users to log in without real OTP verification
      // Useful for hackathon/demo testing only
      console.log("Development bypass mode enabled: Seed users can log in without real OTP verification.");
    }

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
