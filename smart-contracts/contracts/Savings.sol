// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Savings
 * @dev A contract for managing various savings plans including automated savings using Gelato
*/

contract Savings is ReentrancyGuard {

    using SafeERC20 for IERC20;

    // Custom errors for gas optimization
    error AddressZeroDetected();
    error ZeroValueNotAllowed();
    error InsufficientFunds();
    error InvalidTokenAddress();
    error NotOwner();
    error InvalidPercentage();
    error UnauthorizedCaller();
    error InvalidWithdrawal();
    error InsufficientAllowance();

    enum TokenType { ETH, LSK, SAFU } // Define the token types

    address public owner;
    address public trustedForwarder; // Gelato's trusted forwarder address

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
        uint256 lastSavingTimestamp;
    }

    struct Balances {
        address token;
        uint256 balance;
        // add bool to check if auosaved
    }

    mapping(address => Balances[]) depositBalances;
    mapping(address => mapping(address => uint256)) depositBalancess;
    mapping(address => Safe) savings;
    mapping(address => bool) acceptedTokens;
    mapping(address => AutomatedSavingsPlan) automatedSavingsPlans;
    mapping(TokenType => address) tokenAddresses;
    mapping(address => SpendAndSavePlan) userSpendAndSave;

    event DepositSuccessful(address indexed user, address indexed token, uint256 amount);
    event SavedSuccessfully(address indexed user, address indexed token, uint256 amount, uint256 duration);
    event Withdrawn(address indexed user, address tokenType, uint256 amount);
    event SpendAndSave(address indexed user, address indexed token, uint256 amountSaved);
    event AutomatedSavingSet(address indexed user, address indexed token, uint256 amount, uint256 frequency);
    event AutomatedSavingExecuted(address indexed user, address indexed token, uint256 amount);
    // Add new event for withdrawal
    event SavingsWithdrawn(address indexed user, uint256 amount, uint256 fee, bool earlyWithdrawal);
    event BalanceWithdrawnToUserAccount(address indexed user, uint256 amount);

    constructor(address _erc20TokenAddress, address _liskTokenAddress, address _safuTokenAddress) {
        owner = msg.sender;

        tokenAddresses[TokenType.ETH] = _erc20TokenAddress;
        tokenAddresses[TokenType.LSK] = _liskTokenAddress;
        tokenAddresses[TokenType.SAFU] = _safuTokenAddress;

        // Add initial accepted tokens
        acceptedTokens[_erc20TokenAddress] = true;
        acceptedTokens[_liskTokenAddress] = true;
        acceptedTokens[_safuTokenAddress] = true;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    modifier onlyTrustedForwarder() {
        if (msg.sender != trustedForwarder) {
            revert UnauthorizedCaller();
        }
        _;
    }

    /**
     * @dev Adds a new accepted token
     * @param _token Address of the token to be accepted
     * @param _tokenType Type of the token to be associated with the token address
     */
    function addAcceptedToken(address _token, TokenType _tokenType) external onlyOwner {

        if (_token != address(0)) revert InvalidTokenAddress();

        acceptedTokens[_token] = true;
        tokenAddresses[_tokenType] = _token;

    }

    /**
     * @dev Removes an accepted token
     * @param _tokenType Type of the token to be removed
     */
    function removeAcceptedToken(TokenType _tokenType) external onlyOwner {
        address tokenAddress = tokenAddresses[_tokenType];
        require(acceptedTokens[tokenAddress], "Token is not accepted");

        acceptedTokens[tokenAddress] = false;
        delete tokenAddresses[_tokenType]; // Remove the token from the mapping
    }

    /**
     * @dev Gets the address of a token by its type
     * @param _tokenType Type of the token
     * @return The address of the token
     */
    function getTokenAddress(TokenType _tokenType) external view returns (address) {
        return tokenAddresses[_tokenType];
    }

    /**
     * @dev Creates a spend and save plan for a user
     * @param _token Address of the token to be used
     * @param _percentage Percentage of spend to save
     * @param _duration Duration of the savings plan
    */
    function createSpendAndSavePlan(address _token, uint8 _percentage, uint256 _duration) external {
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_percentage == 0 || _percentage > 100) revert InvalidPercentage();

        userSpendAndSave[msg.sender] = SpendAndSavePlan({
            token: _token,
            balance: 0,
            percentage: _percentage,
            duration: _duration
        });
    }

    /**
     * @dev Sets up an automated savings plan
     * @param _token Address of the token to be used
     * @param _amount Amount to save periodically
     * @param _frequency Frequency of savings in seconds
     */
    function setAutomatedSavingsPlan(address _token, uint256 _amount, uint256 _frequency) external {
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_amount == 0 || _frequency == 0) revert ZeroValueNotAllowed();

        automatedSavingsPlans[msg.sender] = AutomatedSavingsPlan({
            token: _token,
            amount: _amount,
            frequency: _frequency,
            lastSavingTimestamp: block.timestamp
        });

        emit AutomatedSavingSet(msg.sender, _token, _amount, _frequency);
    }


    /**
    * @dev Deposits tokens to the user's balance
    * @param _amount Amount to deposit
    * @param _token Address of the token to deposit
    */
    function depositToPool(uint256 _amount, address _token) public {
        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();

        // Check allowance before the transfer
        uint256 allowance = IERC20(_token).allowance(msg.sender, address(this));
        if (allowance < _amount) revert InsufficientAllowance();

        // Proceed with the transfer if allowance is sufficient
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        bool tokenExists = false;
        Balances[] storage userBalances = depositBalances[msg.sender];
        for (uint256 i = 0; i < userBalances.length; i++) {
            if (userBalances[i].token == _token) {
                userBalances[i].balance += _amount;
                tokenExists = true;
                break;
            }
        }

        if (!tokenExists) {
            depositBalances[msg.sender].push(Balances({
                token: _token,
                balance: _amount
            }));
        }

        emit DepositSuccessful(msg.sender, _token, _amount);
    }

    /**
     * @dev Saves a specified amount for a duration
     * @param _token Address of the token to save
     * @param _amount Amount to save
     * @param _duration Duration of the savings
     * @param _typeName Type of savings
     */
    function save(address _token, uint256 _amount, uint256 _duration, string memory _typeName) public {
        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();

        Balances[] storage userBalances = depositBalances[msg.sender];
        uint256 userBalance = 0;

        for (uint256 i = 0; i < userBalances.length; i++) {
            if (userBalances[i].token == _token) {
                userBalance = userBalances[i].balance;
                break;
            }
        }

        if (userBalance < _amount) revert InsufficientFunds();

        for (uint256 i = 0; i < userBalances.length; i++) {
            if (userBalances[i].token == _token) {
                userBalances[i].balance -= _amount;
                break;
            }
        }

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


    /**
    * @dev Withdraws tokens from the user's balance
    * @param _token Address of the token to withdraw
    * @param _amount Amount to withdraw
    */
    function withdrawFromPool(address _token, uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroValueNotAllowed();

        Balances[] storage userBalances = depositBalances[msg.sender];
        uint256 userBalance = 0;
        bool tokenExists = false;

        for (uint256 i = 0; i < userBalances.length; i++) {
            if (userBalances[i].token == _token) {
                if (userBalances[i].balance < _amount) revert InsufficientFunds();
                userBalance = userBalances[i].balance;
                userBalances[i].balance -= _amount;
                tokenExists = true;
                break;
            }
        }

        // If the token was not found in the user's deposits, revert with a more descriptive error
        if (!tokenExists) revert("Token not found in user's deposits");

        IERC20(_token).safeTransfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _token, _amount);
    }


    /**
     * @dev Executes the spend and save functionality
     * @param _token Address of the token for spend and save
     * @param _amount Amount spent, from which a percentage will be saved
     */
    function spendAndSave(address _token, uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();

        SpendAndSavePlan storage plan = userSpendAndSave[msg.sender];
        if (plan.token != _token) revert InvalidTokenAddress();

        uint256 amountToSave = (_amount * plan.percentage) / 100;
        if (amountToSave > 0) {
            depositToPool(amountToSave, _token);
            save(_token, amountToSave, plan.duration, "spendAndSave");

            emit SpendAndSave(msg.sender, _token, amountToSave);
        }
    }

    /**
     * @dev Executes the automated saving plan (to be called by Gelato)
     * @param _user Address of the user whose plan is being executed
     */
    function executeAutomatedSaving(address _user) external onlyTrustedForwarder {
        AutomatedSavingsPlan storage plan = automatedSavingsPlans[_user];
        
        if (plan.amount == 0 || plan.frequency == 0) return;
        if (block.timestamp < plan.lastSavingTimestamp + plan.frequency) return;

        Balances[] storage userBalances = depositBalances[_user];
        uint256 userBalance = 0;

        for (uint256 i = 0; i < userBalances.length; i++) {
            if (userBalances[i].token == plan.token) {
                userBalance = userBalances[i].balance;
                break;
            }
        }

        if (userBalance < plan.amount) return;

        for (uint256 i = 0; i < userBalances.length; i++) {
            if (userBalances[i].token == plan.token) {
                userBalances[i].balance -= plan.amount;
                break;
            }
        }

        savings[_user] = Safe({
            typeOfSafe: SavingType("Automated"),
            token: plan.token,
            amount: plan.amount,
            duration: 0,
            startTime: block.timestamp,
            unlockTime: 0
        });

        plan.lastSavingTimestamp = block.timestamp;

        emit AutomatedSavingExecuted(_user, plan.token, plan.amount);
    }

    /**
     * @dev Withdraws savings from the savings mapping to the user's deposit balance
     * @param _token Address of the token to withdraw
     * @param _amount Amount to withdraw
     * @param _acceptEarlyWithdrawalFee Whether the user accepts the early withdrawal fee
    */
    function withdrawSavings(address _token, uint256 _amount, bool _acceptEarlyWithdrawalFee, string memory _type) external nonReentrant {

        Safe storage userSafe = savings[msg.sender];

        if (userSafe.amount == 0 || userSafe.token != _token) revert InvalidWithdrawal();
        if (_amount > userSafe.amount) revert InsufficientFunds();

        bool isMatured = block.timestamp >= userSafe.unlockTime;
        uint256 fee = 0;

        if (!isMatured) {
            if (!_acceptEarlyWithdrawalFee) revert InvalidWithdrawal();
            fee = (_amount * 1) / 100; // 1% fee for early withdrawal
        }

        uint256 amountAfterFee = _amount - fee;
        userSafe.amount -= _amount;

        Balances[] storage userBalances = depositBalances[msg.sender];
        for (uint256 i = 0; i < userBalances.length; i++) {
            if (userBalances[i].token == _token) {
                userBalances[i].balance += amountAfterFee;
                break;
            }
        }

        if (fee > 0) {
            // Transfer fee to contract owner or a designated fee recipient
            for (uint256 i = 0; i < userBalances.length; i++) {
                if (userBalances[i].token == owner) {
                    userBalances[i].balance += fee;
                    break;
                }
            }
        }

        // If all savings are withdrawn, reset the Safe struct
        if (userSafe.amount == 0) {
            delete savings[msg.sender];
        }

        emit SavingsWithdrawn(msg.sender, _amount, fee, !isMatured);
    }


    /**
     * @dev Returns the contract balance for a specific token
     * @param _token Address of the token
     * @return uint256 Balance of the contract for the specified token
     */
    function getContractBalance(address _token) external onlyOwner view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    /**
     * @dev Returns an array of the user's balances for all accepted tokens
     * @param _user Address of the user
     * @return Balances[] Array of the user's balances
     */
    function getUserBalances(address _user) external view returns (Balances[] memory) {
        return depositBalances[_user];
    }

    /**
     * @dev Gets the total balance of all the user's savings
     * @param _user The address of the user
     * @return The total balance of the user's savings
     */
    function getTotalSavingsBalance(address _user) external view returns (uint256) {
        uint256 totalBalance = 0;

        // Iterate through the user's savings and sum up the balances
        Safe storage userSafe = savings[_user];
        if (userSafe.amount > 0) {
            totalBalance += userSafe.amount;
        }

        return totalBalance;
    }


    /**
     * @dev Gets the available balance (funds in the deposit pool that are not locked in savings)
     * @param _user The address of the user
     * @return The available balance of the user
    */
    function getAvailableBalance(address _user) external view returns (uint256) {
        uint256 availableBalance = 0;

        // Iterate through the user's deposits and sum up the balances
        Balances[] memory userBalances = depositBalances[_user];
        for (uint256 i = 0; i < userBalances.length; i++) {
            availableBalance += userBalances[i].balance;
        }

        // Subtract the user's saved balance
        Safe storage userSafe = savings[_user];
        if (userSafe.amount > 0) {
            availableBalance -= userSafe.amount;
        }

        return availableBalance;
    }
    
}