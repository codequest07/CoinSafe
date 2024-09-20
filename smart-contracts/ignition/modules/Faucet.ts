import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenFaucetModule = buildModule("TokenFaucetModule", (m) => {

  const erc20TokenAddress = m.getParameter("_tokenAddress", "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a");

  const faucetContract = m.contract("TokenFaucet", [erc20TokenAddress]);

  return { faucetContract };
});

export default TokenFaucetModule;
