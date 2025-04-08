import { ethers } from "hardhat";

async function main() {

    const faucet = "0x6245DF66b74b56D803730d48BF1bF16EEBBBD881";
    const faucetContract = await ethers.getContractAt("IFaucet", faucet);

    const to = "0x7FBbE68068A3Aa7E479A1E51e792F4C2073b018f";

    console.log("Starting to withdraw");

    const withdraw = await faucetContract.withdrawRemainingTokens(
        to
    );

    withdraw.wait();

    console.log("Wthdraw successful ::", withdraw);

}

main().catch(error => {
    console.error(error);
});