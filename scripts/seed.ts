import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../src/lib/mongodb";
import { User } from "../src/models/User";
import { Team } from "../src/models/Team";
import { Goal } from "../src/models/Goal";

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set");
    }

    await connectDB();
    console.log("Connected to MongoDB");

    // Admins
    const adminEmail = "admin@atomicgoals.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        role: "admin",
        verified: true,
        isSeedUser: true,
        approvalStatus: "Approved",
      });
      console.log("Admin user created");
    }

    // Managers
    const managersData = [
      { email: "alice.eng@atomicgoals.com", name: "Alice Engineer", role: "manager", department: "Engineering", jobTitle: "VP of Engineering" },
      { email: "bob.mkt@atomicgoals.com", name: "Bob Marketer", role: "manager", department: "Marketing", jobTitle: "CMO" },
      { email: "sarah.sales@atomicgoals.com", name: "Sarah Sales", role: "manager", department: "Sales", jobTitle: "VP of Sales" },
      { email: "hannah.hr@atomicgoals.com", name: "Hannah HR", role: "manager", department: "HR", jobTitle: "VP of HR" },
    ];

    const managers = [];
    for (const data of managersData) {
      let m = await User.findOne({ email: data.email });
      if (!m) m = await User.create({ ...data, verified: true, isSeedUser: true, onboardingCompleted: true, approvalStatus: "Approved" });
      managers.push(m);
    }
    console.log("Managers seeded");

    // Teams
    const teamsData = [
      { name: "Frontend Team", department: "Engineering", managerEmail: "alice.eng@atomicgoals.com" },
      { name: "Growth Team", department: "Marketing", managerEmail: "bob.mkt@atomicgoals.com" },
      { name: "Brand Team", department: "Marketing", managerEmail: "bob.mkt@atomicgoals.com" },
      { name: "Enterprise Sales", department: "Sales", managerEmail: "sarah.sales@atomicgoals.com" },
      { name: "People Ops", department: "HR", managerEmail: "hannah.hr@atomicgoals.com" },
    ];

    const teams = [];
    for (const data of teamsData) {
      const manager = managers.find(m => m.email === data.managerEmail);
      let t = await Team.findOne({ name: data.name });
      if (!t) {
        t = await Team.create({ name: data.name, department: data.department, manager: manager._id });
      }
      teams.push(t);
    }
    console.log("Teams seeded");

    // Assign Managers to their first team
    for (const m of managers) {
      const mTeam = teams.find(t => t.manager.toString() === m._id.toString());
      if (mTeam) {
        m.team = mTeam._id;
        await m.save();
      }
    }

    // Employees
    const employeesData = [
      { email: "charlie.eng@atomicgoals.com", name: "Charlie Coder", department: "Engineering", teamName: "Frontend Team", managerEmail: "alice.eng@atomicgoals.com", jobTitle: "Senior Developer" },
      { email: "diana.eng@atomicgoals.com", name: "Diana Dev", department: "Engineering", teamName: "Frontend Team", managerEmail: "alice.eng@atomicgoals.com", jobTitle: "Junior Developer" },
      { email: "eve.mkt@atomicgoals.com", name: "Eve SEO", department: "Marketing", teamName: "Growth Team", managerEmail: "bob.mkt@atomicgoals.com", jobTitle: "SEO Specialist" },
      { email: "frank.mkt@atomicgoals.com", name: "Frank Ads", department: "Marketing", teamName: "Growth Team", managerEmail: "bob.mkt@atomicgoals.com", jobTitle: "Ads Manager" },
      { email: "grace.mkt@atomicgoals.com", name: "Grace Design", department: "Marketing", teamName: "Brand Team", managerEmail: "bob.mkt@atomicgoals.com", jobTitle: "UI Designer" },
      { email: "sam.sales@atomicgoals.com", name: "Sam Representative", department: "Sales", teamName: "Enterprise Sales", managerEmail: "sarah.sales@atomicgoals.com", jobTitle: "Account Executive" },
      { email: "harry.hr@atomicgoals.com", name: "Harry Human", department: "HR", teamName: "People Ops", managerEmail: "hannah.hr@atomicgoals.com", jobTitle: "HR Generalist" },
    ];

    const employees = [];
    for (const data of employeesData) {
      const manager = managers.find(m => m.email === data.managerEmail);
      const team = teams.find(t => t.name === data.teamName);
      let e = await User.findOne({ email: data.email });
      if (!e) {
        e = await User.create({
          name: data.name,
          email: data.email,
          role: "employee",
          department: data.department,
          jobTitle: data.jobTitle,
          manager: manager._id,
          team: team._id,
          verified: true,
          isSeedUser: true,
          onboardingCompleted: true,
          approvalStatus: "Approved",
        });
      }
      employees.push(e);
    }
    console.log("Employees seeded");

    // Goals
    const existingGoals = await Goal.countDocuments({ title: { $regex: /Seed Goal/ } });
    if (existingGoals === 0) {
      const charlie = employees.find(e => e.email === "charlie.eng@atomicgoals.com");
      const alice = managers.find(m => m.email === "alice.eng@atomicgoals.com");
      const fTeam = teams.find(t => t.name === "Frontend Team");
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      await Goal.create({
        title: "Seed Goal: Redesign Dashboard",
        description: "Update the core dashboard for better analytics visualization.",
        creator: charlie._id,
        assignedTo: [charlie._id],
        team: fTeam._id,
        assignedManager: alice._id,
        department: "Engineering",
        dueDate: futureDate,
        approvalStatus: "Pending Approval",
        status: "in-progress",
        progress: 10,
        goalWeightage: 30,
        contributionPercentage: 15,
        contributingTeams: [fTeam._id],
        quarterlyTarget: "Q3 2026",
      });
      
      await Goal.create({
        title: "Seed Goal: Increase Conversion Rate",
        description: "Optimize the landing page.",
        creator: alice._id,
        assignedTo: [employees.find(e => e.email === "eve.mkt@atomicgoals.com")._id],
        team: teams.find(t => t.name === "Growth Team")._id,
        assignedManager: managers.find(m => m.email === "bob.mkt@atomicgoals.com")._id,
        department: "Marketing",
        dueDate: futureDate,
        approvalStatus: "Approved",
        status: "in-progress",
        progress: 50,
        goalWeightage: 25,
        contributionPercentage: 12.5,
        contributingTeams: [teams.find(t => t.name === "Growth Team")._id],
        quarterlyTarget: "Q3 2026",
      });

      const sarah = managers.find(m => m.email === "sarah.sales@atomicgoals.com");
      const hannah = managers.find(m => m.email === "hannah.hr@atomicgoals.com");
      const sam = employees.find(e => e.email === "sam.sales@atomicgoals.com");
      const harry = employees.find(e => e.email === "harry.hr@atomicgoals.com");
      
      await Goal.create({
        title: "Seed Goal: Close 5 Enterprise Deals",
        description: "Focus on Fortune 500 companies in Q3.",
        creator: sarah._id,
        assignedTo: [sam._id],
        team: teams.find(t => t.name === "Enterprise Sales")._id,
        assignedManager: sarah._id,
        department: "Sales",
        dueDate: futureDate,
        approvalStatus: "Approved",
        status: "in-progress",
        progress: 20,
        goalWeightage: 25,
        contributionPercentage: 12.5,
        contributingTeams: [teams.find(t => t.name === "Enterprise Sales")._id],
        quarterlyTarget: "Q3 2026",
      });

      await Goal.create({
        title: "Seed Goal: Launch New Employee Handbook",
        description: "Draft and publish the remote work guidelines.",
        creator: hannah._id,
        assignedTo: [harry._id],
        team: teams.find(t => t.name === "People Ops")._id,
        assignedManager: hannah._id,
        department: "HR",
        dueDate: futureDate,
        approvalStatus: "Approved",
        status: "completed",
        progress: 100,
        goalWeightage: 20,
        contributionPercentage: 10,
        contributingTeams: [teams.find(t => t.name === "People Ops")._id],
        quarterlyTarget: "Q3 2026",
      });
      
      console.log("Goals seeded");
    }

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
