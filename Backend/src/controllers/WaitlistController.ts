import { Request, Response } from "express";
import Waitlist from "../Models/WaitlistModel";
import { waitlistValidationSchema } from "../Validation";
import { sendEmail } from "../email";

export const addToWaitlist = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  const { name, country, email } = req.body;

  if (!name || !country || !email) {
    return res.status(400).json({
      message:
        "Request body is missing required fields: name, country, or email",
    });
  }

  const { error } = waitlistValidationSchema.validate({ name, country, email });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingUser = await Waitlist.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email is already registered in the waitlist" });
    }

    const newEntry = new Waitlist({ name, country, email });
    await newEntry.save();

    await sendEmail({
      email,
      subject: "Welcome to CoinSafe Waitlist",
      html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Thank you for joining the <strong>CoinSafe</strong> waitlist! We're excited to have you on board. Stay tuned for updates!
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              We'll be sending you more details soon. In the meantime, feel free to explore our platform.
            </p>
            <p style="font-size: 16px; color: #555;">
              Best regards,<br>
              <strong>CoinSafe Team</strong>
            </p>
            <footer style="margin-top: 30px; font-size: 12px; color: #888;">
              <p>If you have any questions, feel free to reply to this email.</p>
              <p>CoinSafe &copy; 2024</p>
            </footer>
          </div>
        `,
    });

    res.status(201).json({
      message: "Successfully added to the waitlist",
      user: { email: newEntry.email, name: newEntry.name },
    });
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    res.status(500).json({ message: "Server error. Please try again later" });
  }
};

export const getAllWaitlistEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const waitlist = await Waitlist.find();
    res.status(200).json(waitlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOne = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email parameter is required" });
  }

  try {
    const user = await Waitlist.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No waitlist entry found for this email" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user from waitlist:", error);
    res.status(500).json({ message: "Server error. Please try again later" });
  }
};
