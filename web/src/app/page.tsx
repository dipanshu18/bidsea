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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [allNFTs, setAllNFTs] = useState<INFT[]>([]);

  const getAllNfts = useCallback(async () => {
    if (window.ethereum) {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
        NFTBidMarketplace.abi,
        signer
      );

      const transaction = await contract.getAllNFTs();

      //Fetch all the details of every NFT from the contract
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

      setAllNFTs(items);

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllNfts();
  }, [getAllNfts]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {allNFTs.length > 0 ? (
        <>
          <h1 className="text-3xl font-extrabold">Explore listed NFT&apos;s</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {allNFTs.map((item) => (
              <NFTCard key={item.tokenId} nft={item} />
            ))}
          </div>
        </>
      ) : (
        <div>
          <h1 className="text-center font-extrabold text-2xl">
            No NFTs listed yet
          </h1>
        </div>
      )}
    </div>
  );
}
