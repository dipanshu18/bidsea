import type { IAuctionNFT, INFT } from "@/app/page";
import Image from "next/image";
import Link from "next/link";

export function NFTCard({
  nft,
  type,
}: {
  nft: INFT | IAuctionNFT;
  type?: "LISTING" | "AUCTION";
}) {
  return (
    <div className="card bg-base-100 w-full shadow-sm">
      <figure>
        <Image
          src={nft.image}
          alt={`${nft.name} nft pic`}
          width={1080}
          height={1920}
          className="h-96 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{nft.name}</h2>
        <div className="card-actions justify-end">
          <Link
            href={
              type === "LISTING"
                ? `/${nft.tokenId.toString()}`
                : `/auctions/${nft.tokenId.toString()}`
            }
          >
            <button className="btn btn-secondary" type="button">
              See more
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
