import { connectDB } from "../src/lib/mongodb";
import nodemailer from "nodemailer";

async function verifyConnections() {
  console.log("Testing Connections...\\n");

  let mongoStatus = "❌ Failed";
  try {
    const mongoose = await connectDB();
    if (mongoose.connection.readyState === 1) {
      mongoStatus = "✅ Connected Successfully";
    } else {
      mongoStatus = `⚠️ Connected but readyState is ${mongoose.connection.readyState}`;
    }
  } catch (error: unknown) {
    mongoStatus = `❌ Failed: ${ (error as Error).message }`;
  }
  console.log(`[MongoDB]: ${mongoStatus}`);

  let smtpStatus = "❌ Failed";
  if (!process.env.EMAIL_SERVER) {
    smtpStatus = "⚠️ EMAIL_SERVER not set, skipping SMTP check.";
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER,
        port: 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      const verified = await transporter.verify();
      if (verified) {
        smtpStatus = "✅ Connected Successfully";
      }
    } catch (error: unknown) {
      // Don't leak the raw password, maybe mask it if it prints.
      smtpStatus = `❌ Failed: ${ (error as Error).message }`;
    }
  }
  
  console.log(`[SMTP (Email)]: ${smtpStatus}\\n`);
  
  // Need to exit smoothly so the script finishes
  process.exit(0);
}

verifyConnections();
