// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;


interface  IFaucet {

    function claim() external ;

    function getNextClaimTime(address _user) external view returns (uint256) ;

    function getUserBalance() external view returns (uint256);

    function getContractBalance() external view returns (uint256);
    
}