"use client";

import { useState, useEffect, useCallback } from "react";
import {
  profileAPI,
  type ProfileData,
  type ApiResponse,
} from "../services/api";

export function useProfile(walletAddress: string | undefined) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const response = await profileAPI.getProfile(walletAddress);
      setProfile(response.profile || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateEmail = async (email: string): Promise<ApiResponse> => {
    if (!walletAddress) throw new Error("Wallet not connected");

    setLoading(true);
    try {
      const response = await profileAPI.updateEmail(walletAddress, email);
      await fetchProfile(); // Refresh profile data
      return response;
    } finally {
      setLoading(false);
    }
  };

  const updateTwitter = async (twitterHandle: string): Promise<ApiResponse> => {
    if (!walletAddress) throw new Error("Wallet not connected");

    setLoading(true);
    try {
      const response = await profileAPI.updateTwitter(
        walletAddress,
        twitterHandle
      );
      await fetchProfile(); // Refresh profile data
      return response;
    } finally {
      setLoading(false);
    }
  };

  const updateDiscord = async (discordHandle: string): Promise<ApiResponse> => {
    if (!walletAddress) throw new Error("Wallet not connected");

    setLoading(true);
    try {
      const response = await profileAPI.updateDiscord(
        walletAddress,
        discordHandle
      );
      await fetchProfile(); // Refresh profile data
      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateEmail,
    updateTwitter,
    updateDiscord,
    refetch: fetchProfile,
  };
}
