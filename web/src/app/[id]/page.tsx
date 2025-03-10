/* eslint-disable @next/next/no-img-element */
export default function NFTDetails({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-10 bg-base-100 max-w-xl lg:max-w-7xl mx-auto">
      <figure>
        <img
          src="https://elevate.ca/wp-content/uploads/2022/04/galaxy-7040416_1280-1024x576.png"
          alt="NFT pic"
          className="rounded-2xl"
        />
      </figure>
      <div className="space-y-5 w-full max-w-md">
        <h2 className="text-xl font-bold">Name: {params.id}</h2>
        <p className="">
          Description: Lorem ipsum dolor sit amet consectetur, adipisicing elit.
          Facilis sunt repellendus quae adipisci perferendis, qui expedita
          quisquam ut debitis modi!
        </p>
        <p>
          Ask price: <span className="text-lg font-extrabold">-- ETH</span>
        </p>
        <div className="card-actions">
          <button type="submit" className="btn btn-primary w-full">
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}
