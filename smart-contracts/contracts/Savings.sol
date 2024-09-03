// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Savings is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Define custom errors
    error AddressZeroDetected();
    error ZeroValueNotAllowed();
    error CantSendToZeroAddress();
    error InsufficientFunds();
    error InsufficientContractBalance();
    error NotOwner();
    error InvalidTokenAddress();

    address public owner;

    struct SavingType {
        string name;
    }

    struct Safe {
        SavingType typeOfSafe;
        address token;
        uint256 amount;
        uint256 duration;
        uint256 startTime;
        uint256 unlockTime;
    }

    struct FrequentSavings {
        uint256 amount;
        uint256 nextTimestamp;
        uint256 duration;
        uint256 interval;
    }

    struct Deposit {
        uint256 amount;
        uint256 endTimestamp;
    }

    // Mappings for storing various states
    mapping(address => uint256) public depositBalances;
    mapping(address => Safe) public savings;
    mapping(address => bool) public acceptedTokens;
    mapping(address => uint256) public balancesPool;
    mapping(address => FrequentSavings) public frequentSavings;
    mapping(address => Deposit[]) public deposits;
    mapping(bytes32 => address) public tokenAddresses;

    // Events for tracking actions
    event DepositSuccessful(address indexed user, address indexed token, uint256 amount);
    event SavedSuccessfully(address indexed user, address indexed token, uint256 amount, uint256 duration);
    event SavingsTriggered(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, bytes32 tokenType, uint256 amount);

    // Constructor to set initial token addresses and contract owner
    constructor(address _erc20TokenAddress, address _liskTokenAddress, address _safuTokenAddress) {
        tokenAddresses[keccak256("ERC20")] = _erc20TokenAddress;
        tokenAddresses[keccak256("LSK")] = _liskTokenAddress;
        tokenAddresses[keccak256("SAFU")] = _safuTokenAddress;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function addAcceptedToken(address _token) external onlyOwner {
        acceptedTokens[_token] = true;
    }

    function removeAcceptedToken(address _token) external onlyOwner {
        acceptedTokens[_token] = false;
    }

    function depositToPool(uint256 _amount, address _token) external {
        if (msg.sender == address(0)) {
            revert AddressZeroDetected();
        }

        if (_amount == 0) {
            revert ZeroValueNotAllowed();
        }

        if (!acceptedTokens[_token]) {
            revert InvalidTokenAddress();
        }

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        depositBalances[msg.sender] += _amount;

        emit DepositSuccessful(msg.sender, _token, _amount);
    }

    function save(address _token, uint256 _amount, uint256 _duration, string memory _typeName) external {
        if (msg.sender == address(0)) {
            revert AddressZeroDetected();
        }

        if (_amount == 0) {
            revert ZeroValueNotAllowed();
        }

        if (!acceptedTokens[_token]) {
            revert InvalidTokenAddress();
        }

        uint256 _userBalance = depositBalances[msg.sender];
        if (_userBalance < _amount) {
            revert InsufficientFunds();
        }

        depositBalances[msg.sender] -= _amount;

        savings[msg.sender] = Safe({
            typeOfSafe: SavingType(_typeName),
            token: _token,
            amount: _amount,
            duration: _duration,
            startTime: block.timestamp,
            unlockTime: block.timestamp + _duration
        });

        emit SavedSuccessfully(msg.sender, _token, _amount, _duration);
    }

    function triggerScheduledSavings(address user) external nonReentrant {
        FrequentSavings storage savingsData = frequentSavings[user];
        uint256 amount = savingsData.amount;

        require(block.timestamp >= savingsData.nextTimestamp, "Savings interval not reached yet");
        require(balancesPool[user] >= amount, "Insufficient balance in pool");

        // Update state before making any external calls or changes
        balancesPool[user] -= amount;

        // Add the amount to the user's deposits
        deposits[user].push(Deposit({
            amount: amount,
            endTimestamp: block.timestamp + savingsData.duration
        }));

        // Update the next timestamp for the next savings interval
        savingsData.nextTimestamp += savingsData.interval;

        emit SavingsTriggered(user, amount);
    }

    function withdrawFromPool(bytes32 tokenType, uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than zero");
        require(balancesPool[msg.sender] >= amount, "Insufficient balance in pool");

        // Get the token address based on the token type
        address tokenAddress = tokenAddresses[tokenType];
        require(tokenAddress != address(0), "Token type not supported");

        // Deduct the amount from the user's balance in the pool
        balancesPool[msg.sender] -= amount;

        // Transfer the tokens back to the user's wallet
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, tokenType, amount);
    }
}
