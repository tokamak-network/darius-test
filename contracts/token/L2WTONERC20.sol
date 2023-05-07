// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.9.0;

import { L2StandardERC20 } from "../standards/L2StandardERC20.sol";

contract L2WTONERC20 is L2StandardERC20 {
    constructor(
      address _l2Bridge,
      address _l1Token
    )
        L2StandardERC20(_l2Bridge, _l1Token, "Wrapped TON", "WTON")
        {
        }

        function decimals() public pure override returns (uint8) {
        return 27;
    }
}