// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./SavingsBase.sol";

contract SavingsWithdraw is SavingsBase {


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

    // TODO: Implement claimAll function
    function claimAll() external {
        // Implementation pending
    }
}