/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

export function NFTCard() {
  return (
    <div className="card bg-base-100 w-full shadow-sm">
      <figure>
        <img
          src="https://media.licdn.com/dms/image/v2/C5612AQEhtPNooqNUeg/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1641999038804?e=2147483647&v=beta&t=ysRtp4HROlBk4HpDBBXq_YKlS6pI98ap21naFFLdWgM"
          alt="Bored apes NFT pic"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">Bored Apes</h2>
        <div className="card-actions justify-end">
          <Link href={"/123"}>
            <button className="btn btn-secondary" type="button">
              See more
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
