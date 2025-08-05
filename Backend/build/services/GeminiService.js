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
exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiService {
    constructor(apiKey) {
        this.model = "gemini-2.5-pro-exp-03-25";
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    getSavingsPlan(transfersData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Using Gemini API Key:", this.genAI.apiKey ? "Set (not shown for security)" : "Not set");
            try {
                const generationConfig = {
                    temperature: 0.9, // Adjust creativity/determinism
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 1000,
                };
                const safetySettings = [
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                ];
                const model = this.genAI.getGenerativeModel({
                    model: this.model,
                    safetySettings,
                    generationConfig,
                });
                const prompt = `
        ${JSON.stringify(transfersData)}

        You are a financial savings AI called SaveSense. Someone wants to save money with you. Advise your user on how to save properly based on their recent transaction history provided above.
        You must sound convincing and homely, explaining things clearly in soft diction. Review their recent transactions (ERC20 and native transfers) and consider how much they spend and how often.
        Craft a proper savings plan based on their past transactions.

        Offer these three savings plan options:
        1.  **Basic Plan:** A one-off savings plan with a fixed duration and fixed amount.
        2.  **Frequency Plan:** Automate saving a specific amount at regular intervals (e.g., daily, weekly, monthly).
        3.  **Spend & Save Plan:** Save a certain percentage of every transaction made from their wallet.

        Present these plans concisely and clearly so a layperson can understand and implement them.

        Always end with "Best regards from SaveSense."

        NOTE: If the transaction data (JSON) is empty or shows no spending activity, state that you have no recent transaction data to analyze, do not use the word "json", and explain the savings plan options generally for the user.
      `;
                const result = yield model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                console.log("Gemini API response received.");
                return text;
            }
            catch (error) {
                console.error("Error calling Gemini API:", error);
                // Consider more specific error handling if needed
                return null;
            }
        });
    }
}
exports.GeminiService = GeminiService;
//# sourceMappingURL=GeminiService.js.map