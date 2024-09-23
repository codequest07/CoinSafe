import axios from "axios";

export async function main(ids: string): Promise<any | null> {
  if(!ids) return new Error("Ids not passed")
  try {
    console.log("Beginning the fetch ");
    const data = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );
    
    return data.data || null;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
