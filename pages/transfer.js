import React, { useState } from 'react';
import Web3 from 'web3';
import evmTransferContractABI from './transferABI.js'; 


function TokenTransferComponent() {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
  
    const initialize = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const networkId = 1440002;
        const contractData = evmTransferContractABI.networks[networkId];
        if (contractData) {
          const contractInstance = new web3Instance.eth.Contract(
            evmTransferContractABI.abi,
            contractData.address
          );
          setWeb3(web3Instance);
          setContract(contractInstance);
          console.log('Web3 and contract initialized successfully.');
        } else {
          console.error('Contract not deployed on the current network');
        }
      } else {
        console.error('MetaMask not detected. Please install MetaMask or use a compatible Ethereum browser.');
      }
    };    
    const sendTokens = async () => {
      if (contract && web3) {
        try {
          // Convert the amount to wei if your token uses a different decimal precision
          const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    
          const senderAddress = await web3.eth.getAccounts(); // Get the sender's address
    
          // Send the transaction to the contract
          const gasLimit = await contract.methods.sendTokens(toAddress, amountInWei).estimateGas({ from: senderAddress[0] });
          await contract.methods.sendTokens(toAddress, amountInWei).send({
              from: senderAddress[0], // Use the sender's address from MetaMask
              gas: gasLimit, // Set the gas limit based on the estimation
          });          

          console.log('Tokens sent successfully');
        } catch (error) {
          console.error('Error sending tokens:', error);
        }
      }
    };
    
    return (
      <div>
        <button onClick={initialize}>Initialize Web3</button>
        <div>
          <input
            type="text"
            placeholder="Recipient Address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={sendTokens}>Send Tokens</button>
        </div>
      </div>
    );
  }
  
  export default TokenTransferComponent;  