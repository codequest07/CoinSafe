import axios from "axios";
import Bottleneck from "bottleneck";

const cache: any = {};
const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes

const limiter = new Bottleneck({
  maxConcurrent: 1, // Only 1 request at a time
  minTime: 1500, // 1.5 seconds between requests
});

export async function main(tokenId: string): Promise<any | null> {
  if (!tokenId) return new Error("tokenId not passed");
  try {
    console.log("Beginning the fetch ");
    const currentTime = Date.now();
    // Serve from cache if available and not expired
    if (
      cache[tokenId] &&
      currentTime - cache[tokenId].timestamp < CACHE_DURATION
    ) {
      console.log("Checking cache...", cache)
      return cache[tokenId].data;
    }

    const data = await limiter.schedule(async () => {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
      );
      if (response.status !== 200) throw new Error(`Error: ${response.status}`);
      return response;
    });

    // Cache the data
    cache[tokenId] = {
      data: data.data,
      timestamp: currentTime,
    };

    console.log("Cache updated", cache)

    return data.data || null;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
