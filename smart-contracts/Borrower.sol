// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Borrower {
    IERC20 public assetToken;
    address public owner;
    uint256 public borrowedAmount;

    constructor(address _assetToken) {
        assetToken = IERC20(_assetToken);
        owner = msg.sender;
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(borrowedAmount == 0, "Already borrowed");
        require(assetToken.balanceOf(address(this)) >= amount, "Insufficient funds in the contract");

        assetToken.transfer(msg.sender, amount);
        borrowedAmount = amount;
    }

    function repay(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(borrowedAmount > 0, "No loan to repay");
        require(assetToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (amount >= borrowedAmount) {
            borrowedAmount = 0;
        } else {
            borrowedAmount -= amount;
        }
    }

    // Allow the owner to withdraw any excess collateral
    function withdrawExcessCollateral() external {
        require(msg.sender == owner, "Only the owner can withdraw");
        uint256 excessCollateral = assetToken.balanceOf(address(this)) - borrowedAmount;
        require(excessCollateral > 0, "No excess collateral to withdraw");
        assetToken.transfer(owner, excessCollateral);
    }
}

// Users can borrow tokens by calling the borrow function. They specify the amount they want to borrow, and the contract checks if sufficient funds are available. Once borrowed, the borrowedAmount state variable is updated to reflect the borrowed amount.
// Users can repay the borrowed amount by calling the repay function. They specify the amount they want to repay, and the contract transfers the tokens back to the contract. If the repaid amount equals or exceeds the borrowed amount, the borrowedAmount is set to 0, indicating that the loan has been repaid in full.
// The withdrawExcessCollateral function allows the owner to withdraw any excess collateral (tokens not used for borrowing) from the contract. This helps ensure that the owner can recover any unused funds.

