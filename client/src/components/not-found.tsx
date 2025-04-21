import MemoLogo from "@/icons/Logo";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
// import LottieAnimation from "./LottieAnimation";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <div className="flex flex-col items-center py-10 min-h-screen bg-black text-white px-4">
      <div className="flex flex-col items-center max-w-[50rem] w-full">
        {/* Logo */}
        <div className="mb-24 sm:mb-2">
          <div className="flex items-center">
            <MemoLogo className="w-40 h-10" />
          </div>
        </div>

        {/* Illustration */}
        {/* <div>
          <LottieAnimation />
        </div> */}

        {/* Error Message */}
        <h1 className="text-base md:text-4xl font-normal text-[#F1F1F1] text-center mb-6">
          Uh-oh! This page took a wrong turn at block 404
        </h1>

        {/* Subtext */}
        <p className="text-center text-[#CACACA] mb-10">
          Looks like the crypto gremlins hid what you were looking for.
          <br />
          But don’t worry — your assets are still safely stored in the vault.
        </p>

        {/* Return Button */}
        <Button
          onClick={handleGoBack}
          className="bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-[#010104] font-medium py-6 px-8 rounded-full transition-colors">
          Return to home page
        </Button>
      </div>
    </div>
  );
}
