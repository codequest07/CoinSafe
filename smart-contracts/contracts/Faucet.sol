// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenFaucet
 * @dev A contract for distributing tokens to users at regular intervals.
 */
contract TokenFaucet {
    IERC20 public token;
    uint256 public constant CLAIM_AMOUNT = 70 * 10**18; // 70 tokens with 18 decimals
    uint256 public constant CLAIM_INTERVAL = 24 hours;
    address owner;

    mapping(address => uint256) public lastClaimTime;

    /* Events */
    event TokensClaimed(address indexed user, uint256 amount);

    /* Custom Errors */
    error ZeroAddress();
    error ClaimTooSoon(uint256 timeRemaining);
    error InsufficientFaucetBalance(uint256 faucetBalance, uint256 requestedAmount);

    /**
     * @dev Initializes the contract, setting the token to be distributed.
     * @param _tokenAddress The address of the ERC20 token to be distributed.
    */
    constructor(address _tokenAddress) {
        if (_tokenAddress == address(0)) revert ZeroAddress();
        token = IERC20(_tokenAddress);
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Allows users to claim tokens. Users can only claim once every CLAIM_INTERVAL.
     * @notice This function will revert if:
     *  - The sender is the zero address
     *  - The claim interval has not passed since the last claim
     *  - The faucet doesn't have enough balance to fulfill the claim
     */
    function claim() external {
        if (msg.sender == address(0)) revert ZeroAddress();

        uint256 nextClaimTime = lastClaimTime[msg.sender] + CLAIM_INTERVAL;
        if (block.timestamp < nextClaimTime) {
            revert ClaimTooSoon(nextClaimTime - block.timestamp);
        }

        uint256 faucetBalance = token.balanceOf(address(this));
        if (faucetBalance < CLAIM_AMOUNT) {
            revert InsufficientFaucetBalance(faucetBalance, CLAIM_AMOUNT);
        }

        lastClaimTime[msg.sender] = block.timestamp;

        require(token.transfer(msg.sender, CLAIM_AMOUNT), "Token transfer failed");

        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }

    /**
     * @dev Returns the timestamp when a user can next claim tokens.
     * @param _user The address of the user to check.
     * @return The timestamp when the user can next claim tokens.
     */
    function getNextClaimTime(address _user) external view returns (uint256) {
        return lastClaimTime[_user] + CLAIM_INTERVAL;
    }

    /**
     * @dev Allows the contract owner to withdraw all remaining tokens from the contract.
     * @param _to The address to send the remaining tokens to.
     * @notice This function will revert if:
     *  - The `to` address is the zero address
     *  - The token transfer fails
     */
    function withdrawRemainingTokens(address _to) external onlyOwner {
        if (_to == address(0)) revert ZeroAddress();

        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(_to, balance), "Token transfer failed");
    }

    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getUserBalance() external view onlyOwner returns (uint256) {
        return token.balanceOf(msg.sender);
    }
}