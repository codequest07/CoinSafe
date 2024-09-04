import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CoinsafeModule = buildModule("CoinsafeModule", (m) => {

  const erc20TokenAddress = m.getParameter("_erc20TokenAddress", "0xd26be7331edd458c7afa6d8b7fcb7a9e1bb68909");
  const liskTokenAddress = m.getParameter("_liskTokenAddress", "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D");
  const safuTokenAddress = m.getParameter("_safuTokenAddress", "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a");
  

  const safeCoin = m.contract("Savings", [erc20TokenAddress, liskTokenAddress, safuTokenAddress]);

  return { safeCoin };
});

export default CoinsafeModule;
