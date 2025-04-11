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

    enum TokenType {
        USDT,
        LSK,
        SAFU
    }
    enum TxStatus {
        Completed,
        Pending,
        Failed
    }

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
        uint256 startTime;
        uint256 unlockTime;
        uint256 lastSavingTimestamp;
        uint256 nextSavingTimestamp;
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

    address[] public automatedSavingsUsers;

    mapping(address => bool) public isInAutomatedSavingsArray;

    // Modification to track automated savings per user per token
    mapping(address => mapping(address => bool))
        public userAutomatedSavingsPerToken;

    mapping(address => mapping(address => uint256)) public totalAmountSaved; // user => token => amountSaved

    mapping(address => Transaction[]) public userTransactions;

    mapping(address => mapping(address => uint256)) private userTokenBalances;
    mapping(address => mapping(uint256 => Safe)) private userSavings; // user => id => safe 
    mapping(address => uint256) private userSavingsCount; // user => count - remember to update this in different savings actions function

    mapping(TokenType => address) public acceptedTokensAddresses;
    mapping(address => bool) public acceptedTokens;

    mapping(address => AutomatedSavingsPlan) public automatedSavingsPlans;
    mapping(address => SpendAndSavePlan) public userSpendAndSavePlan;
    mapping(address => bool) public userSpendAndSavePlanExists;
    mapping(address => bool) public userAutomatedPlanExists;

    mapping(address => mapping(address => bool)) public isTokenAutoSaved;

    // Fee configuration
    uint256 public automatedSavingsFeePercentage; // Fee in basis points (e.g., 50 = 0.5%)
    address public feeCollector; // Address that collects the fees

    // Events
    event DepositSuccessful(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event SavedSuccessfully(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 duration
    );
    event Withdrawn(address indexed user, address tokenType, uint256 amount);
    event SpendAndSave(
        address indexed user,
        address indexed token,
        uint256 amountSaved
    );
    event AutomatedSavingSet(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 frequency
    );
    event AutomatedSavingExecuted(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event SavingsWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 fee,
        bool earlyWithdrawal
    );
    event TokenAdded(address indexed token, TokenType tokenType);
    event TokenRemoved(address indexed token, TokenType tokenType);
    event PlanCreated(
        address indexed user,
        address indexed token,
        uint8 percentage,
        uint256 duration
    );
    event AutomatedPlanCreated(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 frequency
    );
    event TransactionHistoryUpdated(
        address indexed user,
        uint256 txCount,
        uint256 txId,
        address indexed token,
        string typeOfTransaction,
        uint256 amount,
        uint256 timestamp,
        TxStatus status
    );

    event BatchAutomatedSavingsExecuted(uint256 executedCount, uint256 skippedCount);

    event AutomatedSavingsFeeCharged(address indexed user, address indexed token, uint256 fee);
    event FeeConfigurationUpdated(uint256 newFeePercentage, address newFeeCollector);

    /**
     * @dev Constructor function to initialize the contract with accepted token addresses
     * @param _erc20TokenAddress The address of the ERC20 token
     * @param _liskTokenAddress The address of the LISK token
     * @param _safuTokenAddress The address of the SAFU token
     */
    constructor(
        address _erc20TokenAddress,
        address _liskTokenAddress,
        address _safuTokenAddress,
        uint256 _initialFeePercentage,
        address _feeCollector
    ) {
        owner = msg.sender;

        if (
            _erc20TokenAddress == address(0) ||
            _liskTokenAddress == address(0) ||
            _safuTokenAddress == address(0)
        ) revert AddressZeroDetected();

        acceptedTokensAddresses[TokenType.USDT] = _erc20TokenAddress;
        acceptedTokensAddresses[TokenType.LSK] = _liskTokenAddress;
        acceptedTokensAddresses[TokenType.SAFU] = _safuTokenAddress;

        acceptedTokens[_erc20TokenAddress] = true;
        acceptedTokens[_liskTokenAddress] = true;
        acceptedTokens[_safuTokenAddress] = true;

        acceptedTokenCount += 3;

        automatedSavingsFeePercentage = _initialFeePercentage;
        feeCollector = _feeCollector;
    }

    modifier onlyOwner() {
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
        if (IERC20(_token).balanceOf(msg.sender) < _amount)
            revert InsufficientFunds();

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
    function save(
        address _token,
        uint256 _amount,
        uint256 _duration
    ) public nonReentrant {
        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_duration == 0) revert InvalidInput();

        if (userTokenBalances[msg.sender][_token] < _amount)
            revert InsufficientFunds();

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

        totalAmountSaved[msg.sender][_token] += _amount;

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
    function createSpendAndSavePlan(
        address _token,
        uint8 _percentage,
        uint256 _duration
    ) external {
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_percentage == 0 || _percentage > 100) revert InvalidPercentage();
        if (_duration == 0) revert InvalidInput();
        if (userSpendAndSavePlanExists[msg.sender])
            revert userSpendAndSavePlanAlreadyExists();

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
     * @notice Creates an automated savings plan for the user
     * @param _token The address of the token to be used for the savings plan
     * @param _amount The amount to be saved in the plan
     * @param _frequency The frequency of the savings plan
     * @param _duration The duration of the savings plan
     */
    function createAutomatedSavingsPlan(
        address _token,
        uint256 _amount,
        uint256 _frequency,
        uint256 _duration
    ) external {
        if (!acceptedTokens[_token]) revert InvalidTokenAddress();
        if (_amount == 0 || _frequency == 0) revert ZeroValueNotAllowed();
        if (_frequency > 365 days) revert InvalidInput();

        // Check if user already has an automated savings plan for this specific token
        if (userAutomatedSavingsPerToken[msg.sender][_token])
            revert("Automated savings plan already exists for this token");

        // Check if user has reached maximum number of automated savings plans
        if (userAutomatedPlanExists[msg.sender])
            revert("User already has an automated savings plan");

        automatedSavingsPlans[msg.sender] = AutomatedSavingsPlan({
            token: _token,
            amount: _amount,
            frequency: _frequency,
            duration: _duration,
            startTime: block.timestamp,
            unlockTime: block.timestamp + _duration,
            lastSavingTimestamp: 0,
            nextSavingTimestamp: block.timestamp + _frequency
        });

        // Create a new safe for the automated savings plan
        uint256 savingsIndex = userSavingsCount[msg.sender];
        userSavings[msg.sender][savingsIndex] = Safe({
            typeOfSafe: "Automated",
            id: savingsIndex,
            token: _token,
            amount: 0, // Will be updated in the calling function
            duration: _duration,
            startTime: block.timestamp,
            unlockTime: block.timestamp + _duration
        });

        userSavingsCount[msg.sender]++;

        userAutomatedPlanExists[msg.sender] = true;
        userAutomatedSavingsPerToken[msg.sender][_token] = true;
        isTokenAutoSaved[msg.sender][_token] = true;

        // Add user to the automated savings users array if not already present
        if (!isInAutomatedSavingsArray[msg.sender]) {
            automatedSavingsUsers.push(msg.sender);
            isInAutomatedSavingsArray[msg.sender] = true;
        }

        emit AutomatedPlanCreated(msg.sender, _token, _amount, _frequency);
    }

    // ======================================= GET AND EXECUTE AUTOMATED SAVINGS PLANS DUE =======================================

    function getAndExecuteAutomatedSavingsPlansDue() external nonReentrant {
        uint256 dueCount = 0;
        uint256 skippedCount = 0;
        
        for (uint256 i = 0; i < automatedSavingsUsers.length; i++) {
            address user = automatedSavingsUsers[i];
            AutomatedSavingsPlan storage plan = automatedSavingsPlans[user];

            if (userTokenBalances[user][plan.token] < plan.amount) {
                skippedCount++;
                continue;
            }

            // Check if the plan is due and still active
            if (
                plan.amount > 0 && block.timestamp >= plan.nextSavingTimestamp
            ) {
                try this.executeAutomatedSaving(user) {
                    dueCount++;
                } catch {
                    skippedCount++;
                }
            }
        }

        emit BatchAutomatedSavingsExecuted(dueCount, skippedCount);
    }

    // ======================================= EXECUTE SPEND AND SAVE =======================================

    /**
     * @notice Executes the spend and save functionality by saving a percentage of the spent amount
     * @param _token The address of the token for spend and save
     * @param _amount The amount spent, from which a percentage will be saved
     * @dev This function calculates the amount to save based on the spend percentage set in the user's plan, deposits the required funds from the external wallet to the pool and then saves the funds to the user's savings.
     */
    // TODO: ADD ERROR HANDLER TO THROW IF USER HASNT SET UP A SPEND AND SAVE PLAN BEFORE CALLING THIS FUNCTION
    function spendAndSave(
        address _token,
        uint256 _amount
    ) external nonReentrant {
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

            totalAmountSaved[msg.sender][_token] += amountToSave;

            addTransaction("spend and save", _token, _amount);

            emit SpendAndSave(msg.sender, _token, amountToSave);
        }
    }

    /**
     * @dev Calculates and charges fee for automated savings execution
     * @param _user The user being charged
     * @param _token The token being used
     * @param _amount The amount being saved
     * @return netAmount The amount after fee deduction
     */
    function calculateAndChargeFee(
        address _user,
        address _token,
        uint256 _amount
    ) internal returns (uint256 netAmount) {
        // Calculate fee (using basis points)
        uint256 fee = (_amount * automatedSavingsFeePercentage) / 10000;
        netAmount = _amount - fee;

        if (fee > 0) {
            // Transfer fee to fee collector
            userTokenBalances[feeCollector][_token] += fee;
            
            emit AutomatedSavingsFeeCharged(_user, _token, fee);
        }

        return netAmount;
    }

    // ===================================== EXECUTE AUTOMATED SAVINGS =====================================

    /**
     * @notice Executes automated savings for a user
     * @param _user The address of the user
     * @dev This function is designed to be called internally or by trusted external contracts
    */
    function executeAutomatedSaving(address _user) external {
        AutomatedSavingsPlan storage plan = automatedSavingsPlans[_user];

        // Check if plan is valid and due
        if (plan.amount == 0 || plan.frequency == 0) return;
        if (block.timestamp < plan.lastSavingTimestamp + plan.frequency) return;

        // Check if plan has exceeded its duration
        if (block.timestamp > plan.unlockTime) {
            // Clean up the plan
            userAutomatedPlanExists[_user] = false;
            userAutomatedSavingsPerToken[_user][plan.token] = false;
            removeFromAutomatedSavings(_user);
            delete automatedSavingsPlans[_user];
            return;
        }

        // Check if user has sufficient balance
        if (userTokenBalances[_user][plan.token] < plan.amount) return;

        // Deduct total amount including fee from user's balance
        userTokenBalances[_user][plan.token] -= plan.amount;

        // Calculate net amount after fee
        uint256 netAmount = calculateAndChargeFee(_user, plan.token, plan.amount);

        // Find or create a new savings slot
        uint256 savingsIndex = findAutomatedSavingsSafe(
            _user,
            plan.token
        );

        // Save the net amount (after fee)
        userSavings[_user][savingsIndex].amount += netAmount;

        // Update plan timestamps
        plan.lastSavingTimestamp = block.timestamp;
        plan.nextSavingTimestamp = block.timestamp + plan.frequency;

        // Update total amount saved
        totalAmountSaved[_user][plan.token] += netAmount;

        addTransaction("auto save", plan.token, netAmount);

        emit AutomatedSavingExecuted(_user, plan.token, plan.amount);
    }

    // Helper function to remove a user from automated savings if their plan expires or is cancelled
    function removeFromAutomatedSavings(address _user) public {

        AutomatedSavingsPlan storage plan = automatedSavingsPlans[_user];

        if (isInAutomatedSavingsArray[_user]) {
            // Find and remove the user from the array
            userAutomatedPlanExists[_user] = false;
            userAutomatedSavingsPerToken[_user][plan.token] = false;
            // removeFromAutomatedSavings(_user);
            delete automatedSavingsPlans[_user];

            //  ***///---- TODO: Check if this is necessary

            for (uint256 i = 0; i < automatedSavingsUsers.length; i++) {
                if (automatedSavingsUsers[i] == _user) {
                    // Replace with the last element and then remove the last element
                    automatedSavingsUsers[i] = automatedSavingsUsers[automatedSavingsUsers.length - 1];
                    automatedSavingsUsers.pop();
                    isInAutomatedSavingsArray[_user] = false;
                    break;
                }
            }
        }
    }

    /**
     * @dev Finds an existing automated savings safe or creates a new one
     * @param _user The address of the user
     * @param _token The token address
     * @return The index of the safe
     */
    function findAutomatedSavingsSafe(
        address _user,
        address _token
    ) internal view returns (uint256) {
        // First, try to find an existing automated savings safe for the token
        for (uint256 i = 0; i < userSavingsCount[_user]; i++) {
            if (
                userSavings[_user][i].token == _token &&
                keccak256(abi.encodePacked(userSavings[_user][i].typeOfSafe)) ==
                keccak256(abi.encodePacked("Automated"))
            ) {
                return i;
            }
        }
        revert();
    }


    function getAutomatedSavingsDuePlans() external view returns (address[] memory) {
        // Count how many plans are due
        uint256 dueCount = 0;
        for (uint256 i = 0; i < automatedSavingsUsers.length; i++) {
            address user = automatedSavingsUsers[i];
            AutomatedSavingsPlan storage plan = automatedSavingsPlans[user];
            
            // Check if the plan is due and still active
            if (plan.amount > 0 && block.timestamp >= plan.nextSavingTimestamp) {
                dueCount++;
            }
        }

        // Create an array to store due plan addresses
        address[] memory duePlans = new address[](dueCount);
        uint256 index = 0;

        // Populate the array with addresses of due plans
        for (uint256 i = 0; i < automatedSavingsUsers.length; i++) {
            address user = automatedSavingsUsers[i];
            AutomatedSavingsPlan storage plan = automatedSavingsPlans[user];
            
            // Check if the plan is due and still active
            if (plan.amount > 0 && block.timestamp >= plan.nextSavingTimestamp) {
                duePlans[index] = user;
                index++;
            }
        }

        return duePlans;
    }


    // Admin functions to manage fees
    function updateFeeConfiguration(uint256 _newFeePercentage, address _newFeeCollector) 
        external 
        onlyOwner 
    {
        require(_newFeePercentage <= 1000, "Fee percentage too high"); // Max 10%
        require(_newFeeCollector != address(0), "Invalid fee collector address");
        
        automatedSavingsFeePercentage = _newFeePercentage;
        feeCollector = _newFeeCollector;
        
        emit FeeConfigurationUpdated(_newFeePercentage, _newFeeCollector);
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
    function withdrawSavings(
        uint256 _savingsIndex,
        bool _acceptEarlyWithdrawalFee
    ) external nonReentrant {
        
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
    function withdrawFromPool(
        address _token,
        uint256 _amount
    ) external nonReentrant {
        if (_amount == 0) revert ZeroValueNotAllowed();
        if (userTokenBalances[msg.sender][_token] < _amount)
            revert InsufficientFunds();

        userTokenBalances[msg.sender][_token] -= _amount;

        IERC20(_token).safeTransfer(msg.sender, _amount);

        addTransaction("withdrawal", _token, _amount);

        emit Withdrawn(msg.sender, _token, _amount);
    }

    // ======================================= CLAIM ALL AVAILABLE SAVINGS ===========================================

    // TODO: FUNCTION THAT CLAIMS ALL CLAIMABLE SAVINGS
    function claimAll() external {}

    // ======================================= BALANCES ==========================================

    /**
     * @dev Returns the total balances (available + saved) of tokens for a specific user
     * @param _user The address of the user
     * @return An array of token addresses and an array of corresponding total balances. which ios culmunation of available balances and saved balances
     */
    function getUserBalances(
        address _user
    ) external view returns (address[] memory, uint256[] memory) {
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
    function getAvailableBalances(
        address _user
    ) external view returns (address[] memory, uint256[] memory) {
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
    function getUserSavings(
        address _user
    ) external view returns (Safe[] memory) {
        uint256 savingsCount = userSavingsCount[_user];
        Safe[] memory userSavingsArray = new Safe[](savingsCount);

        for (uint256 i = 0; i < savingsCount; i++) {
            userSavingsArray[i] = userSavings[_user][i];
        }

        return userSavingsArray;
    }

    // TODO: // Get all users savings across types

    // Get scheduled savings and next savings action
    function getScheduledSavings()
        external
        view
        returns (ScheduledSaving[] memory)
    {
        AutomatedSavingsPlan storage plan = automatedSavingsPlans[msg.sender];

        // If no plan exists or it's invalid, return empty array
        if (plan.amount == 0 || plan.frequency == 0 || plan.duration == 0) {
            return new ScheduledSaving[](0);
        }

        // Calculate how many future savings events there will be
        uint256 timeRemaining = plan.duration -
            (block.timestamp - plan.lastSavingTimestamp);
        uint256 numScheduledSavings = timeRemaining / plan.frequency;

        ScheduledSaving[] memory scheduledSavings = new ScheduledSaving[](
            numScheduledSavings
        );

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

    // =================================== GET TRAMNSACTIONS =====================================

    /**
     * @notice Gets the transaction history for the user
     * @param offset The offset for pagination
     * @param limit The limit for pagination
     * @return Transaction[] The array of transactions
     */
    function getTransactionHistory(
        uint256 offset,
        uint256 limit
    ) external view returns (Transaction[] memory) {
        Transaction[] memory history = userTransactions[msg.sender];
        uint256 length = history.length;

        // If there are no transactions, return empty array
        if (length == 0) {
            return new Transaction[](0);
        }

        // Adjust offset if it's beyond array bounds
        if (offset >= length) {
            offset = length - (length % limit);
            if (offset == length) {
                offset = length > limit ? length - limit : 0;
            }
        }

        // Calculate actual size of returned array
        uint256 size = length - offset;
        if (size > limit) {
            size = limit;
        }

        // Create return array and populate it
        Transaction[] memory page = new Transaction[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = history[length - 1 - (offset + i)];
        }

        return page;
    }

    // =================================== ADD TRANSACTION =====================================

    /**
     * @notice Adds a new transaction to the user's transaction history
     * @param _type The type of transaction
     * @param _token The address of the token
     * @param _amount The amount of the transaction
     */
    function addTransaction(
        string memory _type,
        address _token,
        uint256 _amount
    ) internal {
        Transaction memory newTransaction = Transaction({
            id: txCount++,
            user: msg.sender,
            token: _token,
            typeOfTransaction: _type,
            amount: _amount,
            timestamp: block.timestamp,
            status: TxStatus.Completed // Or Pending, depending on your needs
        });

        userTransactions[msg.sender].push(newTransaction);

        emit TransactionHistoryUpdated(
            msg.sender,
            txCount,
            newTransaction.id,
            _token,
            _type,
            _amount,
            block.timestamp,
            TxStatus.Completed
        );
    }

    // ================================== ADMIN ACTIONS =======================================

    function getContractBalance(
        address _token
    ) external view onlyOwner returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
}
