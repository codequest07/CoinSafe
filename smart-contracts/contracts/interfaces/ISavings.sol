// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

enum TxStatus { Completed, Pending, Failed }
struct Transaction {
    uint256 id;
    address user;
    address token;
    string typeOfTransaction;
    uint256 amount;
    uint256 timestamp;
    TxStatus status; 
}

interface ISavings {
    function createAutomatedSavingsPlan(address _token, uint256 _amount, uint256 _frequency, uint256 _duration) external;
    function getTransactionHistory(uint256 offset, uint256 limit) external view returns (Transaction[] memory);
}