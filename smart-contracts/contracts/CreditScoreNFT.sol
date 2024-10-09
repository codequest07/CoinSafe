// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./OnchainScore.sol";  // Importing the OnchainScore contract;

contract CreditScoreNFT is ERC721 {
    uint256 private _nextTokenId;
    address public initialOwner;
    UserScore public userScoreContract;  // Reference to the OnchainScore contract

    struct CreditScore {
        uint256 score;
        uint256 lastUpdateTime;
    }

    mapping(address => CreditScore) public creditScores;
    mapping(address => uint256) public userToTokenId;
    mapping(address => bool) public authorizedUpdaters;

    event CreditScoreUpdated(address indexed user, uint256 newScore, uint256 tokenId);
    event NFTMinted(address indexed to, uint256 tokenId);

    constructor(address _userScoreContractAddress) ERC721("CreditScoreNFT", "CSNFT") {
        initialOwner = msg.sender;
        userScoreContract = UserScore(_userScoreContractAddress);  // Initialize the OnchainScore contract
        _nextTokenId = 1;
    }

    function mint(address to) public returns (uint256) {
        
        // Ensure the OnchainScore contract is correctly set up
        require(address(userScoreContract) != address(0), "UserScore contract not set");

        // Fetch the user's total score from the OnchainScore contract
        (, , uint256 totalScore, ) = userScoreContract.userScores(to);

        // Ensure that the user's total score is not zero
        require(totalScore > 0, "Cannot mint NFT: User score is zero or not available");

        // Mint the NFT
        uint256 tokenId = _nextTokenId++;  // Increment the token ID counter
        _safeMint(to, tokenId);

        // Store the user's score in this contract and link it to the NFT
        creditScores[to] = CreditScore(totalScore, block.timestamp);
        userToTokenId[to] = tokenId;

        emit NFTMinted(to, tokenId);
        return tokenId;
    }


    function getUserScore(address user) external view returns (uint256 totalScore) {
        (, , totalScore, ) = userScoreContract.userScores(user);
        return totalScore;
    }



    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "ERC721Metadata: URI query for nonexistent token");

        CreditScore memory score = creditScores[owner];

        string memory svg = generateSVG(score.score, score.lastUpdateTime);
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Credit Score NFT", ',
                        '"description": "An NFT representing a user\'s credit score", ',
                        '"image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateSVG(uint256 score, uint256 lastUpdateTime) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280" width="1280" height="1280">',
                '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#008000;stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#000000;stop-opacity:1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="100%" height="100%" fill="url(#bg)"/>',
                '<text x="640" y="400" font-family="Arial, sans-serif" font-size="100" fill="white" text-anchor="middle">Credit Score NFT</text>',
                '<text x="640" y="640" font-family="Arial, sans-serif" font-size="150" font-weight="bold" fill="white" text-anchor="middle">',
                Strings.toString(score),
                '</text>',
                '<text x="640" y="800" font-family="Arial, sans-serif" font-size="100" fill="white" text-anchor="middle">Last Updated: ',
                Strings.toString(lastUpdateTime),
                '</text>',
                '<text x="640" y="1000"  font-family="Arial, sans-serif" font-size="100" fill="white" text-anchor="middle">by CoinSafe</text>',
                '</svg>'
            )
        );
    }
}
