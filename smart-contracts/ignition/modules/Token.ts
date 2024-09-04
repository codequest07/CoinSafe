import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SafuModule = buildModule("SafuModule", (m) => {

    const erc20 = m.contract("Safu");

    return { erc20 };
});

export default SafuModule;
