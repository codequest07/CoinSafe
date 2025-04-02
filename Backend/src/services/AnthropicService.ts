import axios, { AxiosError } from "axios";
import { TransfersData } from "../types/ai";

export class AnthropicService {
  private apiKey: string;
  private apiUrl: string = "https://api.anthropic.com/v1/messages";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getSavingsPlan(transfersData: TransfersData): Promise<string | null> {
    console.log(
      "API Key:",
      this.apiKey ? "Set (not shown for security)" : "Not set"
    );

    if (!this.apiKey) {
      console.error("ANTHROPIC_API_KEY is not set");
      return null;
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `${JSON.stringify(
                transfersData
              )}You are a financial savings AI called SaveSense, someone wants to save some money with you now advice your user on how to save properly. 
                 You must sound convincing and homely explaining to them properly in soft diction. You will review their recent transactions and take into account how much they spend, 
                 how often they spend and craft a proper savings plan based on their past transactions. 
                 There are three categories of transaction A one off savings plan with fixed duration and fixed amount which is called the basic plan, 
                 the second plan is a frequency plan whereby they automate to spend a specific amount at specific intervals say daily or weekly or monthly. 
                 The third plan is the spend and save. per every transaction they make from their wallet account how much percentage of their transactions should they save for every transaction. 
                 Give this In a concise readable way that a lay man will understand and be able to implement. Always end with best regards from SaveSense. NOTE: If the json is empty say you have no recent transaction, don't you the word json and explain the savings plan for the user.`,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Axios error calling Claude API:");
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("Headers:", error.response?.headers);
      } else {
        console.error("Unexpected error calling Claude API:", String(error));
      }
      return null;
    }
  }
}
