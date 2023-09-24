// components/SupportedTokens.js
import React, { useState, useEffect } from 'react';
import contract from '../smart-contracts/LendingBorrowingContract';

function SupportedTokens() {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const tokenCount = await contract.methods.getTokensCount().call();
        console.log('Token count:', tokenCount);
        const tokenArray = [];
        for (let i = 0; i < tokenCount; i++) {
          const tokenInfo = await contract.methods.getTokenInfo(i).call();
          console.log('Token info:', tokenInfo);
          tokenArray.push(tokenInfo);
        }
        setTokens(tokenArray);
      } catch (error) {
        console.error('Error fetching supported tokens:', error);
      }
    };    
    fetchTokens();
  }, []);

  return (
    <div>
      <h1>Supported Tokens</h1>
      <ul>
        {tokens.map((token, index) => (
          <li key={index}>
            {token.name} (LTV: {token.LTV}, Stable Rate: {token.stableRate})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SupportedTokens;
