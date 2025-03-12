// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 private number;

    function setNumber(uint256 _number) public {
        number = _number;
    }

    function increment() public {
        number++;
    }

    function decrement() public {
        number--;
    }

    function getNum() public view returns (uint256) {
        return number;
    }
}
