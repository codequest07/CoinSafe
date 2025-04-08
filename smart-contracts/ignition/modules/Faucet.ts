import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenFaucetModule = buildModule("TokenFaucetModule", (m) => {

  const safuTokenAddress = m.getParameter("_safuTokenAddress", "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a");
  const _usdTokenAddress = m.getParameter("_usdTokenAddress", "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda");
  const _lskTokenAddress = m.getParameter("_lskTokenAddress", "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D");
  const _trustedRelayer = m.getParameter("_trustedRelayer", "0x213C79042De93EcD1Fe71EFdD5B505541403453b");


  const faucetContract = m.contract("TokenFaucet", [safuTokenAddress, _usdTokenAddress, _lskTokenAddress, _trustedRelayer]);

  return { faucetContract };
});

export default TokenFaucetModule;
