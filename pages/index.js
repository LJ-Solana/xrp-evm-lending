import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import CONTRACT_ABI from '../smart-contracts/XRPLendingBorrowingABI';
import TOKEN_ABI from '../smart-contracts/XRPLendTokenABI';
import FAUCET_ABI from '../smart-contracts/faucetABI';

const tokenContractAddress = "0x143dacb2c2e479b764421c0bbe825c805a320fa5";
const lendingContractAddress = "0x445C4FbDB81d92f80B4580F434BBb42105B90eeb";
const faucetContractAddress = "0x945A4Ad6F6D434F3Bc7922F7d398dDB8087dADA8";

export default function Home() {

  const router = useRouter();

  // Connections
  const [tokenContractInstance, setTokenContractInstance] = useState(null);
  const [lendingContractInstance, setLendingContractInstance] = useState(null);
  const [faucetContractInstance, setFaucetContractInstance] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  // Tokens & Formatting
  const [balance, setBalance] = useState(0); 
  const [LNDTokenBalance, setLNDTokenBalance] = useState(null);
  const [xrpPrice, setXrpPrice] = useState(null);
  const [showLendTable, setShowLendTable] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //Lending & Borrowing
  const [lendAmount, setLendAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);

  //Wallet Stats
  const [UserLentAmount, setUserLentAmount] = useState(0);
  const [UserBorrowedAmount, setUserBorrowedAmount] = useState(0);
  const [UserTokenCollateral, setUserTokenCollateral] = useState(0);  

  let provider
  let web3;

    useEffect(() => {
      if (window.innerWidth <= 768) {
        router.push('/SmallScreenPage');
      }
    }, []); 

     // Initialise Contracts
    useEffect(() => {
      async function initializeContracts() {
        try {
          const web3 = new Web3(window.ethereum); // Assuming MetaMask is available
          const tokenContract = new web3.eth.Contract(TOKEN_ABI, tokenContractAddress);
          const lendingContract = new web3.eth.Contract(CONTRACT_ABI, lendingContractAddress);
          const faucetContract = new web3.eth.Contract(FAUCET_ABI, faucetContractAddress);
          setTokenContractInstance(tokenContract);
          setLendingContractInstance(lendingContract);
          setFaucetContractInstance(faucetContract); 
        } catch (error) {
          console.error("Error initializing contracts:", error);
        }
      }
      initializeContracts();
    }, []);
      
    // Connect Metamask & Web3
    const getProvider = async() =>{
      provider =  await detectEthereumProvider();
      web3 = new Web3(provider);
      if (provider) {
          console.log('Ethereum successfully detected!')
      } else {   
          console.log('Please install MetaMask!')
      }
    }

      useEffect(() => {
        getProvider();
    });
  
    const connect = async () => {
      try {
        if (!provider) {
          throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
        }
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]); // Assuming the first account is the connected one      
      } catch (error) {
        console.error('Error connecting wallet:', error.message);
      }
    };

    useEffect(() => {
      if (userAddress) {
        fetchBorrowedAmount();
        fetchLentAmount();
        fetchCollateralAmount();
      }
    }, [userAddress]);

    // Call token Faucet to get $LND Token for interacting
    const handleRequestTokens = async () => {
      try {
        if (!provider) {
          throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
        }
        console.log('Request Amount:', 1000);
    
        // Include the 'amountInWei' parameter in the transaction data
        const tx = faucetContractInstance.methods.requestTokens("100000");
        const gas = await tx.estimateGas({ from: userAddress });
        const data = tx.encodeABI();
        console.log("Gas Estimate:", gas);
    
        const transactionHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              gas: web3.utils.toHex(gas),
              to: faucetContractAddress,
              from: userAddress,
              value: '0x0',
              data: data,
            },
          ],
        });
    
        console.log('Transaction sent successfully:', transactionHash);
        toast.success('Sent you 100,000 $LND tokens');
      } catch (error) {
        console.error('Error Request Tokens:', error);
        toast.error('Request Tokens failed');
      }
    };

    // Fetch LNDToken Balance for Wallet
    const getLNDTokenBalance = async () => {
      try {
        const balance = await tokenContractInstance.methods.balanceOf(userAddress).call();
        setLNDTokenBalance(balance); 
        console.log(`Token Balance for ${userAddress}: ${LNDTokenBalance}`);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };

    useEffect(() => {
      if (userAddress) {
        getLNDTokenBalance();
      }
    }, [userAddress]);

    // Fetch Borrow Amount for Wallet
    const fetchBorrowedAmount = async () => {
      try {
        const borrowedAmount = await lendingContractInstance.methods.borrowedAmount(userAddress).call();
        setUserBorrowedAmount(borrowedAmount.toString());
        console.log('Successfully fetched borrowed amount:', borrowedAmount);
      } catch (error) {
        console.error('Error fetching borrowed amount:', error);
        // Handle the error appropriately
      }
    };

    // Fetch Lent Amount for Wallet
    const fetchLentAmount = async () => {
      try {
        const lentAmountValue = await lendingContractInstance.methods.lentAmount(userAddress).call();
        console.log("abjdbjbdidwd: ", UserLentAmount)
        setUserLentAmount(lentAmountValue.toString());
        console.log('Successfully fetched lent amount:', lentAmountValue);
      } catch (error) {
        console.error('Error fetching user lent amount:', error);
        // Handle the error appropriately
      }
    };

    // Fetch Collateral Amount for Wallet
    const fetchCollateralAmount = async () => {
      try {
        const tokenCollateralValue = await lendingContractInstance.methods.tokenCollateral(userAddress).call();
        setUserTokenCollateral(tokenCollateralValue.toString());
        console.log('Successfully fetched token collateral amount:', tokenCollateralValue);
      } catch (error) {
        console.error('Error fetching user token collateral:', error);
        // Handle the error appropriately
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

    // Fetch balances with explorer API
    useEffect(() => {
      const apiUrl = 'https://evm-poa-sidechain.peersyst.tech/api?module=account&action=balance';
      const fullUrl = `${apiUrl}&address=${userAddress}`;

      fetch(fullUrl)
        .then((response) => response.json())
        .then((data) => {
   
          if (data && data.result) {
            const balanceInWei = data.result;
            const balanceInEther = parseFloat(balanceInWei) / 1e18; 
            setBalance(balanceInEther);
            console.log(balance)
          }
        })
        .catch((error) => {
          console.error('Error fetching balance:', error);
        });
    }, []); 

    // Fetch token prices with CoinGecko API
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

     // Core Lending Function
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
        await getLNDTokenBalance();
        console.log('Transaction sent successfully: ' + transactionHash); // Concatenate transactionHash
        toast.success('Lend of ' + lendAmount + ' $LND successful');
      } catch (error) {
        console.error('Error lending:', error.message);
        toast.error('Lending failed');
      }
    };  

    // Core Deposit Collateral Function
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
        await getLNDTokenBalance();
        console.log('Transaction sent successfully:', transactionHash);
        toast.success('Deposit of ' + borrowAmount + ' $LND collateral successful');
      } catch (error) {
        console.error('Error deposit:', error.message);
        toast.error('Deposit Collateral failed');
      }
    }; 

    // Core Withdraw Collateral Function
    const handleWithdrawCollateral = async () => {
      try {
        if (!provider) {
          throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
        }
        // Convert the Withdrawal Amount
        const amountInWei = web3.utils.toWei(borrowAmount.toString(), 'ether');
        console.log('Withdraw Amount:', borrowAmount);
    
        // Construct the transaction to call the withdrawCollateral function
        const tx = lendingContractInstance.methods.withdrawCollateral(tokenContractAddress, borrowAmount.toString());
        const gas = await tx.estimateGas({ from: userAddress });
        const data = tx.encodeABI();
        console.log("Gas Estimate:", gas);
    
        const transactionHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              gas: web3.utils.toHex(gas),
              to: lendingContractAddress,
              from: userAddress,
              value: '0x0',
              data: data,
            },
          ],
        });
        await getLNDTokenBalance();
        console.log('Transaction sent successfully:', transactionHash);
        toast.success('Withdraw of ' + borrowAmount  + ' $LND collateral successful');
      } catch (error) {
        console.error('Error withdrawing collateral:', error.message);
        toast.error('Withdraw Collateral failed');
      }
    };

     // Core Borrow Function
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
        await getLNDTokenBalance();
        console.log('Transaction sent successfully:', transactionHash);
        toast.success('Borrow of ' + borrowAmount + ' $LND successful');
      } catch (error) {
        console.error('Error Borrow:', error.message);
        toast.error('Borrow failed');
      }
    }; 

    // Core Repay Function
    const handleRepay = async () => {
      try {
        if (!provider) {
          throw new Error('Provider not available. Please install MetaMask or another Ethereum wallet.');
        }
    
        // Convert the Repayment Amount
        const amountInWei = web3.utils.toWei(borrowAmount.toString(), 'ether');
        console.log('Repayment Amount:', borrowAmount);
    
        // Construct the transaction to call the repay function
        const tx = lendingContractInstance.methods.repay(tokenContractAddress, borrowAmount.toString());
        const gas = await tx.estimateGas({ from: userAddress });
        const data = tx.encodeABI();
        console.log("Gas Estimate:", gas);
    
        // Send the transaction
        const transactionHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              gas: web3.utils.toHex(gas),
              to: lendingContractAddress,
              from: userAddress,
              value: '0x0',
              data: data,
            },
          ],
        });
        await getLNDTokenBalance();
        console.log('Transaction sent successfully:', transactionHash);
        toast.success('Repayment of ' + borrowAmount + ' $LND successful');
      } catch (error) {
        console.error('Error repaying debt:', error.message);
        toast.error('Repayment failed');
      }
    }; 

    // Change Input Amount (lend)
    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setLendAmount(newValue);
      console.log('Lend Amount:', newValue);
    };  

    // Change Input Amount (Borrow & Collateral)
    const handleBorrowAmount = (e) => {
      const newValue = e.target.value;
      setBorrowAmount(newValue);
      console.log('Borrow Amount:', newValue);
    };    

    // Change Lend/Borrow Table
    const toggleTable = () => {
      setShowLendTable(!showLendTable);
    };

     // Intro Info Modal
    const openModal = () => {
      setIsModalOpen(true);
    };
    const closeModal = () => {
      setIsModalOpen(false);
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

        <div className={styles.gettingStartedButtonContainer}>
          <button className={styles.gettingStartedButton} onClick={openModal}> Click Here For Information Before Interaction w/ Protocol</button>
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
            <button className={styles.faucetButton} onClick={handleRequestTokens}>
            Get $LND Token
            </button>
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
            <p>{UserLentAmount !== null ? UserLentAmount : 'Connect wallet to view'} <span className={styles.blueText}>$LND</span></p>
          </div>

          <div className={styles.cardGlobal}>
          <div className={styles.tooltip}>
            <p><InformationCircleIcon height={20} className={styles.infoIcon} />Borrowed</p> 
              <div className={styles.tooltipText}>
                <p>Borrowed</p>
                <p>Total value supplied across all assets in the XRPLend protocol.</p>
              </div>
            </div>
            <p>{UserBorrowedAmount !== null ? UserBorrowedAmount : 'Connect wallet to view'}<span className={styles.blueText}>$LND</span></p>
          </div>
        
          <div className={styles.cardGlobal}>
          <div className={styles.tooltip}>
            <p><InformationCircleIcon height={20} className={styles.infoIcon} />Collateral</p> 
              <div className={styles.tooltipText}>
                <p>Collateral</p>
                <p>You can borrow up to 70% of the amount you provide as collateral.</p>
              </div>
            </div>
            <p>{UserTokenCollateral !== null ? UserTokenCollateral : 'Connect wallet to view'} <span className={styles.blueText}>$LND</span></p>
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
                  <th>Wallet Amt.</th>
                  <th>Approve/Lend Amount</th>
                  <th>Approve Action</th>
                  <th>Lend Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>LND</td>
                  <td>${parseFloat(xrpPrice).toFixed(2)}</td>
                  <td className={styles.greenText}>5%</td>
                  <td>{LNDTokenBalance ? parseFloat(LNDTokenBalance).toFixed(2) : 'Connect Wallet'}</td>
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
                  <th>Wallet Amt.</th>
                  <th>Collateral/Borrow Amount</th>
                  <th>Deposit/Withdraw Collateral</th>
                  <th>Borrow/Repay Loan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>LND</td>
                  <td>${parseFloat(xrpPrice).toFixed(2)}</td>
                  <td className={styles.redText}>5%</td>
                  <td>{LNDTokenBalance ? parseFloat(LNDTokenBalance).toFixed(2) : 'Connect Wallet'}</td>
                  <td>
                  <input
                      className={styles.input}
                      type="number"
                      value={borrowAmount}
                      onChange={handleBorrowAmount}
                    />
                  </td>
                  <td>
                    <div className={styles.buttonHorizontal}>
                      <button className={styles.borrowButton} onClick={handleWithdrawCollateral}>Withdraw Collateral</button>
                      <button className={styles.repayButton} onClick={handleDepositCollateral}>Deposit Collateral</button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.buttonHorizontal}>
                      <button className={styles.borrowButton} onClick={handleBorrow}>Borrow</button>
                      <button className={styles.repayButton} onClick={handleRepay}>Repay</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        )}

        {isModalOpen && (
        <div className={styles.modals}>
          <div className={styles.modalContent}>
          <button onClick={closeModal}>
              <svg
                className={styles.close}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M18 6.41L16.59 5 12 9.59 7.41 5 6 6.41 10.59 11 6 15.59 7.41 17 12 12.41 16.59 17 18 15.59 13.41 11 18 6.41z"
                />
              </svg>
            </button>
            <div className={styles.modalText}>
              <p>Please hit the 'Get $LND token' button in top right of screen to get $LND from the faucet before interacting with the contract. </p>
              <p>I created a custom ERC20 token to be the main token for this contract. $LND token is set to 70% LTV. You must deposit at least 70% collateral. The contract owner can add more tokens with custom APY and LTV.</p>
              <p>In order to lend any amount of token, you must first hit the 'approve' button to enable the transfer of funds.</p>
            </div>
          </div>
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
