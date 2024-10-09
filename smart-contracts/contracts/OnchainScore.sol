// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function decimals() external view returns (uint8);
}

/**
 * @title UserScore
 * @dev A contract for managing and updating user scores based on their on-chain activity.
 */
contract UserScore {
    
    /**
     * @dev Represents a user's score, including base network score, platform score, total score, and last update timestamp.
     */
    struct Score {
        uint256 baseNetworkScore;   
        uint256 platformScore;      
        uint256 totalScore;         
        uint256 lastUpdated;        
    }

    /**
     * @dev Mapping of user addresses to their respective scores.
     */
    mapping(address => Score) public userScores;

    /**
     * @dev Maximum base network score a user can achieve.
     */
    uint256 private constant MAX_BASE_SCORE = 100;

    /**
     * @dev Maximum platform score a user can achieve.
     */
    uint256 private constant MAX_PLATFORM_SCORE = 100;
    
    /**
     * @dev Weightage for base network score in total score calculation.
     * 50% weight for Base network score
     */
    uint256 private constant BASE_WEIGHT = 50;
    
    /**
     * @dev Weightage for platform score in total score calculation.
     * 50% weight for platform score
     */
    uint256 private constant PLATFORM_WEIGHT = 50;

    IERC20 public immutable scoreToken;
    uint256 public immutable tokenDecimals;

    constructor(address _tokenAddress) {
        scoreToken = IERC20(_tokenAddress);
        tokenDecimals = scoreToken.decimals();
    }

    /**
     * @dev Emitted when a user's score is updated.
     * @param user The address of the user whose score was updated.
     * @param baseScore The updated base network score.
     * @param platformScore The updated platform score.
     * @param totalScore The updated total score.
     */
    event ScoreUpdated(address user, uint256 baseScore, uint256 platformScore, uint256 totalScore);

    /**
     * @dev Updates a user's score based on their base network transactions, saved amount, and platform transactions.
     * @param user The address of the user to update the score for.
     * @param baseTxCount The number of base network transactions.
     * @param savedAmount The amount saved by the user.
     * @param platformTxCount The number of platform transactions.
     */
    function updateScore(
        address user,
        uint256 baseTxCount,
        uint256 savedAmount,
        uint256 platformTxCount
    ) external {
        // Update Base network score
        uint256 baseScore = calculateBaseScore(baseTxCount);
        
        // Update platform score
        uint256 platformScore = calculatePlatformScore(savedAmount, platformTxCount);
        
        // Calculate total score
        uint256 totalScore = (baseScore * BASE_WEIGHT + platformScore * PLATFORM_WEIGHT) / 100;
        
        // Update user's score
        userScores[user] = Score({
            baseNetworkScore: baseScore,
            platformScore: platformScore,
            totalScore: totalScore,
            lastUpdated: block.timestamp
        });
        
        emit ScoreUpdated(user, baseScore, platformScore, totalScore);
    }
    
    /**
     * @dev Calculates the base network score based on the number of transactions.
     * @param txCount The number of transactions.
     * @return The calculated base network score.
     */
    function calculateBaseScore(uint256 txCount) public pure returns (uint256) {
        if (txCount == 0) return 0;
        if (txCount < 10) return 10;
        if (txCount < 80) return 50;
        if (txCount < 150) return 60;
        if (txCount < 300) return 80;
        return MAX_BASE_SCORE;
    }
    
    /**
     * @dev Calculates the platform score based on the saved amount and number of transactions.
     * @param savedAmount The amount saved by the user.
     * @param txCount The number of transactions.
     * @return The calculated platform score.
     */
    function calculatePlatformScore(uint256 savedAmount, uint256 txCount) public view returns (uint256) {
        // Convert saved amount to a standardized unit for scoring
        // Example: If token has 18 decimals and we want to score per 100 tokens
        uint256 standardizedAmount = savedAmount / (10 ** (tokenDecimals - 2));
        
        // Calculate amount score (max 50 points)
        uint256 amountScore = standardizedAmount;
        if (amountScore > 50) amountScore = 50;
        
        // Calculate activity score (max 50 points)
        uint256 activityScore = txCount * 2;  // 2 points per transaction
        if (activityScore > 50) activityScore = 50;
        
        return amountScore + activityScore;
    }
    
    
    function getUserScore() external view returns (
        Score memory
    ) {
        return userScores[msg.sender];
    }
}