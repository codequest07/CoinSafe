"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData((prev) => ({ ...prev, email }));
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(formData.email)) {
      // Handle form submission here
      console.log("Form submitted:", formData);
      onOpenChange(false);
    } else {
      setEmailError("Please enter a valid email address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#17171C] border-0 text-white max-w-[370px] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Join our waitlist
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Be the first to experience Coinsafe! Sign up now to secure your spot
            and get early access to tools that make saving simple, secure, and
            rewarding.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-gray-400">
              Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-[#262628] border-0 text-white placeholder:text-gray-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-gray-400">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              className={`bg-[#262628] border-0 text-white placeholder:text-gray-500 ${
                emailError ? "border-red-500" : ""
              }`}
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-[#262628] hover:bg-[#262628] text-white hover:text-white border-0 rounded-[2rem]">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white hover:bg-white text-black rounded-[2rem]"
              disabled={!formData.name || !formData.email || !!emailError}>
              Join waitlist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
