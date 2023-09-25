// Deployed these and tested via Remix as first time deploying ETH contract. 
// Deployed Address: 0x445C4FbDB81d92f80B4580F434BBb42105B90eeb https://evm-sidechain.xrpl.org/address/0x445C4FbDB81d92f80B4580F434BBb42105B90eeb
// Would explore hardhat/truffle in future.

// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "hardhat/console.sol";

// contract XRPLending_Borrowing is Ownable {
//     struct Token {
//         address tokenAddress;
//         uint256 LTV; 
//         uint256 stableRate;
//         string name;
//     }
    
//     mapping(address => bool) public supportedTokens;
//     mapping(address => uint256) public tokenCollateral;
//     mapping(address => uint256) public borrowedAmount;
//     mapping(address => uint256) public lentAmount;

//     Token[] public tokens;


//     constructor() {
       
//     }

//     function addSupportedToken(
//         address tokenAddress,
//         uint256 LTV,
//         uint256 stableRate,
//         string memory name
//     ) external onlyOwner {
//         require(!supportedTokens[tokenAddress], "Token already supported");
//         supportedTokens[tokenAddress] = true;
//         tokens.push(Token(tokenAddress, LTV, stableRate, name));
//     }

//     function lend(address tokenAddress, uint256 amount) external {
//         require(supportedTokens[tokenAddress], "Token not supported");
//         require(amount > 0, "Amount must be greater than 0");
//         IERC20 token = IERC20(tokenAddress);
//         require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");
//         token.transferFrom(msg.sender, address(this), amount);
//         lentAmount[msg.sender] += amount;
//         console.log(msg.sender, amount);
//     }

//     function borrow(address tokenAddress, uint256 amount) external {
//         require(supportedTokens[tokenAddress], "Token not supported");
//         require(amount > 0, "Amount must be greater than 0");
//         uint256 collateralValue = tokenCollateral[msg.sender];
//         uint256 maxBorrowAmount = (collateralValue * tokens[indexOfToken(tokenAddress)].LTV) / 100;

//         require(borrowedAmount[msg.sender] + amount <= maxBorrowAmount, "Borrow limit exceeded");

//         IERC20 token = IERC20(tokenAddress);

//         require(token.balanceOf(address(this)) >= amount, "Insufficient liquidity");

//         borrowedAmount[msg.sender] += amount;
//         token.transfer(msg.sender, amount);
//     }

//     function repay(address tokenAddress, uint256 amount) external {
//         require(supportedTokens[tokenAddress], "Token not supported");
//         require(amount > 0, "Amount must be greater than 0");

//         uint256 debt = borrowedAmount[msg.sender];
//         require(debt > 0, "No outstanding debt");

//         IERC20 token = IERC20(tokenAddress);

//         require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");

//         borrowedAmount[msg.sender] -= amount;
//         token.transferFrom(msg.sender, address(this), amount);

//     }

//     function depositCollateral(address tokenAddress, uint256 amount) external {
//         require(supportedTokens[tokenAddress], "Token not supported");
//         require(amount > 0, "Amount must be greater than 0");

//         IERC20 token = IERC20(tokenAddress);

//         require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");

//         token.transferFrom(msg.sender, address(this), amount);
//         tokenCollateral[msg.sender] += amount;

//     }

//     function withdrawCollateral(address tokenAddress, uint256 amount) external {
//         require(supportedTokens[tokenAddress], "Token not supported");
//         require(amount > 0, "Amount must be greater than 0");

//         uint256 collateral = tokenCollateral[msg.sender];
//         require(collateral >= amount, "Insufficient collateral");

//         tokenCollateral[msg.sender] -= amount;
//         IERC20 token = IERC20(tokenAddress);
//         token.transfer(msg.sender, amount);

//     }

//     function getTokensCount() external view returns (uint256) {
//         return tokens.length;
//     }

//     function getTokenInfo(uint256 index)
//         external
//         view
//         returns (
//             address tokenAddress,
//             uint256 LTV,
//             uint256 stableRate,
//             string memory name
//         )
//     {
//         require(index < tokens.length, "Invalid token index");
//         Token storage token = tokens[index];
//         return (token.tokenAddress, token.LTV, token.stableRate, token.name);
//     }

//     function indexOfToken(address tokenAddress) internal view returns (uint256) {
//         for (uint256 i = 0; i < tokens.length; i++) {
//             if (tokens[i].tokenAddress == tokenAddress) {
//                 return i;
//             }
//         }
//         revert("Token not found");
//     }
// }
