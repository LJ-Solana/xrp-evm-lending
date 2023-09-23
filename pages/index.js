import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Web3 from 'web3';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import XRPLendingBorrowingContractABI from './XRPLending_BorrowingABI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
const [showLendModal, setShowLendModal] = useState(false);
const [showBorrowModal, setShowBorrowModal] = useState(false);
const [showAPYModal, setShowAPYModal] = useState(false);
const [showAPRModal, setShowAPRModal] = useState(false);
const [showTokenModal, setShowTokenModal] = useState(false);

const [balance, setBalance] = useState(0); 
const [userAddress, setUserAddress] = useState('');
const [showLendTable, setShowLendTable] = useState(true);
const [xrpPrice, setXrpPrice] = useState(null);
const [ethPrice, setEthPrice] = useState(null);
const [daiPrice, setDaiPrice] = useState(null);
const [inputValue, setInputValue] = useState(""); 

// Add Token Support (Auth Only)
const [tokenAddress, setTokenAddress] = useState(''); 
const [LTV, setLTV] = useState(0); 
const [stableRate, setStableRate] = useState(0); 
const [tokenName, setTokenName] = useState(''); 

//Lending
const [lendAmount, setLendAmount] = useState(0);
const [web3Instance, setWeb3Instance] = useState(null);
const [XRPLendingContract,  setXRPLendingContract] = useState(null);

