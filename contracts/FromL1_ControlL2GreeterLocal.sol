//SPDX-License-Identifier: Unlicense
// This contracts runs on L1, and controls a Greeter on L2.
// The addresses are specific to Optimistic Goerli.
pragma solidity ^0.8.0;

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";
    
contract FromL1_ControlL2GreeterLocal {
    // Taken from https://community.optimism.io/docs/useful-tools/networks/#optimism-goerli

    address crossDomainMessengerAddr = 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318;

    address greeterL2Addr = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;

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