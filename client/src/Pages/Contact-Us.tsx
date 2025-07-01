import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mgvydlna", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      } else {
        throw new Error("Failed to send message");
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white p-8 md:p-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-light">Thank you!</h2>
          <p className="text-gray-300">
            Your message has been sent successfully. We'll get back to you soon!
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 h-auto">
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white  mt-20 p-8 md:p-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-1 gap-12 md:gap-16 items-start">
            <div className="grid md:grid-cols-2 gap-12  items-end">
              {/* Left side - Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl bg-gradient-to-r from-[#F1F1F1] to-[#8B8B8B] bg-clip-text text-transparent font-[500] md:text-5xl  leading-tight">
                  Have something to share with us?
                </h1>
              </div>

              {/* Right side - Form */}
              <div className="space-y-8">
                <p className="text-base text-[#CACACA]">
                  Send us a message, and we will get back to you!
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nwamaka"
                    className="bg-transparent border-[#FFFFFF3D] border-2 text-white placeholder:text-gray-400 focus:border-gray-400 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-gray-300">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="akah.nwamaka.d@gmail.com"
                    className="bg-transparent border-[#FFFFFF3D] border-2 text-white placeholder:text-gray-400 focus:border-[#FFFFFF3D] h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm text-gray-300">
                    Your message to us
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="akah.nwamaka.d@gmail.com"
                    className="bg-transparent border-[#FFFFFF3D] border-2 text-white placeholder:text-gray-400 focus:border-[#FFFFFF3D] min-h-32 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FFFFFFE5] rounded-[2rem] text-black hover:bg-gray-200 px-8 py-3 h-auto disabled:disabled:opacity-50">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
