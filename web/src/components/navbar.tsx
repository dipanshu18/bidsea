import Link from "next/link";

export function Navbar() {
  return (
    <div className="navbar max-w-7xl mx-auto bg-base-300 shadow-md sticky top-0 z-50 rounded-xl my-5 md:px-8 py-5">
      <div className="navbar-start">
        <div className="dropdown">
          {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href={"/"}>Explore</Link>
            </li>
            <li>
              <Link href={"/list-nft"}>List NFT</Link>
            </li>
            <li>
              <Link href={"/profile"}>Profile</Link>
            </li>
          </ul>
        </div>
        <Link href={"/"} className="btn btn-ghost text-xl">
          Bidsea
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 space-x-3">
          <li>
            <Link href={"/"}>Explore</Link>
          </li>
          <li>
            <Link href={"/list-nft"}>List NFT</Link>
          </li>
          <li>
            <Link href={"/profile"}>Profile</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <Link href={"/"} className="btn btn-neutral">
          Connect Wallet
        </Link>
      </div>
    </div>
  );
}
