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
exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.getOne = exports.loginUser = exports.registerUser = void 0;
const express_validator_1 = require("express-validator");
const model_1 = __importDefault(require("../model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { fullname, email, password } = req.body;
        const hashedPassword = bcrypt_1.default.hashSync(password, 10);
        const existingUser = yield model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }
        const newUser = new model_1.default({ fullname, email, password: hashedPassword });
        const savedUser = yield newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: savedUser });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const user = yield model_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const secretKey = process.env.SECRET;
        if (!secretKey) {
            throw new Error('SECRET key is not provided');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey, { expiresIn: '5h' });
        const userWithoutPassword = Object.assign(Object.assign({}, user.toJSON()), { password: undefined });
        res.status(200).json({ message: 'Login successful', user: userWithoutPassword, token });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.loginUser = loginUser;
const getOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getOne = getOne;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield model_1.default.find();
        if (!allUsers) {
            res.status(404).json('users not found');
            return;
        }
        res.status(200).json(allUsers);
    }
    catch (error) {
        console.error('Error retrieving all users:', error);
        throw new Error('Failed to retrieve all users');
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const { fullname, email } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        if (!fullname || !email) {
            res.status(400).json('please choose what you would like to update');
        }
        const updatedUser = yield model_1.default.findByIdAndUpdate(userId, { fullname, email }, { new: true });
        if (updatedUser) {
            res.json(updatedUser);
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const deletedUser = yield model_1.default.findByIdAndDelete(userId);
        if (deletedUser) {
            res.status(200).json({ message: 'deleted successfully', deletedUser });
        }
        else {
            res.status(404).json('user not found');
        }
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=Usercontroller.js.map