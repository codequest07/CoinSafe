// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

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

    address public owner;
    uint8 public acceptedTokenCount;
    uint256 txCount;

    mapping(address => Transaction[]) public userTransactions;

    mapping(address => mapping(address => uint256)) private userTokenBalances;
    mapping(address => mapping(uint256 => Safe)) private userSavings;
    mapping(address => uint256) private userSavingsCount;

    mapping(TokenType => address) public acceptedTokensAddresses;
    mapping(address => bool) public acceptedTokens;

    mapping(address => AutomatedSavingsPlan) public automatedSavingsPlans;
    mapping(address => SpendAndSavePlan) public userSpendAndSavePlan;
    mapping(address => bool) public userSpendAndSavePlanExists;
    mapping(address => bool) public userAutomatedPlanExists;

    mapping (address => mapping (address => bool)) public isTokenAutoSaved;

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

    /**
     * @dev Constructor function to initialize the contract with accepted token addresses
     * @param _erc20TokenAddress The address of the ERC20 token
     * @param _liskTokenAddress The address of the LISK token
     * @param _safuTokenAddress The address of the SAFU token
    */
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

// ======================================= DEPOSIT TO WALLET ===========================================

    /**
     * @notice Deposit a specified amount of tokens to the pool
     * @param _amount The amount of tokens to deposit
     * @param _token The address of the token to deposit
    */
    function depositToPool(uint256 _amount, address _token) public {
        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (IERC20(_token).balanceOf(msg.sender) < _amount) revert InsufficientFunds();

        uint256 allowance = IERC20(_token).allowance(msg.sender, address(this));
        if (allowance < _amount) revert InsufficientAllowance();

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        userTokenBalances[msg.sender][_token] += _amount;

        addTransaction("deposit", _token, _amount);

        emit DepositSuccessful(msg.sender, _token, _amount);
    }

// ======================================= BASIC SAVING ===========================================

    /**
     * @notice Save a specified amount of tokens for a specific duration
     * @param _token The address of the token to save
     * @param _amount The amount of tokens to save
     * @param _duration The duration for which to save the tokens
     * @dev this function locks a token away to save for a specified duration. The token will be unlocked after the specified duration. It finds the desired token and queries the user's balance to ensure the user has enough and saves it by moving it from the userTokenBalances mapping to the userSavings mapping.
    */
    function save(address _token, uint256 _amount, uint256 _duration) public nonReentrant {
        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_duration == 0) revert InvalidInput();

        if (userTokenBalances[msg.sender][_token] < _amount) revert InsufficientFunds();

        userTokenBalances[msg.sender][_token] -= _amount;

        uint256 savingsIndex = userSavingsCount[msg.sender];
        userSavings[msg.sender][savingsIndex] = Safe({
            typeOfSafe: "Basic",
            id: savingsIndex,
            token: _token,
            amount: _amount,
            duration: _duration,
            startTime: block.timestamp,
            unlockTime: block.timestamp + _duration
        });
        userSavingsCount[msg.sender]++;

        addTransaction("save", _token, _amount);

        emit SavedSuccessfully(msg.sender, _token, _amount, _duration);
    }


// =================================== CREATE SPEND&SAVE SAVE PLAN =======================================

    /**
     * @notice Creates a Spend and Save plan for the user
     * @param _token The address of the token to be saved on every transaction
     * @param _percentage The percentage to save
     * @param _duration The duration of the plan
    */
    function createSpendAndSavePlan(address _token, uint8 _percentage, uint256 _duration) external {
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_percentage == 0 || _percentage > 100) revert InvalidPercentage();
        if (_duration == 0) revert InvalidInput();
        if (userSpendAndSavePlanExists[msg.sender]) revert userSpendAndSavePlanAlreadyExists();

        userSpendAndSavePlan[msg.sender] = SpendAndSavePlan({
            token: _token,
            balance: 0,
            percentage: _percentage,
            duration: _duration
        });

        userAutomatedPlanExists[msg.sender] = true;

        emit PlanCreated(msg.sender, _token, _percentage, _duration);
    }

    
