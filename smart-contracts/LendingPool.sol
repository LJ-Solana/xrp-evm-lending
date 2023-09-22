// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingPool is Ownable {
    IERC20 public assetToken;

    struct Loan {
        address borrower;
        uint256 amountBorrowed;
        bool repaid;
    }

    Loan[] public loans;

    constructor(address _assetToken) {
        assetToken = IERC20(_assetToken);
    }

    function lend(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(assetToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        loans.push(Loan(msg.sender, amount, false));
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(assetToken.balanceOf(address(this)) >= amount, "Insufficient funds in the pool");

        // Find an available loan to borrow from
        int256 loanIndex = findAvailableLoan(amount);
        require(loanIndex >= 0, "No available loans");

        Loan storage loan = loans[uint256(loanIndex)];
        require(!loan.repaid, "Loan has already been repaid");

        assetToken.transfer(msg.sender, amount);
        loan.repaid = true;
    }

    function findAvailableLoan(uint256 amount) internal view returns (int256) {
        for (int256 i = 0; i < int256(loans.length); i++) {
            Loan storage loan = loans[uint256(i)];
            if (!loan.repaid && loan.amountBorrowed >= amount) {
                return i;
            }
        }
        return -1;
    }

    // Allow the owner to withdraw excess funds
    function withdrawExcessFunds() external onlyOwner {
        uint256 balance = assetToken.balanceOf(address(this));
        if (balance > 0) {
            assetToken.transfer(owner(), balance);
        }
    }
}


// The LendingPool contract allows users to lend and borrowers to borrow tokens.
// The Loan struct stores information about each loan, including the borrower's address, the borrowed amount, and whether the loan has been repaid.
// The lend function allows users to deposit tokens into the lending pool, creating a new loan.
// The borrow function allows borrowers to request loans from available loans in the pool. It looks for an available loan that matches or exceeds the requested amount.
// The findAvailableLoan function helps find an available loan to borrow from.
// The withdrawExcessFunds function allows the owner to withdraw any excess funds (e.g., interest) from the pool.