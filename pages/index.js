import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import CONTRACT_ABI from '../smart-contracts/XRPLendingBorrowingABI';
import TOKEN_ABI from '../smart-contracts/XRPLendTokenABI';
const tokenContractAddress = "0x143dacb2c2e479b764421c0bbe825c805a320fa5";
const lendingContractAddress = "0x445C4FbDB81d92f80B4580F434BBb42105B90eeb";

export default function Home() {

  // Connections
  const [XRPLendingContract,  setXRPLendingContract] = useState(null);
  const [tokenContractInstance, setTokenContractInstance] = useState(null);
  const [lendingContractInstance, setLendingContractInstance] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  // Get Token Prices 
  const [balance, setBalance] = useState(0); 
  const [showLendTable, setShowLendTable] = useState(true);
  const [xrpPrice, setXrpPrice] = useState(null);

  // Token
  const [tokenAddress, setTokenAddress] = useState(''); 
  const [inputValue, setInputValue] = useState(""); 

  //Lending
  const [lendAmount, setLendAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);

  // Borrowing
  const [collateralBalance, setCollateralBalance] = useState(0);
  const [availableBorrowAmount, setAvailableBorrowAmount] = useState(0);

  let provider
  let web3;

    useEffect(() => {
        getProvider();
    });
    useEffect(() => {
      async function initializeContracts() {
        try {
          const web3 = new Web3(window.ethereum); // Assuming MetaMask is available
          const tokenContract = new web3.eth.Contract(TOKEN_ABI, tokenContractAddress);
          const lendingContract = new web3.eth.Contract(CONTRACT_ABI, lendingContractAddress);
          setTokenContractInstance(tokenContract);
          setLendingContractInstance(lendingContract);
        } catch (error) {
          // Handle errors here
          console.error("Error initializing contracts:", error);
        }
      }
  
      initializeContracts();
    }, []);
  
    const getProvider = async() =>{
      provider =  await detectEthereumProvider();
      web3 = new Web3(provider);
      if (provider) {
          console.log('Ethereum successfully detected!')
      } else {   
          console.log('Please install MetaMask!')
      }
    }

    const connect = async () => {
      try {
        if (!provider) {
          throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
        }
  
        // Request accounts from the wallet
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]); // Assuming the first account is the connected one        
      } catch (error) {
        console.error('Error connecting wallet:', error.message);
      }
    };
  
  const approveToken = async function() {
      
      if (!web3) {
          return undefined
      }
  
      try {
        console.log(provider)

          const value = web3.utils.toWei("100", 'ether');
          const tx = tokenContractInstance.methods.approve("0x9Cbca85FF8A0479a2577A6202f95A0C1661c358E", value);
          var gas = await tx.estimateGas({from:userAddress});
          const data = tx.encodeABI();
          console.log("gassss: ", gas)
          const transactionHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                  gas: web3.utils.toHex(gas),
                  
                  to: tokenContractAddress,
                  'from': userAddress,
                  value: 0x0,
                  data: data
                // And so on...
              },
            ],
          });
          // Handle the result
          console.log(transactionHash);
      }catch (error) {
          console.error(error);
      }
  }

  useEffect(() => {
    const apiUrl = 'https://evm-poa-sidechain.peersyst.tech/api?module=account&action=balance';
    const fullUrl = `${apiUrl}&address=${userAddress}`;

    // Make an HTTP GET request to the API
    fetch(fullUrl)
      .then((response) => response.json())
      .then((data) => {
        // The data object should contain the balance
        if (data && data.result) {
          // The balance is usually returned as a string, so you can convert it to a number if needed
          const balanceInWei = data.result;
          const balanceInEther = parseFloat(balanceInWei) / 1e18; // Convert Wei to Ether
          setBalance(balanceInEther);
          console.log(balance)
        }
      })
      .catch((error) => {
        console.error('Error fetching balance:', error);
      });
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
        setXrpPrice(xrpPrice);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    }
    fetchPrices();
  }, []);

  const handleLend = async () => {
    try {
      if (!provider) {
        throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
      }
  
      // Convert the lendAmount to Wei
      const amountInWei = web3.utils.toWei(lendAmount.toString(), 'ether');
      console.log('Lend Amount:', lendAmount);
      console.log('Amount in Wei:', amountInWei, "dbaqdbd:    ", userAddress);
  
      const tx = lendingContractInstance.methods.lend(tokenContractAddress, lendAmount.toString());
      var gas = await tx.estimateGas({ from: userAddress });
      const data = tx.encodeABI();
      console.log("gassss: ", gas)
      const transactionHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            gas: web3.utils.toHex(gas),
            to: lendingContractAddress,
            'from': userAddress,
            value: 0x0,
            data: data
          },
        ],
      });
  
      toast.success('Transaction sent successfully: ' + transactionHash); // Concatenate transactionHash
      toast.success('Lending successful');
    } catch (error) {
      console.error('Error lending:', error.message);
      toast.error('Lending failed');
    }
  };  

  const handleDepositCollateral = async () => {
    try {
      if (!provider) {
        throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
      }

      // Convert the DepositAmount 
      const amountInWei = web3.utils.toWei(borrowAmount.toString(), 'ether');
      console.log('deposit Amount:', borrowAmount);

      const tx = lendingContractInstance.methods.depositCollateral(tokenContractAddress, borrowAmount.toString());
          var gas = await tx.estimateGas({from: userAddress});
          const data = tx.encodeABI();
          console.log("gassss: ", gas)
          const transactionHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                  gas: web3.utils.toHex(gas),
                  to: lendingContractAddress,
                  'from': userAddress,
                  value: 0x0,
                  data: data
              },
            ],
          });          
      console.log('Transaction sent successfully:', transactionHash);
      toast.success('Deposit Collateral successful');
    } catch (error) {
      console.error('Error deposit:', error.message);
      toast.error('Deposit Collateral failed');
    }
  }; 
  
  const handleBorrow = async () => {
    try {
      if (!provider) {
        throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
      }

      const amountInWei = web3.utils.toWei(borrowAmount.toString(), 'ether');
      console.log('Deposit Amount:', borrowAmount);

      const tx = lendingContractInstance.methods.borrow(tokenContractAddress, borrowAmount.toString());
          var gas = await tx.estimateGas({from: userAddress});
          const data = tx.encodeABI();
          console.log("gassss: ", gas)
          const transactionHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [
              {
                  gas: web3.utils.toHex(gas),
                  to: lendingContractAddress,
                  'from': userAddress,
                  value: 0x0,
                  data: data
              },
            ],
          });          
      console.log('Transaction sent successfully:', transactionHash);
      toast.success('Borrow successful');
    } catch (error) {
      console.error('Error Borrow:', error.message);
      toast.error('Borrow failed');
    }
  }; 

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLendAmount(newValue);
    console.log('Lend Amount:', newValue);
  };  

  const handleBorrowAmount = (e) => {
    const newValue = e.target.value;
    setBorrowAmount(newValue);
    console.log('Borrow Amount:', newValue);
  };  
  
  useEffect(() => {
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

  const openLendModal = () => {
    setShowLendModal(true);
  };

  const closeLendModal = () => {
    setShowLendModal(false);
  };

  const toggleTable = () => {
    setShowLendTable(!showLendTable);
  };
  
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
        
        <div  className={styles.gifContainer}>
        <iframe src="https://giphy.com/embed/KzcamVeEJlaxCE4OAt" width="480" height="270" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
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

        <div>
          <ToastContainer position="bottom-left" />
        </div>

        <div className={styles.topContainer}>
          <div className={styles.collateralBalances}>
            <p>Collateral Balance: {collateralBalance}</p>
          </div>
          <button className={styles.walletConnect} onClick={connect}>
            {userAddress ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>

        <div className={styles.accountInfo}>
          <h2 className={styles.positionsTitle}>Your Account</h2>
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
            <p>{lendAmount}</p>
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
                  <th>Approve Amount</th>
                  <th>Lend Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>LND</td>
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
                      onClick={approveToken}
                    >
                      Approve
                    </button>
                  </td>
                  <td>
                    <button
                      className={styles.button}
                      onClick={handleLend}
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
                  <th>Deposit Collateral</th>
                  <th>Borrow Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>LND</td>
                  <td>${parseFloat(xrpPrice).toFixed(2)}</td>
                  <td className={styles.redText}>5%</td>
                  <td>{availableBorrowAmount}</td>
                  <td>{balance ? parseFloat(balance).toFixed(2) : 'Loading'}</td>
                  <td>
                  <input
                      className={styles.input}
                      type="number"
                      value={borrowAmount}
                      onChange={handleBorrowAmount}
                    />
                  </td>
                  <td>
                    <button className={styles.button} onClick={handleDepositCollateral}>Deposit Collateral</button>
                  </td>
                  <td>
                    <button className={styles.button} onClick={handleBorrow}>Borrow</button>
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
              <img src="/xrp-logo.png" alt="XRP Logo" style={{ width: '30px', height: '30px', marginRight: '5px', marginLeft: '10' }} />  
              <p>XRP Price: ${parseFloat(xrpPrice).toFixed(2)}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </footer>

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
