declare module "viem" {
  export function formatUnits(value: bigint, decimals: number): string;

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
}
