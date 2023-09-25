// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;
// Deployed these and tested via Remix as first time deploying ETH contract. 
// Deployed Address: 0x641E5431e0B250d78ffbeE3aB303cd239113d89e https://evm-sidechain.xrpl.org/address/0x641E5431e0B250d78ffbeE3aB303cd239113d89e
// Would explore hardhat/truffle in future.

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