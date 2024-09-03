// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Savings {
    using SafeERC20 for IERC20;

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

    mapping(address => uint256) public depositBalances;
    mapping(address => Safe) public savings;
    mapping(address => bool) public acceptedTokens;

    event DepositSuccessful(address indexed user, address indexed token, uint256 amount);
    event SavedSuccessfully(address indexed user, address indexed token, uint256 amount, uint256 duration);

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    constructor() {
        owner = msg.sender;
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
}