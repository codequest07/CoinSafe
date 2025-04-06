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
exports.main = main;
const axios_1 = __importDefault(require("axios"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const cache = {};
const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes
const limiter = new bottleneck_1.default({
    maxConcurrent: 1, // Only 1 request at a time
    minTime: 1500, // 1.5 seconds between requests
});
function main(tokenId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tokenId)
            return new Error("tokenId not passed");
        try {
            // console.log("Beginning the fetch ");
            const currentTime = Date.now();
            // Serve from cache if available and not expired
            if (cache[tokenId] &&
                currentTime - cache[tokenId].timestamp < CACHE_DURATION) {
                // console.log("Checking cache...", cache)
                return cache[tokenId].data;
            }
            const data = yield limiter.schedule(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);
                if (response.status !== 200)
                    throw new Error(`Error: ${response.status}`);
                return response;
            }));
            // Cache the data
            cache[tokenId] = {
                data: data.data,
                timestamp: currentTime,
            };
            // console.log("Cache updated", cache)
            return data.data || null;
        }
        catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    });
}
//# sourceMappingURL=CoinGeckoApiController.js.map