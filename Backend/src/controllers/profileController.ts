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
        font-size: 32px;
        font-weight: bold;
        color: #111827;
        margin: 0 0 32px 0;
      }

      .text {
        font-size: 18px;
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
        width: 40px;
        height: 40px;
        background-color: #000000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }

      .footer {
        border-top: 1px solid #e5e7eb;
        padding-top: 32px;
        font-size: 14px;
        color: #9ca3af;
        line-height: 1.5;
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
            src="https://res.cloudinary.com/dfp2rztmd/image/upload/v1752393890/logo_fppdfj.svg"
            alt="" />
        </div>

        <!-- Main Content -->
        <div class="content">
          <h1 class="title">Verify Your Email Address</h1>

          <p class="text">Hi there,</p>

          <p class="text">
            Thank you for linking your profile with CoinSafe! Please click the
            link below to verify your email address
          </p>

          <p class="text">
            <a href="${verificationLink}">Verify My Email</a>
          </p>
          <p class="text">
            If you did not link your profile to CoinSafe, please ignore this
            email.
          </p>
          <p class="text">Best regards,<br />The CoinSafe Team!</p>

          <!-- Social Media Icons -->
          <div class="social-icons">
            <a href="https://discord.gg/AprSgxhh" class="social-icon">
              <!-- Discord Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a href="https://x.com/Coinsafe_safe" class="social-icon">
              <!-- X (Twitter) Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://t.me/coinsafe_safe" class="social-icon">
              <!-- Telegram Icon -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path
                  d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
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