// ======================================= CREATE AUTO SAVING PLAN =======================================

    /**
        * @notice Creates an automated savings plan for the user.
        *
        * @param _token The address of the token to be used for the savings plan.
        * @param _amount The amount to be saved in the plan.
        * @param _frequency The frequency of the savings plan.
        *
        * @dev This function creates an automated savings plan for the user, which will automatically save the specified amount at the specified frequency.
    */         
    function createAutomatedSavingsPlan(address _token, uint256 _amount, uint256 _frequency, uint256 _duration) external {
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_amount == 0 || _frequency == 0) revert ZeroValueNotAllowed();
        if (_frequency > 365 days) revert InvalidInput();
        if (userAutomatedPlanExists[msg.sender]) revert userAutomatedPlanExistsAlreadyExists();

        automatedSavingsPlans[msg.sender] = AutomatedSavingsPlan({
            token: _token,
            amount: _amount,
            frequency: _frequency,
            duration: _duration,
            lastSavingTimestamp: block.timestamp
        });

        userAutomatedPlanExists[msg.sender] = true;
        isTokenAutoSaved[msg.sender][_token] = true;

        emit AutomatedPlanCreated(msg.sender, _token, _amount, _frequency);
    }


// ======================================= EXECUTE SPEND AND SAVE =======================================


    /**
     * @notice Executes the spend and save functionality by saving a percentage of the spent amount
     * @param _token The address of the token for spend and save
     * @param _amount The amount spent, from which a percentage will be saved
     * @dev This function calculates the amount to save based on the spend percentage set in the user's plan, deposits the required funds from the external wallet to the pool and then saves the funds to the user's savings.
    */
    // TODO: ADD ERROR HANDLER TO THROW IF USER HASNT SET UP A SPEND AND SAVE PLAN BEFORE CALLING THIS FUNCTION
    function spendAndSave(address _token, uint256 _amount) external nonReentrant {
        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();

        SpendAndSavePlan storage plan = userSpendAndSavePlan[msg.sender];
        if (plan.token != _token) revert InvalidTokenAddress();

        uint256 amountToSave = (_amount * plan.percentage) / 100;
        if (amountToSave > 0) {
        
            depositToPool(amountToSave, _token);

            uint256 savingsIndex = userSavingsCount[msg.sender];
            userSavings[msg.sender][savingsIndex] = Safe({
                typeOfSafe: "SpendAndSave",
                id: savingsIndex,
                token: _token,
                amount: amountToSave,
                duration: plan.duration,
                startTime: block.timestamp,
                unlockTime: block.timestamp + plan.duration
            });
            userSavingsCount[msg.sender]++;

            addTransaction("spend and save", _token, _amount);

            emit SpendAndSave(msg.sender, _token, amountToSave);
        }
    }


// ===================================== EXECUTE AUTOMATED SAVINGS =====================================

    function executeAutomatedSaving(address _user) external {
        AutomatedSavingsPlan storage plan = automatedSavingsPlans[_user];
        
        if (plan.amount == 0 || plan.frequency == 0) return;
        if (block.timestamp < plan.lastSavingTimestamp + plan.frequency) return;

        if (userTokenBalances[_user][plan.token] < plan.amount) return;

        userTokenBalances[_user][plan.token] -= plan.amount;

        uint256 savingsIndex = userSavingsCount[_user];
        userSavings[_user][savingsIndex] = Safe({
            typeOfSafe: "Automated",
            id: savingsIndex,
            token: plan.token,
            amount: plan.amount,
            duration: 0,
            startTime: block.timestamp,
            unlockTime: 0
        });
        userSavingsCount[_user]++;

        plan.lastSavingTimestamp = block.timestamp;

        addTransaction("auto save", plan.token, plan.amount);

        emit AutomatedSavingExecuted(_user, plan.token, plan.amount);
    }


