import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export const sendEmail = async (options: {
  email: string;
  subject: string;
  html: string;
}) => {
  console.log("📧 [sendEmail] Starting email send process...");
  console.log(`📧 [sendEmail] Recipient: ${options.email}`);
  console.log(`📧 [sendEmail] Subject: ${options.subject}`);

  // Check environment variables
  console.log("🔧 [sendEmail] Checking environment variables...");
  console.log(`   service: ${process.env.service ? "✅ Set" : "❌ Missing"}`);
  console.log(`   user: ${process.env.user ? "✅ Set" : "❌ Missing"}`);
  console.log(
    `   mailPassword: ${process.env.mailPassword ? "✅ Set" : "❌ Missing"}`
  );

  if (!process.env.service || !process.env.user || !process.env.mailPassword) {
    console.error(
      "❌ [sendEmail] Missing environment variables for email service."
    );
    console.error("   Required: service, user, mailPassword");
    console.error("   Please check your .env file");
    throw new Error("Missing environment variables for email service.");
  }

  console.log("🔧 [sendEmail] Creating email transporter...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.mailPassword,
    },
  });

  console.log("✅ [sendEmail] Email transporter created successfully");

  const mailOptions = {
    from: process.env.user,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  console.log("📧 [sendEmail] Mail options prepared:");
  console.log(`   From: ${mailOptions.from}`);
  console.log(`   To: ${mailOptions.to}`);
  console.log(`   Subject: ${mailOptions.subject}`);
  console.log(`   HTML length: ${mailOptions.html.length} characters`);

  try {
    console.log("📧 [sendEmail] Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [sendEmail] Email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [sendEmail] Error sending email:");
    console.error(`   Error message: ${(error as Error).message}`);
    console.error(`   Error stack: ${(error as Error).stack}`);

    // Log specific error details
    if ((error as any).code) {
      console.error(`   Error code: ${(error as any).code}`);
    }
    if ((error as any).command) {
      console.error(`   Command: ${(error as any).command}`);
    }

    return { success: false, error: (error as Error).message };
  }
};
