// public viem client primarilly for the purpose of multicall
import { createPublicClient, http } from 'viem'
import { liskSepolia } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: liskSepolia,
  transport: http()
})