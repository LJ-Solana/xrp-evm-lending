import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Web3 from 'web3';
import { useState, useEffect } from 'react';
import axios from 'axios';
import evmLendingContractABI from './lendingABI';
import { InformationCircleIcon } from '@heroicons/react/24/solid'


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
  const [inputValue, setInputValue] = useState(""); 

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

  const handleLend = async () => {
    const xrplEvmRpcUrl = 'https://rpc-evm-sidechain.xrpl.org';
  
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(xrplEvmRpcUrl);
        const contractAddress = '0xcD13E405D1D909B0ceb7c6429EB07cD6eAB2dfC7';
        const contractAbi = evmLendingContractABI;
        const  xrpToEthExchangeRate = "1000";
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        const xrpLoanValue = parseFloat(inputValue);
        const ethLoanValue = xrpLoanValue * xrpToEthExchangeRate;
        const transactionData = contract.methods.lendTokens(web3.utils.toWei(ethLoanValue.toString(), 'ether')).encodeABI();
        const accounts = await web3.eth.getAccounts();
        const senderAddress = accounts[0];
        const gasPrice = 1000000;
        const gas = await contract.methods.lendTokens(web3.utils.toWei(ethLoanValue.toString(), 'ether')).estimateGas({ from: senderAddress });
  
        const transaction = {
          from: senderAddress,
          to: contractAddress,
          gas,
          gasPrice,
          data: transactionData,
        };
  
        const result = await web3.eth.sendTransaction(transaction);
        console.log('Transaction result:', result);
  
      } catch (error) {
        console.error('Error lending tokens:', error);
      }
    } else {
      console.error('MetaMask not detected. Please install MetaMask or use a compatible Ethereum browser.');
    }
  };  

  async function connectMetaMask() {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const web3 = new Web3(window.ethereum);

        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0];

        const networkId = await web3.eth.net.getId();
        const networkName = networkId === '1' ? 'Mainnet' : 'Rinkeby';

        console.log(`Connected to ${networkName} with address: ${userAddress}`);
      } else {
        console.error('MetaMask not found. Please install MetaMask extension.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }
    
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
          <h2 className={styles.positionsTitle}>Your Account: </h2>
            <p>
             {userAddress && userAddress.length > 10 ? (
                userAddress.substring(0, 4) + '...' + userAddress.slice(-4)
              ) : userAddress}
            </p>
        </div>


        {showLendTable ? (
        <div>
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
          
          <h2 className={styles.positionsTitle}>Global Pool</h2>
          <table className={styles.positionTable}>
          <thead>
            <tr>
              <th>Asset</th>
              <th><InformationCircleIcon height={'20px'} title="APY Info"/>Price</th>
              <th><InformationCircleIcon height={'20px'} />APY</th>
              <th><InformationCircleIcon height={'20px'} />Deposits</th>
              <th>Wallet Amt.</th>
              <th>Amount to Supply</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <img src="/xrp-logo.png" alt="XRP Logo" className={styles.assetLogo} />
                XRP
              </td>
              <td>${parseFloat(xrpPrice).toFixed(2)}</td>
              <td className={styles.greenText}>5%</td>
              <td>1000</td>
              <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} </td>
              <td>
                <input className={styles.input} type="number" defaultValue={0} />
              </td>
              <td>
                <button className={styles.button} onClick={handleLend}>
                  Supply
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <img src="/eth-logo.png" alt="ETH Logo" className={styles.assetLogo} />
                ETH
              </td>
              <td>${parseFloat(ethPrice).toFixed(2)}</td>
              <td className={styles.greenText}>2%</td>
              <td>500</td>
              <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} </td>
              <td>
                <input className={styles.input} type="number" defaultValue={0} />
              </td>
              <td>
                <button className={styles.button} onClick={openBorrowModal}>
                  Supply
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <img src="/dai-logo.png" alt="DAI Logo" className={styles.assetLogo} />
                DAI
              </td>
              <td>${parseFloat(daiPrice).toFixed(2)}</td>
              <td className={styles.greenText}>3%</td>
              <td>500</td>
              <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} </td>
              <td>
                <input className={styles.input} type="number" defaultValue={0} />
              </td>
              <td>
                <button className={styles.button} onClick={openBorrowModal}>
                  Supply
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      ) : (

        <div>
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

          <h2 className={styles.positionsTitle}>Global Pool</h2>
          <table className={styles.positionTable}>
            <thead>
              <tr>
                <th>Asset</th>
                <th><InformationCircleIcon height={'20px'} title="APY Info"/>Price</th> 
                <th><InformationCircleIcon height={'20px'} title="APY Info"/>APR</th>
                <th><InformationCircleIcon height={'20px'} title="APY Info"/>Available</th>
                <th>Wallet Amt.</th> 
                <th>Amount to Borrow</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ETH</td>
                <td>${parseFloat(ethPrice).toFixed(2)}</td> 
                <td className={styles.redText}>6%</td>
                <td>500</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} </td>
                <td>
                  <input className={styles.input}  type="number" defaultValue={0} />
                </td>
                <td>
                  <button className={styles.button} onClick={openBorrowModal}>Borrow</button>
                </td>
              </tr>
              <tr>
                <td>DAI</td>
                <td>${parseFloat(daiPrice).toFixed(2)}</td> 
                <td className={styles.redText}>6%</td>
                <td>500</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'} </td>
                <td>
                  <input className={styles.input} type="number" defaultValue={0} />
                </td>
                <td>
                  <button className={styles.button} onClick={openBorrowModal}>Borrow</button>
                </td>
              </tr>
              <tr>
                <td>XRP</td>
                <td>${parseFloat(xrpPrice).toFixed(2)}</td> 
                <td className={styles.redText}>6%</td>
                <td>500</td>
                <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                <td>
                  <input className={styles.input}  type="number"  defaultValue={0} /> 
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
          {xrpPrice !== null ? (
            <>
              <img src="/xrp-logo.png" alt="XRP Logo" style={{ width: '30px', height: '30px', marginRight: '5px' }} />  
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
