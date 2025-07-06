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
      const { dueAddresses: successful, skippedAddresses: failed } =
        await executeBatch(startIndex, currentBatchSize);

      console.log(
        `📧 [batchProcessor] Sending emails for ${allDueAddresses.length} due addresses...`
      );
      // Since the contract event doesn't provide specific addresses,
      // we'll send emails to all due addresses with a generic message
      if (allDueAddresses.length > 0) {
        await sendBatchEmails(allDueAddresses, []);
      }

      startIndex += currentBatchSize;

      if (startIndex >= allDueAddresses.length) {
        console.log("✅ [batchProcessor] All batches processed.");
        break;
      }
    } catch (error) {
      console.error("❌ [batchProcessor] Error processing batch:", error);
      console.error("🔍 [batchProcessor] Error details:", {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      // Continue with next batch even if current one fails
      startIndex += currentBatchSize;
    }
  }

  console.log("🏁 [batchProcessor] Batch processor completed.");
}

async function sendBatchEmails(successful: string[], failed: string[]) {
  console.log(
    `📧 [sendBatchEmails] Sending emails to ${successful.length} successful and ${failed.length} failed addresses...`
  );

  for (const userAddress of successful) {
    try {
      console.log(
        `📧 [sendBatchEmails] Looking up email for address: ${userAddress}`
      );
      const email = await getEmailFromAddress(userAddress);
      console.log(`📧 [sendBatchEmails] Sending success email to: ${email}`);
      await sendEmail({
        email,
        subject: "✅ Automated Savings Executed",
        html: `<p>Hello!</p><p>Your automated savings plan was successfully executed on CoinSafe.</p>`,
      });
      console.log(`✅ [sendBatchEmails] Success email sent to: ${email}`);
    } catch (err) {
      console.warn(
        `⚠️ [sendBatchEmails] Skipping success email for ${userAddress}:`,
        (err as Error).message
      );
    }
  }

  for (const userAddress of failed) {
    try {
      console.log(
        `📧 [sendBatchEmails] Looking up email for failed address: ${userAddress}`
      );
      const email = await getEmailFromAddress(userAddress);
      console.log(`📧 [sendBatchEmails] Sending failure email to: ${email}`);
      await sendEmail({
        email,
        subject: "⚠️ Automated Savings Skipped",
        html: `<p>Hello!</p><p>We attempted to process your automated savings but it was skipped due to insufficient balance.</p>`,
      });
      console.log(`✅ [sendBatchEmails] Failure email sent to: ${email}`);
    } catch (err) {
      console.warn(
        `⚠️ [sendBatchEmails] Skipping skipped email for ${userAddress}:`,
        (err as Error).message
      );
    }
  }

  console.log(`📧 [sendBatchEmails] Email sending completed.`);
}

async function getEmailFromAddress(address: string): Promise<string> {
  console.log(
    `🔍 [getEmailFromAddress] Looking up user with address: ${address}`
  );
  const user = await User.findOne({ walletAddress: address.toLowerCase() });
  if (!user || !user.email || !user.emailVerified) {
    throw new Error(`No verified email found for address ${address}`);
  }
  console.log(`✅ [getEmailFromAddress] Found verified email: ${user.email}`);
  return user.email;
}
