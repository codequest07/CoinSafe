// public viem client primarilly for the purpose of multicall
import { createPublicClient, http } from "viem";
import { lisk } from "viem/chains";

export const publicClient = createPublicClient({
  chain: lisk,
  transport: http(),
});
