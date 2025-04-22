"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers, formatUnits } from "ethers";

import NFTBidMarketplace from "../../../NFTBidMarketplace.json";
import { NFTCard } from "@/components/nft-card";
import type { IAuctionNFT, INFT } from "../page";
import { Spinner } from "@/components/spinner";
import axios from "axios";

export default function Profile() {
  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [marketplaceNFTs, setMarketplaceNFTs] = useState<INFT[]>([]);
  const [auctionNFTs, setAuctionNFTs] = useState<IAuctionNFT[]>([]);

  const getUserNfts = useCallback(async () => {
    if (window.ethereum) {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setConnectedWalletAddress(address);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      try {
        // Get owned and created NFTs from the contract
        const [marketplaceTokensTransactions, auctionTokensTransaction] =
          await contract.getMyNFTs();

        // Fetch all the marketplace NFTs
        const marketplaceItems = await Promise.all(
          marketplaceTokensTransactions.map(async (i: INFT) => {
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

        // Fetch all the auction NFTs
        const auctionItems = await Promise.all(
          auctionTokensTransaction.map(async (i: IAuctionNFT) => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            const response = await axios.get(tokenURI);
            const meta = await response.data;

            const minPrice = formatUnits(i.minPrice.toString(), "ether");
            const highestBid = formatUnits(i.highestBid.toString(), "ether");
            const item = {
              tokenId: Number(i.tokenId),
              seller: i.seller,
              owner: i.owner,
              minPrice,
              highestBidder: i.highestBidder,
              highestBid,
              duration: i.duration,
              image: meta.imgUrl,
              name: meta.name,
              description: meta.description,
            };
            return item;
          })
        );

        // Set the fetched items to the respective state variables
        setMarketplaceNFTs(marketplaceItems);
        setAuctionNFTs(auctionItems);
      } catch (error) {
        console.log("ERROR:", error);
      } finally {
        setLoading(false);
      }
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
            <h1 className="text-3xl font-extrabold">Your NFTs</h1>

            {/* Marketplace NFTs Section */}
            <div className="my-5">
              <h2 className="text-xl font-bold">Marketplace NFTs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {marketplaceNFTs.length > 0 ? (
                  marketplaceNFTs.map((item) => (
                    <NFTCard key={item.tokenId} nft={item} type="LISTING" />
                  ))
                ) : (
                  <>
                    <h1>No marketplace nfts listed or bought yet</h1>
                  </>
                )}
              </div>
            </div>

            {/* Auction NFTs Section */}
            <div className="my-5">
              <h2 className="text-xl font-bold">Auction NFTs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {auctionNFTs.length > 0 ? (
                  auctionNFTs.map((item) => (
                    <NFTCard key={item.tokenId} nft={item} type="AUCTION" />
                  ))
                ) : (
                  <>
                    <h1>No nfts auction listed or won yet</h1>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
