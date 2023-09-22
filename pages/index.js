import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [showLendModal, setShowLendModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showAPYModal, setShowAPYModal] = useState(false);
  const [showAPRModal, setShowAPRModal] = useState(false);
  const [balance, setBalance] = useState(0); 
  const [userAddress, setUserAddress] = useState('');
  const [showLendTable, setShowLendTable] = useState(true);
  const [xrpPrice, setXrpPrice] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [daiPrice, setDaiPrice] = useState(null);

  const openLendModal = () => {
    setShowLendModal(true);
  };

  const closeLendModal = () => {
    setShowLendModal(false);
  };

  const openBorrowModal = () => {
    setShowBorrowModal(true);
  };

  const closeBorrowModal = () => {
    setShowBorrowModal(false);
  };

  const openAPYModal = () => {
    setShowAPYModal(true);
  };

  const closeAPYModal = () => {
    setShowAPYModal(false);
  };

  const openAPRModal = () => {
    setShowAPRModal(true);
  };

  const closeAPRModal = () => {
    setShowAPRModal(false);
  };

  const toggleTable = () => {
    setShowLendTable(!showLendTable);
  };
  
  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.enable();
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            setIsMetaMaskConnected(true);
            setUserAddress(accounts[0]); 
            const weiBalance = await web3.eth.getBalance(accounts[0]);
            const etherBalance = web3.utils.fromWei(weiBalance, 'ether');
            setBalance(parseFloat(etherBalance));
          }
        } catch (error) {
          console.error('MetaMask connection error:', error);
        }
      }
    };

    checkMetaMaskConnection();
  }, []);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
        } catch (error) {
          console.error('Error connecting to Metamask:', error);
        }
      } else {
        console.error('Web3 provider not detected. Please install Metamask or use a compatible Ethereum browser.');
      }
    };
  
    initializeWeb3();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch XRP price
        const xrpResponse = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: 'ripple',
              vs_currencies: 'usd',
            },
          }
        );
        setXrpPrice(xrpResponse.data.ripple.usd);
  
        // Fetch ETH price
        const ethResponse = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: 'ethereum',
              vs_currencies: 'usd',
            },
          }
        );
        setEthPrice(ethResponse.data.ethereum.usd);
  
        // Fetch DAI price
        const daiResponse = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: 'dai',
              vs_currencies: 'usd',
            },
          }
        );
        setDaiPrice(daiResponse.data.dai.usd);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
  
    fetchPrices();
  }, []);
  

  return (
    <div className={styles.container}>
      <Head>
        <title>XRPLend</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ marginTop: '20px' }}>
        <h1 className={styles.title}>
          XRPLend <span className={styles.whiteText}>EVM</span>
        </h1>
        <p className={styles.walletconnect}>
          {isMetaMaskConnected && (
            <div className={styles.walletInfo}>
              <p>MetaMask Connected</p>
              <p>
                Wallet Address: {userAddress && userAddress.length > 10 ? (
                  userAddress.substring(0, 4) + '...' + userAddress.slice(-4)
                ) : userAddress}
              </p>
              <p>Balance: {balance ? parseFloat(balance).toFixed(2) : 'Loading'} XRP</p>
            </div>
          )}
        </p>

        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleButton} ${showLendTable ? styles.active : ''}`}
            onClick={() => setShowLendTable(true)}
          >
            Lend
          </button>
          <button
            className={`${styles.toggleButton} ${showLendTable ? '' : styles.active}`}
            onClick={() => setShowLendTable(false)}
          >
            Borrow
          </button>
        </div>

        {showLendTable ? (
        <div>
          <h2 className={styles.positionsTitle}>Your Positions</h2>

          {/* Position Cards */}
          <div className={styles.positionCards}>
            <div className={styles.card}>
              <p>Asset: XRP</p>
              <p>Amount: 1000</p>
              <p>USD Value: $1000</p>
              <p className={styles.greenText}>APY: 5%</p>
            </div>

            <div className={styles.card}>
              <p>Asset: ETH</p>
              <p>Amount: 500</p>
              <p>USD Value: $1000</p>
              <p className={styles.greenText}>APY: 2%</p>
            </div>

            <div className={styles.card}>
              <p>Asset: DAI</p>
              <p>Amount: 500</p>
              <p>USD Value: $1000</p>
              <p className={styles.greenText}>APY: 3%</p>
            </div>
          </div>
          
          <h2 className={styles.positionsTitle}>Lending Options</h2>
          <table className={styles.positionTable}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th> 
                <th>Deposits</th>
                <th><span onClick={setShowAPYModal}>ℹ️ </span> APY</th>
                <th>Wallet Amt.</th> 
                <th>Amount to Lend</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>XRP</td>
                <td>${parseFloat(xrpPrice).toFixed(2)}</td> 
                <td>1000</td>
                <td className={styles.greenText}>5%</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} XRP</td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <button className={styles.button} onClick={openLendModal}>Lend</button>
                </td>
              </tr>
              <tr>
                <td>ETH</td>
                <td>${parseFloat(ethPrice).toFixed(2)}</td> 
                <td>500</td>
                <td className={styles.greenText}>2%</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} XRP</td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <button className={styles.button} onClick={openBorrowModal}>Lend</button>
                </td>
              </tr>
              <tr>
                <td>DAI</td>
                <td>${parseFloat(daiPrice).toFixed(2)}</td> 
                <td>500</td>
                <td className={styles.greenText}>3%</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} XRP</td>
                <td>
                  <input type="number" />
                </td>
                <td>
                  <button className={styles.button} onClick={openBorrowModal}>Lend</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        // Borrow Table
        <div>
          <h2 className={styles.positionsTitle}>Your Positions</h2>
        
          <div className={styles.positionCards}>
            <div className={styles.card}>
              <p>Asset: XRP</p>
              <p>Amount: 1000</p>
              <p>USD Value: $1000</p>
              <p className={styles.redText}>APR: 5%</p>
            </div>

            <div className={styles.card}>
              <p>Asset: ETH</p>
              <p>Amount: 500</p>
              <p>USD Value: $1000</p>
              <p className={styles.redText}>APR: 2%</p>
            </div>

            <div className={styles.card}>
              <p>Asset: DAI</p>
              <p>Amount: 500</p>
              <p>USD Value: $1000</p>
              <p className={styles.redText}>APR: 3%</p>
            </div>
          </div>

          <h2 className={styles.positionsTitle}>Borrowing Options</h2>
          <table className={styles.positionTable}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th> 
                <th>Available</th>
                <th> <span onClick={setShowAPRModal}>ℹ️</span> APR</th>
                <th>Wallet Amt.</th> 
                <th>Amount to Borrow</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ETH</td>
                <td>${parseFloat(ethPrice).toFixed(2)}</td> 
                <td>500</td>
                <td className={styles.redText}>6%</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} XRP</td>
                <td>
                  <input type="number" className={styles.whiteOutlineInput} />
                </td>
                <td>
                  <button className={styles.button} onClick={openBorrowModal}>Borrow</button>
                </td>
              </tr>
              <tr>
                <td>DAI</td>
                <td>${parseFloat(daiPrice).toFixed(2)}</td> {/* Display DAI price */}
                <td>500</td>
                <td className={styles.redText}>6%</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} XRP</td>
                <td>
                  <input type="number" className={styles.whiteOutlineInput} />
                </td>
                <td>
                  <button className={styles.button} onClick={openBorrowModal}>Borrow</button>
                </td>
              </tr>
              <tr>
                <td>XRP</td>
                <td>${parseFloat(xrpPrice).toFixed(2)}</td> {/* Display XRP price */}
                <td>500</td>
                <td className={styles.redText}>6%</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} XRP</td>
                <td>
                  <input type="number" /> {/* Input field */}
                </td>
                <td>
                  <button className={styles.button} onClick={openBorrowModal}>Borrow</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      </main>

      <footer>
        <div className={styles.warning}>
          <p>This Lending dApp is not designed for a production environment.</p>
        </div>
        <div className={styles.xrpprice}>
          {xrpPrice !== null ? (
            <>
              <img src="/xrp-logo.png" alt="XRP Logo" style={{ width: '30px', height: '30px', marginRight: '10px' }} />  
              <p>XRP Price: ${parseFloat(xrpPrice).toFixed(2)}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </footer>


       {/* Lend Modal */}
       {showLendModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeLendModal}>&times;</span>
            <h2>Lend Tokens</h2>
            <button>Lend</button>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeBorrowModal}>&times;</span>
            <h2>Borrow Tokens</h2>
            <button>Borrow</button> 
          </div>
        </div>
      )}

      {/* APY Modal */}
      {showAPYModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeAPYModal}>&times;</span>
            <h2>What is APY?</h2>
            <p>What you'll earn on deposits over a year. This includes compounding.</p>
          </div>
        </div>
      )}

         {/* APR Modal */}
         {showAPRModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeAPRModal}>&times;</span>
            <h2>What is APR?</h2>
            <p style={{textAlign: 'center'}}>What you'll pay for your borrows, or the price of a loan. This does not include compounding.</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .modal-content {
          background-color: #121212;
          padding: 20px;
          border-radius: 10px;
          width: 40%;
          height: 40%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .close {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 24px;
          color: white;
          cursor: pointer;
        }

        .close:hover {
          color: #0070f3; /* Change the close icon color on hover */
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 50px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: end;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #121212;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
