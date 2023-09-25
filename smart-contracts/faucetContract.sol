// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract TokenFaucet is Ownable {
//     IERC20 public token;

//     constructor(address _tokenAddress) {
//         token = IERC20(_tokenAddress);
//     }

//     function withdrawTokens(uint256 amount) external onlyOwner {
//         require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
//         token.transfer(owner(), amount);
//     }

//     function requestTokens(uint256 amount) external {
//         require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
//         token.transfer(msg.sender, amount);
//     }
// }