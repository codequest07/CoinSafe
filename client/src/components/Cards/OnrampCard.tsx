import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { API_BASE_URL } from "@/lib/api-config";
import { base } from "@/lib/config";

const allCurrencies = [
    { code: "USDT", label: "Tether" },
    { code: "USDC", label: "USD Coin" },
];

export default function OnrampCard() {
    const navigate = useNavigate();
    const account = useActiveAccount();
    const activeChain = useActiveWalletChain();

    const [amount, setAmount] = useState<string>("");
    const [selectedCurrency, setSelectedCurrency] = useState("USDT");
    const [token, setToken] = useState("");
    const [isFetchingToken, setIsFetchingToken] = useState(true);

    // Determine Fonbnk network based on active chain
    const isBase = activeChain?.id === base.id;
    const fonbnkNetwork = isBase ? "BASE" : "LISK";

    // Base only supports USDC; Lisk supports both
    const currencies = isBase
        ? allCurrencies.filter((c) => c.code === "USDC")
        : allCurrencies;

    // Reset to USDC if switching to Base while USDT is selected
    useEffect(() => {
        if (isBase && selectedCurrency === "USDT") {
            setSelectedCurrency("USDC");
        }
    }, [isBase, selectedCurrency]);

    useEffect(() => {
        setIsFetchingToken(true);
        fetch(`${API_BASE_URL}/fonbnk/generate-signature`)
            .then((res) => res.json())
            .then((data) => setToken(data?.data?.signature ?? ""))
            .catch((err) => console.error("Error fetching Fonbnk signature:", err))
            .finally(() => setIsFetchingToken(false));
    }, []);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handleClear = () => setAmount("");

    const fonbnkUrl =
        !amount || !token
            ? "#"
            : `https://pay.fonbnk.com/auth?source=o9VjcneL&network=${fonbnkNetwork}&asset=${selectedCurrency}&amount=${amount}&currency=crypto&paymentChannel=bank&countryIsoCode=NG&address=${account?.address}&signature=${token}`;

    const canProceed = !!amount && parseFloat(amount) > 0 && !!token;

    return (
        <main className="min-h-screen md:min-h-fit flex items-start md:items-center justify-center md:justify-center p-4 pt-8 md:pt-4">
            <div className="w-full max-w-md md:max-w-[600px] border-0 md:p-6 rounded-[12px] text-white md:bg-[#1D1D1D73]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <button className="rounded-full" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-medium">On-ramp</h1>
                </div>

                {/* Network badge */}
                <div className="mb-4">
                    <span className="text-xs text-gray-400 bg-[#FFFFFF10] border border-[#FFFFFF21] rounded-full px-3 py-1">
                        Network:{" "}
                        <span className="text-white font-medium">{fonbnkNetwork}</span>
                    </span>
                </div>

                {/* Amount + currency input */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Amount to On-ramp</label>
                    <div className="flex items-center justify-between bg-transparent rounded-[8px] border border-[#FFFFFF3D] px-4 py-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                className="text-2xl font-medium bg-transparent border-none outline-none w-full text-white placeholder-gray-600"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            {amount !== "" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClear}
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        className="flex items-center gap-2 border border-[#FFFFFF21] bg-[#1E1E1E99] text-[#F1F1F1] hover:bg-[#2a2a2a] px-3 py-2 text-[14px] rounded-md"
                                    >
                                        {selectedCurrency}
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-32 bg-[#1E1E1E] border-[#FFFFFF21] text-white"
                                >
                                    {currencies.map((currency) => (
                                        <DropdownMenuItem
                                            key={currency.code}
                                            onClick={() => setSelectedCurrency(currency.code)}
                                            className="cursor-pointer hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white"
                                        >
                                            <span className="font-medium">{currency.code}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Info text */}
                <p className="text-xs text-gray-500 mt-3">
                    You will be redirected to Fonbnk to complete your purchase. The funds
                    will be sent to your connected wallet address.
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 mt-8">
                    <Button
                        onClick={() => navigate(-1)}
                        className="px-10 rounded-[2rem] text-[#F1F1F1] bg-[#3F3F3F99] hover:bg-[#3F3F3F99]"
                    >
                        Cancel
                    </Button>

                    <Link
                        to={fonbnkUrl}
                        target={canProceed ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (!canProceed) e.preventDefault();
                        }}
                    >
                        <Button
                            className="bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5]/90 rounded-[100px] border border-[#FFFFFF05] text-[#010104] text-[14px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!canProceed || isFetchingToken}
                        >
                            {isFetchingToken ? "Loading..." : "Proceed to On-ramp"}
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
