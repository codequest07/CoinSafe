"use client";

import { useState, useEffect } from "react";
import { Country } from "country-state-city";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialFormData = {
  name: "",
  email: "",
  country: "",
};

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success!",
        description: "You've been added to the waitlist.",
        duration: 5000,
      });
    }
  }, [isSuccess, toast]);

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

  const resetForm = () => {
    setFormData(initialFormData);
    setEmailError("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after a short delay to allow the closing animation
    setTimeout(() => {
      resetForm();
      setIsSuccess(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(formData.email)) {
      setIsSubmitting(true);
      try {
        const response = await fetch(
          "https://coinsafe-0q0m.onrender.com/api/waitlist",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          setIsSuccess(true);
          resetForm();
        } else {
          throw new Error("Form submission failed");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to join the waitlist. Please try again.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setEmailError("Please enter a valid email address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#17171C] border-0 text-white max-w-[370px] sm:max-w-[480px]">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              Thank you for joining the waitlist!
            </h2>
            <div className="w-16 h-16 mb-6">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#4ADE80]">
                <rect width="64" height="64" rx="32" fill="currentColor" />
                <path
                  d="M41.5 27.5C41.5 35.5 35.5 42.5 27.5 42.5C19.5 42.5 13.5 35.5 13.5 27.5C13.5 19.5 19.5 13.5 27.5 13.5"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M27.5 21.5C27.5 21.5 27.5 27.5 27.5 27.5C27.5 27.5 47.5 27.5 47.5 27.5"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-gray-400 max-w-[80%]">
              We'll notify you as soon as Coinsafe is ready for you to start
              saving and earning with ease. In the meantime, feel free to share
              the waitlist with friends and family—let's build a smarter way to
              save together!
            </p>
            <Button
              onClick={handleClose}
              className="mt-6 bg-white hover:bg-white text-black rounded-[2rem]">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">
                Join our waitlist
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Be the first to experience Coinsafe! Sign up now to secure your
                spot and get early access to tools that make saving simple,
                secure, and rewarding.
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
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm text-gray-400">
                  Country
                </label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, country: value }))
                  }>
                  <SelectTrigger className="bg-[#262628] border-0 text-white">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Country.getAllCountries().map((country) => (
                      <SelectItem key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="bg-[#262628] hover:bg-[#262628] text-white hover:text-white border-0 rounded-[2rem]">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-white hover:bg-white text-black rounded-[2rem]"
                  disabled={
                    !formData.name ||
                    !formData.email ||
                    !formData.country ||
                    !!emailError ||
                    isSubmitting
                  }>
                  {isSubmitting ? "Submitting..." : "Join waitlist"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
