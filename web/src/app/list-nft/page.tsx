import { ListNFTForm } from "@/components/list-nft-form";

export default function ListNFT() {
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <h1 className="text-3xl font-extrabold">List your NFT</h1>

      <ListNFTForm />
    </div>
  );
}
