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
        return res.status(400).json({ message: 'Request body is missing required fields: name, country, or email' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    const { error } = Validation_1.waitlistValidationSchema.validate({ name, country, email });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const existingUser = yield WaitlistModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered in the waitlist' });
        }
        const newEntry = new WaitlistModel_1.default({ name, country, email });
        yield newEntry.save();
        yield (0, email_1.sendEmail)({
            email: email,
            subject: 'Welcome to CoinSafe Waitlist',
            html: `<p>Hi ${name},</p><p>Thank you for joining the CoinSafe waitlist! We're excited to have you on board. Stay tuned for updates!</p>`
        });
        res.json({
            message: "Welcome",
            user: { email: newEntry.email, name: newEntry.name },
        });
        res.status(201).json({ message: 'Successfully added to the waitlist' });
    }
    catch (error) {
        console.error('Error adding to waitlist:', error);
        res.status(500).json({ message: 'Server error. Please try again later' });
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
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllWaitlistEntries = getAllWaitlistEntries;
const getOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: 'Email parameter is required' });
    }
    try {
        const user = yield WaitlistModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No waitlist entry found for this email' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user from waitlist:', error);
        res.status(500).json({ message: 'Server error. Please try again later' });
    }
});
exports.getOne = getOne;
//# sourceMappingURL=WaitlistController.js.map