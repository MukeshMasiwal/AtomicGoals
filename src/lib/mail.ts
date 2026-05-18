import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail(options: SendMailOptions) {
  if (!process.env.EMAIL_SERVER) {
    console.warn("Emails are disabled because EMAIL_SERVER is not set.");
    console.warn(`Simulating email to ${options.to}`);
    console.log(options.html);
    return;
  }

  await transporter.sendMail({
    from: `"GoalTrack" <${process.env.EMAIL_USER || "noreply@goaltrack.com"}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export function getResetPasswordHtml(resetUrl: string) {
  return `
 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
 <h2 style="color: #4F46E5;">Password Reset Request</h2>
 <p>You recently requested to reset your password for your GoalTrack account.</p>
 <p>Click the button below to proceed. This link is valid for 15 minutes.</p>
 <div style="margin: 30px 0;">
 <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
 </div>
 <p>If you didn't make this request, you can safely ignore this email.</p>
 <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
 <p style="font-size: 12px; color: #666;">
 If you're having trouble clicking the button, copy and paste this URL into your browser: <br>
 <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
 </p>
 </div>
 `;
}
