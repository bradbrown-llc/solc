// SPDX-License-Identifier: 0BSD
pragma solidity 0.8.18;

contract Baz {
    function foo() external pure returns (uint) {
        return 8000;
    }
}

contract Boo {
    function bar() external returns (bool) {
        return true;
    }
}