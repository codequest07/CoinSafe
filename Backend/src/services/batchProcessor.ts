import { getDuePlans, executeBatch } from "./savingsService";
import { sendEmail } from "./email";
import User from "../Models/UserModel";

const BATCH_SIZE = 30;

export async function batchAutomatedSavingsProcessor() {
  let startIndex = 0;

  while (true) {
    const allDueAddresses = await getDuePlans();

    if (allDueAddresses.length === 0) {
      console.log("🎉 No due savings plans. Process complete.");
      break;
    }

    const remaining = allDueAddresses.length - startIndex;
    const currentBatchSize = remaining >= BATCH_SIZE ? BATCH_SIZE : remaining;

    console.log(
      `🚀 Processing batch: startIndex=${startIndex}, count=${currentBatchSize}`
    );

    const { dueAddresses: successful, skippedAddresses: failed } =
      await executeBatch(startIndex, currentBatchSize);

    await sendBatchEmails(successful, failed);

    startIndex += currentBatchSize;

    if (startIndex >= allDueAddresses.length) {
      console.log("✅ All batches processed.");
      break;
    }
  }
}

async function sendBatchEmails(successful: string[], failed: string[]) {
  for (const userAddress of successful) {
    try {
      const email = await getEmailFromAddress(userAddress);
      await sendEmail({
        email,
        subject: "✅ Automated Savings Executed",
        html: `<p>Hello!</p><p>Your automated savings plan was successfully executed on CoinSafe.</p>`,
      });
    } catch (err) {
      console.warn(
        `⚠️ Skipping success email for ${userAddress}:`,
        (err as Error).message
      );
    }
  }

  for (const userAddress of failed) {
    try {
      const email = await getEmailFromAddress(userAddress);
      await sendEmail({
        email,
        subject: "⚠️ Automated Savings Skipped",
        html: `<p>Hello!</p><p>We attempted to process your automated savings but it was skipped due to insufficient balance.</p>`,
      });
    } catch (err) {
      console.warn(
        `⚠️ Skipping skipped email for ${userAddress}:`,
        (err as Error).message
      );
    }
  }
}

async function getEmailFromAddress(address: string): Promise<string> {
  const user = await User.findOne({ walletAddress: address.toLowerCase() });
  if (!user || !user.email || !user.emailVerified) {
    throw new Error(`No verified email found for address ${address}`);
  }
  return user.email;
}
