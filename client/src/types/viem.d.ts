declare module "viem" {
  // Formatting functions
  export function formatUnits(value: bigint, decimals: number): string;
  export function formatEther(value: bigint): string;

  // Client functions
  export function http(): any;
  export function createPublicClient(config: any): any;
  export function parseAbiItem(item: string): any;
  export function stringify(obj: any, replacer?: any, space?: any): string;

  // ABI types
  export type AbiConstructor = any;
  export type AbiError = any;
  export type AbiEvent = any;
  export type AbiFallback = any;
  export type AbiFunction = any;
  export type AbiReceive = any;

  export type Abi = readonly (
    | AbiConstructor
    | AbiError
    | AbiEvent
    | AbiFallback
    | AbiFunction
    | AbiReceive
  )[];

  // ERC20 ABI
  export const erc20Abi: Abi;
}
