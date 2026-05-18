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
        verified: false,
        onboardingCompleted: false,
        approvalStatus: "Pending Approval",
        otp,
        otpExpiry: otpExpire,
      });
      console.log("[AUTH] Created placeholder user for OTP", {
        email,
        userId: String(user._id),
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
      user.otpExpiry = otpExpire;
      await user.save();
      console.log("[AUTH] Re-issued OTP for existing user", {
        email,
        userId: String(user._id),
      });
    }

    // Log the OTP to console for easy testing locally (since SMTP might fail)
    console.log(`[AUTH] Generated OTP for ${email}: ${otp}`);

    // Attempt to send email
    if (
      process.env.EMAIL_SERVER &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    ) {
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

        const senderEmail = process.env.EMAIL_USER;

        const htmlTemplate = `
 <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
 <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center;">
 <h1 style="color: #4f46e5; margin-bottom: 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">AtomicGoals</h1>
 <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 24px;">Your Verification Code</h2>
 
 <p style="color: #475569; font-size: 16px; margin-bottom: 24px; line-height: 1.5;">
 You requested to sign in to your AtomicGoals account. Please use the verification code below to complete your sign-in request.
 </p>
 
 <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
 <span style="font-family: monospace; font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: 0.25em;">${otp}</span>
 </div>
 
 <p style="color: #64748b; font-size: 14px; margin-bottom: 32px;">
 This code will expire in <strong>10 minutes</strong>.
 </p>
 
 <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
 
 <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
 If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
 </p>
 </div>
 </div>
 `;

        const textTemplate = `Your AtomicGoals verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`;

        await transporter.sendMail({
          from: `"AtomicGoals" <${senderEmail}>`,
          to: email,
          subject: "Your AtomicGoals verification code",
          text: textTemplate,
          html: htmlTemplate,
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
