"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Contract, parseUnits, ethers, formatEther } from "ethers";

import NFTBidMarketplace from "../../NFTBidMarketplace.json";

export function ListAuctionForm() {
  const router = useRouter();

  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);

  const [nftDetails, setNftDetails] = useState({
    name: "",
    description: "",
    startingPrice: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);

  async function uploadFile() {
    try {
      if (!file) {
        toast.error("No file selected");
        return;
      }

      setUploading(true);
      const data = new FormData();
      data.set("file", file);

      const response = await axios.post("/api/file", data);

      const signedUrl = await response.data;
      return signedUrl;
    } catch (error) {
      console.log("Error:", error);
      toast.error("Trouble uploading file");
    } finally {
      setUploading(false);
    }
  }

  async function handleListAuction(e: FormEvent) {
    e.preventDefault();

    const { name, description, startingPrice, duration } = nftDetails;
    if (!file || !name || !description || !startingPrice || !duration) {
      toast.error("Please enter all the fields");
      return;
    }

    // Validate and convert startingPrice and duration
    const price = Number.parseFloat(startingPrice);
    const durationInSeconds = Number.parseInt(duration) * 86400; // Convert duration to seconds

    if (Number.isNaN(price) || Number.isNaN(durationInSeconds)) {
      toast.error("Invalid starting price or duration");
      return;
    }

    try {
      const url = await uploadFile();

      const response = await axios.post("/api/metadata", {
        ...nftDetails,
        imgUrl: url,
      });

      const signedUrl = await response.data;

      if (typeof window.ethereum === "undefined") {
        toast.error("Please install Metamask");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const nftBidMarketplace = new Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
        NFTBidMarketplace.abi,
        signer
      );

      const startingPrice = parseUnits(nftDetails.startingPrice, "ether");
      let auctionFee = await nftBidMarketplace.getAuctionFee();
      auctionFee = auctionFee.toString();

      const balance = await provider.getBalance(signer.address);
      console.log("User's balance:", formatEther(balance)); // Convert to ether for easy reading

      if (balance < auctionFee) {
        toast.error("Insufficient balance to list the auction");
        return;
      }

      const transaction = await nftBidMarketplace.createToken(
        signedUrl,
        0,
        1,
        startingPrice,
        durationInSeconds,
        {
          value: auctionFee,
        }
      );

      const result = await transaction.wait();

      console.log(result);

      if (result.status === 1) {
        toast.success("Auction listed");
        setFile(undefined);
        setNftDetails({
          name: "",
          description: "",
          startingPrice: "",
          duration: "",
        });
        router.replace("/");
      } else {
        toast.error("Transaction failed");
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Trouble listing NFT auction");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target?.files?.[0]);
  }

  return (
    <div className="card bg-base-300 w-full max-w-xl shrink-0 shadow-lg">
      <div className="card-body">
        <form onSubmit={handleListAuction}>
          <fieldset className="fieldset gap-3">
            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="image"
              >
                Upload image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="file-input w-full"
                accept="img/*"
              />
            </div>
            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="name"
              >
                Name
              </label>
              <input
                onChange={(e) =>
                  setNftDetails({ ...nftDetails, name: e.target.value })
                }
                value={nftDetails.name}
                type="text"
                className="input w-full"
                placeholder="name"
              />
            </div>

            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                onChange={(e) =>
                  setNftDetails({ ...nftDetails, description: e.target.value })
                }
                value={nftDetails.description}
                className="textarea w-full"
                placeholder="description"
              />
            </div>

            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="price"
              >
                Starting price (in ETH)
              </label>
              <input
                onChange={(e) =>
                  setNftDetails({
                    ...nftDetails,
                    startingPrice: e.target.value,
                  })
                }
                value={nftDetails.startingPrice}
                type="text"
                className="input w-full"
                placeholder="price"
              />
            </div>

            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="duration"
              >
                Duration (in days)
              </label>
              <input
                onChange={(e) =>
                  setNftDetails({ ...nftDetails, duration: e.target.value })
                }
                value={nftDetails.duration}
                type="text"
                className="input w-full"
                placeholder="duration"
              />
            </div>

            <button
              disabled={loading || uploading}
              className="btn btn-neutral mt-4"
              type="submit"
            >
              {loading ? "Submitting..." : "List"}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
