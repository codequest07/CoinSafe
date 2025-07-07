import { getDuePlans, executeBatch } from "./savingsService";
import { sendEmail } from "./email";
import User from "../Models/UserModel";

const BATCH_SIZE = 30;

export async function batchAutomatedSavingsProcessor() {
  console.log(
    "🔄 [batchProcessor] Starting automated savings batch processor..."
  );
  let startIndex = 0;

  while (true) {
    console.log(
      `📋 [batchProcessor] Getting due plans (iteration ${
        startIndex / BATCH_SIZE + 1
      })...`
    );
    const allDueAddresses = await getDuePlans();

    if (allDueAddresses.length === 0) {
      console.log(
        "🎉 [batchProcessor] No due savings plans. Process complete."
      );
      break;
    }

    console.log(
      `📊 [batchProcessor] Total due plans found: ${allDueAddresses.length}`
    );
    const remaining = allDueAddresses.length - startIndex;
    const currentBatchSize = remaining >= BATCH_SIZE ? BATCH_SIZE : remaining;

    console.log(
      `🚀 [batchProcessor] Processing batch: startIndex=${startIndex}, count=${currentBatchSize}, remaining=${remaining}`
    );

    try {
      const result = await executeBatch(startIndex, currentBatchSize);
      console.log("✅ [batchProcessor] Batch execution completed successfully");

      // Send emails for successful executions
      console.log("📧 [batchProcessor] Starting email notifications...");

      // Since we can't get the actual addresses from the contract event,
      // we'll send emails to all due addresses that have verified emails
      for (const address of allDueAddresses) {
        console.log(
          `📧 [batchProcessor] Looking up user for address: ${address}`
        );

        try {
          const user = await User.findOne({ walletAddress: address });

          if (!user) {
            console.log(
              `⚠️ [batchProcessor] No user found for address: ${address}`
            );
            continue;
          }

          console.log(
            `👤 [batchProcessor] User found: ${user.email || "No email"}`
          );

          if (!user.email) {
            console.log(
              `⚠️ [batchProcessor] User ${address} has no email address`
            );
            continue;
          }

          if (!user.emailVerified) {
            console.log(
              `⚠️ [batchProcessor] User ${address} email not verified`
            );
            continue;
          }

          console.log(`📧 [batchProcessor] Sending email to: ${user.email}`);

          const emailResult = await sendEmail({
            email: user.email,
            subject: "Automated Savings Executed",
            html: `
              <h2>Automated Savings Executed</h2>
              <p>Your automated savings plan has been executed successfully.</p>
              <p>Wallet Address: ${address}</p>
              <p>Thank you for using CoinSafe!</p>
            `,
          });

          if (emailResult.success) {
            console.log(
              `✅ [batchProcessor] Email sent successfully to ${user.email}`
            );
          } else {
            console.error(
              `❌ [batchProcessor] Failed to send email to ${user.email}: ${emailResult.error}`
            );
          }
        } catch (error) {
          console.error(
            `❌ [batchProcessor] Error processing user ${address}:`,
            error
          );
        }
      }

      console.log("📧 [batchProcessor] Email notification process completed");

      if (remaining <= currentBatchSize) {
        console.log(
          "🏁 [batchProcessor] All batches processed. Process complete."
        );
        break;
      }

      startIndex += currentBatchSize;
    } catch (error) {
      console.error(
        "❌ [batchProcessor] Error during batch processing:",
        error
      );
      break;
    }
  }

  console.log(
    "🎉 [batchProcessor] Automated savings batch processor completed."
  );
}
