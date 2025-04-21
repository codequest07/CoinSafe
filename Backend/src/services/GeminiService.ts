import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { TransfersData } from "../types/ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = "gemini-2.5-pro-exp-03-25";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async getSavingsPlan(transfersData: TransfersData): Promise<string | null> {
    console.log(
      "Using Gemini API Key:",
      this.genAI.apiKey ? "Set (not shown for security)" : "Not set"
    );

    try {
      const generationConfig = {
        temperature: 0.9, // Adjust creativity/determinism
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
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

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log("Gemini API response received.");
      return text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Consider more specific error handling if needed
      return null;
    }
  }
}
