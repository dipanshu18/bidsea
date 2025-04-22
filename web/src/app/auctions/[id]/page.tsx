"use client";

import { use, useCallback, useEffect, useState } from "react";
import { ethers, formatUnits, parseEther } from "ethers";

import NFTBidMarketplace from "../../../../NFTBidMarketplace.json";
import { Spinner } from "@/components/spinner";
import type { IAuctionNFT } from "@/app/page";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuctionDetailsProps {
  params: Promise<{ id: string }>;
}

export default function AuctionDetails({ params }: AuctionDetailsProps) {
  const router = useRouter();
  const { id } = use(params);

  const [connectedWalletAddress, setConnectedWalletAddress] = useState("");
  const [auctionDetails, setAuctionDetails] = useState<IAuctionNFT | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);

  const fetchAuctionDetails = useCallback(async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      try {
        // Fetch auction details from the smart contract
        const tokenURI = await contract.tokenURI(id);
        const details = await contract.getAuctionDetails(Number(id));
        const address = await signer.getAddress();

        const response = await axios.get(tokenURI);
        const meta = await response.data;

        // Convert minPrice and highestBid from wei to ether
        const minPrice = formatUnits(details.minPrice.toString(), "ether");
        const highestBid = formatUnits(details.highestBid.toString(), "ether");

        // Prepare the auction item object
        const item: IAuctionNFT = {
          tokenId: Number(details.tokenId),
          seller: details.seller,
          owner: details.owner,
          minPrice,
          highestBidder: details.highestBidder,
          highestBid,
          duration: details.duration,
          image: meta.imgUrl, // Assuming your metadata contains an image field
          name: meta.name,
          description: meta.description,
          ended: details.ended,
          started: details.started,
        };

        setConnectedWalletAddress(address);
        setAuctionDetails(item);
        setAuctionStarted(details.started);
        setAuctionEnded(details.ended);
      } catch (error) {
        console.error("Error fetching auction details:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  const startAuction = async () => {
    if (window.ethereum && auctionDetails) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      try {
        const result = await contract.startAuction(
          auctionDetails.tokenId,
          parseEther(auctionDetails.minPrice),
          auctionDetails.duration
        );

        if (result.status === 1) {
          setAuctionStarted(true);
          router.refresh();
          window.location.reload();

          toast.success("Started auction");
        }
      } catch (error) {
        console.error("Error starting auction:", error);
      }
    }
  };

  const endAuction = async () => {
    if (window.ethereum && auctionDetails) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      try {
        const result = await contract.endAuction(auctionDetails.tokenId);

        if (result.status === 1) {
          setAuctionEnded(true);

          router.refresh();
          window.location.reload();

          toast.success("Auction ended");
        }
      } catch (error) {
        console.error("Error ending auction:", error);
      }
    }
  };

  const bidOnAuction = async () => {
    if (window.ethereum && auctionDetails) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      try {
        const bid = parseEther(bidAmount);
        const transaction = await contract.bid(auctionDetails.tokenId, {
          value: bid,
        });

        const result = await transaction.wait();

        if (result.success === 1) {
          setBidAmount("");
          router.refresh();
          window.location.reload();
          toast.success("Bid placed");
        }
      } catch (error) {
        console.error("Error placing bid:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  // Handle case where auction details are not available or no auction exists
  if (!auctionDetails) {
    return <h1>No auction found for this NFT.</h1>;
  }

  return (
    <div className="bg-base-100 max-w-xl lg:max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:justify-center items-center gap-10 ">
        <figure className="h-[70vh]">
          <Image
            src={auctionDetails.image}
            alt="NFT image"
            className="rounded-2xl w-full h-full"
            width={1080}
            height={1920}
            loading="lazy"
          />
        </figure>
        <div className="space-y-5">
          <div>
            <strong>Owner:</strong> {auctionDetails.owner}
          </div>
          <div>
            <strong>Minimum Price:</strong> {auctionDetails.minPrice} ETH
          </div>
          <div>
            <strong>Highest Bid:</strong> {auctionDetails.highestBid} ETH
          </div>
          <div>
            <strong>Highest Bidder:</strong> {auctionDetails.highestBidder}
          </div>

          <div>
            <strong>Auction Status:</strong>
            {auctionDetails.ended
              ? "Ended"
              : auctionDetails.started
              ? "Ongoing"
              : "Not started"}
          </div>

          {connectedWalletAddress === auctionDetails.seller &&
            !auctionStarted && (
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={startAuction}
              >
                Start Auction
              </button>
            )}

          {auctionStarted &&
            !auctionEnded &&
            connectedWalletAddress !== auctionDetails.seller && (
              <div>
                <button
                  type="button"
                  className="btn w-full btn-primary"
                  onClick={() => {
                    const modal = document.getElementById(
                      "my_modal_3"
                    ) as HTMLDialogElement;
                    modal.showModal();
                  }}
                >
                  Bid
                </button>
                <dialog id="my_modal_3" className="modal">
                  <div className="modal-box">
                    <form method="dialog">
                      {/* Close modal */}
                      <button
                        type="button"
                        onClick={() => {
                          const modal = document.getElementById(
                            "my_modal_3"
                          ) as HTMLDialogElement;
                          modal.close();
                        }}
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                      >
                        ✕
                      </button>
                    </form>
                    <h3 className="font-bold text-lg">Enter your bid</h3>
                    <form
                      className="py-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        bidOnAuction();
                      }}
                    >
                      <div className="grid gap-2">
                        <label htmlFor="bidAmount">Bid Amount</label>
                        <input
                          className="input w-full"
                          placeholder="bid amount"
                          type="text"
                          name="bid amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-secondary mt-5 w-full"
                      >
                        Place bid
                      </button>
                    </form>
                  </div>
                </dialog>
              </div>
            )}

          {auctionEnded && (
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={endAuction}
            >
              End Auction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
