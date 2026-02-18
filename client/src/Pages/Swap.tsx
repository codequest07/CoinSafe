import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { tokenData, getTokenDecimals } from "@/lib/token-metadata";
import { useRecoilValue } from "recoil";
import { balancesState, supportedTokensState } from "@/store/atoms/balance";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AmountInput from "@/components/AmountInput";
import { formatUnits } from "viem";
import MemoSwapArrow from "@/icons/SwapArrow";
import { useActiveAccount } from "thirdweb/react";
import { useSwap } from "@/hooks/useSwap";
import { useSwapQuote, SingleHopQuoteParams } from "@/hooks/useSwapQuote";
import { formatSwapQuote, calculateSlippageBps } from "@/lib/swap-utils";
import { toast } from "sonner";
import { useChainConfig } from "@/hooks/useChainConfig";

type TokenOption = {
  address: string;
  symbol: string;
  image?: string;
};

const getTokenOption = (address: string): TokenOption => ({
  address,
  symbol: tokenData?.[address]?.symbol || "Token",
  image: tokenData?.[address]?.image,
});

const Swap = () => {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const supportedTokens = useRecoilValue(supportedTokensState);
  const balances = useRecoilValue(balancesState);
  const { tokens } = useChainConfig();
  const validationErrors = {} as Record<string, string>;

  const tokenOptions = useMemo(
    () =>
      (
        (supportedTokens?.length
          ? supportedTokens
          : Object.keys(tokenData || {})) as string[]
      ).filter((t) => !tokens.lsk || t.toLowerCase() !== tokens.lsk.toLowerCase()),
    [supportedTokens, tokens],
  );

  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [slippage] = useState("0.5");

  // Maintained for AmountInput compatibility
  const [saveState, setSaveState] = useState({
    target: "",
    token: "",
    amount: 0,
    duration: 0,
    typeName: "",
    transactionPercentage: 0,
    frequency: 0,
  });

  useEffect(() => {
    if (!tokenOptions.length) return;

    setFromToken((prev) => prev || tokenOptions[0]);
    setToToken(
      (prev) =>
        prev ||
        tokenOptions[1] ||
        (tokenOptions.length > 1 ? tokenOptions[1] : tokenOptions[0]),
    );
    setSaveState((prev) => ({
      ...prev,
      token: prev.token || tokenOptions[0],
    }));
  }, [tokenOptions]);

  const handleSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handlePercentFill = (percent: number) => {
    const value = ((selectedTokenBalance * percent) / 100).toFixed(6); // Increased precision
    setFromAmount(value);
    setSaveState((prev) => ({
      ...prev,
      amount: Number(value),
    }));
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      setSaveState((prev) => ({
        ...prev,
        amount: value === "" ? 0 : Number(value),
      }));
    }
  };

  const handleTokenSelect = (value: string) => {
    setFromToken(value);
    setSaveState((prev) => ({
      ...prev,
      token: value,
    }));
    if (value === toToken && tokenOptions.length > 1) {
      const fallback = tokenOptions.find((t) => t !== value);
      setToToken(fallback || "");
    }
  };

  const handleToTokenSelect = (value: string) => {
    // prevent both selects from ending on the same token
    if (value === fromToken && tokenOptions.length > 1) {
      const fallback = tokenOptions.find((t) => t !== value);
      if (fallback) {
        setFromToken(fallback);
        setSaveState((prev) => ({ ...prev, token: fallback }));
      }
    }
    setToToken(value);
  };

  // Update selected token balance
  useEffect(() => {
    if (!fromToken) return;
    const available = balances?.available as Record<string, bigint> | undefined;
    if (!available) {
      setSelectedTokenBalance(0);
      return;
    }
    const rawBalance = available[fromToken] || 0n;
    const decimals = getTokenDecimals(fromToken);
    setSelectedTokenBalance(Number(formatUnits(rawBalance, decimals)));
  }, [balances, fromToken]);

  // Hook Setup
  const { swap, isLoading: isSwapLoading } = useSwap({
    account,
    onSuccess: () => {
      setFromAmount("");
      // Add any additional success logic here if needed
    },
    toast,
  });

  const quoteParams: SingleHopQuoteParams | null = useMemo(() => {
    if (
      !fromToken ||
      !toToken ||
      !fromAmount ||
      Number(fromAmount) <= 0 ||
      fromToken === toToken
    )
      return null;

    return {
      tokenIn: fromToken,
      tokenOut: toToken,
      amountIn: fromAmount,
      slippageBps: calculateSlippageBps(Number(slippage)),
    };
  }, [fromToken, toToken, fromAmount, slippage]);

  // Debounce quote params to avoid excessive calls
  const [debouncedParams, setDebouncedParams] =
    useState<SingleHopQuoteParams | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams(quoteParams);
    }, 500);
    return () => clearTimeout(timer);
  }, [quoteParams]);

  const {
    quote,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useSwapQuote(debouncedParams);

  const formattedQuote = useMemo(() => {
    if (!quote) return null;
    return formatSwapQuote(
      quote,
      getTokenDecimals(fromToken),
      getTokenDecimals(toToken),
    );
  }, [quote, fromToken, toToken]);

  const estimatedToAmount = formattedQuote?.expectedAmountOut || "0.00";

  const insufficientBalance =
    Number(fromAmount || 0) > 0 &&
    Number(fromAmount || 0) > selectedTokenBalance;

  const handleSwapClick = async () => {
    if (!fromToken || !toToken) return;

    await swap({
      tokenIn: fromToken,
      tokenOut: toToken,
      amountIn: fromAmount,
      amountOutMin: quote?.minAmountOut || 0n,
    });
  };

  const canSwap =
    !isQuoteLoading &&
    !insufficientBalance &&
    !!fromToken &&
    !!toToken &&
    Number(fromAmount) > 0;

  const renderTokenSelect = (
    value: string,
    onChange: (val: string) => void,
  ) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32 h-12 bg-[#1E1E1E] border border-[#2A2A2A] text-white">
        <div className="flex items-center gap-2">
          {getTokenOption(value)?.image ? (
            <span className="w-5 h-5 rounded-full overflow-hidden">
              <img
                src={getTokenOption(value)?.image}
                alt={getTokenOption(value)?.symbol}
                className="w-full h-full object-cover"
              />
            </span>
          ) : (
            <span className="w-6 h-6 rounded-full bg-[#2C2C2C] flex items-center justify-center text-xs">
              {getTokenOption(value)?.symbol?.slice(0, 2)}
            </span>
          )}
          <span className="text-sm">
            {getTokenOption(value)?.symbol || "Select"}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#0D0D0F] text-white border border-[#1F1F1F]">
        {tokenOptions.map((address) => {
          const option = getTokenOption(address);
          return (
            <SelectItem
              key={address}
              value={address}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                {option.image ? (
                  <span className="w-5 h-5 rounded-full overflow-hidden">
                    <img
                      src={option.image}
                      alt={option.symbol}
                      className="w-full h-full object-cover"
                    />
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#2C2C2C] flex items-center justify-center text-xs">
                    {option.symbol.slice(0, 2)}
                  </span>
                )}
                <span className="text-sm">{option.symbol}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen md:min-h-fit flex md:items-center justify-center md:justify-center bg-[#010104] p-4">
      <div className="w-full max-w-md md:max-w-[600px] rounded-xl md:border-[1px] md:border-[#FFFFFF21] md:bg-[#1D1D1D73] md:p-6 text-white">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-[400]">Swap your assets</h1>
        </div>

        <div className="space-y-2 relative">
          <div
            className={`rounded-[8px] border ${insufficientBalance ? "border-[#FF6B6B]" : "border-[#1E1E1E]"
              } bg-[#111114] p-4 sm:p-5`}
          >
            <div className="flex items-center justify-between text-sm text-[#B5B5B5]">
              <span>Swap from</span>
              <div className="flex items-center gap-2">
                {[25, 50, 75].map((pct) => (
                  <Button
                    key={pct}
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePercentFill(pct)}
                    className="h-8 rounded-full border border-[#2E2E2E] bg-[#1C1C1F] text-xs text-white"
                  >
                    {pct}%
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePercentFill(100)}
                  className="h-8 rounded-full border border-[#2E2E2E] bg-[#1C1C1F] text-xs text-white"
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <AmountInput
                amount={fromAmount}
                handleAmountChange={handleAmountChange}
                handleTokenSelect={handleTokenSelect}
                saveState={{
                  ...saveState,
                  token: fromToken || saveState.token,
                  amount: saveState.amount,
                }}
                selectedTokenBalance={selectedTokenBalance}

                validationErrors={validationErrors}
                supportedTokens={tokenOptions}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-[#8A8A8A]">
                  Wallet balance:{" "}
                  <span className="text-[#E5E5E5]">
                    {selectedTokenBalance.toFixed(4)}{" "}
                    {tokenData[fromToken]?.symbol || ""}
                  </span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs text-[#79E7BA]"
                  onClick={() => {
                    const available = balances?.available as
                      | Record<string, bigint>
                      | undefined;
                    const rawBalance = available?.[fromToken] || 0n;
                    const decimals = getTokenDecimals(fromToken);
                    const formatted = formatUnits(rawBalance, decimals);
                    setFromAmount(formatted);
                    setSaveState((prev) => ({
                      ...prev,
                      amount: Number(formatted),
                    }));
                  }}
                >
                  Max
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex justify-center z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleSwitch}
              className="rounded-[8px] bg-[#1F1F20] border-[4px] border-[#0D0D0F] text-white hover:bg-[#242428]"
            >
              <MemoSwapArrow className="w-5 h-5" />
            </Button>
          </div>

          <div className="rounded-xl mb-4  bg-[#1F1F20] p-4 sm:p-5">
            <div className="flex items-center justify-between text-sm text-[#B5B5B5]">
              <span>Swap to</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1">
                {isQuoteLoading ? (
                  <div className="flex items-center gap-2 text-white/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Calculating...</span>
                  </div>
                ) : (
                  <input
                    value={estimatedToAmount}
                    readOnly
                    className="w-full bg-transparent text-3xl font-semibold text-white outline-none"
                  />
                )}
                {/* <p className="text-xs text-[#7B7B7B] mt-1">≈ $0.00</p> */}
              </div>
              {renderTokenSelect(toToken, handleToTokenSelect)}
            </div>
          </div>

          {insufficientBalance && (
            <div className="rounded-[8px]  bg-[#1F1F20] text-[#F1F1F1] text-center py-3 px-4 text-sm">
              Not enough {tokenData[fromToken]?.symbol || "tokens"} to swap
            </div>
          )}

          {quoteError && (
            <div className="rounded-[8px]  bg-[#1F1F20] text-red-400 text-center py-3 px-4 text-sm">
              {quoteError.message}
            </div>
          )}

          {quote && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-[#E5E5E5]">
                <div className="flex items-center sm:gap-2">
                  <span className="text-xs sm:text-sm">
                    1 {tokenData[fromToken]?.symbol} ≈{" "}
                    {(
                      Number(formattedQuote?.expectedAmountOut) /
                      Number(fromAmount)
                    ).toFixed(4)}{" "}
                    {tokenData[toToken]?.symbol}
                  </span>
                  {/* <span className="text-[#9FA0A3]">•</span>
                  <span>&lt;$0.01</span> */}
                </div>
                <button
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] text-white"
                  onClick={() => setShowDetails((prev) => !prev)}
                >
                  <span>{showDetails ? "Show less" : "Show more"}</span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {showDetails && (
                <div className="grid grid-cols-2 gap-y-2 text-sm text-[#E5E5E5]">
                  {/* <span className="flex items-center gap-2 text-[#B5B5B5]">
                    Fee
                  </span>
                  <span className="text-right text-[#E5E5E5]">0.3%</span> */}

                  <span className="flex items-center gap-2 text-[#B5B5B5]">
                    Min Received
                  </span>
                  <span className="text-right text-[#E5E5E5]">
                    {formattedQuote?.minAmountOut} {tokenData[toToken]?.symbol}
                  </span>

                  <span className="flex items-center gap-2 text-[#B5B5B5]">
                    Order routing
                  </span>
                  <span className="text-right text-[#E5E5E5]">
                    Coinsafe Router
                  </span>

                  <span className="flex items-center gap-2 text-[#B5B5B5]">
                    Slippage
                  </span>
                  <span className="text-right text-[#E5E5E5]">
                    {formattedQuote?.slippagePercentage}%
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="mt-6">
            <Button
              disabled={!canSwap || isSwapLoading}
              onClick={handleSwapClick}
              className="w-full h-12 rounded-full bg-[#1E1E1E]  border border-[#2A2A2A] text-[#E5E5E5] hover:bg-[#242428]"
            >
              {isSwapLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Swapping...</span>
                </div>
              ) : !account ? (
                "Connect Wallet"
              ) : quoteError ? (
                "Cannot Quote"
              ) : insufficientBalance ? (
                "Insufficient Balance"
              ) : (
                "Swap"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