// ======================================= UNLOCK SAVING ===========================================

    /**
     * @dev Allows a user to withdraw their savings from a specific safe.
     * @param _savingsIndex The index of the safe from which to withdraw savings
     * @param _acceptEarlyWithdrawalFee Boolean indicating whether the user accepts an early withdrawal fee
    */
    // TODO: ERROR BOUNDARY IF USER DOES NOT CHECK _acceptEarlyWithdrawalFee TO TRUE IN CASES OF EMERGENCY
    // TODO: ERROR BOUNDARY IF USER TRYING TO CLAIM ISNT ORIGINAL SAVER
    // TODO: FIGURE OUT A WAY TO NULLIFY SAFE INDEX
    function withdrawSavings(uint256 _savingsIndex, bool _acceptEarlyWithdrawalFee) external nonReentrant {
        Safe storage userSafe = userSavings[msg.sender][_savingsIndex];

        if (userSafe.amount == 0) revert InvalidWithdrawal();
        // if (_amount > userSafe.amount) revert InsufficientFunds();

        bool isMatured = block.timestamp >= userSafe.unlockTime;
        uint256 fee = 0;

        if (!isMatured) {
            if (!_acceptEarlyWithdrawalFee) revert InvalidWithdrawal();
            fee = (userSafe.amount * 1) / 100;
        }

        uint256 amountAfterFee = userSafe.amount - fee;
        userSafe.amount -= userSafe.amount;

        userTokenBalances[msg.sender][userSafe.token] += amountAfterFee;

        if (fee > 0) {
            // Transfer fee to contract owner or a designated fee recipient
            userTokenBalances[owner][userSafe.token] += fee;
        }

        // If all savings are withdrawn, reset the Safe struct
        if (userSafe.amount == 0) {
            delete userSavings[msg.sender][_savingsIndex];
        }

        addTransaction("unlock", userSafe.token, userSafe.amount);

        emit SavingsWithdrawn(msg.sender, userSafe.amount, fee, !isMatured);
    }


// ======================================= WITHDRAW FROM POOL ===========================================


    /**
     * @notice Withdraw specified token amount to users external wallet
     * @param _token The address of the token to withdraw
     * @param _amount The amount of tokens to save
     * @dev This function withdraws a specified amount of tokens from the userTokenBalances mapping pool to users external wallet.
    */
    function withdrawFromPool(address _token, uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (userTokenBalances[msg.sender][_token] < _amount) revert InsufficientFunds();

        userTokenBalances[msg.sender][_token] -= _amount;

        IERC20(_token).safeTransfer(msg.sender, _amount);

        addTransaction("withdrawal", _token, _amount);

        emit Withdrawn(msg.sender, _token, _amount);
    }


// ======================================= CLAIM ALL AVAILABLE SAVINGS ===========================================

    // TODO: FUNCTION THAT CLAIMS ALL CLAIMABLE SAVINGS
    function claimAll() external {
        
    }


