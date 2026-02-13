import { useActiveWalletChain } from "thirdweb/react";
import { getChainConfig, ChainConfig } from "../lib/chains";
import { liskMainnet } from "../lib/config";

export function useChainConfig(): ChainConfig {
    const activeChain = useActiveWalletChain();

    // If no wallet is connected, or chain is not supported, default to Lisk Mainnet
    // You might want to handle "unsupported chain" differently in the UI
    return getChainConfig(activeChain?.id || liskMainnet.id);
}
