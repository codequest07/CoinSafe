import { Request, Response } from "express";
import User from "../Models/UserModel";
import { sendEmail } from "../services/email";
import validator from "validator";
import crypto from "crypto";

// Helper function to generate verification link and HTML
const generateVerificationContent = (email: string, token: string) => {
  const verificationLink = `https://www.coinsafe.network/dashboard/profile?token=${token}&email=${encodeURIComponent(
  // const verificationLink = `http://localhost:5173/dashboard/profile?token=${token}&email=${encodeURIComponent(
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

// Controller for POST /api/profile/update-email
export const updateEmail = async (req: Request, res: Response) => {
  const { walletAddress, email } = req.body;

  console.log("=== UPDATE EMAIL DEBUG START ===");
  console.log("1. Request body:", req.body);

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
    console.log("2. Generated verification token:", verificationToken);
    console.log("3. Token length:", verificationToken.length);

    const tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    console.log("4. Token expiry set to:", tokenExpiry.toISOString());

    // Update or create user
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        email: email.toLowerCase(),
        emailVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpires: tokenExpiry,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("5. User updated/created:");
    console.log("   - Wallet:", updatedUser.walletAddress);
    console.log("   - Email:", updatedUser.email);
    console.log("   - Email Verified:", updatedUser.emailVerified);
    console.log("   - Verification Token:", updatedUser.verificationToken);
    console.log("   - Token Expiry:", updatedUser.verificationTokenExpires);

    // Generate verification email content
    const { subject, htmlContent } = generateVerificationContent(
      email,
      verificationToken
    );
    console.log(
      "6. Verification link generated:",
      `https://www.coinsafe.network/dashboard/profile?token=${verificationToken}&email=${encodeURIComponent(
      // `http://localhost:5173/dashboard/profile?token=${verificationToken}&email=${encodeURIComponent(
        email
      )}`
    );

    // Send email
    const emailResult = await sendEmail({
      email: email,
      subject: subject,
      html: htmlContent,
    });

    console.log("7. Email send result:", emailResult);

    if (!emailResult.success) {
      console.error("❌ Failed to send verification email:", emailResult.error);
      return res.status(500).json({
        message:
          "Email saved, but failed to send verification email. Please try again later.",
      });
    }

    console.log("✅ Email update successful");
    console.log("=== UPDATE EMAIL DEBUG END ===");

    res.status(200).json({
      message:
        "Email updated successfully. Please check your inbox for verification.",
    });
  } catch (error) {
    console.error("❌ Error updating email:", error);
    res.status(500).json({ message: "Server error while updating email." });
  }
};

// Controller for POST /api/profile/update-twitter
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

// Controller for POST /api/profile/update-discord
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

// Controller for GET /api/profile/verify-email - ENHANCED VERSION
export const verifyEmail = async (req: Request, res: Response) => {
  const { token, email } = req.query;

  console.log("=== EMAIL VERIFICATION DEBUG START ===");
  console.log("1. Raw query params:", req.query);
  console.log("2. Extracted token:", token);
  console.log("3. Extracted email:", email);
  console.log("4. Token type:", typeof token);
  console.log("5. Email type:", typeof email);
  console.log("6. Current timestamp:", new Date().toISOString());

  if (
    !token ||
    !email ||
    typeof token !== "string" ||
    typeof email !== "string"
  ) {
    console.log("❌ VALIDATION FAILED: Missing or invalid parameters");
    return res.status(400).json({
      success: false,
      message: "Invalid verification link parameters.",
    });
  }

  try {
    const queryEmail = email.toLowerCase().trim();
    console.log("7. Processed email for query:", queryEmail);

    // First, check if user exists and is already verified
    const existingUser = await User.findOne({ email: queryEmail });
    console.log("8. User found by email:", existingUser ? "YES" : "NO");

    if (!existingUser) {
      console.log("❌ No user found with this email");
      return res.status(400).json({
        success: false,
        message: "No user found with this email address.",
      });
    }

    // Check if already verified
    if (existingUser.emailVerified) {
      console.log("✅ User already verified - returning success");
      return res.status(200).json({
        success: true,
        message: "Email is already verified!",
        alreadyVerified: true,
      });
    }

    console.log("9. User details:");
    console.log("   - Wallet:", existingUser.walletAddress);
    console.log("   - Email:", existingUser.email);
    console.log("   - Email Verified:", existingUser.emailVerified);
    console.log(
      "   - Has Verification Token:",
      !!existingUser.verificationToken
    );
    console.log("   - Stored Token:", existingUser.verificationToken);
    console.log("   - Received Token:", token);
    console.log("   - Tokens Match:", existingUser.verificationToken === token);
    console.log("   - Token Expiry:", existingUser.verificationTokenExpires);
    console.log(
      "   - Token Expired:",
      existingUser.verificationTokenExpires
        ? existingUser.verificationTokenExpires < new Date()
        : "NO EXPIRY SET"
    );

    // Now try to find user with valid token for verification
    const user = await User.findOne({
      email: queryEmail,
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    console.log(
      "10. User found with token and valid expiry:",
      user ? "YES" : "NO"
    );

    if (!user) {
      console.log("❌ VERIFICATION FAILED");

      // Check if token expired
      const userWithExpiredToken = await User.findOne({
        email: queryEmail,
        verificationToken: token,
      });

      console.log("11. Debug scenarios:");
      console.log(
        "    - User exists with this token (any email):",
        !!userWithExpiredToken
      );

      if (userWithExpiredToken) {
        console.log("    - Token found but expired");
        return res.status(400).json({
          success: false,
          message:
            "Verification token has expired. Please request a new verification email.",
          expired: true,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid verification token.",
      });
    }

    console.log("✅ VERIFICATION SUCCESSFUL");
    console.log("12. User before update:");
    console.log("    - Email Verified:", user.emailVerified);
    console.log("    - Verification Token:", user.verificationToken);

    // Update the user
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    const savedUser = await user.save();

    console.log("13. User after update:");
    console.log("    - Email Verified:", savedUser.emailVerified);
    console.log("    - Verification Token:", savedUser.verificationToken);
    console.log("    - Save successful:", !!savedUser);

    // Double-check by fetching the user again
    const verifyUpdate = await User.findOne({
      walletAddress: user.walletAddress,
    });
    console.log("14. Double-check from DB:");
    console.log("    - Email Verified in DB:", verifyUpdate?.emailVerified);

    console.log("=== EMAIL VERIFICATION DEBUG END ===");

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      alreadyVerified: false,
    });
  } catch (error) {
    console.error("❌ ERROR in email verification:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification. Please try again.",
    });
  }
};

// Controller for POST /api/profile/update-preferences
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

// Controller for GET /api/profile/:walletAddress - ENHANCED VERSION
export const getProfile = async (req: Request, res: Response) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase();
    console.log("--- Get Profile Request ---");
    console.log("Requested wallet address:", walletAddress);

    if (!validator.isEthereumAddress(walletAddress)) {
      return res
        .status(400)
        .json({ message: "Invalid wallet address format." });
    }

    const user = await User.findOne({ walletAddress });
    console.log("Raw user from database:", user);

    if (!user) {
      console.log("No user found for wallet address:", walletAddress);
      return res.status(200).json({
        message: "Profile not found for this wallet. Please link your profile.",
        profile: null,
      });
    }

    // Log the specific emailVerified field
    console.log("User emailVerified field:", user.emailVerified);
    console.log("Type of emailVerified:", typeof user.emailVerified);
    console.log("Boolean conversion:", Boolean(user.emailVerified));

    // Explicitly construct the profile object
    const profileData = {
      email: user.email,
      emailVerified: Boolean(user.emailVerified), // Ensure it's a proper boolean
      twitterHandle: user.twitterHandle,
      discordHandle: user.discordHandle,
      notificationPreferences: user.notificationPreferences,
    };

    console.log("Profile data being sent:", profileData);
    console.log("Profile emailVerified being sent:", profileData.emailVerified);

    res.status(200).json({
      message: "Profile fetched successfully.",
      profile: profileData,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

// TEST ENDPOINT - Add this temporarily to check user status
export const testUserStatus = async (req: Request, res: Response) => {
  const { walletAddress } = req.params;

  try {
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    res.json({
      found: !!user,
      user: user
        ? {
            walletAddress: user.walletAddress,
            email: user.email,
            emailVerified: user.emailVerified,
            hasVerificationToken: !!user.verificationToken,
            verificationToken: user.verificationToken,
            tokenExpiry: user.verificationTokenExpires,
            tokenExpired: user.verificationTokenExpires
              ? user.verificationTokenExpires < new Date()
              : null,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// RESEND VERIFICATION EMAIL - Bonus feature
export const resendVerificationEmail = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required." });
  }

  if (!validator.isEthereumAddress(walletAddress)) {
    return res
      .status(400)
      .json({ message: "Invalid Ethereum wallet address format." });
  }

  try {
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please link your email first." });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    if (!user.email) {
      return res.status(400).json({
        message: "No email address found. Please add an email first.",
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = tokenExpiry;
    await user.save();

    // Send verification email
    const { subject, htmlContent } = generateVerificationContent(
      user.email,
      verificationToken
    );

    const emailResult = await sendEmail({
      email: user.email,
      subject: subject,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Failed to resend verification email:", emailResult.error);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.status(200).json({
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Server error while resending email." });
  }
};