// Borrowing
const [availableBorrowAmount, setAvailableBorrowAmount] = useState(0);

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

  const openTokenModal = () => {
    setShowTokenModal(true);
  };

  const closeTokenModal = () => {
    setShowTokenModal(false);
  };

  const toggleTable = () => {
    setShowLendTable(!showLendTable);
  };

  async function connectMetaMask() {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
  
        if (accounts.length > 0) {
          setIsMetaMaskConnected(true);
          setUserAddress(accounts[0]);
  
          const weiBalance = await web3.eth.getBalance(accounts[0]);
          const etherBalance = web3.utils.fromWei(weiBalance, 'ether');
          setBalance(parseFloat(etherBalance));
        } else {
          console.error('No accounts found');
        }
      } else {
        console.error('MetaMask not found. Please install MetaMask extension.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }

  useEffect(() => {
    async function initWeb3() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const contractAddress = '0xeF6C360086DB37ED5476761E2BBEAf474Caada69';
        const XRPLendingContract = new web3Instance.eth.Contract(
          XRPLendingBorrowingContractABI,
          contractAddress
        );
        setWeb3Instance(web3Instance);
        setXRPLendingContract(XRPLendingContract);
        console.log('Contract instance:', XRPLendingContract);
  
        // Move the contract instance creation here
        const contractInstance = new web3Instance.eth.Contract(
          XRPLendingBorrowingContractABI,
          contractAddress
        );
        // Now, you can use contractInstance in the rest of your component
        // ...
      } else {
        console.error('No Ethereum provider detected');
      }
    }
    initWeb3();
  }, []);
  
  useEffect(() => {
    async function fetchPrices() {
      try {
        const getPrice = async (id) => {
          const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
              ids: id,
              vs_currencies: 'usd',
            },
          });
          return response.data[id].usd;
        };

        const xrpPrice = await getPrice('ripple');
        const ethPrice = await getPrice('ethereum');
        const daiPrice = await getPrice('dai');

        setXrpPrice(xrpPrice);
        setEthPrice(ethPrice);
        setDaiPrice(daiPrice);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    }
    fetchPrices();
  }, []);

  const addSupportedToken = async () => {
    try {
      if (web3Instance && XRPLendingContract) {
        const accounts = await web3Instance.eth.requestAccounts();
        const userAddress = accounts[0];
        await XRPLendingContract.methods
          .addSupportedToken(tokenAddress, LTV, stableRate, tokenName)
          .send({ from: userAddress });

        setTokenAddress('');
        setLTV(0);
        setStableRate(0);
        setTokenName('');
        setShowTokenModal(false);

        alert('Token added successfully!');
      } else {
        console.error('Web3 or contract not initialized');
      }
    } catch (error) {
      console.error('Error adding supported token:', error);
    }
  };

  const handleLend = async (tokenAddress, lendAmount) => {
    console.log('handleLend function called');
    if (web3Instance && XRPLendingContract) {
      try {
        console.log('Before sending transaction');
        const amountInWei = web3Instance.utils.toWei(lendAmount.toString(), 'ether');
        console.log('Lend Amount:', lendAmount);
        console.log('Amount in Wei:', amountInWei);
  
        await XRPLendingContract.methods
          .lend(tokenAddress, amountInWei)
          .send({
            from: web3Instance.currentProvider.selectedAddress,
          });
  
        console.log('Transaction sent successfully');
        toast.success('Lending successful');
      } catch (error) {
        console.error('Error lending:', error);
        toast.error('Lending failed');
      }
    }
  };  

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLendAmount(newValue);
    console.log('Lend Amount:', newValue);
  };  

  async function getTokenInfo(index) {
    try {
      const result = await contractInstance.methods.getTokenInfo(index).call();
      // The result will contain the information you requested
      const { tokenAddress, LTV, stableRate, name } = result;
      console.log('Token Info:', tokenAddress, LTV, stableRate, name);
    } catch (error) {
      console.error('Error fetching token info:', error);
    }
  }
  // Call the function with an index (e.g., 0)
  getTokenInfo(0);
  

  useEffect(() => {
    // Read the available XRPL amount for the specific token
    if (XRPLendingContract && tokenAddress) {
      async function fetchAvailableBorrowAmount() {
        try {
          console.log('Fetching available borrow amount...');
          const available = await XRPLendingContract.methods.lentAmount(tokenAddress).call();
          console.log('Available borrow amount fetched successfully:', available);
          setAvailableBorrowAmount(available);
        } catch (error) {
          console.error('Error fetching available borrow amount:', error);
        }
      }
      console.log('Starting to fetch available borrow amount for token:', tokenAddress);
      fetchAvailableBorrowAmount();
    }
  }, [XRPLendingContract, tokenAddress]);
  
    
  return (
    <div className={styles.container}>

      <Head>
        <title>XRPLend | EVM Sidechain Lending</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ width: '90%' }}>

        <div className={styles.header}>
          <img src="/xrpl_logo.svg" alt="XRPL Logo" className={styles.logo} />
          {showLendTable ? (
          <h1 className={styles.titleGreen}>
            Lend <span className={styles.whiteText}>EVM</span>
          </h1>
          ) : (
          <h1 className={styles.titleRed}>
            Borrow <span className={styles.whiteText}>EVM</span>
          </h1>
              )}
        </div>

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

        <button
          className={styles.walletConnect}
          onClick={connectMetaMask} 
          disabled={isMetaMaskConnected}
        >
          {isMetaMaskConnected ? 'Connected' : 'Connect MetaMask'}
        </button>

        <div className={styles.accountInfo}>
          <h2 className={styles.positionsTitle}>Global Stats</h2>
        </div>

        <div className={styles.positionCards}>
          <div className={styles.cardGlobal}>
            <div className={styles.tooltip}>
            <p><InformationCircleIcon height={20} className={styles.infoIcon} />Supplied</p> 
              <div className={styles.tooltipText}>
                <p>Supplied</p>
                <p>Total value supplied across all assets in the XRPLend protocol.</p>
              </div>
            </div>
            <p>$1000</p>
          </div>

          <div className={styles.cardGlobal}>
          <div className={styles.tooltip}>
            <p><InformationCircleIcon height={20} className={styles.infoIcon} />Borrowed</p> 
              <div className={styles.tooltipText}>
                <p>Borrowed</p>
                <p>Total value supplied across all assets in the XRPLend protocol.</p>
              </div>
            </div>
            <p>$2000</p>
          </div>

          <div className={styles.cardGlobal}>
          <div className={styles.tooltip}>
            <p><InformationCircleIcon height={20} className={styles.infoIcon} />TVL</p> 
              <div className={styles.tooltipText}>
                <p>Global TVL</p>
                <p>Total value locked in the XRPLend protocol, calculated as: deposits - borrowed</p>
              </div>
            </div>
            <p>$3000</p>
          </div>
        </div>

        <div className={styles.accountInfo}>
          <h2 className={styles.positionsTitle}>Your Account: </h2>
            <p>
             {userAddress && userAddress.length > 10 ? (
                userAddress.substring(0, 4) + '...' + userAddress.slice(-4)
              ) : userAddress}
            </p>
        </div>

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

          <h2>Global Pool</h2>

          {showLendTable ? (
          <div>
            <table className={styles.positionTable}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>
                    <div className={styles.tooltip}>
                      <InformationCircleIcon height={'20px'} className={styles.infoIcon} />
                      <div className={styles.tooltipText}>
                        <p>Price</p>
                        <p>Powered by Coingecko Public API.</p>
                      </div>
                    </div>
                    Price
                  </th>
                  <th>
                    <div className={styles.tooltip}>
                      <InformationCircleIcon height={'20px'} className={styles.infoIcon} />
                      <div className={styles.tooltipText}>
                        <p>APY</p>
                        <p>What you'll earn on deposits over a year.</p>
                      </div>
                    </div>
                    APY
                  </th>
                  <th>
                    <div className={styles.tooltip}>
                      <InformationCircleIcon height={'20px'} className={styles.infoIcon} />
                      <div className={styles.tooltipText}>
                        <p>Deposits</p>
                        <p>Total XRPLend deposits for each asset.</p>
                      </div>
                    </div>
                    Deposits
                  </th>
                  <th>Wallet Amt.</th>
                  <th>Amount to Supply</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>XRPLend</td>
                  <td>${parseFloat(xrpPrice).toFixed(2)}</td>
                  <td className={styles.greenText}>5%</td>
                  <td>1000</td>
                  <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      value={lendAmount}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <button
                      className={styles.button}
                      onClick={() => handleLend('0x4445c5D07ad4DBfa4491Fd7A6f3F8F3A56a935ed', lendAmount)}
                    >
                      Supply
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>USD (Bridged USD)</td>
                  <td>${parseFloat(ethPrice).toFixed(2)}</td>
                  <td className={styles.greenText}>2%</td>
                  <td>500</td>
                  <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                  <td>
                    <input className={styles.input} type="number" defaultValue={0} />
                  </td>
                  <td>
                    <button
                      className={styles.button}
                      onClick={() => handleLend('0xfF0d22C43C43c6d5d6D17a0109e6605AC7B26489', lendAmount)}
                    >
                      Supply
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Peersyst token</td>
                  <td>${parseFloat(daiPrice).toFixed(2)}</td>
                  <td className={styles.greenText}>3%</td>
                  <td>500</td>
                  <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                  <td>
                    <input className={styles.input} type="number" defaultValue={0} />
                  </td>
                  <td>
                    <button
                      className={styles.button}
                      onClick={() => handleLend('0x89B4dE433558cbEeA95cD57bfCA4357A4FEA4Ace', lendAmount)}
                    >
                      Supply
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <table className={styles.positionTable}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>
                    <div className={styles.tooltip}>
                      <InformationCircleIcon height={'20px'} title="APY Info" className={styles.infoIcon} />
                      <div className={styles.tooltipText}>
                        <p>Price</p>
                        <p>Powered by Coingecko public API.</p>
                      </div>
                    </div>
                    Price
                  </th>
                  <th>
                    <div className={styles.tooltip}>
                      <InformationCircleIcon height={'20px'} className={styles.infoIcon} />
                      <div className={styles.tooltipText}>
                        <p>APR</p>
                        <p>What you'll pay for your borrows, or the price of a loan. This does not include compounding.</p>
                      </div>
                    </div>
                    APR
                  </th>
                  <th>
                    <div className={styles.tooltip}>
                      <InformationCircleIcon height={'20px'} className={styles.infoIcon} />
                      <div className={styles.tooltipText}>
                        <p>Available</p>
                        <p>The amount of tokens available to borrow for each asset. Calculated as the minimum of the asset's borrow limit and available liquidity that has not yet been borrowed.</p>
                      </div>
                    </div>
                    Available
                  </th>
                  <th>Wallet Amt.</th>
                  <th>Amount to Borrow</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>XRPLend</td>
                  <td>${parseFloat(xrpPrice).toFixed(2)}</td>
                  <td className={styles.redText}>6%</td>
                  <td>{availableBorrowAmount}</td>
                  <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                  <td>
                    <input className={styles.input} type="number" defaultValue={0} />
                  </td>
                  <td>
                    <button className={styles.button} onClick={openBorrowModal}>Borrow</button>
                  </td>
                </tr>
                <tr>
                  <td>USD (Bridged USD)</td>
                  <td>${parseFloat(ethPrice).toFixed(2)}</td>
                  <td className={styles.redText}>6%</td>
                  <td>500</td>
                  <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                  <td>
                    <input className={styles.input} type="number" defaultValue={0} />
                  </td>
                  <td>
                    <button className={styles.button} onClick={openBorrowModal}>Borrow</button>
                  </td>
                </tr>
                <tr>
                  <td>Peersyst token</td>
                  <td>${parseFloat(daiPrice).toFixed(2)}</td>
                  <td className={styles.redText}>6%</td>
                  <td>500</td>
                  <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                  <td>
                    <input className={styles.input} type="number" defaultValue={0} />
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

      <footer className={styles.footer}>
        <div className={styles.warning}>
          <p>This Lending dApp is not designed for a production environment.</p>
        </div>

        <div className={styles.xrpprice}>
        <button className={styles.button} onClick={setShowTokenModal}>Add New Token</button>
          {xrpPrice !== null ? (
            <>
              <img src="/xrp-logo.png" alt="XRP Logo" style={{ width: '30px', height: '30px', marginRight: '5px', marginLeft: '10' }} />  
              <p>XRP Price: ${parseFloat(xrpPrice).toFixed(2)}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </footer>

       {/* Token Modal */}
       {showTokenModal && (
        <div className={styles.modals}>
          <div className={styles.modalContent}>
          <h2>Add New Token</h2>
          <label>Token Address:</label>
          <input
            className={styles.input}
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
          <label>LTV:</label>
          <input
            className={styles.input}
            type="number"
            value={LTV}
            onChange={(e) => setLTV(e.target.value)}
          />
          <label>Stable Rate:</label>
          <input
            className={styles.input}
            type="number"
            value={stableRate}
            onChange={(e) => setStableRate(e.target.value)}
          />
          <label>Token Name:</label>
          <input
            className={styles.input}
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
          />
          <button  className={styles.button} onClick={addSupportedToken}>Add Token</button>
          <span className={styles.close} onClick={closeTokenModal}>&times;</span>
          <p>Note: Only the authorised wallet may add new tokens.</p>
          </div>
        </div>
      )}

       {/* Lend Modal */}
       {showLendModal && (
        <div className={styles.modals}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={closeLendModal}>&times;</span>
            <h2>Lend Tokens</h2>
            <button>Lend</button>
          </div>
        </div>
      )}

      {showBorrowModal && (
        <div className={styles.modals}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={closeBorrowModal}>&times;</span>
            <h2>Borrow Tokens</h2>
            <button>Borrow</button> 
          </div>
        </div>
      )}

      {showAPYModal && (
        <div className={styles.modals}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={closeAPYModal}>&times;</span>
            <h2>What is APY?</h2>
            <p className={styles.centerText}>What you'll earn on deposits over a year. This includes compounding.</p>
          </div>
        </div>
      )}

      {showAPRModal && (
        <div className={styles.modals}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={closeAPRModal}>&times;</span>
            <h2>What is APR?</h2>
            <p className={styles.centerText}>What you'll pay for your borrows, or the price of a loan. This does not include compounding.</p>
          </div>
        </div>
      )}


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
