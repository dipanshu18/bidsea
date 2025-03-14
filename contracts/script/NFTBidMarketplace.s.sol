// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {Script} from "../lib/forge-std/src/Script.sol";
import "../src/NFTBidMarketplace.sol";

contract NFTBidMarketplaceScript is Script {
    NFTBidMarketplace public nftBidMarketplace;

    function setUp() public {}

    function run() public returns (NFTBidMarketplace) {
        vm.startBroadcast();

        nftBidMarketplace = new NFTBidMarketplace();

        vm.stopBroadcast();

        return nftBidMarketplace;
    }
}
