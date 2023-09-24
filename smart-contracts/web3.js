import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  // Browser with MetaMask or similar provider
  web3 = new Web3(window.ethereum);
} else {
  // Node.js or browser without provider (fallback to a remote node)
  web3 = new Web3('https://rpc-evm-sidechain.xrpl.org');
}

export default web3;
