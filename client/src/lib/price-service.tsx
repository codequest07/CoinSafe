import { useQuery, useQueries } from "@tanstack/react-query";
import { queryClient } from "./react-query";
import { tokens } from "@/lib/contract";

// --- Types ---
// --- Types ---

// --- Fetcher ---
const fetchTokenUnitPrice = async (tokenId: string): Promise<number> => {
  const normalize = (id: string) => id.toLowerCase();
  const normalizedId = normalize(tokenId);

  // Check for SAFU (address or ticker)
  if (normalizedId === "safu" || normalizedId === normalize(tokens.safu)) {
    // SAFU has a fixed price logic in original code: 0.339
    return 0.339;
  }

  // Map our internal token IDs to CoinGecko IDs if necessary
  let coingeckoId = tokenId;

  // Map tickers & addresses
  if (normalizedId === "usdt" || normalizedId === normalize(tokens.usdt)) {
    coingeckoId = "tether";
  } else if (
    normalizedId === "usdc" ||
    normalizedId === normalize(tokens.usdc) ||
    normalizedId === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" // Base USDC
  ) {
    coingeckoId = "usd-coin";
  } else if (normalizedId === "lsk" || normalizedId === normalize(tokens.lsk)) {
    coingeckoId = "lisk";
  }

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-xEDfyZh1gVhZ5LFCEuzwUW6M",
    },
  };

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`,
      options,
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch price for ${tokenId}`);
    }

    const data = await res.json();
    // data format: { [coingeckoId]: { usd: 1.23 } }

    const price = data?.[coingeckoId]?.usd;

    if (typeof price === "number") {
      return price;
    } else {
      // Fallback or error if price is missing
      console.warn(`Price not found for ${tokenId} in response`, data);
      return 0; // Return 0 to emulate original behavior of returning 0 on error
    }
  } catch (err) {
    console.error(`Error fetching price for ${tokenId}:`, err);
    return 0;
  }
};

// --- Hooks ---

export const useTokenPrice = (tokenId: string) => {
  return useQuery({
    queryKey: ["tokenPrice", tokenId],
    queryFn: () => fetchTokenUnitPrice(tokenId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useTokenPrices = (tokenIds: string[]) => {
  return useQueries({
    queries: tokenIds.map((id) => ({
      queryKey: ["tokenPrice", id],
      queryFn: () => fetchTokenUnitPrice(id),
      staleTime: 1000 * 60 * 5,
    })),
  });
};

// --- Imperative Helper (for legacy support) ---

export const getStoredTokenPrice = async (token: string): Promise<number> => {
  // This will fetch if stale, or return cache if fresh
  try {
    const price = await queryClient.fetchQuery({
      queryKey: ["tokenPrice", token],
      queryFn: () => fetchTokenUnitPrice(token),
      staleTime: 1000 * 60 * 5,
    });
    return price;
  } catch (e) {
    console.error("Error in getStoredTokenPrice", e);
    return 0;
  }
};
