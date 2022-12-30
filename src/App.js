import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletChainId, setWalletChainId] = useState("");
  const [userAmount, setUserAmount] = useState("");

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress, walletChainId]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
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
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
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
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
      window.ethereum.on("chainChanged", (chainId) => {
        setWalletAddress(chainId);
        console.log(chainId);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

	const onInputChange = async event => {
		if (event.target.validity.valid) {
			setUserAmount(event.target.value);
		}
	};

	const handleDonate = async event => {

      if (!(walletChainId && walletAddress && walletChainId.length > 0 && walletAddress.length > 0)) {
				const msg = 'Please try to connect first!';
				console.log(msg);
				return alert(msg);
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
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
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
                  <input
                    className="input is-medium"
                    type="text"
										value={userAmount}
										pattern="[0-9]+([\.][0-9]*)?" 
										onInput={onInputChange}
                    placeholder="Enter the amount (example 0.05)"
                  />
                </div>
                <div className="column">
                  <button className="button is-link is-medium" onClick={handleDonate} >
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
