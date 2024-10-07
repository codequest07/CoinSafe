
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Core
 * @dev A base contract for shared functionalities
 */
contract Core is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    // Custom errors for gas optimization
    error AddressZeroDetected();
    error ZeroValueNotAllowed();
    error InsufficientFunds();
    error InvalidTokenAddress();
    error InvalidPercentage();
    error UnauthorizedCaller();
    error InvalidWithdrawal();
    error InsufficientAllowance();
    error SpendAndSavePlanNotFound();
    error ContractPaused();
    error InvalidInput();
    error PlanAlreadyExists();
    error UserSpendAndSavePlanAlreadyExists();

    address public trustedForwarder;

    struct Safe {
        string typeOfSafe;
        uint256 id;
        address token;
        uint256 amount;
        uint256 duration;
        uint256 startTime;
        uint256 unlockTime;
    }

    enum TokenType { USDT, LSK, SAFU }
}
