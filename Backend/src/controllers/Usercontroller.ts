import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { IUser } from '../model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
      return; 
    }
    const { fullname, email, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return; 
    }

    const newUser: IUser = new User({ fullname, email, password: hashedPassword });

    const savedUser = await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error registering user:', error);

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return; 
    }

    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const secretKey = process.env.SECRET;
    if (!secretKey) {
      throw new Error('SECRET key is not provided');
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '5h' });
    
    const userWithoutPassword = { ...user.toJSON(), password: undefined };
    
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user: IUser | null = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return; 
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await User.find();
    if (!allUsers) {
      res.status(404).json('users not found');
      return;
    }

    res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error retrieving all users:', error);
    throw new Error('Failed to retrieve all users');
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string = req.params.id;
    const { fullname, email }: Partial<IUser> = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!fullname || !email) {
      res.status(400).json('please choose what you would like to update');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { fullname, email }, { new: true });

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string = req.params.id;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      res.status(200).json({ message: 'deleted successfully', deletedUser });
    } else {
      res.status(404).json('user not found');
    }
  } catch (error) {
    console.error('Error deleting user:', error);

    res.status(500).json({ error: 'Internal Server Error' });
  }
};
