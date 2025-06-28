"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useActiveAccount } from "thirdweb/react";
import { useProfile } from "../hooks/useProfile";
import { profileAPI } from "../services/api";

export default function ProfilePage() {
  const account = useActiveAccount();
  const address = account?.address || "";

  const {
    profile,
    loading,
    error,
    updateEmail,
    updateTwitter,
    updateDiscord,
    refetch,
  } = useProfile(address);

  // Form states
  const [emailInput, setEmailInput] = useState("");
  const [twitterInput, setTwitterInput] = useState("");
  const [discordInput, setDiscordInput] = useState("");

  // Loading states for individual actions
  const [emailLoading, setEmailLoading] = useState(false);
  const [twitterLoading, setTwitterLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);

  // Verification state
  const [verificationLoading, setVerificationLoading] = useState(false);
  const verificationProcessed = useRef(false); // Prevent duplicate verification calls

  // Success/error messages
  const [messages, setMessages] = useState<{
    email?: string;
    twitter?: string;
    discord?: string;
    verification?: string;
  }>({});

  // Check for email verification on component mount
  useEffect(() => {
    const handleEmailVerification = async () => {
      // Prevent duplicate calls
      if (verificationProcessed.current) {
        console.log("Verification already processed, skipping...");
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const email = urlParams.get("email");

      if (token && email) {
        console.log("Email verification parameters found, processing...");
        verificationProcessed.current = true;
        setVerificationLoading(true);

        try {
          const response = await profileAPI.verifyEmail(token, email);

          if (response.alreadyVerified) {
            setMessages((prev) => ({
              ...prev,
              verification: "✅ Email is already verified!",
            }));
          } else {
            setMessages((prev) => ({
              ...prev,
              verification: "✅ " + response.message,
            }));
          }

          // Refresh profile data
          await refetch();

          // Clear URL parameters after successful verification
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Email verification failed";
          setMessages((prev) => ({
            ...prev,
            verification: "❌ " + errorMessage,
          }));
        } finally {
          setVerificationLoading(false);
        }
      }
    };

    handleEmailVerification();
  }, [refetch]); // Only depend on refetch, not on URL params to prevent re-runs

  // Update form inputs when profile data loads
  useEffect(() => {
    if (profile) {
      setEmailInput(profile.email || "");
      setTwitterInput(profile.twitterHandle || "");
      setDiscordInput(profile.discordHandle || "");
    }
  }, [profile]);

  const handleEmailConnect = async () => {
    if (!emailInput.trim()) return;

    setEmailLoading(true);
    setMessages((prev) => ({ ...prev, email: undefined }));

    try {
      const response = await updateEmail(emailInput);
      setMessages((prev) => ({ ...prev, email: "✅ " + response.message }));
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        email:
          "❌ " +
          (err instanceof Error ? err.message : "Failed to update email"),
      }));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleTwitterConnect = async () => {
    setTwitterLoading(true);
    setMessages((prev) => ({ ...prev, twitter: undefined }));

    try {
      const response = await updateTwitter(twitterInput);
      setMessages((prev) => ({ ...prev, twitter: "✅ " + response.message }));
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        twitter:
          "❌ " +
          (err instanceof Error ? err.message : "Failed to update Twitter"),
      }));
    } finally {
      setTwitterLoading(false);
    }
  };

  const handleDiscordConnect = async () => {
    setDiscordLoading(true);
    setMessages((prev) => ({ ...prev, discord: undefined }));

    try {
      const response = await updateDiscord(discordInput);
      setMessages((prev) => ({ ...prev, discord: "✅ " + response.message }));
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        discord:
          "❌ " +
          (err instanceof Error ? err.message : "Failed to update Discord"),
      }));
    } finally {
      setDiscordLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h bg-transparent flex items-center justify-center p-4">
        <Card className="w-full max-w-xl bg-transparent border-[#FFFFFF21] rounded-3xl p-8">
          <p className="text-white text-center">
            Please connect your wallet to view your profile.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-transparent border-[#FFFFFF21] rounded-3xl p-8 space-y-6">
        {/* Header */}
        <div className="">
          <h1 className="text-[15px] font-medium text-[#F1F1F1]">My profile</h1>
        </div>
        <div className="border-b border-[#FFFFFF21] -mx-8 mb-8"></div>

        {/* Verification Status */}
        {verificationLoading && (
          <div className="text-center text-blue-400 text-sm">
            🔄 Verifying your email...
          </div>
        )}

        {messages.verification && (
          <div
            className={`text-center text-sm p-3 rounded-lg ${
              messages.verification.includes("✅")
                ? "bg-green-900/20 text-green-400 border border-green-500/20"
                : "bg-red-900/20 text-red-400 border border-red-500/20"
            }`}>
            {messages.verification}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center text-[#CACACA]">Loading profile...</div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}

        {/* Connected Wallet Section */}
        <div className="space-y-4">
          <h2 className="text-[14px] font-[400] text-[#CACACA]">
            Connected wallet
          </h2>
          <p className="text-white font-mono text-[14px]">{address}</p>
        </div>

        {/* Email Address Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[14px] font-[400] text-[#CACACA] uppercase">
              EMAIL ADDRESS
            </h3>
            <p className="text-gray-400 text-[13px]">
              Link an active email address to get notified of your savings
              activities
            </p>
            {profile?.emailVerified === true && (
              <p className="text-green-400 text-[12px] flex items-center gap-1">
                ✓ Email verified
              </p>
            )}
            {profile?.email && profile?.emailVerified !== true && (
              <p className="text-yellow-400 text-[12px] flex items-center gap-1">
                ⚠ Email pending verification
              </p>
            )}
          </div>
          <div className="relative">
            <Input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-12 pr-24"
              placeholder="Enter your email address"
              disabled={emailLoading || verificationLoading}
            />
            <Button
              onClick={handleEmailConnect}
              disabled={
                emailLoading || !emailInput.trim() || verificationLoading
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-lg px-4 h-8 text-sm">
              {emailLoading ? "..." : "Connect"}
            </Button>
          </div>
          {messages.email && (
            <p
              className={`text-[12px] ${
                messages.email.includes("✅")
                  ? "text-green-400"
                  : "text-red-400"
              }`}>
              {messages.email}
            </p>
          )}
        </div>

        {/* Socials Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-[14px] font-[400] text-[#CACACA] uppercase">
            SOCIALS
          </h2>

          {/* Twitter */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-[400] text-[#CACACA]">Twitter</h3>
            {profile?.twitterHandle ? (
              <div className="space-y-2">
                <p className="text-white text-[13px]">
                  @{profile.twitterHandle}
                </p>
                {/* <Input
                  value={twitterInput}
                  onChange={(e) => setTwitterInput(e.target.value)}
                  className="bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-10"
                  placeholder="Update Twitter handle"
                /> */}
                <Button
                  onClick={handleTwitterConnect}
                  disabled={twitterLoading}
                  className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                  {twitterLoading ? "Updating..." : "Update Twitter"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* <Input
                  value={twitterInput}
                  onChange={(e) => setTwitterInput(e.target.value)}
                  className="bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-10"
                  placeholder="Enter Twitter handle"
                /> */}
                <Button
                  onClick={handleTwitterConnect}
                  disabled={twitterLoading}
                  className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                  {twitterLoading ? "Connecting..." : "Connect Twitter"}
                </Button>
              </div>
            )}
            {messages.twitter && (
              <p
                className={`text-[12px] ${
                  messages.twitter.includes("✅")
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                {messages.twitter}
              </p>
            )}
          </div>

          {/* Discord */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-[400] text-[#CACACA]">Discord</h3>
            {profile?.discordHandle ? (
              <div className="space-y-2">
                <p className="text-white text-[13px]">
                  {profile.discordHandle}
                </p>
                {/* <Input
                  value={discordInput}
                  onChange={(e) => setDiscordInput(e.target.value)}
                  className="bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-10"
                  placeholder="Update Discord handle"
                /> */}
                <Button
                  onClick={handleDiscordConnect}
                  disabled={discordLoading}
                  className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                  {discordLoading ? "Updating..." : "Update Discord"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* <Input
                  value={discordInput}
                  onChange={(e) => setDiscordInput(e.target.value)}
                  className="bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-10"
                  placeholder="Enter Discord handle"
                /> */}
                <Button
                  onClick={handleDiscordConnect}
                  disabled={discordLoading}
                  className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                  {discordLoading ? "Connecting..." : "Connect Discord"}
                </Button>
              </div>
            )}
            {messages.discord && (
              <p
                className={`text-[12px] ${
                  messages.discord.includes("✅")
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                {messages.discord}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-[#FFFFFF21] -mx-8">
          {/* Save Changes Button */}
          <div className="flex justify-end mx-4 pt-6">
            <Button
              disabled={
                loading ||
                emailLoading ||
                twitterLoading ||
                discordLoading ||
                verificationLoading
              }
              className="bg-[#FFFFFFE5] hover:bg-gray-100 text-black rounded-full px-8 py-3 font-medium">
              {loading ? "Loading..." : "Save changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
