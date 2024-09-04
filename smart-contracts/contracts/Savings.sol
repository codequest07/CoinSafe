import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Savings is ReentrancyGuard {
    using SafeERC20 for IERC20;

    error AddressZeroDetected();
    error ZeroValueNotAllowed();
    error InsufficientFunds();
    error InvalidTokenAddress();
    error NotOwner();

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

    struct SpendAndSavePlan {
        address token;
        uint balance;
        uint8 percentage;
        uint duration;
    }


    mapping(address => uint256) public depositBalances;
    mapping(address => Safe) public savings;
    mapping(address => bool) public acceptedTokens;
    //mapping(address => uint256) public balancesPool;
    mapping(address => FrequentSavings) public frequentSavings;
    //mapping(address => Deposit[]) public deposits;
    mapping(bytes32 => address) public tokenAddresses;
    mapping(address => SpendAndSavePlan) public userSpendAndSave;


    event DepositSuccessful(address indexed user, address indexed token, uint256 amount);
    event SavedSuccessfully(address indexed user, address indexed token, uint256 amount, uint256 duration);
    event SavingsTriggered(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, bytes32 tokenType, uint256 amount);
    event SpendAndSave(address indexed user, address indexed token, uint256 amountSaved);

    constructor(address _erc20TokenAddress, address _liskTokenAddress, address _safuTokenAddress) {
        owner = msg.sender;
        tokenAddresses[keccak256("ERC20")] = _erc20TokenAddress;
        tokenAddresses[keccak256("LSK")] = _liskTokenAddress;
        tokenAddresses[keccak256("SAFU")] = _safuTokenAddress;
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

    function createSpendAndSaveplan(address _token, uint8 _percentage, uint _duration)  returns () {

        require(percentage <= 100, "Invalid saving percentage");

        userSpendAndSave[msg.sender] = SpendAndSave({
            token = _token,
            balance = 0,
            percentage = _percentage,
            duration = _duration
        })
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
        FrequentSavings storage savings = frequentSavings[user];
        uint256 amount = savings.amount;

        require(block.timestamp >= savings.nextTimestamp, "Savings interval not reached yet");
        require(depositBalances[user] >= amount, "Insufficient balance in pool");

        depositBalances[user] -= amount;

        depositBalances[user].push(Deposit({
            amount: amount,
            endTimestamp: block.timestamp + savings.duration
        }));

        savings.nextTimestamp += savings.interval;

        emit SavingsTriggered(user, amount);
    }

    function withdrawFromPool(bytes32 tokenType, uint256 amount) external nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than zero");
        require(depositBalances[msg.sender] >= amount, "Insufficient balance in pool");

        address tokenAddress = tokenAddresses[tokenType];
        require(tokenAddress != address(0), "Token type not supported");

        depositBalances[msg.sender] -= amount;

        //should this be only IERC20 and should i add the recipeint of the transactions

        IERC20(tokenAddress).safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, tokenType, amount);
    }


    function spendAndSave(
        uint256 amount,
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        SpendAndSavePlan storage spendAndSavePlan = userSpendAndSave[msg.sender];

        address tokenAddress = spendAndSavePlan.token;
        require(tokenAddress != address(0), "Token type not supported");
        // Fetch user's saving percentage
        uint256 savingPercentage = spendAndSavePlan.percentage;

        // Calculate the amount to save
        uint256 amountToSave = (amount * savingPercentage) / 100;

        // Transfer the saving amount from user's wallet to the contract
        if (amountToSave > 0) {

            // IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amountToSave);
            deposit(tokenAddress, amountToSave);

            depositBalances[msg.sender] -= amountToSave;

            // Save the transferred amount
            save(tokenAddress, amountToSave, duration, typeName);

            savings[msg.sender] += amountToSave;

            emit SpendAndSave(msg.sender, tokenAddress, amountToSave);
        };

        };

        // Get the contract balance
    function getContractBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    // Get the user's savings balance
    function getUserSavingsBalance(address user) external view returns (uint256) {
        return depositBalances[user];
    }

}
        
