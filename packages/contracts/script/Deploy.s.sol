// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GoodPathReceipt} from "../src/GoodPathReceipt.sol";

/// @dev Deploy: `cd packages/contracts && forge script script/Deploy.s.sol --rpc-url celo --broadcast --verify`
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address owner = vm.envAddress("GOODPATH_RECEIPT_OWNER");

        vm.startBroadcast(deployerKey);

        GoodPathReceipt impl = new GoodPathReceipt();
        bytes memory init = abi.encodeCall(GoodPathReceipt.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), init);
        GoodPathReceipt receipt = GoodPathReceipt(address(proxy));

        vm.stopBroadcast();

        console2.log("GoodPathReceipt implementation", address(impl));
        console2.log("GoodPathReceipt proxy", address(receipt));
        console2.log("Owner", owner);
    }
}
