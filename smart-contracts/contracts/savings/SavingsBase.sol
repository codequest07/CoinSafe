// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SavingsBase is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Custom errors
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
    error userSpendAndSavePlanAlreadyExists();
    error userAutomatedPlanExistsAlreadyExists();

    enum TokenType { USDT, LSK, SAFU }
    enum TxStatus { Completed, Pending, Failed }

    address public trustedForwarder;
    address public owner;
    uint8 public acceptedTokenCount;
    uint256 txCount;

    struct Safe {
        string typeOfSafe;
        uint256 id;
        address token;
        uint256 amount;
        uint256 duration;
        uint256 startTime;
        uint256 unlockTime;
    }

    struct SpendAndSavePlan {
        address token;
        uint256 balance;
        uint8 percentage;
        uint256 duration;
    }

    struct AutomatedSavingsPlan {
        address token;
        uint256 amount;
        uint256 frequency;
        uint256 duration;
        uint256 lastSavingTimestamp;
    }

    struct Transaction {
        uint256 id;
        address user;
        address token;
        string typeOfTransaction;
        uint256 amount;
        uint256 timestamp;
        TxStatus status; 
    }

    struct ScheduledSaving {
        address token;
        uint256 amount;
        uint256 scheduledDate;
    }

    mapping(address => Transaction[]) public userTransactions;
    mapping(address => mapping(address => uint256)) internal userTokenBalances;
    mapping(address => mapping(uint256 => Safe)) internal userSavings;
    mapping(address => uint256) internal userSavingsCount;
    mapping(TokenType => address) public acceptedTokensAddresses;
    mapping(address => bool) public acceptedTokens;
    mapping(address => AutomatedSavingsPlan) public automatedSavingsPlans;
    mapping(address => SpendAndSavePlan) public userSpendAndSavePlan;
    mapping(address => bool) public userSpendAndSavePlanExists;
    mapping(address => bool) public userAutomatedPlanExists;
    mapping(address => mapping(address => bool)) public isTokenAutoSaved;

    // Events
    event DepositSuccessful(address indexed user, address indexed token, uint256 amount);
    event SavedSuccessfully(address indexed user, address indexed token, uint256 amount, uint256 duration);
    event Withdrawn(address indexed user, address tokenType, uint256 amount);
    event SpendAndSave(address indexed user, address indexed token, uint256 amountSaved);
    event AutomatedSavingSet(address indexed user, address indexed token, uint256 amount, uint256 frequency);
    event AutomatedSavingExecuted(address indexed user, address indexed token, uint256 amount);
    event SavingsWithdrawn(address indexed user, uint256 amount, uint256 fee, bool earlyWithdrawal);
    event TokenAdded(address indexed token, TokenType tokenType);
    event TokenRemoved(address indexed token, TokenType tokenType);
    event PlanCreated(address indexed user, address indexed token, uint8 percentage, uint256 duration);
    event AutomatedPlanCreated(address indexed user, address indexed token, uint256 amount, uint256 frequency);
    event TransactionHistoryUpdated(address indexed user, uint256 txCount, uint256 txId, address indexed token, string typeOfTransaction, uint256 amount, uint256 timestamp, TxStatus status);

    constructor(address _erc20TokenAddress, address _liskTokenAddress, address _safuTokenAddress) {
        owner = msg.sender;
        
        if (_erc20TokenAddress == address(0) || _liskTokenAddress == address(0) || _safuTokenAddress == address(0)) 
            revert AddressZeroDetected();

        acceptedTokensAddresses[TokenType.USDT] = _erc20TokenAddress;
        acceptedTokensAddresses[TokenType.LSK] = _liskTokenAddress;
        acceptedTokensAddresses[TokenType.SAFU] = _safuTokenAddress;

        acceptedTokens[_erc20TokenAddress] = true;
        acceptedTokens[_liskTokenAddress] = true;
        acceptedTokens[_safuTokenAddress] = true;

        acceptedTokenCount += 3;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Unauthorized caller");
        _;
    }

    function addTransaction(string memory _type, address _token, uint256 _amount) internal {
        Transaction memory newTransaction = Transaction({
            id: txCount++,
            user: msg.sender,
            token: _token,
            typeOfTransaction: _type,
            amount: _amount,
            timestamp: block.timestamp,
            status: TxStatus.Completed
        });
        
        userTransactions[msg.sender].push(newTransaction);

        emit TransactionHistoryUpdated(msg.sender, txCount, newTransaction.id, _token, _type, _amount, block.timestamp, TxStatus.Completed);
    }
}