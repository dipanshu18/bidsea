export default function ListNFT() {
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <h1 className="text-3xl font-extrabold">List your NFT</h1>

      <div className="card bg-base-300 w-full max-w-xl shrink-0 shadow-lg">
        <div className="card-body">
          <fieldset className="fieldset gap-3">
            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="image"
              >
                Upload image
              </label>
              <input type="file" className="file-input w-full" />
            </div>
            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="name"
              >
                Name
              </label>
              <input type="text" className="input w-full" placeholder="name" />
            </div>

            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="description"
              >
                Description
              </label>
              <textarea className="textarea w-full" placeholder="description" />
            </div>

            <div className="space-y-1">
              <label
                className="fieldset-label text-sm text-base-content font-semibold"
                htmlFor="price"
              >
                Price (in ETH)
              </label>
              <input type="text" className="input w-full" placeholder="price" />
            </div>

            <button className="btn btn-neutral mt-4" type="submit">
              List
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
