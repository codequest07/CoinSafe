"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AnthropicService = void 0;
const axios_1 = __importStar(require("axios"));
class AnthropicService {
    constructor(apiKey) {
        this.apiUrl = "https://api.anthropic.com/v1/messages";
        this.apiKey = apiKey;
    }
    getSavingsPlan(transfersData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            console.log("API Key:", this.apiKey ? "Set (not shown for security)" : "Not set");
            if (!this.apiKey) {
                console.error("ANTHROPIC_API_KEY is not set");
                return null;
            }
            try {
                const response = yield axios_1.default.post(this.apiUrl, {
                    model: "claude-3-5-haiku-20241022",
                    max_tokens: 1000,
                    messages: [
                        {
                            role: "user",
                            content: `${JSON.stringify(transfersData)}You are a financial savings AI called SaveSense, someone wants to save some money with you now advice your user on how to save properly. 
                 You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
                 how often they spend and craft a proper savings plan based on their past transactions. 
                 There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
                 the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
                 The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
                 Give this In a concise readable way that a lay man will understand and be able to implement. Always end with best regards from SaveSense. NOTE: If the json is empty say you have no recent transaction, don't you the word json and explain the savings plan for the user.`,
                        },
                    ],
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": this.apiKey,
                        "anthropic-version": "2023-06-01",
                    },
                });
                return response.data.content[0].text;
            }
            catch (error) {
                if (error instanceof axios_1.AxiosError) {
                    console.error("Axios error calling Claude API:");
                    console.error("Status:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
                    console.error("Data:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
                    console.error("Headers:", (_c = error.response) === null || _c === void 0 ? void 0 : _c.headers);
                }
                else {
                    console.error("Unexpected error calling Claude API:", String(error));
                }
                return null;
            }
        });
    }
}
exports.AnthropicService = AnthropicService;
//# sourceMappingURL=AnthropicService.js.map