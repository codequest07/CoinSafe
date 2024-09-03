import MemoChrome from "@/icons/Chrome";
import { Card, CardContent, CardHeader } from "../ui/card";
const ExtensionCard = () => {
  return (
    <div>
      <Card
        x-chunk="dashboard-02-chunk-0"
        className="flex flex-col items-center border-0 justify-center bg-[#092324] text-white p-1 rounded-lg shadow-lg">
        <CardHeader className="flex items-center justify-center">
          <MemoChrome className="w-20 h-20" />
        </CardHeader>
        <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold">Save automatically</p>
            <p className="text-sm">
              Start saving automatically with our all new crowe wallet extension
            </p>
          </div>
          <div className="flex justify-center">
            <button className="bg-white text-black font-semibold py-2 px-6 rounded-full">
              Download
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensionCard;
