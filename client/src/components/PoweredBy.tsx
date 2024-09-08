import { useNavigate } from "react-router-dom";

const PoweredBy = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center px-4 sm:px-6 md:px-8 lg:px-16">
      <div className="flex flex-col items-center pt-12 md:pt-[100px] text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl text-[#F1F1F1]">
          Built on trust, powered by security
        </h1>
        <p className="text-[#CACACA] text-base md:text-md lg:text-lg max-w-[550px] pt-4 md:pt-6">
          Your savings are protected by blockchain technology, ensuring every
          transaction is secure and transparent. With no middlemen and full
          visibility.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-8 md:pt-10">
          <button
            onClick={() => navigate("/extension")}
            className="bg-[#1E1E1E99] text-[#F1F1F1] px-5 py-2 sm:px-8 sm:py-3 rounded-full">
            Download extension
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#FFFFFFE5] text-[#010104] px-5 py-2 sm:px-8 sm:py-3 rounded-full">
            Launch app
          </button>
        </div>
      </div>

      <div className="pt-8 md:pt-12 overflow-hidden flex justify-center w-full">
        <img
          src="/assets/galaxy.svg"
          alt="Galaxy"
          className="w-full max-w-[550px] animate-spinEarth"
        />
      </div>
    </div>
  );
};

export default PoweredBy;