// ======================================= BALANCES ==========================================

    /**
     * @dev Returns the total balances (available + saved) of tokens for a specific user
     * @param _user The address of the user
     * @return An array of token addresses and an array of corresponding total balances. which ios culmunation of available balances and saved balances
    */
    function getUserBalances(address _user) external view returns (address[] memory, uint256[] memory) {
        address[] memory tokens = new address[](acceptedTokenCount);
        uint256[] memory balances = new uint256[](acceptedTokenCount);

        tokens[0] = acceptedTokensAddresses[TokenType.USDT];
        tokens[1] = acceptedTokensAddresses[TokenType.LSK];
        tokens[2] = acceptedTokensAddresses[TokenType.SAFU];

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            uint256 availableBalance = userTokenBalances[_user][token];
            uint256 savedBalance = 0;

            // Add saved balances to the total
            for (uint256 j = 0; j < userSavingsCount[_user]; j++) {
                Safe memory safe = userSavings[_user][j];
                if (safe.token == token) {
                    savedBalance += safe.amount;
                }
            }

            // Total balance is available plus saved
            balances[i] = availableBalance + savedBalance;
        }

        return (tokens, balances);
    }


    /**
     * @dev Returns the available balances of tokens for a specific user
     * @param _user The address of the user
     * @return An array of token addresses and an array of corresponding balances of available balances which are funds in the deposit pool that are not locked in savings
     */
    function getAvailableBalances(address _user) external view returns (address[] memory, uint256[] memory) {
        address[] memory tokens = new address[](acceptedTokenCount); 
        uint256[] memory balances = new uint256[](acceptedTokenCount);

        tokens[0] = acceptedTokensAddresses[TokenType.USDT];
        tokens[1] = acceptedTokensAddresses[TokenType.LSK];
        tokens[2] = acceptedTokensAddresses[TokenType.SAFU];

        balances[0] = userTokenBalances[_user][tokens[0]];
        balances[1] = userTokenBalances[_user][tokens[1]];
        balances[2] = userTokenBalances[_user][tokens[2]];

        return (tokens, balances);
    }


    /**
     * @dev Returns the savings of a specific user
     * @param _user The address of the user
     * @return An array of Safe structs representing the user's savings 
    */
    function getUserSavings(address _user) external view returns (Safe[] memory) {

        uint256 savingsCount = userSavingsCount[_user];
        Safe[] memory userSavingsArray = new Safe[](savingsCount);

        for (uint256 i = 0; i < savingsCount; i++) {
            userSavingsArray[i] = userSavings[_user][i];
        }

        return userSavingsArray;
    }

    // TODO: // Get all users savings across types


    // Get scheduled savings and next savings action
    function getScheduledSavings() external view returns (ScheduledSaving[] memory) {
        AutomatedSavingsPlan storage plan = automatedSavingsPlans[msg.sender];
        
        // If no plan exists or it's invalid, return empty array
        if (plan.amount == 0 || plan.frequency == 0 || plan.duration == 0) {
            return new ScheduledSaving[](0);
        }
        
        // Calculate how many future savings events there will be
        uint256 timeRemaining = plan.duration - (block.timestamp - plan.lastSavingTimestamp);
        uint256 numScheduledSavings = timeRemaining / plan.frequency;
        
        ScheduledSaving[] memory scheduledSavings = new ScheduledSaving[](numScheduledSavings);
        
        uint256 nextSavingTime = plan.lastSavingTimestamp + plan.frequency;
        
        for (uint256 i = 0; i < numScheduledSavings; i++) {
            scheduledSavings[i] = ScheduledSaving({
                token: plan.token,
                amount: plan.amount,
                scheduledDate: nextSavingTime
            });
            nextSavingTime += plan.frequency;
        }
        
        return scheduledSavings;
    }

// =================================== GET CLAIMABLE BALANCE =====================================

    // TODO: CREATE A FUNCTION THAT SHOWS CLAIMABLE BALANCE 
    function getClaimableSavings() external view {
        
    }

// =================================== GET TRAMNSACTIONS =====================================

    /**
     * @notice Gets the transaction history for the user
     * @param offset The offset for pagination
     * @param limit The limit for pagination
     * @return Transaction[] The array of transactions
    */
    // function getTransactionHistory(uint256 offset, uint256 limit) external view 
    // returns (Transaction[] memory) {
    //     Transaction[] memory history = userTransactions[msg.sender];
    //     uint256 length = history.length;
        
    //     // If there are no transactions, return empty array
    //     if (length == 0) {
    //         return new Transaction[](0);
    //     }
        
    //     // Adjust offset if it's beyond array bounds
    //     if (offset >= length) {
    //         offset = length - (length % limit);
    //         if (offset == length) {
    //             offset = length > limit ? length - limit : 0;
    //         }
    //     }
        
    //     // Calculate actual size of returned array
    //     uint256 size = length - offset;
    //     if (size > limit) {
    //         size = limit;
    //     }
        
    //     // Create return array and populate it
    //     Transaction[] memory page = new Transaction[](size);
    //     for (uint256 i = 0; i < size; i++) {
    //         page[i] = history[length - 1 - (offset + i)];
    //     }
        
    //     return page;
    // }


