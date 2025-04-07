// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TokenFaucet
 * @dev A contract for distributing tokens to users at regular intervals.
 */
contract TokenFaucet {
    using SafeERC20 for IERC20;

    IERC20 public safuToken;
    IERC20 public lskToken;
    IERC20 public usdToken;

    uint256 public safuClaimAmount = 70 * 10**18;
    uint256 public lskClaimAmount = 20 * 10**18;
    uint256 public usdClaimAmount = 40 * 10**18;
    uint256 public constant CLAIM_INTERVAL = 24 hours;
    
    address owner;
    address trustedRelayer;

    mapping(address => uint256) public lastClaimTime;

    struct TokenConfig {
        IERC20 token;
        uint256 claimAmount;
    }

    /* Events */
    event TokensClaimed(address indexed user);

    /* Custom Errors */
    error ZeroAddress();
    error ClaimTooSoon(uint256 timeRemaining);
    error InsufficientFaucetBalance(uint256 faucetBalance, uint256 requestedAmount);

    /**
     * @dev Initializes the contract, setting the token to be distributed.
     * @param _safuTokenAddress The address of the ERC20 token to be distributed.
    */
    constructor(address _safuTokenAddress, address _usdTokenAddress, address _lskTokenAddress, address _trustedRelayer) {
        if (_safuTokenAddress == address(0)) revert ZeroAddress();
        if (_usdTokenAddress == address(0)) revert ZeroAddress();
        if (_lskTokenAddress == address(0)) revert ZeroAddress();

        safuToken = IERC20(_safuTokenAddress);
        lskToken = IERC20(_lskTokenAddress);
        usdToken = IERC20(_usdTokenAddress);

        owner = msg.sender;
        trustedRelayer = _trustedRelayer;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlyTrustedRelayer {
        require(msg.sender == trustedRelayer);
        _;
    }

    /**
     * @dev Allows users to claim tokens. Users can only claim once every CLAIM_INTERVAL.
     * @notice This function will revert if:
     *  - The sender is the zero address
     *  - The claim interval has not passed since the last claim
     *  - The faucet doesn't have enough balance to fulfill the claim
     */
    function claim(address _to) external onlyTrustedRelayer {
        if (msg.sender == address(0)) revert ZeroAddress();

        uint256 nextClaimTime = lastClaimTime[_to] + CLAIM_INTERVAL;
        if (block.timestamp < nextClaimTime) {
            revert ClaimTooSoon(nextClaimTime - block.timestamp);
        }

        TokenConfig[3] memory tokens = [
            TokenConfig(safuToken, safuClaimAmount),
            TokenConfig(usdToken, usdClaimAmount),
            TokenConfig(lskToken, lskClaimAmount)
        ];

        for (uint i = 0; i < tokens.length; i++) {
            uint256 faucetBalance = tokens[i].token.balanceOf(address(this));
            if (faucetBalance >= tokens[i].claimAmount) {
                tokens[i].token.safeTransfer(_to, tokens[i].claimAmount);
            }
        }

        lastClaimTime[_to] = block.timestamp;
        emit TokensClaimed(_to);
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
     * @param _token The address of the token to withdraw.
     * @notice This function will revert if:
     *  - The `to` address is the zero address
     *  - The token transfer fails
     */
    function withdrawRemainingTokens(address _to, address _token) external onlyOwner {
        if (_to == address(0)) revert ZeroAddress();
        if (_token == address(0)) revert ZeroAddress();

        // Check which token to withdraw
        IERC20 tokenToWithdraw;
        if (_token == address(safuToken)) {
            tokenToWithdraw = safuToken;
        } else if (_token == address(usdToken)) {
            tokenToWithdraw = usdToken;
        } else if (_token == address(lskToken)) {
            tokenToWithdraw = lskToken;
        } else {
            revert("Invalid token address");
        }

        uint256 balance = tokenToWithdraw.balanceOf(address(this));
        if (balance > 0) {
            tokenToWithdraw.safeTransfer(_to, balance);
        }
    }

    function getContractBalances() external view returns (uint256, uint256, uint256) {
        return (
            safuToken.balanceOf(address(this)),
            usdToken.balanceOf(address(this)),
            lskToken.balanceOf(address(this))
        );
    }

    function getUserBalance() external view onlyOwner returns (uint256) {
        return safuToken.balanceOf(msg.sender);
    }

    function updateClaimAmounts(
        uint256 _newSafuAmount,
        uint256 _newUsdAmount, 
        uint256 _newLskAmount
    ) external onlyOwner {
        safuClaimAmount = _newSafuAmount * 10**18;
        usdClaimAmount = _newUsdAmount * 10**18;
        lskClaimAmount = _newLskAmount * 10**18;
    }
}