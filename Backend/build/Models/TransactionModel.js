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
exports.TransactionModel = void 0;
const axios_1 = __importDefault(require("axios"));
class TransactionModel {
    constructor(etherscanApiKey) {
        this.etherscanApiKey = etherscanApiKey;
        this.apiBaseUrls = {
            base: "https://api.etherscan.io/v2/api?chainid=8453",
            optimism: "https://api.etherscan.io/v2/api?chainid=10",
            arbitrum: "https://api.etherscan.io/v2/api?chainid=42161",
            "arbitrum-nova": "https://api.etherscan.io/v2/api?chainid=42170",
        };
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }
    getTransactions(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch from all networks in parallel
                const results = yield Promise.allSettled([
                    this.fetchNetworkTransactions(address, "base"),
                    this.fetchNetworkTransactions(address, "optimism"),
                    this.fetchNetworkTransactions(address, "arbitrum"),
                    this.fetchNetworkTransactions(address, "arbitrum-nova"),
                ]);
                const allTransfers = [];
                const networks = ["base", "optimism", "arbitrum", "arbitrum-nova"];
                results.forEach((result, index) => {
                    const network = networks[index];
                    if (result.status === "fulfilled") {
                        console.log(`Successfully fetched ${result.value.length} transactions from ${network}`);
                        allTransfers.push(...result.value);
                    }
                    else {
                        console.error(`Failed to fetch transactions from ${network}:`, result.reason);
                    }
                });
                console.log(`Total transactions fetched from all networks: ${allTransfers.length}`);
                return allTransfers;
            }
            catch (error) {
                console.error(`Failed to get transactions for ${address}:`, error);
                return [];
            }
        });
    }
    // Helper to fetch all transactions for a specific network
    fetchNetworkTransactions(address, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const [externalTransfers, erc20Transfers] = yield Promise.all([
                this.fetchExternalTransactions(address, network),
                this.fetchERC20Transfers(address, network),
            ]);
            return [...externalTransfers, ...erc20Transfers];
        });
    }
    fetchExternalTransactions(address, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const logPrefix = `${network} External transactions`;
            return this.fetchWithRetry(network, {
                module: "account",
                action: "txlist",
                address,
                startblock: 0,
                endblock: "latest",
                apikey: this.etherscanApiKey,
            }, logPrefix).then((response) => this.processExternalTransfers(response, network)); // Pass network
        });
    }
    fetchERC20Transfers(address, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const logPrefix = `${network} ERC-20 transfers`;
            return this.fetchWithRetry(network, {
                module: "account",
                action: "tokentx",
                address,
                startblock: 0,
                endblock: "latest",
                apikey: this.etherscanApiKey,
            }, logPrefix).then((response) => this.processERC20Transfers(response, network)); // Pass network
        });
    }
    fetchWithRetry(network_1, params_1, logPrefix_1) {
        return __awaiter(this, arguments, void 0, function* (network, // Added network parameter
        params, logPrefix, attempt = 1) {
            const apiUrl = this.apiBaseUrls[network]; // Use network-specific URL
            try {
                console.log(`${logPrefix} - Attempt ${attempt}: Fetching from ${apiUrl}...`);
                const response = yield axios_1.default.get(apiUrl, { params });
                // Handle potential rate limits or empty results gracefully
                const data = response.data;
                if (data.status !== "1") {
                    if (response.data.message ===
                        "No transactions found") {
                        console.log(`${logPrefix}: No transactions found`);
                        return response.data;
                    }
                    throw new Error(`API error: ${response.data.message}`);
                }
                return response.data;
            }
            catch (error) {
                if (attempt >= this.maxRetries) {
                    console.error(`${logPrefix} - Max retries exceeded`);
                    throw error;
                }
                yield new Promise((resolve) => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(network, params, logPrefix, attempt + 1); // Pass network recursively
            }
        });
    }
    processExternalTransfers(response, network) {
        // Added network parameter
        if (response.status !== "1" || !Array.isArray(response.result))
            return [];
        return response.result
            .filter((tx) => Number(tx.value) > 0)
            .map((tx) => ({
            value: Number(tx.value) / 1e18,
            erc721TokenId: null,
            erc1155Metadata: null,
            tokenId: null,
            asset: "ETH", // ETH for all networks
            category: "external",
            hash: tx.hash,
            timestamp: parseInt(tx.timeStamp),
            from: tx.from,
            to: tx.to,
            network: network, // Add network field
        }));
    }
    processERC20Transfers(response, network) {
        // Added network parameter
        if (response.status !== "1" || !Array.isArray(response.result))
            return [];
        return response.result
            .filter((tx) => Number(tx.value) > 0)
            .map((tx) => ({
            value: Number(tx.value) / 10 ** Number(tx.tokenDecimal || 18), // Added default decimal
            erc721TokenId: null,
            erc1155Metadata: null,
            tokenId: tx.tokenID || null,
            asset: tx.tokenSymbol || "Unknown ERC20", // Added default symbol
            category: "erc20",
            hash: tx.hash,
            timestamp: parseInt(tx.timeStamp),
            from: tx.from,
            to: tx.to,
            contractAddress: tx.contractAddress,
            network: network, // Add network field
        }));
    }
}
exports.TransactionModel = TransactionModel;
//# sourceMappingURL=TransactionModel.js.map