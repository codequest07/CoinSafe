// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Define a generic token interface
interface IToken {
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract Savings is ReentrancyGuard {

    // Define the structure for storing savings data
    struct Deposit {
        uint256 amount;
        uint256 endTimestamp;
    }

    struct FrequentSavings {
        uint256 amount;
        uint256 nextTimestamp;
        uint256 duration;
        uint256 interval;
    }

    // Constructor to set the initial token addresses
    constructor(address _erc20TokenAddress, address _liskTokenAddress, address _safuTokenAddress) {
        tokenAddresses[keccak256("ERC20")] = _erc20TokenAddress;
        tokenAddresses[keccak256("LSK")] = _liskTokenAddress;
        tokenAddresses[keccak256("SAFU")] = _safuTokenAddress;
    }

    // Mappings for storing balances, savings, and deposits
    mapping(address => uint256) public balancesPool;
    mapping(address => FrequentSavings) public frequentSavings;
    mapping(address => Deposit[]) public deposits;
    mapping(bytes32 => address) public tokenAddresses;

    // Events for tracking important actions
    event SavingsTriggered(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, bytes32 tokenType, uint256 amount);

    // Function to trigger scheduled savings
    function triggerScheduledSavings(address user) external nonReentrant {
        FrequentSavings storage savings = frequentSavings[user];
        uint256 amount = savings.amount;

        // Ensure the savings interval has been reached
        require(block.timestamp >= savings.nextTimestamp, "Savings interval not reached yet");

        require(balancesPool[user] >= amount, "Insufficient balance in pool");

        // Update state before making any external calls or changes
        balancesPool[user] -= amount;

        // Add the amount to the user's deposits
        deposits[user].push(Deposit({
            amount: amount,
            endTimestamp: block.timestamp + savings.duration
        }));

        // Update the next timestamp for the next savings interval
        savings.nextTimestamp += savings.interval;

        // Emit an event for the triggered savings
        emit SavingsTriggered(user, amount);
    }

    // Function to withdraw from the pool
    function withdrawFromPool(bytes32 tokenType, uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than zero");
        
        require(balancesPool[msg.sender] >= amount, "Insufficient balance in pool");

        // Get the token address based on the token type
        address tokenAddress = tokenAddresses[tokenType];

        require(tokenAddress != address(0), "Token type not supported");

        // Deduct the amount from the user's balance in the pool
        balancesPool[msg.sender] -= amount;

        // Transfer the tokens back to the user's wallet
        bool success = IToken(tokenAddress).transfer(msg.sender, amount);

        require(success, "Token transfer failed");

        // Emit an event for the withdrawal
        emit Withdrawn(msg.sender, tokenType, amount);
    }
}


//lsk eth, safu
//find lsk contract sepolia tokens

//deposit pool where users can make deposits
//mapping calld balances, another called savings, when the save function is called, we will be removing from the balances to the savings
// savings function to save funds from the balances
//You'll need to find the LSK token contract address on the Sepolia testnet
