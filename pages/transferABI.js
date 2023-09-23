const evmTransferContractABI = {
	networks: {
	  1440002: {  
		address: '0xcD13E405D1D909B0ceb7c6429EB07cD6eAB2dfC7',
	  },
	},
	abi: [
	  {
		"inputs": [
		  {
			"internalType": "address",
			"name": "_tokenAddress",
			"type": "address"
		  }
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	  },
	  {
		"inputs": [],
		"name": "owner",
		"outputs": [
		  {
			"internalType": "address",
			"name": "",
			"type": "address"
		  }
		],
		"stateMutability": "view",
		"type": "function"
	  },
	  {
		"inputs": [
		  {
			"internalType": "address",
			"name": "_to",
			"type": "address"
		  },
		  {
			"internalType": "uint256",
			"name": "_amount",
			"type": "uint256"
		  }
		],
		"name": "sendTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	  },
	  {
		"inputs": [],
		"name": "token",
		"outputs": [
		  {
			"internalType": "contract IERC20",
			"name": "",
			"type": "address"
		  }
		],
		"stateMutability": "view",
		"type": "function"
	  },
	],
  };
  
  export default evmTransferContractABI;  