//SPDX-License-Identifier: Unlicense
// This contracts runs on L1, and controls a Greeter on L2.
// The addresses are specific to Optimistic Goerli.
pragma solidity ^0.8.0;

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";
    
contract FromL1_ControlL2Greeter {
    // Taken from https://community.optimism.io/docs/useful-tools/networks/#optimism-goerli

    address crossDomainMessengerAddr = 0x2878373BA3Be0Ef2a93Ba5b3F7210D76cb222e63;

    address greeterL2Addr = 0xDe6b80f4700C2148Ba2aF81640a23E153C007C7F;

    function setGreeting(string calldata _greeting) public {
        bytes memory message;
            
        message = abi.encodeWithSignature("setGreeting(string)", 
            _greeting);

        ICrossDomainMessenger(crossDomainMessengerAddr).sendMessage(
            greeterL2Addr,
            message,
            1000000   // within the free gas limit amount
        );
    }      // function setGreeting 

}          // contract FromL1_ControlL2Greeter