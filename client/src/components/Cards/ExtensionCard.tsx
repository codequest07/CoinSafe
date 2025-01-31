import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import MemoChrome from "@/icons/Chrome";
import MemoChromeMagic from "@/icons/ChromeMagic";
import SaveSenseResp from "../Modals/SaveSenseResp";
import Loading from "../Modals/loading-screen";
import { useAccount } from "wagmi";
import KitchenLoading from "../Modals/kitchen-loading";
import { PermissionModal } from "../Modals/Permission-modal";
import { Toast } from "../ui/toast";

interface ExtensionCardProps {
  title: string;
  desc: string;
  btnTitle: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onButtonClick?: () => void;
  setShowKitchenLoading: (show: boolean) => void;
}

const ExtensionCard: React.FC<ExtensionCardProps> = ({
  title,
  desc,
  btnTitle,
  icon: Icon,
  onButtonClick,
  setShowKitchenLoading,
}) => {
  const handleClick = () => {
    if (btnTitle === "Get started") {
      onButtonClick?.();
    } else if (btnTitle === "Download") {
      setShowKitchenLoading(true);
      // Simulate download process
      setTimeout(() => {
        setShowKitchenLoading(false);
        // Here you would typically initiate the actual download
        console.log("Download completed");
      }, 3000); // Simulating a 3-second download
    }
  };

  return (
    <Card className="flex flex-col items-center border-0 justify-between bg-[#092324] text-white p-2 rounded-lg shadow-lg">
      <CardHeader className="flex items-center justify-center">
        {Icon && <Icon className="w-16 h-16" />}
      </CardHeader>
      <CardContent className="p-2 pt-0 md:p-4 md:pt-0 text-center space-y-4">
        <h2 className="text-base font-[500]">{title}</h2>
        <p className="text-[#F1F1F1] text-xs">{desc}</p>
        <button
          className="bg-white text-[#010104] font-[500] py-2 px-6 rounded-full"
          aria-label={btnTitle}
          onClick={handleClick}>
          {btnTitle}
        </button>
      </CardContent>
    </Card>
  );
};

export const extensionCardData = [
  {
    title: "Even more seamless",
    desc: "Get our extension for more seamless saving while you spend",
    btnTitle: "Download",
    icon: () => <MemoChrome className="w-16 h-16 " />,
  },
  {
    title: "Saving just got smarter",
    desc: "Our AI analyzes your past transactions to tailor the perfect savings plan just for you",
    btnTitle: "Get started",
    icon: () => <MemoChromeMagic className="w-16 h-16 " />,
  },
];

export default function ExtensionCardCarousel({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [showKitchenLoading, setShowKitchenLoading] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isSaveSenseModalOpen, setIsSaveSenseModalOpen] = useState(false);
  const [saveSenseData, setSaveSenseData] = useState(null);

  const { address } = useAccount();
  const scrollNext = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    const timer = setInterval(scrollNext, 4000); // Change slide every 4 seconds
    return () => clearInterval(timer);
  }, [scrollNext]);

  const handleGetStarted = () => {
    if (!address) {
      console.error("No wallet connected");
      return;
    }
    setIsPermissionModalOpen(true);
  };

  const handlePermissionApprove = async () => {
    setIsPermissionModalOpen(false);
    setIsLoadingModalOpen(true);

    try {
      const response = await fetch(
        `https://coinsafe-0q0m.onrender.com/main/${address}`
        // `http://localhost:1234/main/${address}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setSaveSenseData(data);
      setIsLoadingModalOpen(false);
      setIsSaveSenseModalOpen(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoadingModalOpen(false);
      Toast({
        title: "Failed to fetch data",
        variant: "destructive",
        // description: "Please try again later",
      });
    }
  };

  const handlePermissionReject = () => {
    setIsPermissionModalOpen(false);
    onClose?.();
  };
  const closeSaveSenseModal = () => setIsSaveSenseModalOpen(false);

  return (
    <div className="flex flex-col items-center">
      <Carousel
        setApi={setApi}
        className="w-full max-w-xs"
        opts={{
          loop: true, // Enable looping
        }}>
        <CarouselContent>
          {extensionCardData.map((card, index) => (
            <CarouselItem key={index}>
              <ExtensionCard
                {...card}
                onButtonClick={
                  card.btnTitle === "Get started" ? handleGetStarted : undefined
                }
                setShowKitchenLoading={setShowKitchenLoading}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex justify-center mt-2 space-x-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === current ? "bg-emerald-400" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onApprove={handlePermissionApprove}
        onReject={handlePermissionReject}
      />
      <Loading
        isOpen={isLoadingModalOpen}
        onClose={() => setIsLoadingModalOpen(false)}
      />
      <SaveSenseResp
        isOpen={isSaveSenseModalOpen}
        onClose={closeSaveSenseModal}
        data={saveSenseData}
      />
      <KitchenLoading
        isOpen={showKitchenLoading}
        onClose={() => setShowKitchenLoading(false)}
      />
    </div>
  );
}
