"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { X } from 'lucide-react';
import { useActiveAccount } from "thirdweb/react";
import { useProfile } from "../hooks/useProfile";
import { profileAPI } from "../services/api";
import ConnectModal from "@/components/Modals/ConnectModal";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const address = account?.address || "";
  const {
    profile,
    loading,
    error,
    updateEmail,
    // updateTwitter,
    // updateDiscord,
    refetch,
  } = useProfile(address);

  // Form states
  const [emailInput, setEmailInput] = useState("");
  // const [twitterInput, setTwitterInput] = useState("");
  // const [discordInput, setDiscordInput] = useState("");

  // Edit states
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  // const [isEditingTwitter, setIsEditingTwitter] = useState(false);
  // const [isEditingDiscord, setIsEditingDiscord] = useState(false);

  // Loading states for individual actions
  const [emailLoading, setEmailLoading] = useState(false);
  // const [twitterLoading, setTwitterLoading] = useState(false);
  // const [discordLoading, setDiscordLoading] = useState(false);

  // Verification state
  const [verificationLoading, setVerificationLoading] = useState(false);
  const verificationProcessed = useRef(false); // Prevent duplicate verification calls
  const [openConnectModal, setOpenConnectModal] = useState(false);

  // Success/error messages
  const [messages, setMessages] = useState<{
    email?: string;
    twitter?: string;
    discord?: string;
    verification?: string;
  }>({});

  // Open connect modal if wallet is not connected
  useEffect(() => {
    if (!account?.address) {
      setOpenConnectModal(true);
    } else {
      setOpenConnectModal(false);
    }
  }, [account?.address]);

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
  }, [refetch]);

  // Update form inputs when profile data loads
  useEffect(() => {
    if (profile) {
      setEmailInput(profile.email || "");
      // setTwitterInput(profile.twitterHandle || "");
      // setDiscordInput(profile.discordHandle || "");
    }
  }, [profile]);

  const handleEmailConnect = async () => {
    if (!emailInput.trim()) return;

    setEmailLoading(true);
    setMessages((prev) => ({ ...prev, email: undefined }));

    try {
      const response = await updateEmail(emailInput);
      setMessages((prev) => ({ ...prev, email: "✅ " + response.message }));
      setIsEditingEmail(false); // Close edit mode after successful update
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

  // const handleTwitterConnect = async () => {
  //   setTwitterLoading(true);
  //   setMessages((prev) => ({ ...prev, twitter: undefined }));
  //   try {
  //     const response = await updateTwitter(twitterInput);
  //     setMessages((prev) => ({ ...prev, twitter: "✅ " + response.message }));
  //     setIsEditingTwitter(false);
  //   } catch (err) {
  //     setMessages((prev) => ({
  //       ...prev,
  //       twitter:
  //         "❌ " +
  //         (err instanceof Error ? err.message : "Failed to update Twitter"),
  //     }));
  //   } finally {
  //     setTwitterLoading(false);
  //   }
  // };

  // const handleDiscordConnect = async () => {
  //   setDiscordLoading(true);
  //   setMessages((prev) => ({ ...prev, discord: undefined }));
  //   try {
  //     const response = await updateDiscord(discordInput);
  //     setMessages((prev) => ({ ...prev, discord: "✅ " + response.message }));
  //     setIsEditingDiscord(false);
  //   } catch (err) {
  //     setMessages((prev) => ({
  //       ...prev,
  //       discord:
  //         "❌ " +
  //         (err instanceof Error ? err.message : "Failed to update Discord"),
  //     }));
  //   } finally {
  //     setDiscordLoading(false);
  //   }
  // };

  // Show connect modal if no wallet connected
  if (openConnectModal) {
    return (
      <ConnectModal
        isConnectModalOpen={openConnectModal}
        setIsConnectModalOpen={setOpenConnectModal}
      />
    );
  }

  return (
    <div className="min-h bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-transparent border-[#FFFFFF21] rounded-3xl p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="text-white" size={20} />
          </button>
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
          <div className="space-y-6">
            {/* Connected Wallet Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-32 bg-[#FFFFFF21]" />
              <Skeleton className="h-5 w-full bg-[#FFFFFF21]" />
            </div>

            {/* Email Address Skeleton */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 bg-[#FFFFFF21]" />
                <Skeleton className="h-4 w-20 bg-[#FFFFFF21]" />
              </div>
              <Skeleton className="h-4 w-3/4 bg-[#FFFFFF21]" />
              <div className="relative">
                <Skeleton className="h-12 w-full rounded-xl bg-[#FFFFFF21]" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Connected Wallet Section */}
            <div className="space-y-4">
              <h2 className="text-[14px] font-[400] text-[#CACACA]">
                Connected wallet
              </h2>
              <p className="text-white font-mono text-[14px]">{address}</p>
            </div>

            {/* Email Address Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[14px] font-[400] text-[#CACACA] uppercase">
                  EMAIL ADDRESS
                </h3>
                {profile?.emailVerified &&
                  profile?.email &&
                  !isEditingEmail && (
                    <Button
                      onClick={() => setIsEditingEmail(true)}
                      className="text-[#79E7BA] hover:text-white text-[13px] bg-transparent hover:bg-transparent p-0 h-auto">
                      Change email
                    </Button>
                  )}
              </div>

              <p className="text-gray-400 text-[13px]">
                Link an active email address to get notified of your savings
                activities
              </p>

              {/* Show verified email display when email is verified and not editing */}
              {profile?.emailVerified && profile?.email && !isEditingEmail ? (
                <div className="flex w-fit items-center justify-between bg-[#3F3F3F99] rounded-[2rem] p-2">
                  <div className="">
                    <span className="text-white text-[14px]">
                      {profile.email}
                    </span>
                  </div>
                </div>
              ) : (
                /* Show input field when no email, not verified, or editing */
                <>
                  {profile?.email && profile?.emailVerified !== true && (
                    <p className="text-yellow-400 text-[12px] flex items-center gap-1">
                      ⚠ Email pending verification
                    </p>
                  )}

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
                        emailLoading ||
                        !emailInput.trim() ||
                        verificationLoading
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-lg px-4 h-8 text-sm">
                      {emailLoading
                        ? "..."
                        : isEditingEmail
                        ? "Update"
                        : "Connect"}
                    </Button>
                  </div>

                  {isEditingEmail && (
                    <Button
                      onClick={() => {
                        setIsEditingEmail(false);
                        setEmailInput(profile?.email || "");
                      }}
                      className="text-[#CACACA] hover:text-white text-[12px] bg-transparent hover:bg-transparent p-0 h-auto underline">
                      Cancel
                    </Button>
                  )}
                </>
              )}

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
          </>
        )}

        {/* Socials Section */}
        {/*   <div className="space-y-4 pt-2">
          <h2 className="text-[14px] font-[400] text-[#CACACA] uppercase">
            SOCIALS
          </h2>
          {/* Twitter */}
        {/* <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-[400] text-[#CACACA]">Twitter</h3>
              {profile?.twitterHandle && !isEditingTwitter && (
                <Button
                  onClick={() => setIsEditingTwitter(true)}
                  className="text-[#CACACA] hover:text-white text-[12px] bg-transparent hover:bg-transparent p-0 h-auto underline">
                  Change
                </Button>
              )}
            </div> */}

        {/* {profile?.twitterHandle && !isEditingTwitter ? (
              <div className="flex items-center justify-between bg-[#1A1A1A] border border-[#FFFFFF21] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <X className="w-4 h-4 text-[#CACACA]" />
                  <span className="text-white text-[14px]">
                    @{profile.twitterHandle}
                  </span>
                </div>
                <Button
                  onClick={() => setIsEditingTwitter(true)}
                  className="text-[#CACACA] hover:text-red-400 bg-transparent hover:bg-transparent p-1 h-auto">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2"> */}

        {/* <Input
                  value={twitterInput}
                  onChange={(e) => setTwitterInput(e.target.value)}
                  className="bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-10"
                  placeholder="Enter Twitter handle"
                /> */}

        {/* <div className="flex gap-2"> */}

        {/* <Button
                    onClick={handleTwitterConnect}
                    disabled={twitterLoading}
                    className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                    {twitterLoading
                      ? "Updating..."
                      : profile?.twitterHandle
                      ? "Update Twitter"
                      : "Connect Twitter"}
                  </Button> */}

        {/* <Button
                    onClick={handleTwitterConnect}
                    disabled={twitterLoading}
                    className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                    Connect Twitter
                  </Button>
                  {isEditingTwitter && (
                    <Button
                      onClick={() => {
                        setIsEditingTwitter(false);
                        setTwitterInput(profile?.twitterHandle || "");
                      }}
                      className="text-[#CACACA] hover:text-white bg-transparent hover:bg-transparent px-4 py-2 h-auto">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )} */}

        {/* {messages.twitter && (
              <p
                className={`text-[12px] ${
                  messages.twitter.includes("✅")
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                {messages.twitter}
              </p>
            )} */}

        {/* </div> */}

        {/* Discord */}
        {/* <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-[400] text-[#CACACA]">Discord</h3>
              {profile?.discordHandle && !isEditingDiscord && (
                <Button
                  onClick={() => setIsEditingDiscord(true)}
                  className="text-[#CACACA] hover:text-white text-[12px] bg-transparent hover:bg-transparent p-0 h-auto underline">
                  Change
                </Button>
              )}
            </div> */}

        {/* {profile?.discordHandle && !isEditingDiscord ? (
              <div className="flex items-center justify-between bg-[#1A1A1A] border border-[#FFFFFF21] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <X className="w-4 h-4 text-[#CACACA]" />
                  <span className="text-white text-[14px]">
                    {profile.discordHandle}
                  </span>
                </div>
                <Button
                  onClick={() => setIsEditingDiscord(true)}
                  className="text-[#CACACA] hover:text-red-400 bg-transparent hover:bg-transparent p-1 h-auto">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2"> */}

        {/* <Input
                  value={discordInput}
                  onChange={(e) => setDiscordInput(e.target.value)}
                  className="bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-10"
                  placeholder="Enter Discord handle"
                /> */}

        {/* <div className="flex gap-2"> */}

        {/* <Button
                    onClick={handleDiscordConnect}
                    disabled={discordLoading}
                    className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                    {discordLoading
                      ? "Updating..."
                      : profile?.discordHandle
                      ? "Update Discord"
                      : "Connect Discord"}
                  </Button> */}

        {/* <Button className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
                    Connect Discord
                  </Button>
                  {isEditingDiscord && (
                    <Button
                      onClick={() => {
                        setIsEditingDiscord(false);
                        setDiscordInput(profile?.discordHandle || "");
                      }}
                      className="text-[#CACACA] hover:text-white bg-transparent hover:bg-transparent px-4 py-2 h-auto">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )} */}

        {/* {messages.discord && (
              <p
                className={`text-[12px] ${
                  messages.discord.includes("✅")
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                {messages.discord}
              </p>
            )} */}

        {/* </div> */}
        {/* </div> */}

        {/* <div className="border-t border-[#FFFFFF21] -mx-8"> */}
        {/* Save Changes Button */}
        {/* <div className="flex justify-end mx-4 pt-6"> */}
        {/* <Button
              disabled={
                loading ||
                emailLoading ||
                twitterLoading ||
                discordLoading ||
                verificationLoading
              }
              className="bg-[#FFFFFFE5] hover:bg-gray-100 text-black rounded-full px-8 py-3 font-medium">
              {loading ? "Loading..." : "Save changes"}
            </Button> */}
        {/* </div> */}
        {/* </div> */}
      </Card>
    </div>
  );
}
