// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.9.0;

import { L2StandardERC20 } from "../standards/L2StandardERC20.sol";

contract L2ERC20Decimal6 is L2StandardERC20 {

    constructor(
      address _l2Bridge,
      address _l1Token,
      string memory _tokenName,
      string memory _tokenSymbol
    ) L2StandardERC20(_l2Bridge, _l1Token, _tokenName, _tokenSymbol){

    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}