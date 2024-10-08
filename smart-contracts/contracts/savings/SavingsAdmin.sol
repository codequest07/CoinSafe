// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./SavingsBase.sol";

contract SavingsAdmin is SavingsBase {
    function getContractBalance(address _token) external view onlyOwner returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    // TODO: Implement additional admin functions as needed
    // For example:
    // - Add or remove accepted tokens
    // - Update fee percentages
    // - Pause/unpause contract
    // - Transfer ownership
}