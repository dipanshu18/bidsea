"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Contract, parseUnits, ethers } from "ethers";

import NFTBidMarketplace from "../../NFTBidMarketplace.json";

export function ListNFTForm() {
  const router = useRouter();

  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);

  const [nftDetails, setNftDetails] = useState({
    name: "",
    description: "",
    price: "",
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

  async function handleListNFT(e: FormEvent) {
    e.preventDefault();

    const { name, description, price } = nftDetails;
    if (!file || !name || !description || !price) {
      toast.error("Please enter all the fields");
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
        "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
        NFTBidMarketplace.abi,
        signer
      );

      const price = parseUnits(nftDetails.price, "ether");
      let listingFee = await nftBidMarketplace.getListingFee();
      listingFee = listingFee.toString();

      const transaction = await nftBidMarketplace.createToken(
        signedUrl,
        price,
        {
          value: listingFee,
        }
      );

      const result = await transaction.wait();

      if (result.status === 1) {
        toast.success("NFT listed");
        setFile(undefined);
        setNftDetails({ name: "", description: "", price: "" });
        router.replace("/");
      } else {
        toast.error("Transaction failed");
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Trouble listing NFT");
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
        <form onSubmit={handleListNFT}>
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
                Price (in ETH)
              </label>
              <input
                onChange={(e) =>
                  setNftDetails({ ...nftDetails, price: e.target.value })
                }
                value={nftDetails.price}
                type="text"
                className="input w-full"
                placeholder="price"
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
