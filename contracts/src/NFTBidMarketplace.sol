// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTBidMarketplace is ERC721URIStorage {
    address payable owner;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingFee = 0.01 ether;

    constructor() ERC721("Bidsea", "BS") {
        owner = payable(msg.sender);
    }

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    mapping(uint256 => ListedToken) private idToListedToken;

    function updateListingFee(uint256 _newFee) public payable {
        require(owner == msg.sender, "Only owner can update the listing price");
        listingFee = _newFee;
    }

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function getLatestIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        uint256 tokenId = _tokenIds.current();
        return idToListedToken[tokenId];
    }

    function getListingForToken(
        uint256 tokenId
    ) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint) {
        require(msg.value == listingFee, "Send enough ether to list");
        require(price > 0, "Make sure the price isn't negative");

        _tokenIds.increment();
        uint256 currentTokenId = _tokenIds.current();
        _safeMint(msg.sender, currentTokenId);

        _setTokenURI(currentTokenId, tokenURI);

        createListedToken(currentTokenId, price);
        return currentTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint256 nftCount = _tokenIds.current();

        ListedToken[] memory tokens = new ListedToken[](nftCount);

        uint currentIdx = 0;

        for (uint i = 0; i < nftCount; i++) {
            uint id = i + 1;
            ListedToken storage currentItem = idToListedToken[id];

            tokens[currentIdx] = currentItem;
            currentIdx += 1;
        }

        return tokens;
    }

    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint totalItemsCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIdx = 0;

        // Get the count of all the nfts belongs to the user;
        for (uint i = 0; i < totalItemsCount; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                itemCount += 1;
            }
        }

        // populate tokens array to return user owned nfts;
        ListedToken[] memory tokens = new ListedToken[](itemCount);

        for (uint i = 0; i < totalItemsCount; i++) {
            if (
                idToListedToken[i + 1].owner == msg.sender ||
                idToListedToken[i + 1].seller == msg.sender
            ) {
                uint id = i + 1;
                ListedToken storage currentItem = idToListedToken[id];
                tokens[currentIdx] = currentItem;
                currentIdx += 1;
            }
        }

        return tokens;
    }

    function executeSale(uint256 tokenId) public payable {
        require(
            msg.value == idToListedToken[tokenId].price,
            "Amount should be equivalent to the ask price in order to purchase the NFT"
        );

        address payable seller = idToListedToken[tokenId].seller;

        idToListedToken[tokenId].currentlyListed = true;
        idToListedToken[tokenId].seller = payable(msg.sender);

        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        approve(address(this), tokenId);

        payable(owner).transfer(listingFee);
        payable(seller).transfer(msg.value);
    }
}
