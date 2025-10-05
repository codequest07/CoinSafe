// // ============================================
// // Backend - Firebase Functions with Scheduled Jobs
// // functions/src/index.ts

// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';

// admin.initializeApp();

// // ============================================
// // 1. SCHEDULED NOTIFICATIONS (Cron Jobs)
// // ============================================

// /**
//  * Send daily morning notification at 8 AM
//  * Runs every day at 8:00 AM in your timezone
//  */
// export const sendDailyMorningNotification = functions.pubsub
//   .schedule('0 8 * * *') // Cron format: minute hour day month weekday
//   .timeZone('America/New_York') // Change to your timezone
//   .onRun(async (context: any) => {
//     console.log('Sending daily morning notifications...');

//     try {
//       // Get all users with FCM tokens from Firestore
//       const usersSnapshot = await admin
//         .firestore()
//         .collection('users')
//         .where('fcmToken', '!=', null)
//         .where('notificationsEnabled', '==', true)
//         .get();

//       const tokens: string[] = [];
//       const userPreferences: { [token: string]: any } = {};

//       usersSnapshot.forEach((doc: any) => {
//         const data = doc.data();
//         if (data.fcmToken) {
//           tokens.push(data.fcmToken);
//           userPreferences[data.fcmToken] = data.preferences || {};
//         }
//       });

//       if (tokens.length === 0) {
//         console.log('No users to notify');
//         return null;
//       }

//       // Create the notification message
//       const message: admin.messaging.MulticastMessage = {
//         notification: {
//           title: '☀️ Good Morning!',
//           body: 'Start your day right. Check out what\'s new today!',
//         },
//         data: {
//           type: 'daily_reminder',
//           url: '/',
//           timestamp: Date.now().toString(),
//         },
//         webpush: {
//           fcmOptions: {
//             link: 'https://app.coinsafe.network/',
//           },
//           notification: {
//             icon: '/icon-192.png',
//             badge: '/icon-96.png',
//             requireInteraction: false,
//           },
//         },
//         tokens: tokens,
//       };

//       // Send to all users
//       const response = await admin.messaging().sendMulticast(message);

//       console.log(
//         `Successfully sent ${response.successCount} notifications, ` +
//         `${response.failureCount} failed`
//       );

//       // Clean up invalid tokens
//       if (response.failureCount > 0) {
//         await cleanupInvalidTokens(response.responses, tokens);
//       }

//       return null;
//     } catch (error) {
//       console.error('Error sending daily notifications:', error);
//       return null;
//     }
//   });

// /**
//  * Send evening reminder at 8 PM
//  */
// export const sendDailyEveningNotification = functions.pubsub
//   .schedule('0 20 * * *')
//   .timeZone('America/New_York')
//   .onRun(async (context: any) => {
//     console.log('Sending daily evening notifications...');

//     const usersSnapshot = await admin
//       .firestore()
//       .collection('users')
//       .where('fcmToken', '!=', null)
//       .where('notificationsEnabled', '==', true)
//       .where('eveningReminders', '==', true) // User preference
//       .get();

//     const tokens = usersSnapshot.docs
//       .map((doc: any) => doc.data().fcmToken)
//       .filter(Boolean);

//     if (tokens.length === 0) return null;

//     const message: admin.messaging.MulticastMessage = {
//       notification: {
//         title: '🌙 Evening Check-in',
//         body: 'Review your progress and plan for tomorrow',
//       },
//       data: {
//         type: 'evening_reminder',
//         url: '/progress',
//       },
//       webpush: {
//         fcmOptions: {
//           link: 'https://app.coinsafe.network/',
//         },
//       },
//       tokens: tokens,
//     };

//     const response = await admin.messaging().sendMulticast(message);
//     console.log(`Evening notifications sent: ${response.successCount} successful`);

//     return null;
//   });

// /**
//  * Weekly summary every Monday at 9 AM
//  */
// export const sendWeeklySummary = functions.pubsub
//   .schedule('0 9 * * 1') // Every Monday
//   .timeZone('America/New_York')
//   .onRun(async (context: any) => {
//     console.log('Sending weekly summary...');

//     const usersSnapshot = await admin
//       .firestore()
//       .collection('users')
//       .where('fcmToken', '!=', null)
//       .where('weeklyDigest', '==', true)
//       .get();

