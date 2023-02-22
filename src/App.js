import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { convertToUsd, convertToCurrency, chainIdToCurrencyCode} from "./utils.js";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletChainId, setWalletChainId] = useState("");
  const [userAmount, setUserAmount] = useState("");
  //const [isUsdInput, setIsUsdInput] = useState(false); // Added state variable
  const [usdAmount, setUsdAmount] = useState(""); // Added state variable
  const [currencyName, setCurrencyName] = useState("ETH");


  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress, walletChainId]);

  useEffect(() => {
    const fetchCurrencyName = async () => {
      if (walletChainId) {
        const currencyName = chainIdToCurrencyCode(walletChainId);
        setCurrencyName(currencyName);
      }
    };
    fetchCurrencyName();
  }, [walletChainId]);

  const RequestConnection = async () => {
    var msg = "";
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      msg = "Please install and connect to Metamask to continue.";
    } else {
      msg = "Please connect to Metamask to continue.";
    }
    console.log(msg);
    window.alert(msg);
  }

  const connectWallet = async () => {
    if (!(typeof window != "undefined" && typeof window.ethereum != "undefined")) {
      /* MetaMask is not installed */
      RequestConnection();
      return;
    }
    try {
      /* MetaMask is installed */
      /* fetch account */
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      console.log(accounts[0]);
      /* fetch chainId */
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      setWalletChainId(chainId);
      console.log(chainId);

    } catch (err) {
      console.error(err.message);
    }
  };



  const getCurrentWalletConnected = async () => {
    // error printing function
    const RequestConnection = async () => {
      var msg = "";
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        msg = "Please install and connect to Metamask to continue.";
      } else {
        msg = "Please connect to Metamask to continue.";
      }
      console.log(msg);
      window.alert(msg);
    }
    if (!(typeof window != "undefined" && typeof window.ethereum != "undefined")) {
      /* MetaMask is not installed */
      RequestConnection();
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } else {
        RequestConnection();
        return;
      }
      /* fetch chainId */
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });
      if (chainId.length > 0) { /* if we are here, should be always true!? */
        setWalletChainId(chainId);
        console.log(chainId);
      } else {
        RequestConnection();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const addWalletListener = async () => {
    if (!(typeof window != "undefined" && typeof window.ethereum != "undefined")) {
      /* MetaMask is not installed */
      setWalletAddress("");

      var msg = "";
      if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
        msg = "Please install and connect to Metamask to continue.";
      } else {
        msg = "Please connect to Metamask to continue.";
      }
      console.log(msg);
      window.alert(msg);

      return;
    }
    window.ethereum.on("accountsChanged", (accounts) => {
      setWalletAddress(accounts[0]);
      console.log(accounts[0]);
    });
    window.ethereum.on("chainChanged", (chainId) => {
      setWalletAddress(chainId);
      console.log(chainId);
    });
  };

  const onInputChange = async event => {
    if (!(walletChainId && walletAddress && walletChainId.length > 0 && walletAddress.length > 0)) {
      RequestConnection()
      return;
    }
    if (event.target.validity.valid) {
      setUserAmount(event.target.value);
      //setIsUsdInput(false);

      if (event.target.value === "") {
        setUsdAmount("");
      } else {
        const usdValue = await convertToUsd(event.target.value, walletChainId);
        setUsdAmount(usdValue);
      }
    }
  };

  const onUsdInputChange = async event => {
    if (!(walletChainId && walletAddress && walletChainId.length > 0 && walletAddress.length > 0)) {
      RequestConnection()
      return;
    }
    if (event.target.validity.valid) {
      setUsdAmount(event.target.value);
      //setIsUsdInput(true);

      if (event.target.value === "") {
        setUserAmount("");
      } else {
        const currencyValue = await convertToCurrency(event.target.value, walletChainId);
        setUserAmount(currencyValue);
      }
    }
  };


  const handleDonate = async event => {

      if (!(walletChainId && walletAddress && walletChainId.length > 0 && walletAddress.length > 0)) {
        RequestConnection()
        return;
      }
      console.log(userAmount);
      var EtherToWei = 0;
      try {
        EtherToWei = ethers.utils.parseUnits(userAmount,"ether");
        console.log("EtherToWei", EtherToWei);
      } catch(err) {
        console.error(err.message);
        return;
      }

      /* FIXME: update value */
      const transactionParameters = {
        to: "0x1155418c315169Da7e947C1D830E669F6b1F2f3e", // Required except during contract publications.
        from: walletAddress, // must match user's active address.
        value: EtherToWei._hex, // Only required to send ether to the recipient from the initiating external account.
        chainId: walletChainId, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };

      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      console.log(txHash);
      const txHashField = document.getElementById('txHashField');
      txHashField.innerText = "Transaction hash: " + txHash;
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">Donation Page</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu connect-wallet-visible">
            <div className="navbar-end is-right">
              <button
                  className="button is-white connect-wallet connect-wallet-visible"
                  onClick={connectWallet}
                >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0 
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                  { walletAddress && walletAddress.length > 0  &&  walletChainId && walletChainId.length > 0
                    ? ` (${walletChainId})`
                    : ""}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Donate</h1>
            <p>Your contribution is highly appreciated</p>
            <div className="box address-box">
              <div className="columns">
                <div className="column is-four-fifths">
                  <div className="columns">
                    <div className="column is-half">
                      <label className="label">Enter amount in ${currencyName}:</label>
                      <input
                        className="input is-medium"
                        type="text"
                        value={userAmount}
                        pattern="[0-9]+([\.][0-9]*)?"
                        onInput={onInputChange}
                        placeholder="Enter the amount (example 0.05)"
                      />
                    </div>
                    <div className="column is-half">
                      <label className="label">Amount in USD:</label>
                      <input
                        className="input is-medium"
                        type="text"
                        value={usdAmount}
                        pattern="[0-9]+([\.][0-9]*)?"
                        onInput={onUsdInputChange}
                        placeholder="Enter the amount in USD"
                      />
                    </div>
                  </div>
                </div>
                <div className="column" style={{ paddingTop: "2rem" }}>
                  <button className="button is-link is-large" onClick={handleDonate} >
                    DONATE
                  </button>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p id="txHashField">No transaction yet</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
