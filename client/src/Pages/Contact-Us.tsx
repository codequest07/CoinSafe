import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactUs() {
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
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
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
                    placeholder="akah.nwamaka.d@gmail.com"
                    className="bg-transparent border-[#FFFFFF3D] border-2 text-white placeholder:text-gray-400 focus:border-[#FFFFFF3D] min-h-32 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-[#FFFFFFE5] rounded-[2rem] text-black hover:bg-gray-200 px-8 py-3 h-auto">
                  Submit
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
