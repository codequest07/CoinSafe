"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerklService = void 0;
const axios_1 = __importDefault(require("axios"));
class MerklService {
    constructor(baseUrl = "https://api.merkl.xyz", timeout = 10000) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }
    /**
     * Fetch opportunities from Merkl API
     * @param chainId - Optional chain ID to filter opportunities
     * @param opportunityName - Optional opportunity name to filter
     * @returns Promise<MerklApiResponse>
     */
    fetchOpportunities(chainId, opportunityName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const params = {};
                if (chainId) {
                    params.chainId = chainId.toString();
                }
                if (opportunityName) {
                    params.name = opportunityName;
                }
                const response = yield axios_1.default.get(`${this.baseUrl}/v4/opportunities`, {
                    params,
                    timeout: this.timeout,
                    headers: {
                        Accept: "application/json",
                        "User-Agent": "CoinSafe-Merkl-APR-Tracker/1.0",
                    },
                });
                // Merkl API returns an array directly, not wrapped in a data property
                return { data: response.data };
            }
            catch (error) {
                console.error("Error fetching Merkl opportunities:", error);
                if (axios_1.default.isAxiosError(error)) {
                    throw new Error(`Merkl API Error: ${(_a = error.response) === null || _a === void 0 ? void 0 : _a.status} - ${(_b = error.response) === null || _b === void 0 ? void 0 : _b.statusText}`);
                }
                throw new Error(`Failed to fetch Merkl opportunities: ${error}`);
            }
        });
    }
    /**
     * Fetch specific opportunity by name
     * @param opportunityName - Name of the opportunity (e.g., 'lisk')
     * @param chainId - Optional chain ID
     * @returns Promise<MerklOpportunity | null>
     */
    fetchOpportunityByName(opportunityName, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.fetchOpportunities(chainId, opportunityName);
                if (response.data && response.data.length > 0) {
                    // Find partial match by name (case-insensitive)
                    const opportunity = response.data.find((opp) => opp.name.toLowerCase().includes(opportunityName.toLowerCase()));
                    return opportunity || null;
                }
                return null;
            }
            catch (error) {
                console.error(`Error fetching opportunity '${opportunityName}':`, error);
                throw error;
            }
        });
    }
    /**
     * Fetch all opportunities for a specific chain
     * @param chainId - Chain ID to fetch opportunities for
     * @returns Promise<MerklOpportunity[]>
     */
    fetchOpportunitiesByChain(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.fetchOpportunities(chainId);
                return response.data || [];
            }
            catch (error) {
                console.error(`Error fetching opportunities for chain ${chainId}:`, error);
                throw error;
            }
        });
    }
    /**
     * Health check for Merkl API
     * @returns Promise<boolean>
     */
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.fetchOpportunities();
                return true;
            }
            catch (error) {
                console.error("Merkl API health check failed:", error);
                return false;
            }
        });
    }
}
exports.MerklService = MerklService;
//# sourceMappingURL=MerklService.js.map