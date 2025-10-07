import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

const MERKL_BASE_URL = 'https://api.merkl.xyz/v4/opportunities';
const LISK_CHAIN_ID = 1135;

interface MerklOpportunity {
  chainId: number;
  type: string;
  identifier: string; // Vault address
  name: string;
  description: string;
  status: string;
  action: string;
  tvl: number;
  apr: number;
  maxApr: number;
  dailyRewards: number;
  tokens: Array<{
    id: string;
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    price: number;
  }>;
  // Add other fields as needed from sample
}

export const useMerklOpportunities = (page: number = 0, items: number = 20) => {
  const [data, setData] = useState<MerklOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tailored params for Lisk Morpho vaults (based on sample)
        const params = new URLSearchParams({
          page: page.toString(),
          items: items.toString(),
          chainId: LISK_CHAIN_ID.toString(),
          type: 'MORPHOVAULT', // Filter for vaults
          status: 'LIVE',
          action: 'LEND',
          campaigns: 'true',
          test: 'false',
          minimumTvl: '1',
          maximumTvl: '1',
          minimumApr: '1',
          maximumApr: '1',
          distributionTypes: 'DUTCH_AUCTION', // From sample breakdowns
          mainProtocolId: 'morpho',
          withInvalids: 'false',
          sort: 'null',
          order: 'desc',
        });

        // Axios call (proxied via CORS-anywhere for dev; remove in prod with backend proxy)
        const response = await axios.get(`${MERKL_BASE_URL}?${params.toString()}`, {
          timeout: 10000, // 10s timeout for efficiency
          headers: { 'Content-Type': 'application/json' },
        });

        // Filter for Lisk Morpho vaults (per sample structure)
        const liskVaults = response.data.filter(
          (item: any) => item.chainId === LISK_CHAIN_ID && item.type === 'MORPHOVAULT'
        ) as MerklOpportunity[];

        setData(liskVaults);
      } catch (err) {
        const axiosErr = err as AxiosError;
        setError(axiosErr.message || 'Failed to fetch Merkl data');
        setData([]); // Fallback to empty
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [page, items]);

  // Helper: Get USDC vault specifically (from sample)
  const getUsdcVault = () => data.find(v => v.name.includes('USDC'));

  return { data, loading, error, getUsdcVault };
};