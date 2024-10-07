
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Core.sol";

/**
 * @title ScheduledSavings
 * @dev A contract for managing scheduled savings
 */
contract ScheduledSavings is Core {
    struct ScheduledSaving {
        address token;
        uint256 amount;
        uint256 scheduledDate;
    }

    mapping(address => ScheduledSaving) public scheduledSavings;

    // Functions managing scheduled savings
}
