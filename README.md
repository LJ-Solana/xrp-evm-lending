# XRP-EVM Sidechain Lending Platform

Welcome to the XRP-EVM Sidechain Lending Platform, a decentralized lending platform built on the XRP-EVM sidechain. This platform allows users to lend and borrow various crypto assets while earning interest or paying interest on their loans.

[Example Deployment]
https://xrp-evm-lending-platform.vercel.app/

[Project Screenshot]
<img width="1728" alt="lending-screenshot" src="https://github.com/LJ-Solana/xrp-evm-lending/assets/111569336/1f2491e2-7502-4054-8202-d53ef5fd07ca">

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Lending and Borrowing:** Users can lend their crypto assets to earn interest or borrow assets by providing collateral.
- **Faucet:** Users can send themselves #LND token to interact with the protocol.
- **Collateral Management:** Users manage how much they can borrow based on the LTV of their collateral.
- **Additional Tokens:** Owner of the contract can add newly supported tokens with 'address tokenAddress;, uint256 LTV;, uint256 stableRate;, string name;'
- **APY/APR Information:** Information about asset Annual Percentage Yield (APY) and Annual Percentage Rate (APR) is available.
- **User Wallet Integration:** Supports integration with MetaMask or other compatible wallets for secure transactions.
- **All Token Info:** Users can fetch information on all supported tokens by the protocol.
- **Asset Management:** Users can view their asset balances, lending positions, and borrowing positions.

## TO-DO
- [ ] Mobile Compatibility
- [ ] Liquidations
- [ ] Additional Token Support

## Getting Started

Follow these steps to set up the XRP-EVM Sidechain Lending Platform on your local environment.

### Prerequisites

- Node.js and npm (Node Package Manager) installed on your system.
- MetaMask or another compatible Ethereum wallet extension installed in your browser.
- Access to a running XRP-EVM sidechain node or network.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/xrp-evm-lending.git
   cd xrp-evm-lending 

2. Install all packages:

     ```bash
   npm i 

2. Run in dev Mode:

     ```bash
   npm run dev 
