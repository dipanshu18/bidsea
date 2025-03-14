"use client";

import { use, useCallback, useEffect, useState } from "react";
import { ethers, parseUnits } from "ethers";

import NFTBidMarketplace from "../../../NFTBidMarketplace.json";
import type { INFT } from "../page";
import axios from "axios";
import Image from "next/image";
import { Spinner } from "@/components/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NFTDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [nftInfo, setNftInfo] = useState<INFT>();
  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");

  const getNftDetail = useCallback(async () => {
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

      const tokenURI = await contract.tokenURI(id);
      const nftDetails = await contract.getListingForToken(id);

      //Fetch the details of NFT from the contract

      const response = await axios.get(tokenURI);
      const meta = await response.data;

      const item = {
        price: meta.price,
        tokenId: meta.tokenId,
        seller: nftDetails.seller,
        owner: nftDetails.owner,
        image: meta.imgUrl,
        name: meta.name,
        description: meta.description,
      };

      setNftInfo(item as unknown as INFT);
      setConnectedWalletAddress(address);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getNftDetail();
  }, [getNftDetail]);

  async function handleBuyNFT() {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        //Pull the deployed contract instance
        const contract = new ethers.Contract(
          "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
          NFTBidMarketplace.abi,
          signer
        );
        if (nftInfo?.price) {
          const salePrice = parseUnits(nftInfo.price, "ether");

          const transaction = await contract.executeSale(id, {
            value: salePrice,
          });
          const result = await transaction.wait();

          if (result.status === 1) {
            toast.success("You successfully bought the NFT!");
            router.refresh();
            router.replace("/");
          }
        }
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Something went wrong while purchasing the NFT");
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (!loading && !nftInfo) {
    return (
      <div>
        <h1>Error while fetching the details of the NFT</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:justify-center items-center gap-10 bg-base-100 max-w-xl lg:max-w-7xl mx-auto">
      <figure className="h-[70vh]">
        <Image
          src={nftInfo?.image as string}
          alt="NFT pic"
          className="rounded-2xl w-full h-full"
          width={1080}
          height={1920}
          loading="lazy"
        />
      </figure>
      <div className="space-y-5 w-full max-w-md">
        <h2 className="text-xl font-bold">Name: {nftInfo?.name}</h2>
        <p className="">Description: {nftInfo?.description}</p>
        <p>
          Ask price:{" "}
          <span className="text-lg font-extrabold">{nftInfo?.price} ETH</span>
        </p>
        {connectedWalletAddress === nftInfo?.seller ? (
          <h1 className="text-xl font-extrabold text-primary">
            You own this NFT
          </h1>
        ) : (
          <div className="card-actions">
            <button
              onClick={handleBuyNFT}
              type="submit"
              className="btn btn-primary w-full"
            >
              Buy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
