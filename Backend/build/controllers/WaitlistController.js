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
exports.getOne = exports.getAllWaitlistEntries = exports.addToWaitlist = void 0;
const WaitlistModel_1 = __importDefault(require("../Models/WaitlistModel"));
const Validation_1 = require("../Validation");
const email_1 = require("../email");
const addToWaitlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, country, email } = req.body;
    if (!name || !country || !email) {
        return res.status(400).json({
            message: "Request body is missing required fields: name, country, or email",
        });
    }
    const { error } = Validation_1.waitlistValidationSchema.validate({ name, country, email });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const existingUser = yield WaitlistModel_1.default.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Email is already registered in the waitlist" });
        }
        const newEntry = new WaitlistModel_1.default({ name, country, email });
        yield newEntry.save();
        yield (0, email_1.sendEmail)({
            email,
            subject: "Welcome to CoinSafe Waitlist",
            html: `
          <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to the CoinSafe Waitlist!</title>
    <style>
    </style>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    ">
    <div style="margin-bottom: 20px">
      <div style="font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; color: #79E7BA; letter-spacing: 2px;">COINSAFE</div>
    </div>

    <h1 style="font-size: 28px; margin-bottom: 20px">Hi ${name},</h1>

    <p style="font-size: 16px; margin-bottom: 20px">
      Thank you for signing up for the CoinSafe waitlist! 🎉 We're thrilled to
      have you join our community of savers who are redefining financial
      freedom.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px">
      With CoinSafe, you'll soon enjoy:
    </p>

    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px">
      <li>Effortless saving.</li>
      <li>Complete transparency and control with blockchain technology.</li>
      <li>AI-driven insights to grow your wealth intelligently.</li>
    </ul>

    <p style="font-size: 16px; margin-bottom: 20px">
      Stay tuned for updates, sneak peeks, and the official launch date. In the
      meantime, feel free to connect with us or spread the word to friends and
      family!
    </p>

    <p style="font-size: 16px; margin-bottom: 20px">
      If you have any questions, we're here to help.
    </p>

    <p style="font-size: 16px; margin-bottom: 20px">
      Let's build your financial future together!
    </p>

    <p style="font-size: 16px; margin-bottom: 20px">
      Best regards,<br />
      The CoinSafe Team
    </p>

    <p style="font-size: 16px; margin-bottom: 20px">
      <a
        href="https://www.coinsafe.network/"
        style="color: #79e7ba; text-decoration: none"
        >Visit our website</a
      >
      |
      <a
        href="https://x.com/Coinsafe_safe"
        style="color: #79e7ba; text-decoration: none"
        >Follow us on X</a
      >
    </p>

    <div class="footer" style="margin-top: 10px; padding-top: 10px">
      <div style="margin-bottom: 20px">
        <div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #79E7BA; letter-spacing: 1px;">COINSAFE</div>
      </div>

      <p style="font-size: 14px">
        You're receiving this email because you signed up for the CoinSafe
        waitlist. If this doesn't seem right, please feel free to disregard this
        message.
      </p>

      <p style="font-size: 14px">
        Don't want any more emails from CoinSafe?
        <a href="#" style="color: #79e7ba; text-decoration: underline"
          >Unsubscribe</a
        >.
      </p>
    </div>
  </body>
</html>
        `,
        });
        res.status(201).json({
            message: "Successfully added to the waitlist",
            user: { email: newEntry.email, name: newEntry.name },
        });
    }
    catch (error) {
        console.error("Error adding to waitlist:", error);
        res.status(500).json({ message: "Server error. Please try again later" });
    }
});
exports.addToWaitlist = addToWaitlist;
const getAllWaitlistEntries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const waitlist = yield WaitlistModel_1.default.find();
        res.status(200).json(waitlist);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getAllWaitlistEntries = getAllWaitlistEntries;
const getOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: "Email parameter is required" });
    }
    try {
        const user = yield WaitlistModel_1.default.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "No waitlist entry found for this email" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error fetching user from waitlist:", error);
        res.status(500).json({ message: "Server error. Please try again later" });
    }
});
exports.getOne = getOne;
//# sourceMappingURL=WaitlistController.js.map