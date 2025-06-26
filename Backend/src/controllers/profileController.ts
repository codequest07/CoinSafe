import { Request, Response } from "express";
import User from "../Models/UserModel";
import { sendEmail } from "../services/email"; // Your existing sendEmail function
import validator from "validator";
import crypto from "crypto";

// Helper function to generate verification link and HTML
const generateVerificationContent = (email: string, token: string) => {
  // Current date and time is Thursday, June 26, 2025 at 2:13:47 PM WAT.
  // Ensure this link matches your frontend's verification route
  const verificationLink = `http://localhost:3000/verify-email?token=${token}&email=${encodeURIComponent(
    email
  )}`;
  const subject = "CoinSafe: Please Verify Your Email Address";
  const htmlContent = `
        <p>Hi there,</p>
        <p>Thank you for linking your profile with CoinSafe! Please click the link below to verify your email address:</p>
        <p><a href="${verificationLink}">Verify My Email</a></p>
        <p>If you did not link your profile to CoinSafe, please ignore this email.</p>
        <p>Best regards,<br/>The CoinSafe Team</p>
    `;
  return { subject, htmlContent };
};

// NEW: Controller for POST /api/notifications/update-email
export const updateEmail = async (req: Request, res: Response) => {
  const { walletAddress, email } = req.body;

  if (!walletAddress || !email) {
    return res
      .status(400)
      .json({ message: "Wallet address and email are required." });
  }
  if (!validator.isEthereumAddress(walletAddress)) {
    return res
      .status(400)
      .json({ message: "Invalid Ethereum wallet address format." });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    // Check if the provided email is already linked to a different wallet
    const existingEmailLink = await User.findOne({
      email: email.toLowerCase(),
      walletAddress: { $ne: walletAddress.toLowerCase() },
    });
    if (existingEmailLink) {
      return res.status(409).json({
        message: "This email is already linked to another wallet address.",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        email: email.toLowerCase(),
        emailVerified: false, // Set to false to re-trigger verification if email changed
        verificationToken: verificationToken,
        verificationTokenExpires: new Date(Date.now() + 3600 * 1000), // Token valid for 1 hour
      },
      { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not exists, return new doc
    );

    // Prepare and send email verification
    const { subject, htmlContent } = generateVerificationContent(
      email,
      verificationToken
    );
    const emailResult = await sendEmail({
      email: email,
      subject: subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return res.status(500).json({
        message:
          "Email saved, but failed to send verification email. Please try again later.",
      });
    }

    res.status(200).json({
      message:
        "Email updated successfully. Please check your inbox for verification.",
    });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Server error while updating email." });
  }
};

// NEW: Controller for POST /api/notifications/update-twitter
export const updateTwitter = async (req: Request, res: Response) => {
  const { walletAddress, twitterHandle } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required." });
  }
  if (!validator.isEthereumAddress(walletAddress)) {
    return res
      .status(400)
      .json({ message: "Invalid Ethereum wallet address format." });
  }
  // Optional: Add more specific validation for twitterHandle format if needed (e.g., regex)

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { twitterHandle: twitterHandle || undefined }, // Set to undefined if empty string is passed to clear it
      { new: true } // Return the updated document
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please link your email first." });
    }

    res.status(200).json({
      message: "Twitter handle updated successfully.",
      twitterHandle: user.twitterHandle,
    });
  } catch (error) {
    console.error("Error updating Twitter handle:", error);
    res
      .status(500)
      .json({ message: "Server error while updating Twitter handle." });
  }
};

// NEW: Controller for POST /api/notifications/update-discord
export const updateDiscord = async (req: Request, res: Response) => {
  const { walletAddress, discordHandle } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required." });
  }
  if (!validator.isEthereumAddress(walletAddress)) {
    return res
      .status(400)
      .json({ message: "Invalid Ethereum wallet address format." });
  }
  // Optional: Add more specific validation for discordHandle format if needed

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { discordHandle: discordHandle || undefined }, // Set to undefined if empty string is passed to clear it
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please link your email first." });
    }

    res.status(200).json({
      message: "Discord handle updated successfully.",
      discordHandle: user.discordHandle,
    });
  } catch (error) {
    console.error("Error updating Discord handle:", error);
    res
      .status(500)
      .json({ message: "Server error while updating Discord handle." });
  }
};

// EXISTING: Controller for GET /api/notifications/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  const { token, email } = req.query;

  if (
    !token ||
    !email ||
    typeof token !== "string" ||
    typeof email !== "string"
  ) {
    return res.status(400).send("Invalid verification link.");
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return res
        .status(400)
        .send(
          "Verification failed: Invalid or expired token, or email already verified."
        );
    }

    user.emailVerified = true;
    user.verificationToken = undefined; // Clear the token after use
    user.verificationTokenExpires = undefined;
    await user.save();

    res
      .status(200)
      .send(
        "<h1>Email Verified!</h1><p>Your CoinSafe email address has been successfully verified. You can now close this tab.</p>"
      );
  } catch (error) {
    console.error("Error verifying email:", error);
    res
      .status(500)
      .send(
        "<h1>Server Error</h1><p>An error occurred during email verification. Please try again.</p>"
      );
  }
};

// EXISTING: Controller for POST /api/notifications/update-preferences
export const updatePreferences = async (req: Request, res: Response) => {
  const { walletAddress, preferences } = req.body;

  if (!walletAddress || !preferences || typeof preferences !== "object") {
    return res
      .status(400)
      .json({ message: "Wallet address and preferences are required." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $set: { notificationPreferences: preferences } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please link your email first." });
    }

    res.status(200).json({
      message: "Notification preferences updated successfully.",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Server error updating preferences." });
  }
};

// EXISTING: Controller for GET /api/notifications/profile/:walletAddress
export const getProfile = async (req: Request, res: Response) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase();
    if (!validator.isEthereumAddress(walletAddress)) {
      return res
        .status(400)
        .json({ message: "Invalid wallet address format." });
    }

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(200).json({
        message: "Profile not found for this wallet. Please link your profile.",
        profile: null,
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully.",
      profile: {
        email: user.email,
        emailVerified: user.emailVerified,
        twitterHandle: user.twitterHandle,
        discordHandle: user.discordHandle,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};
