import { getAddress } from "viem";

const addresses = [
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
];

addresses.forEach(addr => {
    try {
        const checksummed = getAddress(addr);
        console.log(`Original: ${addr}`);
        console.log(`Checksummed: ${checksummed}`);
        console.log(`Match: ${addr === checksummed}`);
    } catch (error) {
        console.error(`Invalid address ${addr}:`, error);
    }
});
