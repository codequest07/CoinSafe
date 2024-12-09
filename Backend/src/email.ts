import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export const sendEmail = async (options: { email: string; subject: string; html: string }) => {
  if (!process.env.service || !process.env.user || !process.env.mailPassword) {
    console.error("Missing environment variables for email service.");
    throw new Error("Missing environment variables for email service.");
  }

  const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: process.env.user,
      pass: process.env.mailPassword,
    },
  });

  const mailOptions = {
    from: process.env.user, 
    to: options.email,   
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error(" Error sending email:", error);
    throw error;
  }
};
