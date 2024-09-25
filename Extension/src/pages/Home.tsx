import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MemoLogo from "@/icons/Logo";
import MemoShape from "@/icons/Shape";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-80 flex items-center justify-center bg-gradient-to-br from-teal-900 via-gray-900 to-black relative overflow-hidden">
      {/* Floating shape in background */}
      <div className="absolute bottom-0 flex justify-center w-full">
        <MemoShape className="w-[320px] h-[320px] opacity-75" />
      </div>

      <div className="relative z-10 flex justify-center w-80 p-4 text-white">
        {/* Logo and Title */}
        <div className="flex items-center absolute -top-[10rem] justify-center mb-8 space-x-3">
          <MemoLogo className="w-28 h-16" />
          <div className="w-[2px] h-6 bg-[#FFFFFF17]" />
          <p className="text-xl font-semibold tracking-wide">Whisper</p>
        </div>

        {/* Card Section */}
        <Card className="bg-[#13131340] relative h-60 -top-10 text-white border border-[#FFFFFF17] shadow-lg rounded-xl">
          <CardContent className="flex flex-col items-center text-center p-4 space-y-6">
            <p className="text-xl font-semibold tracking-wide pb-2">Whisper</p>
            {/* Description */}
            <p className="text-sm leading-relaxed text-[#B5B5B5] pb-5 font-light">
              Whisper listens for transactions to make you spend and save
              seamlessly
            </p>

            {/* Button */}
            <Button
              onClick={() => navigate("/setup")}
              variant="outline"
              className="w-full bg-white text-black font-semibold rounded-full py-3 hover:bg-gray-200">
              Set up permissions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
