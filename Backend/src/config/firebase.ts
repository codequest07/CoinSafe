import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.warn(
      "⚠️ Firebase Admin initialized with application default credentials. " +
        "Set FIREBASE_SERVICE_ACCOUNT_KEY env var for production."
    );
  }
}

export const firebaseAdmin = admin;
export const firebaseMessaging = admin.messaging();
export const firebaseFirestore = admin.firestore();
