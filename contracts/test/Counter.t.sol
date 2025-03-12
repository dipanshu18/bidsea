// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter counter;
    uint256 currentCount;

    function setUp() public {
        counter = new Counter();
    }

    function test_SetNumber() public {
        counter.setNumber(5);
        currentCount = counter.getNum();
        assertEq(uint256(currentCount), uint256(5));
    }

    function test_Increment() public {
        counter.setNumber(5);
        counter.increment();
        currentCount = counter.getNum();
        assertEq(uint256(currentCount), uint256(6));
    }

    function test_Decrement() public {
        counter.setNumber(6);
        counter.decrement();
        currentCount = counter.getNum();
        assertEq(uint256(currentCount), uint256(5));
    }

    function test_FailDecrement() public {
        counter.setNumber(5);
        counter.decrement();
        counter.decrement();
        counter.decrement();
        counter.decrement();
        counter.decrement();
    }
}
