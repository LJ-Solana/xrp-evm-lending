import React, { useState, useEffect } from 'react';
import contract from '../smart-contracts/LendingBorrowingContract';

function LendTokens() {
  const [selectedToken, setSelectedToken] = useState(''); // State to store the selected token address
  const [amount, setAmount] = useState(0); // State to store the lending amount
  const [tokens, setTokens] = useState([]); // State to store the list of supported tokens

  useEffect(() => {
    const fetchSupportedTokens = async () => {
      try {
        const contractAddress = '0xeF6C360086DB37ED5476761E2BBEAf474Caada69'; // Replace with your contract's actual address
        const contractInstance = new web3.eth.Contract(
          contract.options.jsonInterface,
          contractAddress
        );
  
        const gasLimit = 500000; // Set the gas limit as needed
  
        const tokenCount = await contractInstance.methods
          .getTokensCount()
          .send({
            from: '0x5E9F8D7ccEa01ad971004F83Ddf6C49241CbEE6f',
            gas: gasLimit,
          });
  
        const tokenArray = [];
        for (let i = 0; i < tokenCount; i++) {
          const tokenInfo = await contractInstance.methods
            .getTokenInfo(i)
            .call({
              gas: gasLimit,
            });
          tokenArray.push(tokenInfo);
        }
        setTokens(tokenArray);
      } catch (error) {
        console.error('Error fetching supported tokens:', error);
      }
    };
  
    fetchSupportedTokens();
  }, []);  

  const handleLend = async () => {
    try {
      if (!selectedToken || amount <= 0) {
        console.error('Invalid input');
        return;
      }

      const contractAddress = '0xeF6C360086DB37ED5476761E2BBEAf474Caada69'; 
      const contractInstance = new web3.eth.Contract(
        contract.options.jsonInterface,
        contractAddress
      );

      console.log('Selected Token:', selectedToken);
      console.log('Lending Amount:', amount);

      // Call the lend function in your contract
      const transaction = await contractInstance.methods.lend(selectedToken, amount).send({
        from: '0x5E9F8D7ccEa01ad971004F83Ddf6C49241CbEE6f', 
        value: web3.utils.toWei(amount.toString(), 'ether'), 
      });

      console.log('Transaction Hash:', transaction.transactionHash);

      // Lending successful, you can add further handling or notifications here
      console.log('Lending successful');
    } catch (error) {
      console.error('Error lending tokens:', error);
    }
  };

  return (
    <div>
      <h1>Lend Tokens</h1>
      <select
        onChange={(e) => setSelectedToken(e.target.value)}
        value={selectedToken}
      >
        <option value="">Select a token</option>
        {tokens.map((token, index) => (
          <option key={index} value={token.tokenAddress}>
            {token.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleLend}>Lend</button>
    </div>
  );
}

export default LendTokens;
