"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📧 [sendEmail] Starting email send process...");
    console.log(`📧 [sendEmail] Recipient: ${options.email}`);
    console.log(`📧 [sendEmail] Subject: ${options.subject}`);
    // Check environment variables
    console.log("🔧 [sendEmail] Checking environment variables...");
    console.log(`   service: ${process.env.service ? "✅ Set" : "❌ Missing"}`);
    console.log(`   user: ${process.env.user ? "✅ Set" : "❌ Missing"}`);
    console.log(`   mailPassword: ${process.env.mailPassword ? "✅ Set" : "❌ Missing"}`);
    if (!process.env.service || !process.env.user || !process.env.mailPassword) {
        console.error("❌ [sendEmail] Missing environment variables for email service.");
        console.error("   Required: service, user, mailPassword");
        console.error("   Please check your .env file");
        throw new Error("Missing environment variables for email service.");
    }
    console.log("🔧 [sendEmail] Creating email transporter...");
    const transporter = nodemailer_1.default.createTransport({
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
        const info = yield transporter.sendMail(mailOptions);
        console.log("✅ [sendEmail] Email sent successfully!");
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error("❌ [sendEmail] Error sending email:");
        console.error(`   Error message: ${error.message}`);
        console.error(`   Error stack: ${error.stack}`);
        // Log specific error details
        if (error.code) {
            console.error(`   Error code: ${error.code}`);
        }
        if (error.command) {
            console.error(`   Command: ${error.command}`);
        }
        return { success: false, error: error.message };
    }
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map