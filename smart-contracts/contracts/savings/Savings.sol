// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./SavingsBase.sol";
import "./SavingsDeposit.sol";
import "./SavingsPlan.sol";
import "./SavingsWithdraw.sol";
import "./SavingsQuery.sol";
import "./SavingsAdmin.sol";

contract Savings is 
    SavingsBase,
    SavingsDeposit,
    SavingsPlan,
    SavingsWithdraw,
    SavingsQuery,
    SavingsAdmin
{

     /**
     * @dev Constructor function to initialize the contract with accepted token addresses
     * @param _erc20TokenAddress The address of the ERC20 token
     * @param _liskTokenAddress The address of the LISK token
     * @param _safuTokenAddress The address of the SAFU token
    */
    constructor(address _erc20TokenAddress, address _liskTokenAddress, address _safuTokenAddress)
        SavingsBase(_erc20TokenAddress, _liskTokenAddress, _safuTokenAddress)
    {}
}