//     const notifications = usersSnapshot.docs.map(async (doc) => {
//       const data = doc.data();
      
//       // Personalized message based on user data
//       return admin.messaging().send({
//         notification: {
//           title: '📊 Your Weekly Summary',
//           body: `You had ${data.weeklyStats?.activities || 0} activities this week!`,
//         },
//         data: {
//           type: 'weekly_summary',
//           url: '/stats',
//         },
//         token: data.fcmToken,
//       });
//     });

//     await Promise.allSettled(notifications);
//     return null;
//   });

// /**
//  * Custom time-based reminders for individual users
//  */
// export const sendCustomReminders = functions.pubsub
//   .schedule('*/30 * * * *') // Every 30 minutes
//   .onRun(async (context: any) => {
//     const now = new Date();
//     const currentTime = now.getHours() * 60 + now.getMinutes();

//     // Get users with scheduled reminders for this time slot
//     const remindersSnapshot = await admin
//       .firestore()
//       .collection('reminders')
//       .where('enabled', '==', true)
//       .where('nextScheduledTime', '<=', admin.firestore.Timestamp.now())
//       .get();

//     const notifications = remindersSnapshot.docs.map(async (doc: any) => {
//       const reminder = doc.data();

//       try {
//         await admin.messaging().send({
//           notification: {
//             title: reminder.title || 'Reminder',
//             body: reminder.message,
//           },
//           data: {
//             type: 'custom_reminder',
//             reminderId: doc.id,
//             url: reminder.url || '/',
//           },
//           token: reminder.fcmToken,
//         });

//         // Update next scheduled time based on frequency
//         const nextTime = calculateNextReminderTime(reminder);
//         await doc.ref.update({
//           nextScheduledTime: nextTime,
//           lastSent: admin.firestore.Timestamp.now(),
//         });
//       } catch (error) {
//         console.error(`Failed to send reminder ${doc.id}:`, error);
//       }
//     });

//     await Promise.allSettled(notifications);
//     return null;
//   });

// // ============================================
// // 2. USER TIMEZONE-AWARE NOTIFICATIONS
// // ============================================

// /**
//  * Send notification at user's local time (e.g., 8 AM in their timezone)
//  * Runs every hour and sends to users whose local time is 8 AM
//  */
// export const sendTimezoneAwareNotifications = functions.pubsub
//   .schedule('0 * * * *') // Every hour
//   .onRun(async (context: any) => {
//     const currentHour = new Date().getUTCHours();

//     // Query users whose timezone makes it 8 AM right now
//     const usersSnapshot = await admin
//       .firestore()
//       .collection('users')
//       .where('fcmToken', '!=', null)
//       .where('notificationsEnabled', '==', true)
//       .where('preferredNotificationHour', '==', 8)
//       .get();

//     const notifications = usersSnapshot.docs
//       .filter((doc: any) => {
//         const userData = doc.data();
//         const userTimezone = userData.timezone || 'America/New_York';
//         const userLocalHour = convertUTCToTimezone(currentHour, userTimezone);
//         return userLocalHour === 8;
//       })
//       .map((doc: any) => {
//         const userData = doc.data();
//         return admin.messaging().send({
//           notification: {
//             title: 'Good Morning!',
//             body: 'Time to start your day!',
//           },
//           token: userData.fcmToken,
//         });
//       });

//     await Promise.allSettled(notifications);
//     return null;
//   });

// // ============================================
// // 3. API ENDPOINTS TO MANAGE NOTIFICATIONS
// // ============================================

// /**
//  * Save FCM token when user subscribes
//  */
// export const saveFCMToken = functions.https.onCall(async (data: any, context: any) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const { token, preferences } = data;
//   const userId = context.auth.uid;

//   await admin.firestore().collection('users').doc(userId).set(
//     {
//       fcmToken: token,
//       notificationsEnabled: true,
//       preferences: preferences || {},
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     },
//     { merge: true }
//   );

//   return { success: true };
// });

// /**
//  * Update notification preferences
//  */
// export const updateNotificationPreferences = functions.https.onCall(
//   async (data, context) => {
//     if (!context.auth) {
//       throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//     }

