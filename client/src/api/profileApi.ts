import axios from "axios";
const api = axios.create({
  baseURL: "https://coinsafe-0q0m.onrender.com/api",
});

interface NotificationPreferences {
  deposit: boolean;
  withdrawal: boolean;
  safeMaturing: boolean;
  [key: string]: boolean;
}

export interface UserProfile {
  email?: string;
  emailVerified: boolean;
  twitterHandle?: string;
  discordHandle?: string;
  notificationPreferences: NotificationPreferences;
}

interface UpdateEmailPayload {
  walletAddress: string;
  email: string;
}

interface UpdatePreferencesPayload {
  walletAddress: string;
  preferences: NotificationPreferences;
}

export const updateEmailApi = async (data: UpdateEmailPayload) => {
  try {
    const response = await api.post("/profile/update-email", data);
    return response.data;
  } catch (error: any) {
    // Axios errors provide `error.response` for server responses
    throw error.response?.data?.message || "Failed to update email.";
  }
};

export const verifyEmailApi = async (token: string, email: string) => {
  try {
    const response = await api.get(
      `/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    );
    return response.data; // Should return { success: boolean, message: string }
  } catch (error: any) {
    throw error.response?.data?.message || "Email verification failed.";
  }
};
export const updateTwitterApi = async (
  walletAddress: string,
  twitterHandle: string
) => {
  try {
    const response = await api.post("/profile/update-twitter", {
      walletAddress,
      twitterHandle,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update Twitter handle.";
  }
};

export const updateDiscordApi = async (
  walletAddress: string,
  discordHandle: string
) => {
  try {
    const response = await api.post("/profile/update-discord", {
      walletAddress,
      discordHandle,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update Discord handle.";
  }
};

export const updateNotificationPreferences = async (
  data: UpdatePreferencesPayload
) => {
  try {
    const response = await api.post("/profile/update-preferences", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to update preferences.";
  }
};

export const getNotificationProfile = async (
  walletAddress: string
): Promise<UserProfile | null> => {
  try {
    const response = await api.get(`/profile/profile/${walletAddress}`);
    // Backend returns { profile: null } if not found, or { profile: data }
    if (response.data.profile) {
      return response.data.profile as UserProfile;
    }
    return null; // Explicitly return null if profile is not found
  } catch (error: any) {
    // Log errors but return null for cases where profile isn't found
    console.error(
      "Failed to fetch profile:",
      error.response?.data?.message || error
    );
    return null;
  }
};
