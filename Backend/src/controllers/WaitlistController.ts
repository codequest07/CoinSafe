import { Request, Response } from 'express';
import Waitlist from '../Models/WaitlistModel';
import { waitlistValidationSchema } from '../Validation';
import { sendEmail } from '../email';

export const addToWaitlist = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { name, country, email } = req.body;

  if (!name || !country || !email) {
    return res.status(400).json({ message: 'Request body is missing required fields: name, country, or email' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const { error } = waitlistValidationSchema.validate({ name, country, email });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingUser = await Waitlist.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered in the waitlist' });
    }

    const newEntry = new Waitlist({ name, country, email });
    await newEntry.save();

    const emailOptions = {
        email: email,
        subject: 'Welcome to CoinSafe Waitlist',
        html: `<p>Hi ${name},</p><p>Thank you for joining the CoinSafe waitlist! We're excited to have you on board. Stay tuned for updates!</p>`
      };
  
      await sendEmail(emailOptions);

    res.status(201).json({ message: 'Successfully added to the waitlist' });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({ message: 'Server error. Please try again later' });
  }
};


export const getAllWaitlistEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const waitlist = await Waitlist.find();
    res.status(200).json(waitlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOne = async (req: Request, res: Response): Promise<Response | undefined> => {
    const { email } = req.params; 
  
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
  
    try {
      const user = await Waitlist.findOne({ email }); 
  
      if (!user) {
        return res.status(404).json({ message: 'No waitlist entry found for this email' });
      }
  
      res.status(200).json(user); 
    } catch (error) {
      console.error('Error fetching user from waitlist:', error);
      res.status(500).json({ message: 'Server error. Please try again later' });
    }
  };