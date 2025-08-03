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
exports.batchAutomatedSavingsProcessor = batchAutomatedSavingsProcessor;
const savingsService_1 = require("./savingsService");
const email_1 = require("./email");
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const ethers_1 = require("ethers");
const BATCH_SIZE = 30;
// Token addresses and their symbols for formatting (updated to match frontend contract addresses)
const TOKEN_SYMBOLS = {
    "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a": "SAFU",
    "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda": "USDT",
    "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D": "LSK",
    "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83": "USDC",
};
// Token decimals mapping (updated to match frontend contract addresses)
const TOKEN_DECIMALS = {
    "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a": 18, // SAFU
    "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda": 6, // USDT
    "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D": 18, // LSK
    "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83": 6, // USDC
};
// Function to format token amount with proper decimals
function formatTokenAmount(amount, tokenAddress) {
    try {
        const normalizedAddress = tokenAddress.toLowerCase();
        const decimals = TOKEN_DECIMALS[normalizedAddress] || 18;
        const formattedAmount = ethers_1.ethers.formatUnits(amount, decimals);
        const symbol = TOKEN_SYMBOLS[normalizedAddress] || "TOKEN";
        return `${formattedAmount} ${symbol}`;
    }
    catch (error) {
        console.error(`Error formatting amount for token ${tokenAddress}:`, error);
        return `${amount.toString()} TOKEN`;
    }
}
// Function to convert frequency to human-readable format
function formatFrequency(frequency) {
    const frequencyInSeconds = Number(frequency);
    if (frequencyInSeconds < 60) {
        return "every few seconds";
    }
    else if (frequencyInSeconds < 3600) {
        const minutes = Math.floor(frequencyInSeconds / 60);
        return `every ${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    else if (frequencyInSeconds < 86400) {
        const hours = Math.floor(frequencyInSeconds / 3600);
        return `every ${hours} hour${hours > 1 ? "s" : ""}`;
    }
    else if (frequencyInSeconds < 2592000) {
        const days = Math.floor(frequencyInSeconds / 86400);
        return `every ${days} day${days > 1 ? "s" : ""}`;
    }
    else if (frequencyInSeconds < 31536000) {
        const months = Math.floor(frequencyInSeconds / 2592000);
        return `every ${months} month${months > 1 ? "s" : ""}`;
    }
    else {
        const years = Math.floor(frequencyInSeconds / 31536000);
        return `every ${years} year${years > 1 ? "s" : ""}`;
    }
}
// Function to generate email content with actual amounts
function generateEmailContent(userAddress, savingsDetails) {
    let amountsText = "";
    let frequencyText = "";
    if (savingsDetails &&
        savingsDetails.tokenDetails &&
        savingsDetails.tokenDetails.length > 0) {
        const amounts = savingsDetails.tokenDetails.map((token) => {
            const amountToSave = formatTokenAmount(BigInt(token.amountToSave), token.token);
            const frequency = formatFrequency(BigInt(token.frequency));
            return { amount: amountToSave, frequency };
        });
        if (amounts.length === 1) {
            amountsText = `Auto save <span class="highlight">${amounts[0].amount}</span>`;
            frequencyText = ` ${amounts[0].frequency}`;
        }
        else {
            const amountStrings = amounts.map((item) => `${item.amount} ${item.frequency}`);
            amountsText = `Auto save <span class="highlight">${amountStrings.join(", ")}</span>`;
        }
    }
    else {
        amountsText = `Auto save <span class="highlight">0.0645 XRP</span> monthly`;
        frequencyText = " monthly";
    }
    return `
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
        transition: background-color 0.3s ease;
      }

      .social-icon:hover {
        background-color: #333333;
      }

      .social-icon svg {
        width: 20px;
        height: 20px;
        fill: white;
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
            alt="Coinsafe Logo"
            style="max-width: 200px; height: auto; display: block;" />
        </div>

        <!-- Main Content -->
        <div class="content">
          <h1 class="title">Automated safe executed</h1>

          <p class="text">Hi there,</p>

          <p class="text">
            Your automated savings plan has been executed successfully
          </p>

          <p class="text">
            ${amountsText}${frequencyText}
          </p>

          <p class="text">Thank you for using Coinsafe!</p>

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
}
function batchAutomatedSavingsProcessor() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🔄 [batchProcessor] Starting automated savings batch processor...");
        let startIndex = 0;
        while (true) {
            console.log(`📋 [batchProcessor] Getting due plans (iteration ${startIndex / BATCH_SIZE + 1})...`);
            const allDueAddresses = yield (0, savingsService_1.getDuePlans)();
            if (allDueAddresses.length === 0) {
                console.log("🎉 [batchProcessor] No due savings plans. Process complete.");
                break;
            }
            console.log(`📊 [batchProcessor] Total due plans found: ${allDueAddresses.length}`);
            const remaining = allDueAddresses.length - startIndex;
            const currentBatchSize = remaining >= BATCH_SIZE ? BATCH_SIZE : remaining;
            console.log(`🚀 [batchProcessor] Processing batch: startIndex=${startIndex}, count=${currentBatchSize}, remaining=${remaining}`);
            try {
                const result = yield (0, savingsService_1.executeBatch)(startIndex, currentBatchSize);
                console.log("✅ [batchProcessor] Batch execution completed successfully");
                // Send emails for successful executions
                console.log("📧 [batchProcessor] Starting email notifications...");
                // Since we can't get the actual addresses from the contract event,
                // we'll send emails to all due addresses that have verified emails
                for (const address of allDueAddresses) {
                    console.log(`📧 [batchProcessor] Looking up user for address: ${address}`);
                    try {
                        const user = yield UserModel_1.default.findOne({ walletAddress: address });
                        if (!user) {
                            console.log(`⚠️ [batchProcessor] No user found for address: ${address}`);
                            continue;
                        }
                        console.log(`👤 [batchProcessor] User found: ${user.email || "No email"}`);
                        if (!user.email) {
                            console.log(`⚠️ [batchProcessor] User ${address} has no email address`);
                            continue;
                        }
                        if (!user.emailVerified) {
                            console.log(`⚠️ [batchProcessor] User ${address} email not verified`);
                            continue;
                        }
                        console.log(`📧 [batchProcessor] Sending email to: ${user.email}`);
                        // Get automated savings details for this user
                        let savingsDetails = null;
                        try {
                            savingsDetails = yield (0, savingsService_1.getAutomatedSavingsDetails)(address);
                            console.log(`✅ [batchProcessor] Retrieved savings details for ${address}`);
                        }
                        catch (error) {
                            console.error(`❌ [batchProcessor] Error getting savings details for ${address}:`, error);
                            // Continue with default email content if we can't get details
                        }
                        const emailResult = yield (0, email_1.sendEmail)({
                            email: user.email,
                            subject: "Automated Savings Executed",
                            html: generateEmailContent(address, savingsDetails),
                        });
                        if (emailResult.success) {
                            console.log(`✅ [batchProcessor] Email sent successfully to ${user.email}`);
                        }
                        else {
                            console.error(`❌ [batchProcessor] Failed to send email to ${user.email}: ${emailResult.error}`);
                        }
                    }
                    catch (error) {
                        console.error(`❌ [batchProcessor] Error processing user ${address}:`, error);
                    }
                }
                console.log("📧 [batchProcessor] Email notification process completed");
                if (remaining <= currentBatchSize) {
                    console.log("🏁 [batchProcessor] All batches processed. Process complete.");
                    break;
                }
                startIndex += currentBatchSize;
            }
            catch (error) {
                console.error("❌ [batchProcessor] Error during batch processing:", error);
                break;
            }
        }
        console.log("🎉 [batchProcessor] Automated savings batch processor completed.");
    });
}
//# sourceMappingURL=batchProcessor.js.map