import axios, { AxiosResponse } from "axios";

export interface MerklOpportunity {
  id: string;
  name: string;
  chainId: number;
  apr: number;
  [key: string]: any;
}

export interface MerklApiResponse {
  data: MerklOpportunity[];
  [key: string]: any;
}

export class MerklService {
  private baseUrl: string;
  private timeout: number;

  constructor(
    baseUrl: string = "https://api.merkl.xyz",
    timeout: number = 10000
  ) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Fetch opportunities from Merkl API
   * @param chainId - Optional chain ID to filter opportunities
   * @param opportunityName - Optional opportunity name to filter
   * @returns Promise<MerklApiResponse>
   */
  async fetchOpportunities(
    chainId?: number,
    opportunityName?: string
  ): Promise<MerklApiResponse> {
    try {
      const params: any = {};

      if (chainId) {
        params.chainId = chainId.toString();
      }

      if (opportunityName) {
        params.name = opportunityName;
      }

      const response: AxiosResponse<MerklOpportunity[]> = await axios.get(
        `${this.baseUrl}/v4/opportunities`,
        {
          params,
          timeout: this.timeout,
          headers: {
            Accept: "application/json",
            "User-Agent": "CoinSafe-Merkl-APR-Tracker/1.0",
          },
        }
      );

      // Merkl API returns an array directly, not wrapped in a data property
      return { data: response.data };
    } catch (error) {
      console.error("Error fetching Merkl opportunities:", error);

      if (axios.isAxiosError(error)) {
        throw new Error(
          `Merkl API Error: ${error.response?.status} - ${error.response?.statusText}`
        );
      }

      throw new Error(`Failed to fetch Merkl opportunities: ${error}`);
    }
  }

  /**
   * Fetch specific opportunity by name
   * @param opportunityName - Name of the opportunity (e.g., 'lisk')
   * @param chainId - Optional chain ID
   * @returns Promise<MerklOpportunity | null>
   */
  async fetchOpportunityByName(
    opportunityName: string,
    chainId?: number
  ): Promise<MerklOpportunity | null> {
    try {
      const response = await this.fetchOpportunities(chainId, opportunityName);

      if (response.data && response.data.length > 0) {
        // Find partial match by name (case-insensitive)
        const opportunity = response.data.find((opp) =>
          opp.name.toLowerCase().includes(opportunityName.toLowerCase())
        );

        return opportunity || null;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching opportunity '${opportunityName}':`, error);
      throw error;
    }
  }

  /**
   * Fetch all opportunities for a specific chain
   * @param chainId - Chain ID to fetch opportunities for
   * @returns Promise<MerklOpportunity[]>
   */
  async fetchOpportunitiesByChain(
    chainId: number
  ): Promise<MerklOpportunity[]> {
    try {
      const response = await this.fetchOpportunities(chainId);
      return response.data || [];
    } catch (error) {
      console.error(
        `Error fetching opportunities for chain ${chainId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Health check for Merkl API
   * @returns Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchOpportunities();
      return true;
    } catch (error) {
      console.error("Merkl API health check failed:", error);
      return false;
    }
  }
}
