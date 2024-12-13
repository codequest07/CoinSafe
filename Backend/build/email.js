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
    if (!process.env.service || !process.env.user || !process.env.mailPassword) {
        console.error("Missing environment variables for email service.");
        throw new Error("Missing environment variables for email service.");
    }
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
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
        yield transporter.sendMail(mailOptions);
        console.log("Email sent successfully.");
    }
    catch (error) {
        console.error(" Error sending email:", error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map