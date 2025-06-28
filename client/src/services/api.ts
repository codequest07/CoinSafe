import axios, { type AxiosResponse } from "axios";

// Safe environment variable access
const getApiBaseUrl = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "https://coinsafe-0q0m.onrender.com/api";
  // return "http://localhost:1234/api";
};

const API_BASE_URL = getApiBaseUrl();

export interface ProfileData {
  email?: string;
  emailVerified?: boolean;
  twitterHandle?: string;
  discordHandle?: string;
  notificationPreferences?: any;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message: string;
  profile?: T;
  [key: string]: any;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/profile`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Extract error message from axios error
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    throw new Error(message);
  }
);

class ProfileAPI {
  async getProfile(walletAddress: string): Promise<ApiResponse<ProfileData>> {
    try {
      const response = await apiClient.get(`/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error("Get Profile Error:", error);
      throw error;
    }
  }

  async updateEmail(
    walletAddress: string,
    email: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiClient.post("/update-email", {
        walletAddress,
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Update Email Error:", error);
      throw error;
    }
  }

  async updateTwitter(
    walletAddress: string,
    twitterHandle: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiClient.post("/update-twitter", {
        walletAddress,
        twitterHandle,
      });
      return response.data;
    } catch (error) {
      console.error("Update Twitter Error:", error);
      throw error;
    }
  }

  async updateDiscord(
    walletAddress: string,
    discordHandle: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiClient.post("/update-discord", {
        walletAddress,
        discordHandle,
      });
      return response.data;
    } catch (error) {
      console.error("Update Discord Error:", error);
      throw error;
    }
  }

  async verifyEmail(token: string, email: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.get("/verify-email", {
        params: { token, email },
      });
      return response.data;
    } catch (error) {
      console.error("Verify Email Error:", error);
      throw error;
    }
  }

  async updatePreferences(
    walletAddress: string,
    preferences: any
  ): Promise<ApiResponse> {
    try {
      const response = await apiClient.post("/update-preferences", {
        walletAddress,
        preferences,
      });
      return response.data;
    } catch (error) {
      console.error("Update Preferences Error:", error);
      throw error;
    }
  }
}

export const profileAPI = new ProfileAPI();
