import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const ClaimBtn = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Button
        onClick={() => navigate("/faucet")}
        className="rounded-[2rem] px-5 sm:px-6 py-1 sm:py-2 leading-tight text-[11px] sm:text-sm bg-[#092324] hover:bg-[#092324] text-[#F1F1F1]">
        Claim faucet
      </Button>
    </div>
  );
};

export default ClaimBtn;
