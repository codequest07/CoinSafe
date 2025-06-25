import { Request, Response } from "express";
import User, { IUser } from "../Models/UserModel";
import mongoose from "mongoose";

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private (requires authentication)
export const getProfile = async (req: Request, res: Response) => {
  // Assuming req.userId is set by the authentication middleware
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Ensure userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user: IUser | null = await User.findById(req.userId).select("-__v"); // Exclude __v field
    // Also, you would typically exclude access/refresh tokens from this public GET endpoint

    if (user) {
      res.json({
        walletAddress: user.walletAddress,
        emailAddress: user.emailAddress,
        isEmailVerified: user.isEmailVerified,
        twitter: user.twitter
          ? { id: user.twitter.id, username: user.twitter.username }
          : undefined,
        discord: user.discord
          ? { id: user.discord.id, username: user.discord.username }
          : undefined,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Connect email address
// @route   POST /api/profile/email/connect
// @access  Private
export const connectEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  try {
    const user: IUser | null = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email already exists for another user
    const existingUserWithEmail = await User.findOne({
      emailAddress: email,
      _id: { $ne: user._id },
    });
    if (existingUserWithEmail) {
      return res.status(400).json({
        message: "This email address is already connected to another account.",
      });
    }

    user.emailAddress = email.toLowerCase();
    user.isEmailVerified = false; // Reset verification status
    await user.save();

    // In a real app, you would generate a token and send a verification email here.
    // For now, we just update the field.
    console.log(
      `Verification email sent to ${email} with token: [DUMMY_TOKEN_HERE]`
    );

    res.json({
      message:
        "Email address updated. Please check your email for verification (dummy).",
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Connect Twitter account
// @route   POST /api/profile/social/twitter/connect
// @access  Private
export const connectTwitter = async (req: Request, res: Response) => {
  // In a real OAuth flow, this endpoint would initiate the redirect to Twitter
  // and the callback would handle the token exchange.
  // For demonstration, we'll simulate linking by accepting dummy data.
  const { twitterId, twitterUsername } = req.body; // In a real app, these come from Twitter's API after OAuth

  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!twitterId || !twitterUsername) {
    return res
      .status(400)
      .json({ message: "Twitter ID and Username are required." });
  }

  try {
    const user: IUser | null = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if twitterId is already connected to another user
    const existingUserWithTwitter = await User.findOne({
      "twitter.id": twitterId,
      _id: { $ne: user._id },
    });
    if (existingUserWithTwitter) {
      return res.status(400).json({
        message: "This Twitter account is already connected to another user.",
      });
    }

    user.twitter = {
      id: twitterId,
      username: twitterUsername,
      accessToken: "DUMMY_TWITTER_ACCESS_TOKEN", // **Encrypt this in production!**
      refreshToken: "DUMMY_TWITTER_REFRESH_TOKEN", // **Encrypt this in production!**
    };
    await user.save();

    res.json({
      message: "Twitter account connected successfully",
      twitter: { id: twitterId, username: twitterUsername },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Connect Discord account
// @route   POST /api/profile/social/discord/connect
// @access  Private
export const connectDiscord = async (req: Request, res: Response) => {
  // Similar to Twitter, this would be part of a Discord OAuth flow.
  const { discordId, discordUsername } = req.body;

  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!discordId || !discordUsername) {
    return res
      .status(400)
      .json({ message: "Discord ID and Username are required." });
  }

  try {
    const user: IUser | null = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if discordId is already connected to another user
    const existingUserWithDiscord = await User.findOne({
      "discord.id": discordId,
      _id: { $ne: user._id },
    });
    if (existingUserWithDiscord) {
      return res.status(400).json({
        message: "This Discord account is already connected to another user.",
      });
    }

    user.discord = {
      id: discordId,
      username: discordUsername,
      accessToken: "DUMMY_DISCORD_ACCESS_TOKEN", // **Encrypt this in production!**
      refreshToken: "DUMMY_DISCORD_REFRESH_TOKEN", // **Encrypt this in production!**
    };
    await user.save();

    res.json({
      message: "Discord account connected successfully",
      discord: { id: discordId, username: discordUsername },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Save general profile changes (e.g., if other editable fields were present)
// @route   PUT /api/profile
// @access  Private
export const saveProfileChanges = async (req: Request, res: Response) => {
  // This endpoint can be extended to handle updates to other general profile fields
  // For the current image, only email and social connections are directly shown.
  // We'll update the email if it's passed here, but the specific connectEmail route is more explicit.

  const { emailAddress } = req.body; // Example of another field that might be updatable

  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const user: IUser | null = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Example: If emailAddress is sent via this PUT, update it
    if (emailAddress !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
        return res
          .status(400)
          .json({ message: "Please provide a valid email address" });
      }
      // Check if email already exists for another user
      const existingUserWithEmail = await User.findOne({
        emailAddress: emailAddress,
        _id: { $ne: user._id },
      });
      if (existingUserWithEmail) {
        return res.status(400).json({
          message:
            "This email address is already connected to another account.",
        });
      }
      user.emailAddress = emailAddress.toLowerCase();
      user.isEmailVerified = false; // Reset verification
    }

    // Add other fields you want to update here, e.g.,
    // if (req.body.someOtherField !== undefined) {
    //   user.someOtherField = req.body.someOtherField;
    // }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        walletAddress: user.walletAddress,
        emailAddress: user.emailAddress,
        isEmailVerified: user.isEmailVerified,
        twitter: user.twitter
          ? { id: user.twitter.id, username: user.twitter.username }
          : undefined,
        discord: user.discord
          ? { id: user.discord.id, username: user.discord.username }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
