"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useActiveAccount } from "thirdweb/react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  updateEmailApi,
  verifyEmailApi,
  updateNotificationPreferences,
  getNotificationProfile,
  UserProfile,
} from "../api/profileApi";
import { useEffect, useState } from "react";

// Define an interface for local state of notification preferences
interface LocalNotificationPreferences {
  deposit: boolean;
  withdrawal: boolean;
  safeMaturing: boolean;
  [key: string]: boolean;
}

export default function ProfilePage() {
  const account = useActiveAccount();
  const address = account?.address || ""; 

  const location = useLocation();
  const navigate = useNavigate();

  // --- State for User Profile Data ---
  const [email, setEmail] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<LocalNotificationPreferences>({
    deposit: true,
    withdrawal: true,
    safeMaturing: true,
  });

  // --- State for UI Feedback ---
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false); 

  // --- Effect Hook for Initial Profile Load ---
  useEffect(() => {
    const fetchAndVerifyUserData = async () => {
      if (!address) {
        setMessage("Please connect your wallet to manage your profile.");
        setProfileLoaded(true);
        return;
      }

      setLoading(true);
      setMessage("");

      // Parse query parameters from the URL
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token");
      const emailFromUrl = queryParams.get("email");
      let verificationMessage = "";

      // Check if this is an email verification attempt from the URL
      if (token && emailFromUrl) {
        try {
          const verifyResponse = await verifyEmailApi(token, emailFromUrl);
          if (verifyResponse.success) {
            verificationMessage = verifyResponse.message;
            // Optimistically update, will be confirmed by getNotificationProfile below
            setEmailVerified(true);
          } else {
            verificationMessage = `Verification failed: ${verifyResponse.message}`;
          }
        } catch (err: any) {
          verificationMessage = `Error during verification: ${
            err.message || err
          }`;
          console.error("Frontend verification error:", err);
        } finally {
          // Clean up URL parameters after processing
          const newSearchParams = new URLSearchParams(queryParams.toString());
          newSearchParams.delete("token");
          newSearchParams.delete("email");
          navigate(`${location.pathname}?${newSearchParams.toString()}`, {
            replace: true,
          });
        }
      }

      // fetch the latest profile data
      try {
        const userData: UserProfile | null = await getNotificationProfile(
          address
        );
        if (userData) {
          setEmail(userData.email || "");
          setEmailVerified(userData.emailVerified);
          setPreferences({
            ...preferences,
            ...userData.notificationPreferences,
          });

          if (verificationMessage) {
            setMessage(verificationMessage); // Prioritize verification message from URL
          } else if (userData.email && !userData.emailVerified) {
            setMessage(
              "Your email is linked but not verified. Please check your inbox."
            );
          } else if (userData.emailVerified) {
            setMessage("Your email is verified!");
          }
        } else {
          setEmail("");
          setEmailVerified(false);
          setPreferences({
            deposit: true,
            withdrawal: true,
            safeMaturing: true,
          });
          setMessage(
            verificationMessage ||
              "No profile found. Please link your email to get started!"
          );
        }
      } catch (err: any) {
        setMessage(`Error loading profile: ${err.message || err}`);
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
        setProfileLoaded(true);
      }
    };

    fetchAndVerifyUserData();

  }, [address, location.search, navigate]);

  // --- Handlers for Email,  ---

  const handleEmailConnect = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission and page reload
    if (!address) {
      setMessage("Please connect your wallet.");
      return;
    }
    if (!email) {
      setMessage("Email address cannot be empty.");
      return;
    }

    setLoading(true);
    setMessage(""); // Clear previous messages
    try {
      const response = await updateEmailApi({ walletAddress: address, email });
      setMessage(response.message);
      setEmailVerified(false); // Email needs re-verification after update
    } catch (err: any) {
      setMessage(`Error connecting email: ${err}`);
      console.error("Email update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for the main "Save Changes" button (applies to preferences)
  const handleSaveChanges = async () => {
    if (!address) {
      setMessage("Please connect your wallet.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await updateNotificationPreferences({
        walletAddress: address,
        preferences,
      });
      setMessage(response.message);
      // Backend should return the updated preferences, update local state with those
      setPreferences(response.preferences || preferences);
    } catch (err: any) {
      setMessage(`Error saving changes: ${err}`);
      console.error("Preferences update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Conditional Rendering ---
  // Show a loading message if profile data is being fetched for the first time
  if (loading && !profileLoaded) {
    return (
      <div className="min-h bg-transparent flex items-center justify-center p-4">
        <Card className="w-full max-w-xl bg-transparent border-[#FFFFFF21] rounded-3xl p-8 space-y-6 text-white text-center">
          <p>Loading your profile settings...</p>
        </Card>
      </div>
    );
  }

  // Show a prompt if no wallet is connected
  if (!address && profileLoaded) {
    // Only show this if we've tried to load and found no address
    return (
      <div className="min-h bg-transparent flex items-center justify-center p-4">
        <Card className="w-full max-w-xl bg-transparent border-[#FFFFFF21] rounded-3xl p-8 space-y-6 text-white text-center">
          <p>Please connect your wallet to view and manage your profile.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-transparent border-[#FFFFFF21] rounded-3xl p-8 space-y-6">
        {/* Header */}
        <div className="">
          <h1 className="text-[15px]font-medium text-[#F1F1F1]">My profile</h1>
        </div>
        <div className="border-b border-[#FFFFFF21] -mx-8 mb-8"></div>

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
            <h3 className="text-[14px] font-[400] text-[#CACACA] uppercase ">
              EMAIL ADDRESS
            </h3>
            <p className="text-gray-400 text-[13px]">
              Link an active email address to get notified of your savings
              activities
            </p>
          </div>
          <form onSubmit={handleEmailConnect} className="relative">
            <Input
              className="flex-1 bg-transparent border-[#FFFFFF21] text-white placeholder:text-gray-500 rounded-xl h-12 pr-24"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-lg px-4 h-8 text-sm">
              Connect
            </Button>
          </form>
          {message && (
            <p
              className={`text-center text-sm ${
                message.includes("Error")
                  ? "text-red-400"
                  : emailVerified
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}>
              {message}
            </p>
          )}
          {email && (
            <p
              className={`text-[12px] mt-2 ${
                emailVerified ? "text-green-400" : "text-yellow-400"
              }`}>
              Email: {email}{" "}
              {emailVerified ? "(Verified)" : "(Pending Verification)"}
            </p>
          )}
        </div>

        {/* Divider after email section */}
        <div className=""></div>

        {/* Socials Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-[14px] font-[400] text-[#CACACA] uppercase ">
            SOCIALS
          </h2>

          {/* Twitter */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-[400] text-[#CACACA]">Twitter</h3>
            <Button className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
              Connect twitter
            </Button>
          </div>

          {/* Discord */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-[400] text-[#CACACA]">Discord</h3>
            <Button className="bg-[#3F3F3F99] hover:bg-[#3F3F3F99] text-[#F1F1F1] rounded-full px-6 py-2 h-auto">
              Connect discord
            </Button>
          </div>
        </div>

        <div className="border-t border-[#FFFFFF21] -mx-8 ">
          {/* Save Changes Button */}
          <div className="flex justify-end mx-4  pt-6">
            <Button
              onClick={handleSaveChanges}
              disabled={loading}
              className="bg-[#FFFFFFE5] hover:bg-gray-100 text-black rounded-full px-8 py-3 font-medium">
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