// =================================== ADD TRANSACTION =====================================

    /**
     * @notice Adds a new transaction to the user's transaction history
     * @param _type The type of transaction
     * @param _token The address of the token
     * @param _amount The amount of the transaction
    */
    function addTransaction(string memory _type, address _token, uint256 _amount) internal {
        Transaction memory newTransaction = Transaction({
            id: txCount++,
            user: msg.sender,
            token: _token,
            typeOfTransaction: _type,
            amount: _amount,
            timestamp: block.timestamp,
            status: TxStatus.Completed  // Or Pending, depending on your needs
        });
        
        userTransactions[msg.sender].push(newTransaction);

        emit TransactionHistoryUpdated(msg.sender, txCount, newTransaction.id, _token, _type, _amount, block.timestamp, TxStatus.Completed);
    }

    /**
     * @notice Gets the recommended offset for pagination
     * @param limit The limit for pagination
     * @return uint256 The recommended offset
    */
    function getRecommendedOffset(uint256 limit) external view returns (uint256) {
        uint256 length = userTransactions[msg.sender].length;
        if (length == 0) return 0;
        
        uint256 lastPage = length / limit;
        return lastPage * limit;
    }


// ================================== GET SAVINGS HISTORY ===================================

    function getSavingsActionHistory() external view returns (Transaction[] memory) {
        Transaction[] memory history = userTransactions[msg.sender];
        
        // First, count how many savings-related transactions we have
        uint256 savingsCount = 0;
        for (uint256 i = 0; i < history.length; i++) {
            if (isSavingsTransaction(history[i].typeOfTransaction)) {
                savingsCount++;
            }
        }
        
        // Create an array of the correct size
        Transaction[] memory savingsHistory = new Transaction[](savingsCount);
        
        // Fill the array
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < history.length; i++) {
            if (isSavingsTransaction(history[i].typeOfTransaction)) {
                savingsHistory[currentIndex] = history[i];
                currentIndex++;
            }
        }
        
        return savingsHistory;
    }

    // Helper function to check if a transaction is savings-related
    function isSavingsTransaction(string memory txType) internal pure returns (bool) {
        return (
            keccak256(abi.encodePacked(txType)) == keccak256(abi.encodePacked("save")) ||
            keccak256(abi.encodePacked(txType)) == keccak256(abi.encodePacked("spendAndSave")) ||
            keccak256(abi.encodePacked(txType)) == keccak256(abi.encodePacked("automatedSave")) ||
            keccak256(abi.encodePacked(txType)) == keccak256(abi.encodePacked("unlock"))
        );
    }


// ================================== ADMIN ACTIONS ===================================

    /**
     * @notice Adds a new token to the list of accepted tokens
     * @param _token The address of the token
     * @param _tokenType The type of token
    */
    function addAcceptedToken(address _token, TokenType _tokenType) external onlyOwner {
        if (_token == address(0)) revert InvalidTokenAddress();
        if (acceptedTokens[_token]) revert("Token already accepted");

        acceptedTokens[_token] = true;
        acceptedTokensAddresses[_tokenType] = _token;

        acceptedTokenCount++;

        emit TokenAdded(_token, _tokenType);
    }

    /**
     * @notice Removes a token from the list of accepted tokens
     * @param _tokenType The type of token to remove
    */
    function removeAcceptedToken(TokenType _tokenType) external onlyOwner {
        address tokenAddress = acceptedTokensAddresses[_tokenType];
        if (!acceptedTokens[tokenAddress]) revert("Token is not accepted");

        acceptedTokens[tokenAddress] = false;
        delete acceptedTokensAddresses[_tokenType];

        acceptedTokenCount--;

        emit TokenRemoved(tokenAddress, _tokenType);
    }


    function getContractBalance(address _token) external view onlyOwner returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

}