import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";

import { connectDB } from "../src/lib/mongodb";
import { Goal } from "../src/models/Goal";
import { User } from "../src/models/User";

const demoUsers = [
  {
    name: "Admin User",
    email: "adminmail@gmail.com",
    password: "password",
    role: "admin" as const,
    department: "People Ops",
  },
  {
    name: "Taylor Manager",
    email: "manager@goaltrack.com",
    password: "password",
    role: "manager" as const,
    department: "Engineering",
  },
  {
    name: "Alex Employee",
    email: "employee@goaltrack.com",
    password: "password",
    role: "employee" as const,
    department: "Engineering",
  },
];

async function seed() {
  await connectDB();

  const createdUsers: { id: string; email: string; role: string; department: string }[] =
    [];

  for (const demo of demoUsers) {
    const passwordHash = await bcrypt.hash(demo.password, 10);
    const user = await User.findOneAndUpdate(
      { email: demo.email },
      {
        $set: {
          name: demo.name,
          password: passwordHash,
          role: demo.role,
          department: demo.department,
        },
      },
      { upsert: true, new: true }
    );

    createdUsers.push({
      id: String(user._id),
      email: user.email,
      role: user.role,
      department: user.department ?? "",
    });

    console.log(`Seeded user: ${demo.email} (${demo.role})`);
  }

  const employee = createdUsers.find((user) => user.role === "employee");
  const manager = createdUsers.find((user) => user.role === "manager");

  if (employee) {
    await Goal.deleteMany({ ownerEmail: employee.email });
    await Goal.insertMany([
      {
        title: "Launch Q2 onboarding refresh",
        status: "approved",
        weight: 20,
        progress: 78,
        deadline: new Date("2026-06-20"),
        ownerId: employee.id,
        ownerEmail: employee.email,
        managerEmail: manager?.email ?? "",
        department: employee.department,
      },
      {
        title: "Reduce churn in mid-market segment",
        status: "pending",
        weight: 30,
        progress: 46,
        deadline: new Date("2026-07-02"),
        ownerId: employee.id,
        ownerEmail: employee.email,
        managerEmail: manager?.email ?? "",
        department: employee.department,
      },
    ]);
    console.log("Seeded sample goals for employee");
  }

  console.log("Seed complete.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
