import { ethers } from "hardhat";

async function main() {

    const saving = "0x727b742EAd5540703b62C7f33312335dcFd83f5A";
    const savingsContract = await ethers.getContractAt("ISavings", saving);

    const token = "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a";
    const amount = ethers.parseUnits("5", 18);
    const frequncy = 86400; // 24 hours in seconds
    const duration = 604800; // 1 week in seconds

    console.log("Creating Automated saving plan");

    const create = await savingsContract.createAutomatedSavingsPlan(
        token,
        amount,
        frequncy,
        duration
    );
    create.wait();

    console.log("Plan created ::", create);

}

main().catch(error => {
    console.error(error);
});