import { NFTCard } from "@/components/nft-card";

export default function Profile() {
  return (
    <div>
      <h1 className="text-xl font-bold">
        Connected wallet address: <span className="font-normal">sjdlfsldf</span>
      </h1>

      <div className="my-5 space-y-5">
        <h1 className="text-3xl font-extrabold">Your listed NFT&apos;s</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(5)
            .fill("")
            .map((_, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <NFTCard key={idx} />
            ))}
        </div>
      </div>
    </div>
  );
}
