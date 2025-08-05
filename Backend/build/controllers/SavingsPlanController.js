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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsPlanController = void 0;
class SavingsPlanController {
    constructor(transactionModel, geminiService) {
        this.transactionModel = transactionModel;
        this.geminiService = geminiService;
    }
    getSavingsPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Received request body:", req.body);
            const { address } = req.body;
            // Input validation
            if (!address) {
                this.sendErrorResponse(res, 400, "Wallet address is required");
                return;
            }
            try {
                const normalizedAddress = this.validateAndNormalizeAddress(address);
                const transfers = yield this.fetchTransactions(normalizedAddress);
                const savingsPlan = yield this.generatePlan(transfers);
                this.sendSuccessResponse(res, {
                    address: normalizedAddress,
                    savingsPlan,
                    transactionCount: transfers.length,
                });
            }
            catch (error) {
                this.handleControllerError(res, error);
            }
        });
    }
    validateAndNormalizeAddress(address) {
        const normalizedAddress = address.trim().toLowerCase();
        // Basic validation
        if (typeof address !== "string") {
            throw new Error("Address must be a string");
        }
        if (normalizedAddress.length === 0) {
            throw new Error("Address cannot be empty");
        }
        // Ethereum address validation
        const ethAddressRegex = /^0x[a-f0-9]{40}$/;
        if (!ethAddressRegex.test(normalizedAddress)) {
            throw new Error(`Invalid Ethereum address format. Expected 42 characters (0x prefix + 40 hex chars), got ${normalizedAddress.length} chars.`);
        }
        return normalizedAddress;
    }
    fetchTransactions(address) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Fetching transactions for address: ${address}`);
            try {
                const transfers = yield this.transactionModel.getTransactions(address);
                if (!Array.isArray(transfers)) {
                    throw new Error("Invalid transactions data format");
                }
                console.log(`Found ${transfers.length} transactions`);
                return transfers;
            }
            catch (error) {
                console.error("Failed to fetch transactions:", error);
                throw new Error("Could not retrieve transaction history");
            }
        });
    }
    generatePlan(transfers) {
        return __awaiter(this, void 0, void 0, function* () {
            const transfersData = {
                erc20Transfers: transfers.filter((t) => t.category === "erc20"),
                nativeTransfers: transfers.filter((t) => t.category === "native"),
                internalTransfers: [],
            };
            console.log(`Processing ${transfersData.erc20Transfers.length} ERC20 transfers`);
            try {
                const savingsPlan = yield this.geminiService.getSavingsPlan(transfersData);
                if (!savingsPlan) {
                    throw new Error("Failed to generate savings plan: result is null");
                }
                return savingsPlan;
            }
            catch (error) {
                console.error("AI service error:", error);
                throw new Error("Failed to generate savings plan");
            }
        });
    }
    sendSuccessResponse(res, data) {
        res.status(200).json({
            success: true,
            data: Object.assign(Object.assign({}, data), { generatedAt: new Date().toISOString() }),
        });
    }
    sendErrorResponse(res, code, message) {
        console.error(`Error ${code}: ${message}`);
        res.status(code).json({
            success: false,
            error: message,
            timestamp: new Date().toISOString(),
        });
    }
    handleControllerError(res, error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        this.sendErrorResponse(res, error instanceof Error && error.message.includes("Invalid") ? 400 : 500, errorMessage);
    }
}
exports.SavingsPlanController = SavingsPlanController;
//# sourceMappingURL=SavingsPlanController.js.map