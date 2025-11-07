import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // make sure env variables are loaded

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // convert to number
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html }) {
  if (!to) return;
  await transporter.sendMail({
    from: process.env.MAIL_FROM || '"HR & Payroll" <no-reply@yourcompany.com>',
    to,
    subject,
    html,
  });
}

export default transporter;
