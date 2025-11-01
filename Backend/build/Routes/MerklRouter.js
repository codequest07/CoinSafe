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
const express_1 = require("express");
const MerklController_1 = require("../controllers/MerklController");
const MerklAPRModel_1 = __importDefault(require("../Models/MerklAPRModel"));
const router = (0, express_1.Router)();
const merklController = new MerklController_1.MerklController();
/**
 * @route POST /api/merkl/fetch
 * @desc Fetch and store current APR data for a specific opportunity
 * @access Public
 * @body { opportunityName: string, chainId?: number }
 */
router.post("/fetch", (req, res) => {
    merklController.fetchAndStoreAPR(req, res);
});
/**
 * @route GET /api/merkl/historical
 * @desc Get historical APR data for a specific opportunity
 * @access Public
 * @query { opportunityName: string, chainId?: number, tokenSymbol?: string, tokenAddress?: string, startDate?: string, endDate?: string, limit?: number }
 */
router.get("/historical", (req, res) => {
    merklController.getHistoricalAPR(req, res);
});
/**
 * @route GET /api/merkl/opportunities
 * @desc Get all tracked opportunities with their latest data
 * @access Public
 */
router.get("/opportunities", (req, res) => {
    merklController.getTrackedOpportunities(req, res);
});
/**
 * @route GET /api/merkl/health
 * @desc Health check for Merkl API and database
 * @access Public
 */
router.get("/health", (req, res) => {
    merklController.healthCheck(req, res);
});
/**
 * @route POST /api/merkl/batch-fetch
 * @desc Batch fetch and store APR data for multiple opportunities
 * @access Public
 * @body { opportunities: Array<{ opportunityName: string, chainId?: number }> }
 */
router.post("/batch-fetch", (req, res) => {
    merklController.batchFetchAPR(req, res);
});
/**
 * @route GET /api/merkl/latest/:opportunityName
 * @desc Get the latest APR data for a specific opportunity
 * @access Public
 * @params { opportunityName: string }
 * @query { chainId?: number }
 */
router.get("/latest/:opportunityName", (req, res) => {
    const { opportunityName } = req.params;
    const { chainId } = req.query;
    // Redirect to historical endpoint with limit 1
    req.query.opportunityName = opportunityName;
    req.query.limit = "1";
    merklController.getHistoricalAPR(req, res);
});
/**
 * @route GET /api/merkl/stats/:opportunityName
 * @desc Get comprehensive statistics for a specific opportunity
 * @access Public
 * @params { opportunityName: string }
 * @query { chainId?: number, startDate?: string, endDate?: string }
 */
router.get("/stats/:opportunityName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { opportunityName } = req.params;
        const { chainId, startDate, endDate } = req.query;
        // Build query filter
        const filter = {
            opportunityName: opportunityName,
        };
        if (chainId) {
            filter.chainId = parseInt(chainId);
        }
        // Add date range filter
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) {
                filter.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.timestamp.$lte = new Date(endDate);
            }
        }
        // Get all records for statistics
        const records = yield MerklAPRModel_1.default.find(filter)
            .sort({ timestamp: -1 })
            .select("apr timestamp");
        if (!records || records.length === 0) {
            res.json({
                success: true,
                data: {
                    opportunityName,
                    chainId: chainId ? parseInt(chainId) : null,
                    recordCount: 0,
                    message: "No data found for this opportunity",
                },
            });
            return;
        }
        const aprValues = records.map((record) => record.apr);
        const timestamps = records.map((record) => record.timestamp);
        // Calculate comprehensive statistics
        const stats = {
            opportunityName,
            chainId: chainId ? parseInt(chainId) : null,
            recordCount: records.length,
            dateRange: {
                first: timestamps[timestamps.length - 1],
                last: timestamps[0],
            },
            apr: {
                latest: aprValues[0],
                average: aprValues.reduce((a, b) => a + b, 0) / aprValues.length,
                min: Math.min(...aprValues),
                max: Math.max(...aprValues),
                median: aprValues.sort((a, b) => a - b)[Math.floor(aprValues.length / 2)],
            },
            trends: {
                // Calculate 7-day average if we have enough data
                sevenDayAverage: records.length >= 7
                    ? aprValues.slice(0, 7).reduce((a, b) => a + b, 0) / 7
                    : null,
                // Calculate 30-day average if we have enough data
                thirtyDayAverage: records.length >= 30
                    ? aprValues.slice(0, 30).reduce((a, b) => a + b, 0) / 30
                    : null,
            },
        };
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error("❌ Error fetching statistics:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}));
/**
 * @route GET /api/merkl/tokens
 * @desc Get all tracked tokens across all opportunities
 * @access Public
 * @query { chainId?: number, tokenSymbol?: string }
 */
router.get("/tokens", (req, res) => {
    merklController.getTrackedTokens(req, res);
});
/**
 * @route GET /api/merkl/token/:tokenSymbol/historical
 * @desc Get historical APR data for a specific token
 * @access Public
 * @params { tokenSymbol: string }
 * @query { chainId?: number, startDate?: string, endDate?: string, limit?: number }
 */
router.get("/token/:tokenSymbol/historical", (req, res) => {
    merklController.getTokenHistoricalAPR(req, res);
});
/**
 * @route GET /api/merkl/token/:tokenSymbol/stats
 * @desc Get comprehensive statistics for a specific token
 * @access Public
 * @params { tokenSymbol: string }
 * @query { chainId?: number, startDate?: string, endDate?: string }
 */
router.get("/token/:tokenSymbol/stats", (req, res) => {
    merklController.getTokenStats(req, res);
});
/**
 * @route GET /api/merkl/apr
 * @desc Get current APR data for all tracked tokens
 * @access Public
 * @query { chainId?: number, tokenSymbol?: string }
 */
router.get("/apr", (req, res) => {
    merklController.getCurrentAPR(req, res);
});
/**
 * @route GET /api/merkl/apr/period
 * @desc Get APR data for each token by time period
 * @access Public
 * @query { chainId?: number, startDate?: string, endDate?: string, groupBy?: string }
 */
router.get("/apr/period", (req, res) => {
    merklController.getAPRByPeriod(req, res);
});
exports.default = router;
//# sourceMappingURL=MerklRouter.js.map