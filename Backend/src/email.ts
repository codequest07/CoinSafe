import dotenv from "dotenv"
require("dotenv").config();
import nodemailer from "nodemailer";

export const sendEmail = async (
  options: { email: string; subject: string; html: string }
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.service, 
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);

    return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; 
  }
};

