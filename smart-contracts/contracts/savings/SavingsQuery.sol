// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./SavingsBase.sol";

contract SavingsQuery is SavingsBase {


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

    /**
     * @notice Gets the transaction history for the user
     * @param offset The offset for pagination
     * @param limit The limit for pagination
     * @return Transaction[] The array of transactions
    */
   function getTransactionHistory(uint256 offset, uint256 limit) external view 
   returns (Transaction[] memory) {
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

    // TODO: Implement getClaimableSavings function
    function getClaimableSavings() external view {
        // Implementation pending
    }
}