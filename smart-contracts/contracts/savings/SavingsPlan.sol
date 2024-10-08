// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./SavingsBase.sol";

contract SavingsPlan is SavingsBase {

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

        userSpendAndSavePlanExists[msg.sender] = true;

        emit PlanCreated(msg.sender, _token, _percentage, _duration);
    }

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
            if (userTokenBalances[msg.sender][_token] < amountToSave) revert InsufficientFunds();

            userTokenBalances[msg.sender][_token] -= amountToSave;

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
}