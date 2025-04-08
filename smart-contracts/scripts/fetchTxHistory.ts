import { ethers } from "hardhat";

async function main() {

    const saving = "0x727b742EAd5540703b62C7f33312335dcFd83f5A";
    const savingsContract = await ethers.getContractAt("ISavings", saving);

    const offset = 10;
    const limit = 20;

    console.log("Fetching Tx History");

    const fetchTx = await savingsContract.getTransactionHistory(
        offset,
        limit
    );
    // fetchTx.wait();

    console.log("Tx History ::", fetchTx);

}

main().catch(error => {
    console.error(error);
});