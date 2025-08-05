export interface Transfer {
  value: number;
  erc721TokenId: string | null;
  erc1155Metadata: unknown | null;
  tokenId: string | null;
  asset: string;
  category: string;
  network: "base" | "optimism" | "arbitrum" | "arbitrum-nova"; // Updated network field for mainnet chains
}

export interface TransfersData {
  erc20Transfers: any[];
  nativeTransfers: any[];
  internalTransfers: any[];
}