//     const userId = context.auth.uid;
//     const { 
//       morningReminders,
//       eveningReminders,
//       weeklyDigest,
//       timezone,
//       preferredTime 
//     } = data;

//     await admin.firestore().collection('users').doc(userId).update({
//       morningReminders: morningReminders ?? true,
//       eveningReminders: eveningReminders ?? true,
//       weeklyDigest: weeklyDigest ?? true,
//       timezone: timezone || 'America/New_York',
//       preferredNotificationHour: preferredTime || 8,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     return { success: true };
//   }
// );

// /**
//  * Create custom reminder
//  */
// export const createReminder = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const userId = context.auth.uid;
//   const { title, message, time, frequency, url } = data;

//   // Get user's FCM token
//   const userDoc = await admin.firestore().collection('users').doc(userId).get();
//   const userData = userDoc.data();

//   if (!userData?.fcmToken) {
//     throw new functions.https.HttpsError(
//       'failed-precondition',
//       'User has not enabled notifications'
//     );
//   }

//   const reminderData = {
//     userId,
//     fcmToken: userData.fcmToken,
//     title,
//     message,
//     time, // Format: "08:00"
//     frequency, // 'daily', 'weekly', 'monthly'
//     url: url || '/',
//     enabled: true,
//     nextScheduledTime: calculateNextReminderTime({ time, frequency }),
//     createdAt: admin.firestore.FieldValue.serverTimestamp(),
//   };

//   const reminderRef = await admin
//     .firestore()
//     .collection('reminders')
//     .add(reminderData);

//   return { success: true, reminderId: reminderRef.id };
// });

// /**
//  * Delete reminder
//  */
// export const deleteReminder = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const { reminderId } = data;
//   const userId = context.auth.uid;

//   const reminderDoc = await admin
//     .firestore()
//     .collection('reminders')
//     .doc(reminderId)
//     .get();

//   if (!reminderDoc.exists || reminderDoc.data()?.userId !== userId) {
//     throw new functions.https.HttpsError('permission-denied', 'Unauthorized');
//   }

//   await reminderDoc.ref.delete();
//   return { success: true };
// });

// // ============================================
// // HELPER FUNCTIONS
// // ============================================

// async function cleanupInvalidTokens(
//   responses: admin.messaging.SendResponse[],
//   tokens: string[]
// ) {
//   const invalidTokens: string[] = [];

//   responses.forEach((response, index) => {
//     if (!response.success) {
//       const error = response.error;
//       if (
//         error?.code === 'messaging/invalid-registration-token' ||
//         error?.code === 'messaging/registration-token-not-registered'
//       ) {
//         invalidTokens.push(tokens[index]);
//       }
//     }
//   });

//   if (invalidTokens.length > 0) {
//     console.log(`Cleaning up ${invalidTokens.length} invalid tokens`);
    
//     const batch = admin.firestore().batch();
//     const usersSnapshot = await admin
//       .firestore()
//       .collection('users')
//       .where('fcmToken', 'in', invalidTokens)
//       .get();

//     usersSnapshot.docs.forEach((doc) => {
//       batch.update(doc.ref, { fcmToken: null });
//     });

//     await batch.commit();
//   }
// }

// function calculateNextReminderTime(reminder: any): admin.firestore.Timestamp {
//   const now = new Date();
//   const [hours, minutes] = reminder.time.split(':').map(Number);
  
//   const nextTime = new Date();
//   nextTime.setHours(hours, minutes, 0, 0);

//   // If time has passed today, schedule for next occurrence
//   if (nextTime <= now) {
//     switch (reminder.frequency) {
//       case 'daily':
//         nextTime.setDate(nextTime.getDate() + 1);
//         break;
//       case 'weekly':
//         nextTime.setDate(nextTime.getDate() + 7);
//         break;
//       case 'monthly':
//         nextTime.setMonth(nextTime.getMonth() + 1);
//         break;
//     }
//   }

//   return admin.firestore.Timestamp.fromDate(nextTime);
// }

// function convertUTCToTimezone(utcHour: number, timezone: string): number {
//   const date = new Date();
//   date.setUTCHours(utcHour);
  
//   const localTime = date.toLocaleString('en-US', {
//     timeZone: timezone,
//     hour: 'numeric',
//     hour12: false,
//   });
  
