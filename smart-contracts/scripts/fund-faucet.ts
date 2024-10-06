import { ethers } from "hardhat";

async function main() {

    const safuTokenAddress = "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a";
    const safu = await  ethers.getContractAt("IERC20", safuTokenAddress)

    const faucetContractAddress = "0x6245DF66b74b56D803730d48BF1bF16EEBBBD881";
    const faucet = await ethers.getContractAt("IFaucet", faucetContractAddress)

    const transferTokensToContractTx = await safu.transfer(
        faucet, 
        ethers.parseUnits("1000", 18)
    );
    transferTokensToContractTx.wait();

       // Transfer tokens to the contract's address
    
    console.log("Transfer token ::", transferTokensToContractTx);

    const faucetBlance = await faucet.getContractBalance()

    console.log("Faucet Balance ::", faucetBlance);
}

main().catch(error => {
    console.error(error);
});