import { Request, Response } from "express";
import User from "../Models/UserModel";
import { sendEmail } from "../services/email";
import validator from "validator";
import crypto from "crypto";
import path from "path";

// Helper function to generate verification link and HTML
const generateVerificationContent = (email: string, code: string) => {
  const subject = "CoinSafe: Your Email Verification Code";
  const htmlContent = `
     <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Coinsafe</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        background-color: #f3f4f6;
        line-height: 1.6;
      }

      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .header {
        background-color: #000000;
        padding: 48px 32px;
        text-align: center;
      }

      .logo {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .logo img {
        height: 48px;
        width: auto;
      }

      .logo-icon {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .logo-bar {
        width: 24px;
        height: 4px;
        background-color: #14b8a6;
        border-radius: 2px;
        margin-bottom: 2px;
      }

      .logo-bar:last-child {
        margin-bottom: 0;
      }

      .logo-text {
        color: #ffffff;
        font-size: 24px;
        font-weight: 600;
        margin: 0;
      }

      .content {
        padding: 48px 32px;
      }

      .title {
        font-size: 20px;
        font-weight: bold;
        color: #111827;
        margin: 0 0 32px 0;
      }

      .text {
        font-size: 16px;
        color: #6b7280;
        margin: 0 0 24px 0;
      }

      .highlight {
        color: #10b981;
        font-weight: 600;
      }

      .social-icons {
        display: flex;
        gap: 16px;
        margin: 48px 0 64px 0;
      }

      .social-icon {
        padding: 2px 2px;
        background-color: #000000;
        border-radius: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        margin: 0 8px;
        transition: background-color 0.2s;
      }

      .footer {
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
        font-size: 14px;
        color: #9ca3af;
        line-height: 1;
      }

      .footer p {
        margin: 0 0 16px 0;
      }

      .footer a {
        color: #3b82f6;
        text-decoration: underline;
      }

      @media (max-width: 640px) {
        .email-container {
          margin: 0;
          border-radius: 0;
        }

        .content {
          padding: 32px 24px;
        }

        .header {
          padding: 32px 24px;
        }

        .title {
          font-size: 20px;
        }

        .text {
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div style="padding: 24px">
      <div class="email-container">
          <!-- Header -->
          <div class="header">
            <img
              src="cid:logo"
              alt="CoinSafe Logo"
              style="height: 48px; width: auto; max-width: 200px" />
          </div>

        <!-- Main Content -->
        <div class="content">
          <h1 class="title">Verify Your Email Address</h1>

          <p class="text">Hi there,</p>

          <p class="text">
            Thank you for linking your profile with CoinSafe! Please use the
            verification code below to verify your email address.
          </p>

          <div style="text-align: center; margin: 30px 0">
            <div
              style="
                background-color: #f3f4f6;
                padding: 10px;
                border-radius: 8px;
                display: inline-block;
                font-family: monospace;
                font-size: 20px;
                font-weight: bold;
                letter-spacing: 4px;
                color: #1f2937;
              ">
              ${code}
            </div>
          </div>

          <p class="text">
            Enter this code in the verification form on CoinSafe to complete
            your email verification.
          </p>
          <p class="text">
            This code will expire in 10 minutes. If you did not link your
            profile to CoinSafe, please ignore this email.
          </p>
          <p class="text">Best regards,<br />The CoinSafe Team!</p>

            <!-- Social Media Links -->
            <div class="social-icons">
              <a
                href="https://discord.gg/AprSgxhh"
                class="social-icon"
                style="text-decoration: none; color: white">
                <img
                  src="cid:discord"
                  alt="Discord"
                  style="width: 30px; height: 30px" />
              </a>
              <a
                href="https://x.com/Coinsafe_safe"
                class="social-icon"
                style="text-decoration: none; color: white">
                <img
                  src="cid:twitter"
                  alt="Twitter"
                  style="width: 30px; height: 30px" />
              </a>
              <a
                href="https://t.me/coinsafe_safe"
                class="social-icon"
                style="text-decoration: none; color: white">
                <img
                  src="cid:telegram"
                  alt="Telegram"
                  style="width: 30px; height: 30px" />
              </a>
            </div>

          <!-- Footer -->
          <div class="footer">
            <p>
              Please be aware of phishing sites and always make sure you are
              visiting the official
              <a href="https://coinsafe.network">coinsafe.network</a> website
              when entering sensitive data.
            </p>

            <p>You have received this email as a registered user of Coinsafe</p>

            <p>
              For more information about how we process data, please see our
              Privacy policy
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
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

    // Generate verification code (6-digit numeric code)
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    console.log(
      "🆕 NEW CODE SYSTEM: Generated verification code:",
      verificationCode
    );
    console.log("🆕 NEW CODE SYSTEM: Code length:", verificationCode.length);

    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    console.log("4. Code expiry set to:", codeExpiry.toISOString());

    // Update or create user
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        email: email.toLowerCase(),
        emailVerified: false,
        verificationCode: verificationCode,
        verificationCodeExpires: codeExpiry,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("5. User updated/created:");
    console.log("   - Wallet:", updatedUser.walletAddress);
    console.log("   - Email:", updatedUser.email);
    console.log("   - Email Verified:", updatedUser.emailVerified);
    console.log("   - Verification Code:", updatedUser.verificationCode);
    console.log("   - Code Expiry:", updatedUser.verificationCodeExpires);

    // Generate verification email content
    const { subject, htmlContent } = generateVerificationContent(
      email,
      verificationCode
    );
    console.log("6. Verification code generated:", verificationCode);

    // Send email with attachments (with fallback if assets not found)
    const attachments = [];
    const assetFiles = [
      {
        filename: "coinsafe-logo.svg",
        path: path.join(process.cwd(), "src/assets/coinsafe-logo.svg"),
        cid: "logo",
      },
      {
        filename: "discord.svg",
        path: path.join(process.cwd(), "src/assets/discord.svg"),
        cid: "discord",
      },
      {
        filename: "twitter.svg",
        path: path.join(process.cwd(), "src/assets/twitter.svg"),
        cid: "twitter",
      },
      {
        filename: "telegram.svg",
        path: path.join(process.cwd(), "src/assets/telegram.svg"),
        cid: "telegram",
      },
    ];

    // Check if assets exist before adding to attachments
    for (const asset of assetFiles) {
      try {
        const fs = require("fs");
        if (fs.existsSync(asset.path)) {
          attachments.push(asset);
        } else {
          console.log(`⚠️ Asset not found: ${asset.path}`);
        }
      } catch (error) {
        console.log(`⚠️ Error checking asset ${asset.filename}:`, error);
      }
    }

    const emailResult = await sendEmail({
      email: email,
      subject: subject,
      html: htmlContent,
      attachments: attachments,
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

// Controller for POST /api/profile/verify-email-code - NEW CODE VERIFICATION
export const verifyEmailCode = async (req: Request, res: Response) => {
  const { code, email, walletAddress } = req.body;

  console.log("=== EMAIL CODE VERIFICATION DEBUG START ===");
  console.log("1. Request body:", req.body);
  console.log("2. Extracted code:", code);
  console.log("3. Extracted email:", email);
  console.log("4. Extracted walletAddress:", walletAddress);
  console.log("5. Code type:", typeof code);
  console.log("6. Email type:", typeof email);
  console.log("7. Current timestamp:", new Date().toISOString());

  if (!code || !email || !walletAddress) {
    console.log("❌ VALIDATION FAILED: Missing required parameters");
    return res.status(400).json({
      success: false,
      message: "Code, email, and wallet address are required.",
    });
  }

  try {
    const queryEmail = email.toLowerCase().trim();
    const queryWalletAddress = walletAddress.toLowerCase();
    console.log("8. Processed email for query:", queryEmail);
    console.log("9. Processed wallet for query:", queryWalletAddress);

    // First, check if user exists and is already verified
    const existingUser = await User.findOne({
      email: queryEmail,
      walletAddress: queryWalletAddress,
    });
    console.log(
      "10. User found by email and wallet:",
      existingUser ? "YES" : "NO"
    );

    if (!existingUser) {
      console.log("❌ No user found with this email and wallet combination");
      return res.status(400).json({
        success: false,
        message:
          "No user found with this email and wallet address combination.",
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

    console.log("11. User details:");
    console.log("   - Wallet:", existingUser.walletAddress);
    console.log("   - Email:", existingUser.email);
    console.log("   - Email Verified:", existingUser.emailVerified);
    console.log("   - Has Verification Code:", !!existingUser.verificationCode);
    console.log("   - Stored Code:", existingUser.verificationCode);
    console.log("   - Received Code:", code);
    console.log("   - Codes Match:", existingUser.verificationCode === code);
    console.log("   - Code Expiry:", existingUser.verificationCodeExpires);
    console.log(
      "   - Code Expired:",
      existingUser.verificationCodeExpires
        ? existingUser.verificationCodeExpires < new Date()
        : "NO EXPIRY SET"
    );

    // Check if code matches and is not expired
    if (existingUser.verificationCode !== code) {
      console.log("❌ CODE MISMATCH");
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    if (
      existingUser.verificationCodeExpires &&
      existingUser.verificationCodeExpires < new Date()
    ) {
      console.log("❌ CODE EXPIRED");
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
        expired: true,
      });
    }

    console.log("12. User before update:");
    console.log("    - Email Verified:", existingUser.emailVerified);
    console.log("    - Verification Code:", existingUser.verificationCode);

    // Update the user
    existingUser.emailVerified = true;
    existingUser.verificationCode = undefined;
    existingUser.verificationCodeExpires = undefined;

    const savedUser = await existingUser.save();

    console.log("13. User after update:");
    console.log("    - Email Verified:", savedUser.emailVerified);
    console.log("    - Verification Code:", savedUser.verificationCode);
    console.log("    - Save successful:", !!savedUser);

    // Double-check by fetching the user again
    const verifyUpdate = await User.findOne({
      walletAddress: existingUser.walletAddress,
    });
    console.log("14. Double-check from DB:");
    console.log("    - Email Verified in DB:", verifyUpdate?.emailVerified);

    console.log("=== EMAIL CODE VERIFICATION DEBUG END ===");

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

    // Generate new verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user with new code
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = codeExpiry;
    await user.save();

    // Send verification email
    const { subject, htmlContent } = generateVerificationContent(
      user.email,
      verificationCode
    );

    // Send email with attachments (with fallback if assets not found)
    const attachments = [];
    const assetFiles = [
      {
        filename: "coinsafe-logo.svg",
        path: path.join(process.cwd(), "src/assets/coinsafe-logo.svg"),
        cid: "logo",
      },
      {
        filename: "discord.svg",
        path: path.join(process.cwd(), "src/assets/discord.svg"),
        cid: "discord",
      },
      {
        filename: "twitter.svg",
        path: path.join(process.cwd(), "src/assets/twitter.svg"),
        cid: "twitter",
      },
      {
        filename: "telegram.svg",
        path: path.join(process.cwd(), "src/assets/telegram.svg"),
        cid: "telegram",
      },
    ];

    // Check if assets exist before adding to attachments
    for (const asset of assetFiles) {
      try {
        const fs = require("fs");
        if (fs.existsSync(asset.path)) {
          attachments.push(asset);
        } else {
          console.log(`⚠️ Asset not found: ${asset.path}`);
        }
      } catch (error) {
        console.log(`⚠️ Error checking asset ${asset.filename}:`, error);
      }
    }

    const emailResult = await sendEmail({
      email: user.email,
      subject: subject,
      html: htmlContent,
      attachments: attachments,
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
