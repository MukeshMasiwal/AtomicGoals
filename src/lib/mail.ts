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
