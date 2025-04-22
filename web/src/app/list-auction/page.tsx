"use client";
import { ListAuctionForm } from "@/components/list-auction-form";

export default function ListAuction() {
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <h1 className="text-3xl font-extrabold">List your NFT Auction</h1>

      <ListAuctionForm />
    </div>
  );
}
