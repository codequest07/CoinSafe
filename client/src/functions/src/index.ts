/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const helloWorld = onRequest((_, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Send daily morning notification at 8 AM - Tailored for CoinSafe: Motivational saving reminder
 * Runs every day at 8:00 AM in Africa/Lagos timezone
 * Sends to all subscribed users (only FCM tokens stored)
 * Includes a random motivational quote or fact about saving/investing in real life or Web3/blockchain
 */
export const sendDailyMorningNotification = functions.pubsub
  .schedule("0 8 * * *") // Cron format: minute hour day month weekday
  .timeZone("Africa/Lagos")
  .onRun(async () => {
    console.log("Sending daily morning notifications for CoinSafe...");

    try {
      // Get all tokens from Firestore (no user data, just tokens)
      const tokensSnapshot = await admin
        .firestore()
        .collection("fcm_tokens")
        .where("fcmToken", "!=", null)
        .get();

      const tokens: string[] = [];

      tokensSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.fcmToken) {
          tokens.push(data.fcmToken);
        }
      });

      if (tokens.length === 0) {
        console.log("No users to notify");
        return null;
      }

      // Array of motivational quotes/facts (mix of real-life saving/investing and Web3/blockchain)
      const motivations = [
        "Have you saved something today? 'The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order.' – T.T. Munger",
        "Have you saved something today? Did you know? Compounding interest can turn $100 monthly savings into over $200,000 in 30 years at 7% return.",
        "Have you saved something today? In Web3, blockchain ensures your savings are secure, transparent, and immutable – no middlemen needed!",
        "Have you saved something today? 'Invest in yourself. Your career is the engine of your wealth.' – Paul Clitheroe. Start with small savings habits.",
        "Have you saved something today? Fact: DeFi on blockchain offers yields up to 10%+ on stablecoins, beating traditional bank savings rates.",
        "Have you saved something today? 'The stock market is a device for transferring money from the impatient to the patient.' – Warren Buffett.",
        "Have you saved something today? Blockchain buzz: With Ethereum's upgrades, gas fees are lower, making micro-savings in crypto more accessible.",
        "Have you saved something today? Real-life tip: Automate your savings – set it and forget it to build wealth effortlessly.",
        "Have you saved something today? Web3 insight: Tokenized assets let you save in fractions of real estate or art, democratizing investing.",
        "Have you saved something today? 'Do not save what is left after spending, but spend what is left after saving.' – Warren Buffett.",
      ];

      // Pick a random motivation
      const randomMotivation =
        motivations[Math.floor(Math.random() * motivations.length)];

      // Create the CoinSafe-tailored notification message
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: "☀️ Good Morning from CoinSafe!",
          body: randomMotivation,
        },
        data: {
          type: "daily_morning_reminder",
          url: "/save-assets", // Direct to saving feature
          timestamp: Date.now().toString(),
        },
        webpush: {
          fcmOptions: {
            link: "https://app.coinsafe.network/save-assets",
          },
          notification: {
            icon: "/icon-192.png",
            badge: "/icon-96.png",
            requireInteraction: false,
          },
        },
        tokens: tokens,
      };

      // Send to all users
      const response = await admin.messaging().sendEachForMulticast(message);

      const successCount = response.responses.filter((r) => r.success).length;
      const failureCount = response.responses.filter((r) => !r.success).length;

      console.log(
        `Successfully sent ${successCount} notifications, ` +
          `${failureCount} failed`
      );

      // Clean up invalid tokens
      if (failureCount > 0) {
        await cleanupInvalidTokens(response.responses, tokens);
      }

      return null;
    } catch (error) {
      console.error("Error sending daily notifications:", error);
      return null;
    }
  });

/**
 * Custom notifications triggered externally - Callable function to send ad-hoc messages
 * Allows external trigger (e.g., from admin) to send custom notification to all subscribed users
 * Takes title, body, and url as input
 */
export const sendCustomNotification = functions.https.onCall(
  async (data, ) => {
    // Optional: Add auth check if only admins can trigger
    // if (!context.auth || !isAdmin(context.auth.uid)) { throw new functions.https.HttpsError("permission-denied", "Unauthorized"); }

    const { title, body, url } = data;

    if (!title || !body) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Title and body are required"
      );
    }

    try {
      // Get all tokens from Firestore
      const tokensSnapshot = await admin
        .firestore()
        .collection("fcm_tokens")
        .where("fcmToken", "!=", null)
        .get();

      const tokens: string[] = [];

      tokensSnapshot.forEach((doc) => {
        const tokenData = doc.data();
        if (tokenData.fcmToken) {
          tokens.push(tokenData.fcmToken);
        }
      });

      if (tokens.length === 0) {
        return { success: true, message: "No users to notify" };
      }

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: title,
          body: body,
        },
        data: {
          type: "custom_notification",
          url: url || "/",
          timestamp: Date.now().toString(),
        },
        webpush: {
          fcmOptions: {
            link: `https://app.coinsafe.network${url || "/"}`,
          },
          notification: {
            icon: "/icon-192.png",
            badge: "/icon-96.png",
            requireInteraction: false,
          },
        },
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      const successCount = response.responses.filter((r) => r.success).length;
      const failureCount = response.responses.filter((r) => !r.success).length;

      console.log(
        `Successfully sent ${successCount} custom notifications, ` +
          `${failureCount} failed`
      );

      // Clean up invalid tokens
      if (failureCount > 0) {
        await cleanupInvalidTokens(response.responses, tokens);
      }

      return { success: true, sent: successCount };
    } catch (error) {
      console.error("Error sending custom notification:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error sending notification"
      );
    }
  }
);

/**
 * Save FCM token when user subscribes (only token saved, no auth or other data)
 */
export const saveFCMToken = functions.https.onCall(async (data, context) => {
  const { token } = data;
  console.log(context)

  if (!token) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Token is required"
    );
  }

  // Save to a dedicated collection with auto-generated ID
  const tokenRef = admin.firestore().collection("fcm_tokens").doc();

  await tokenRef.set({
    fcmToken: token,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function cleanupInvalidTokens(
  responses: admin.messaging.SendResponse[],
  tokens: string[]
) {
  const invalidTokens: string[] = [];

  responses.forEach((response, index) => {
    if (!response.success) {
      const error = response.error;
      if (
        error?.code === "messaging/invalid-registration-token" ||
        error?.code === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(tokens[index]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    console.log(`Cleaning up ${invalidTokens.length} invalid tokens`);

    const batch = admin.firestore().batch();
    const tokensSnapshot = await admin
      .firestore()
      .collection("fcm_tokens")
      .where("fcmToken", "in", invalidTokens)
      .get();

    tokensSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref); // Delete invalid token docs
    });

    await batch.commit();
  }
}

// ============================================
// Deployment Instructions
/*
1. Install Firebase CLI:
   npm install -g firebase-tools

2. Initialize Firebase Functions:
   firebase init functions

3. Deploy functions:
   firebase deploy --only functions

4. Monitor logs:
   firebase functions:log

5. Test scheduled functions:
   firebase functions:shell
   > sendDailyMorningNotification({})
    */
