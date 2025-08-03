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
const savingsService_1 = require("./services/savingsService");
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const plans = yield (0, savingsService_1.getDuePlans)();
            console.log("🧾 Due plans found:", plans.length);
            if (plans.length === 0) {
                console.log("✅ No due plans to process.");
                return;
            }
            const batchSize = plans.length >= 30 ? 30 : plans.length;
            console.log(`🚀 Executing batch with size ${batchSize}...`);
            const result = yield (0, savingsService_1.executeBatch)(0, batchSize);
            console.log("✅ Batch Execution Result:");
            console.log("   Successful (dueAddresses):", result.dueAddresses);
            console.log("   Skipped (skippedAddresses):", result.skippedAddresses);
        }
        catch (err) {
            console.error("❌ Error during test execution:", err);
        }
    });
}
test();
//# sourceMappingURL=testBatch.js.map