import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    await connectDB();

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find user or create one
    let user = await User.findOne({ email });
    if (!user) {
      // Create user if they don't exist (acting as a sign-up)
      const name = email.split("@")[0]; // Simple default name
      user = await User.create({
        name,
        email,
        role: "employee", // Default role
        department: "General",
        otp,
        otpExpire,
      });
      await logAudit({
        action: "user.signup",
        actorEmail: email,
        targetType: "user",
        targetId: String(user._id),
      });
    } else {
      // Update existing user with new OTP
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    }

    // Log the OTP to console for easy testing locally (since SMTP might fail)
    console.log(`[AUTH] Generated OTP for ${email}: ${otp}`);

    // Attempt to send email
    if (process.env.EMAIL_SERVER && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER,
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"GoalTrack" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your GoalTrack Login Code",
          text: `Your login code is: ${otp}. It will expire in 10 minutes.`,
          html: `<p>Your login code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
        });
        console.log(`[AUTH] Sent OTP email to ${email}`);
      } catch (emailError) {
        console.error("[AUTH] Failed to send email:", emailError);
        // We don't fail the request here, just log it, so user can still use the console OTP during dev
      }
    }

    return Response.json({ ok: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("[auth/send-otp]", error);
    return Response.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}
