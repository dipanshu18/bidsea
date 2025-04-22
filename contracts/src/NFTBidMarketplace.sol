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
    uint256 auctionFee = 0.03 ether;

    constructor() ERC721("Bidsea", "BS") {
        owner = payable(msg.sender);
    }

    enum tokenType {
        LISTING,
        AUCTION
    }

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    struct AuctionListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 minPrice;
        address payable highestBidder;
        uint256 highestBid;
        uint256 duration;
        bool started;
        bool ended;
    }

    mapping(uint256 => ListedToken) private idToListedToken;
    mapping(uint256 => AuctionListedToken) private idToAuctionListedToken;

    // Auction-specific events
    event StartAuction(
        uint256 indexed tokenId,
        uint256 minPrice,
        uint256 duration
    );
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 bidAmount
    );
    event Withdraw(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );
    event EndAuction(
        uint256 indexed tokenId,
        address indexed highestBidder,
        uint256 highestBid
    );

    function updateListingFee(uint256 _newFee) public payable {
        require(owner == msg.sender, "Only owner can update the listing price");
        listingFee = _newFee;
    }

    function getListingFee() public view returns (uint256) {
        return listingFee;
    }

    function getAuctionFee() public view returns (uint256) {
        return auctionFee;
    }

    function getLatestIdToListedToken()
        public
        view
        returns (ListedToken memory)
    {
        uint256 tokenId = _tokenIds.current();
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    function createToken(
        string memory tokenURI,
        uint256 price,
        tokenType target,
        uint256 minPrice,
        uint256 duration
    ) public payable returns (uint) {
        if (target == tokenType.LISTING) {
            require(msg.value == listingFee, "Send enough ether to list");
            require(price > 0, "Make sure the price isn't negative");
        } else {
            require(msg.value == auctionFee, "Send enough ether to list");
            require(minPrice > 0, "Make sure the price isn't negative");
        }

        _tokenIds.increment();
        uint256 currentTokenId = _tokenIds.current();
        _safeMint(msg.sender, currentTokenId);

        _setTokenURI(currentTokenId, tokenURI);

        if (target == tokenType.LISTING) {
            createListedToken(currentTokenId, price);
            return currentTokenId;
        } else {
            createAuctionListingToken(currentTokenId, minPrice, duration);
            return currentTokenId;
        }
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

    function createAuctionListingToken(
        uint256 tokenId,
        uint256 minPrice,
        uint256 duration
    ) private {
        idToAuctionListedToken[tokenId] = AuctionListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            minPrice,
            payable(msg.sender),
            minPrice,
            duration,
            false,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
    }

    // Marketplace function
    function executeSale(uint256 tokenId) public payable {
        require(
            msg.value == idToListedToken[tokenId].price,
            "Amount should be equivalent to the ask price in order to purchase the NFT"
        );

        address payable seller = idToListedToken[tokenId].seller;

        idToListedToken[tokenId].currentlyListed = false;
        idToListedToken[tokenId].seller = payable(msg.sender);

        _itemsSold.increment();

        _transfer(address(this), msg.sender, tokenId);

        approve(address(this), tokenId);

        payable(owner).transfer(listingFee);
        payable(seller).transfer(msg.value);
    }

    // Auction functions
    function startAuction(
        uint256 tokenId,
        uint256 minPrice,
        uint256 duration
    ) public {
        AuctionListedToken storage auction = idToAuctionListedToken[tokenId];
        require(
            auction.seller == msg.sender,
            "Only the seller can start the auction"
        );
        require(!auction.started, "Auction has already started");

        auction.started = true;
        auction.minPrice = minPrice;
        auction.duration = duration;
        auction.highestBid = minPrice;
        auction.highestBidder = payable(address(0));

        auction.owner = payable(address(this));
        auction.seller = payable(msg.sender);

        auction.duration = block.timestamp + duration;

        emit StartAuction(tokenId, minPrice, duration);
    }

    function bid(uint256 tokenId) public payable {
        AuctionListedToken storage auction = idToAuctionListedToken[tokenId];
        require(auction.started, "Auction hasn't started");
        require(block.timestamp < auction.duration, "Auction has ended");
        require(
            msg.value > auction.highestBid,
            "Bid should be higher than current highest bid"
        );

        // Refund the previous highest bidder if any
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        // Update the highest bid and bidder
        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function withdraw(uint256 tokenId) public {
        AuctionListedToken storage auction = idToAuctionListedToken[tokenId];
        uint256 amount = 0;

        // Ensure only previous bidders can withdraw
        if (
            auction.highestBidder != address(0) &&
            auction.highestBidder != msg.sender
        ) {
            amount = auction.highestBid;
            auction.highestBid = 0;
            auction.highestBidder = payable(address(0));
        }

        require(amount > 0, "No funds to withdraw");

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to withdraw funds");

        emit Withdraw(tokenId, msg.sender, amount);
    }

    function endAuction(uint256 tokenId) public {
        AuctionListedToken storage auction = idToAuctionListedToken[tokenId];
        require(auction.started, "Auction hasn't started");
        require(
            block.timestamp >= auction.duration,
            "Auction is still ongoing"
        );
        require(!auction.ended, "Auction already ended");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            // Transfer the NFT to the highest bidder
            _transfer(address(this), auction.highestBidder, tokenId);

            // Transfer funds to the seller
            (bool sent, ) = payable(auction.seller).call{
                value: auction.highestBid
            }("");
            require(sent, "Failed to transfer funds to seller");
        } else {
            // No bids, transfer NFT back to the seller
            _transfer(address(this), auction.seller, tokenId);
        }

        emit EndAuction(tokenId, auction.highestBidder, auction.highestBid);
    }

    function getAuctionDetails(
        uint256 tokenId
    ) public view returns (AuctionListedToken memory) {
        return idToAuctionListedToken[tokenId];
    }

    function getAllAuctions()
        public
        view
        returns (AuctionListedToken[] memory)
    {
        uint256 totalAuctionsCount = _tokenIds.current();

        // Count how many auctions are not ended
        uint256 activeAuctionsCount = 0;
        for (uint256 i = 1; i <= totalAuctionsCount; i++) {
            if (_exists(i) && !idToAuctionListedToken[i].ended) {
                activeAuctionsCount++;
            }
        }

        // Create an array to store all active auctions
        AuctionListedToken[] memory activeAuctions = new AuctionListedToken[](
            activeAuctionsCount
        );
        uint256 currentIdx = 0;

        // Populate the array with the active auctions
        for (uint256 i = 1; i <= totalAuctionsCount; i++) {
            if (_exists(i) && !idToAuctionListedToken[i].ended) {
                activeAuctions[currentIdx] = idToAuctionListedToken[i];
                currentIdx++;
            }
        }

        return activeAuctions;
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint256 nftCount = _tokenIds.current();

        // Count how many valid, listed NFTs there are
        uint256 validListedCount = 0;
        for (uint256 i = 1; i <= nftCount; i++) {
            if (_exists(i) && idToListedToken[i].currentlyListed) {
                validListedCount++;
            }
        }

        // Create an array for the valid NFTs
        ListedToken[] memory tokens = new ListedToken[](validListedCount);
        uint256 currentIdx = 0;

        // Populate the array with the valid listed NFTs
        for (uint256 i = 1; i <= nftCount; i++) {
            if (_exists(i) && idToListedToken[i].currentlyListed) {
                tokens[currentIdx] = idToListedToken[i];
                currentIdx++;
            }
        }

        return tokens;
    }

    function getListingForToken(
        uint256 tokenId
    ) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getMyNFTs()
        public
        view
        returns (
            ListedToken[] memory marketplaceNFTs, // User's marketplace NFTs (bought or listed)
            AuctionListedToken[] memory auctionNFTs // User's auction NFTs (won or listed)
        )
    {
        uint totalItemsCount = _tokenIds.current();

        // Counters for different categories
        uint marketplaceNFTCount = 0;
        uint auctionNFTCount = 0;

        // First pass: count the number of NFTs in each category
        for (uint i = 0; i < totalItemsCount; i++) {
            ListedToken memory token = idToListedToken[i + 1];
            AuctionListedToken memory auctionToken = idToAuctionListedToken[
                i + 1
            ];

            // User's marketplace NFTs (bought or created)
            if (token.owner == msg.sender || token.seller == msg.sender) {
                marketplaceNFTCount += 1;
            }

            // User's auction NFTs (won or created)
            if (
                auctionToken.highestBidder == msg.sender ||
                auctionToken.seller == msg.sender
            ) {
                auctionNFTCount += 1;
            }
        }

        // Arrays to store the results for each category
        ListedToken[] memory marketplaceTokens = new ListedToken[](
            marketplaceNFTCount
        );
        AuctionListedToken[] memory auctionTokens = new AuctionListedToken[](
            auctionNFTCount
        );

        // Second pass: populate the arrays with the appropriate tokens
        uint currentIdxMarketplace = 0;
        uint currentIdxAuction = 0;

        for (uint i = 0; i < totalItemsCount; i++) {
            ListedToken memory token = idToListedToken[i + 1];
            AuctionListedToken memory auctionToken = idToAuctionListedToken[
                i + 1
            ];

            // User's marketplace NFTs (bought or created)
            if (token.owner == msg.sender || token.seller == msg.sender) {
                marketplaceTokens[currentIdxMarketplace] = token;
                currentIdxMarketplace += 1;
            }

            // User's auction NFTs (won or created)
            if (
                auctionToken.highestBidder == msg.sender ||
                auctionToken.seller == msg.sender
            ) {
                auctionTokens[currentIdxAuction] = auctionToken;
                currentIdxAuction += 1;
            }
        }

        return (marketplaceTokens, auctionTokens);
    }
}
