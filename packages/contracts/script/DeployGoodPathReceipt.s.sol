// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GoodPathReceipt} from "../src/GoodPathReceipt.sol";

/// @notice Deploy UUPS proxy on Celo mainnet when env is ready.
/// forge script script/DeployGoodPathReceipt.s.sol --rpc-url $CELO_RPC_URL --broadcast
contract DeployGoodPathReceipt is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address owner = vm.envOr("GOODPATH_CONTRACT_OWNER", vm.addr(deployerKey));

        vm.startBroadcast(deployerKey);
        GoodPathReceipt impl = new GoodPathReceipt();
        bytes memory initData = abi.encodeCall(GoodPathReceipt.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        vm.stopBroadcast();

        console2.log("GoodPathReceipt impl", address(impl));
        console2.log("GoodPathReceipt proxy", address(proxy));
        console2.log("Owner", owner);
    }
}
