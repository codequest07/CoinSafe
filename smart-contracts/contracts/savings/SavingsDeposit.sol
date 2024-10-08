// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./SavingsBase.sol";

contract SavingsDeposit is SavingsBase {

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
}