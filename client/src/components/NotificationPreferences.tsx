import React, { useState } from "react";
import { Bell, Clock } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api-config";

interface NotificationPreferencesProps {
  walletAddress: string;
}

export const NotificationPreferences: React.FC<
  NotificationPreferencesProps
> = ({ walletAddress }) => {
  const [preferences, setPreferences] = useState({
    morningReminders: true,
    eveningReminders: true,
    weeklyDigest: true,
    preferredNotificationHour: 8,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [newReminder, setNewReminder] = useState({
    title: "",
    message: "",
    time: "08:00",
    frequency: "daily",
  });

  const savePreferences = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/notifications/preferences/${walletAddress}`,
        preferences
      );
      alert("Preferences saved!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences");
    }
  };

  const createReminder = async () => {
    if (!newReminder.title || !newReminder.message) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/notifications/send`, {
        title: newReminder.title,
        body: newReminder.message,
        type: "custom_reminder",
        targetAudience: "specific",
        walletAddresses: [walletAddress],
      });
      alert("Reminder created!");

      setNewReminder({
        title: "",
        message: "",
        time: "08:00",
        frequency: "daily",
      });
    } catch (error) {
      console.error("Error creating reminder:", error);
      alert("Failed to create reminder");
    }
  };

//   const deleteReminder = async (reminderId: string) => {
//     try {
//       const deleteRem = httpsCallable(functions, "deleteReminder");
//       await deleteRem({ reminderId });
//       alert("Reminder deleted!");
//     } catch (error) {
//       console.error("Error deleting reminder:", error);
//       alert("Failed to delete reminder");
//     }
//   };

  return (
    <div className="space-y-6">
      {/* Daily Notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell size={20} />
          Daily Notifications
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.morningReminders}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  morningReminders: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <span>Morning reminders (8 AM)</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.eveningReminders}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  eveningReminders: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <span>Evening reminders (8 PM)</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  weeklyDigest: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <span>Weekly digest (Mondays)</span>
          </label>
        </div>

        <button
          onClick={savePreferences}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Preferences
        </button>
      </div>

      {/* Custom Reminders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Custom Reminders
        </h3>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Reminder title"
            value={newReminder.title}
            onChange={(e) =>
              setNewReminder({ ...newReminder, title: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Reminder message"
            value={newReminder.message}
            onChange={(e) =>
              setNewReminder({ ...newReminder, message: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={newReminder.time}
              onChange={(e) =>
                setNewReminder({ ...newReminder, time: e.target.value })
              }
              className="border rounded-lg px-3 py-2"
            />

            <select
              value={newReminder.frequency}
              onChange={(e) =>
                setNewReminder({ ...newReminder, frequency: e.target.value })
              }
              className="border rounded-lg px-3 py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button
            onClick={createReminder}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Create Reminder
          </button>
        </div>
      </div>
    </div>
  );
};
