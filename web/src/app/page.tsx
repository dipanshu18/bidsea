"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers, formatUnits } from "ethers";

import { NFTCard } from "@/components/nft-card";
import NFTBidMarketplace from "../../NFTBidMarketplace.json";
import axios from "axios";
import { Spinner } from "@/components/spinner";

export interface INFT {
  price: string;
  tokenId: number;
  seller: string;
  owner: string;
  image: string;
  name: string;
  description: string;
}

export interface IAuctionNFT {
  tokenId: number;
  seller: string;
  owner: string;
  minPrice: string;
  highestBidder: string;
  highestBid: string;
  duration: number;
  image: string;
  name: string;
  description: string;
  ended: boolean;
  started: boolean;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [listedNFTs, setListedNFTs] = useState<INFT[]>([]);
  const [auctionNFTs, setAuctionNFTs] = useState<IAuctionNFT[]>([]);

  const getListedNfts = useCallback(async () => {
    if (window.ethereum) {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      try {
        // Fetch all listed NFTs
        const transaction = await contract.getAllNFTs(); // Assuming getAllNFTs fetches all listed NFTs
        const items = await Promise.all(
          transaction.map(async (i: INFT) => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            const response = await axios.get(tokenURI);
            const meta = await response.data;

            const price = formatUnits(i.price.toString(), "ether");
            const item = {
              tokenId: Number(i.tokenId),
              seller: i.seller,
              owner: i.owner,
              image: meta.imgUrl,
              name: meta.name,
              description: meta.description,
              price,
            };
            return item;
          })
        );

        setListedNFTs(items);
      } catch (error) {
        console.log("Error fetching listed NFTs", error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const getAuctionNfts = useCallback(async () => {
    if (window.ethereum) {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      try {
        // Fetch all auction NFTs
        const auctionTransaction = await contract.getAllAuctions();
        const auctionItems = await Promise.all(
          auctionTransaction.map(async (i: IAuctionNFT) => {
            console.log(i.tokenId);

            // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
            let metadata;
            try {
              const tokenURI = await contract.tokenURI(i.tokenId);
              const response = await axios.get(tokenURI);
              metadata = response.data;
            } catch (error) {
              console.error(
                `Error fetching token URI for tokenId ${i.tokenId}`,
                error
              );
              metadata = {
                imgUrl: "", // fallback image
                name: "Unknown", // fallback name
                description: "No metadata available", // fallback description
              };
            }

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
              image: metadata.imgUrl,
              name: metadata.name,
              description: metadata.description,
            };

            return item;
          })
        );

        // Filter out items with invalid image URLs or missing metadata
        const validAuctionNFTs = auctionItems.filter(
          (item) => item.image && item.image !== ""
        );

        setAuctionNFTs(validAuctionNFTs);
      } catch (error) {
        console.log("Error fetching auction NFTs", error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    getListedNfts();
    getAuctionNfts();
  }, [getListedNfts, getAuctionNfts]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {listedNFTs.length > 0 && (
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold">Explore listed NFT&apos;s</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {listedNFTs.map((item) => (
              <NFTCard key={item.tokenId} nft={item} type="LISTING" />
            ))}
          </div>
        </div>
      )}

      {auctionNFTs.length > 0 && (
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold">
            Explore Auctioned NFT&apos;s
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {auctionNFTs.map((item) => (
              <NFTCard key={item.tokenId} nft={item} type="AUCTION" />
            ))}
          </div>
        </div>
      )}

      {listedNFTs.length === 0 && auctionNFTs.length === 0 && (
        <div>
          <h1 className="text-xl">No NFTs listed or auctioned yet</h1>
        </div>
      )}
    </div>
  );
}
