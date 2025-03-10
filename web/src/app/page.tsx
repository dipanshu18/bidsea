import { NFTCard } from "@/components/nft-card";

export default function Home() {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold">Explore listed NFT&apos;s</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array(8)
          .fill("")
          .map((_, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <NFTCard key={idx} />
          ))}
      </div>
    </div>
  );
}
