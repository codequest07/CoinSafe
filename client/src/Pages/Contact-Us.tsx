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

      <div className="min-h-screen bg-black text-white mt-20 p-8 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col max-w-2xl mx-auto items-center justify-center space-y-8">
            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#F1F1F1]">
                HAVE SOMETHING TO SHARE WITH US?
              </h1>
              <p className="text-base md:text-[20px] font-[200] text-white">
                Send us a message, and we will get back to you!
              </p>
            </div>

            {/* Form */}
            <div className="w-full max-w-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nwamaka"
                    className="bg-transparent border-[#FFFFFF3D] border text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-white">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="akah.nwamaka.d@gmail.com"
                    className="bg-transparent border-[#FFFFFF3D] border text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm text-white">
                    Your message to us
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="I have a question about the app..."
                    name="message"
                    className="bg-transparent border-[#FFFFFF3D] border text-white min-h-32 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#CACACA] rounded-full text-black hover:bg-gray-300 px-8 py-3 h-auto w-full md:w-auto disabled:opacity-50">
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
