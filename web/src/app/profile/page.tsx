"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers, formatUnits } from "ethers";

import NFTBidMarketplace from "../../../NFTBidMarketplace.json";
import { NFTCard } from "@/components/nft-card";
import type { INFT } from "../page";
import { Spinner } from "@/components/spinner";
import axios from "axios";

export default function Profile() {
  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState<INFT[]>([]);

  const getUserNfts = useCallback(async () => {
    if (window.ethereum) {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const contract = new ethers.Contract(
        "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
        NFTBidMarketplace.abi,
        signer
      );

      const transaction = await contract.getMyNFTs();

      //Fetch all the user NFTs from the contract
      const items = await Promise.all(
        transaction.map(async (i: INFT) => {
          const tokenURI = await contract.tokenURI(i.tokenId);
          const response = await axios.get(tokenURI);
          const meta = await response.data;

          const price = formatUnits(i.price.toString(), "ether");
          const item = {
            price,
            tokenId: Number(i.tokenId),
            seller: i.seller,
            owner: i.owner,
            image: meta.imgUrl,
            name: meta.name,
            description: meta.description,
          };
          return item;
        })
      );

      setUserNFTs(items);
      setConnectedWalletAddress(address);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUserNfts();
  }, [getUserNfts]);

  return (
    <div>
      {!loading && (
        <h1 className="text-xl font-bold">
          Connected wallet address:{" "}
          <span className="font-normal">{connectedWalletAddress}</span>
        </h1>
      )}

      <div className="my-5 space-y-5">
        {loading ? (
          <div className="min-h-[50vh] flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold">Your listed NFT&apos;s</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {userNFTs.length > 0 ? (
                userNFTs.map((item) => (
                  <NFTCard key={item.tokenId} nft={item} />
                ))
              ) : (
                <h1>You haven&apos;t listed or bought any NFTs yet</h1>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
