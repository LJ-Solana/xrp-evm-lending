// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the ERC20 interface
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingContract {
    // The owner of the contract
    address public owner;

    // Address of the ERC20 token contract
    address public tokenAddress;

    // Mapping of user addresses to their balances
    mapping(address => uint256) public userBalances;

    // Event to log lending transactions
    event Lend(address indexed user, uint256 amount);

    // IERC20 interface for interacting with the token
    IERC20 public token;

    // Constructor to set the owner and token address
    constructor(address _tokenAddress) {
        owner = msg.sender;
        tokenAddress = _tokenAddress;
        token = IERC20(_tokenAddress); 
    }

    // Function to allow users to lend tokens
    function lendTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(userBalances[msg.sender] == 0, "You have an existing balance");

        // Transfer tokens from the sender to this contract
        token.transferFrom(msg.sender, address(this), amount);

        // Update the user's balance
        userBalances[msg.sender] = amount;

        // Emit an event to log the lending transaction
        emit Lend(msg.sender, amount);
    }

    // Function to get the user's balance
    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }
}
