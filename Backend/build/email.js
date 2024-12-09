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
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv").config();
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // Configure the transporter
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587, // Gmail's SMTP port with STARTTLS
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.user, // Gmail email address
            pass: process.env.mailPassword, // App password from Gmail
        },
        tls: {
            rejectUnauthorized: false, // Ignore certificate issues
        },
    });
    // Verify SMTP Connection
    transporter.verify((error, success) => {
        if (error) {
            console.error("❌ SMTP Connection Error:", error);
        }
        else {
            console.log("✅ SMTP Server is Ready:", success);
        }
    });
    const mailOptions = {
        from: process.env.user, // Sender email
        to: options.email, // Receiver email
        subject: options.subject, // Email subject
        html: options.html, // Email content
    };
    try {
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${options.email}`);
        console.log("Message ID:", info.messageId);
        return {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        };
    }
    catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map