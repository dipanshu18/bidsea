"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers"; // Correct import for ethers

export function Navbar() {
  const [connected, setConnected] = useState(false);
  const [currentConnectedAddress, setCurrentConnectedAddress] = useState("0x");

  const getAddress = useCallback(async () => {
    try {
      // Check if window.ethereum is available
      if (typeof window.ethereum === "undefined") {
        console.error("Ethereum provider is not available");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await (await signer).getAddress();
      setCurrentConnectedAddress(addr);
      setConnected(true);
    } catch (error) {
      console.error("Error fetching address:", error);
      setConnected(false);
    }
  }, []);

  async function connectWebsite() {
    if (typeof window.ethereum === "undefined") {
      console.error("Ethereum provider is not available");
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x7a69") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7a69" }],
        });
      }
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(() => {
          getAddress();
          window.location.replace(location.pathname);
        });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }

  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      console.error("Ethereum provider is not available");
      return;
    }

    const checkConnection = async () => {
      if (window.ethereum) {
        const val = await window.ethereum.request({ method: "eth_accounts" });

        if (val && val.length > 0) {
          getAddress();
        } else {
          setConnected(false);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    window.ethereum.on("accountsChanged", () => {
      window.location.replace(location.pathname);
    });

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", () => {
          window.location.replace(location.pathname);
        });
      }
    };
  }, [getAddress]);

  return (
    <div className="navbar max-w-7xl mx-auto shadow-md sticky top-0 z-50 rounded-xl my-5 md:px-8 py-5 backdrop-blur-3xl">
      <div className="navbar-start">
        <div className="dropdown">
          {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href={"/"}>Explore</Link>
            </li>
            <li>
              <Link href={"/list-nft"}>List NFT</Link>
            </li>
            <li>
              <Link href={"/profile"}>Profile</Link>
            </li>
          </ul>
        </div>
        <Link href={"/"} className="btn btn-ghost text-xl">
          Bidsea
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 space-x-3">
          <li>
            <Link href={"/"}>Explore</Link>
          </li>
          <li>
            <Link href={"/list-nft"}>List NFT</Link>
          </li>
          <li>
            <Link href={"/profile"}>Profile</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {connected && currentConnectedAddress !== "0x" ? (
          <button type="button" className="btn btn-success">
            Connected
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-neutral"
            onClick={connectWebsite}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