//   return parseInt(localTime, 10);
// }

// // ============================================
// // Frontend - Notification Preferences Component
// // src/components/NotificationPreferences.tsx

// import React, { useState, useEffect } from 'react';
// import { Bell, Clock, Calendar, Trash2 } from 'lucide-react';
// import { getFunctions, httpsCallable } from 'firebase/functions';

// interface NotificationPreferencesProps {
//   userId: string;
// }

// export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId }) => {
//   const [preferences, setPreferences] = useState({
//     morningReminders: true,
//     eveningReminders: true,
//     weeklyDigest: true,
//     preferredTime: 8,
//     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//   });
  
//   const [customReminders, setCustomReminders] = useState<any[]>([]);
//   const [newReminder, setNewReminder] = useState({
//     title: '',
//     message: '',
//     time: '08:00',
//     frequency: 'daily',
//   });

//   const functions = getFunctions();

//   const savePreferences = async () => {
//     try {
//       const updatePrefs = httpsCallable(functions, 'updateNotificationPreferences');
//       await updatePrefs(preferences);
//       alert('Preferences saved!');
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       alert('Failed to save preferences');
//     }
//   };

//   const createReminder = async () => {
//     if (!newReminder.title || !newReminder.message) {
//       alert('Please fill in all fields');
//       return;
//     }

//     try {
//       const create = httpsCallable(functions, 'createReminder');
//       await create(newReminder);
//       alert('Reminder created!');
      
//       // Reset form
//       setNewReminder({
//         title: '',
//         message: '',
//         time: '08:00',
//         frequency: 'daily',
//       });
//     } catch (error) {
//       console.error('Error creating reminder:', error);
//       alert('Failed to create reminder');
//     }
//   };

//   const deleteReminder = async (reminderId: string) => {
//     try {
//       const deleteRem = httpsCallable(functions, 'deleteReminder');
//       await deleteRem({ reminderId });
//       alert('Reminder deleted!');
//     } catch (error) {
//       console.error('Error deleting reminder:', error);
//       alert('Failed to delete reminder');
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Daily Notifications */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//           <Bell size={20} />
//           Daily Notifications
//         </h3>
        
//         <div className="space-y-3">
//           <label className="flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={preferences.morningReminders}
//               onChange={(e) => setPreferences({ ...preferences, morningReminders: e.target.checked })}
//               className="w-4 h-4"
//             />
//             <span>Morning reminders (8 AM)</span>
//           </label>
          
//           <label className="flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={preferences.eveningReminders}
//               onChange={(e) => setPreferences({ ...preferences, eveningReminders: e.target.checked })}
//               className="w-4 h-4"
//             />
//             <span>Evening reminders (8 PM)</span>
//           </label>
          
//           <label className="flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={preferences.weeklyDigest}
//               onChange={(e) => setPreferences({ ...preferences, weeklyDigest: e.target.checked })}
//               className="w-4 h-4"
//             />
//             <span>Weekly digest (Mondays)</span>
//           </label>
//         </div>

//         <button
//           onClick={savePreferences}
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Save Preferences
//         </button>
//       </div>

//       {/* Custom Reminders */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//           <Clock size={20} />
//           Custom Reminders
//         </h3>
        
//         <div className="space-y-3">
//           <input
//             type="text"
//             placeholder="Reminder title"
//             value={newReminder.title}
//             onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
//             className="w-full border rounded-lg px-3 py-2"
//           />
          
//           <input
//             type="text"
//             placeholder="Reminder message"
//             value={newReminder.message}
//             onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
//             className="w-full border rounded-lg px-3 py-2"
//           />
          
//           <div className="grid grid-cols-2 gap-3">
//             <input
//               type="time"
//               value={newReminder.time}
//               onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
//               className="border rounded-lg px-3 py-2"
//             />
            
//             <select
//               value={newReminder.frequency}
//               onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value })}
//               className="border rounded-lg px-3 py-2"
//             >
//               <option value="daily">Daily</option>
//               <option value="weekly">Weekly</option>
//               <option value="monthly">Monthly</option>
//             </select>
//           </div>
          
//           <button
//             onClick={createReminder}
//             className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
//           >
//             Create Reminder
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
