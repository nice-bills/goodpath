// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GoodPathReceipt} from "../src/GoodPathReceipt.sol";

contract GoodPathReceiptTest is Test {
    GoodPathReceipt internal impl;
    GoodPathReceipt internal receipt;

    address internal owner = address(0xA11CE);
    address internal user = address(0xBEEF);
    bytes32 internal questClaim = keccak256("claim");
    bytes32 internal txHash = bytes32(uint256(0x1234));

    function setUp() public {
        impl = new GoodPathReceipt();
        bytes memory init = abi.encodeCall(GoodPathReceipt.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), init);
        receipt = GoodPathReceipt(address(proxy));
    }

    function test_recordQuest_emitsEvent() public {
        vm.prank(owner);
        vm.expectEmit(true, true, true, false);
        emit GoodPathReceipt.QuestRecorded(user, questClaim, txHash, block.timestamp);
        receipt.recordQuest(user, questClaim, txHash);
        assertTrue(receipt.questRecorded(user, questClaim));
    }

    function test_recordQuest_revertsDuplicate() public {
        vm.startPrank(owner);
        receipt.recordQuest(user, questClaim, txHash);
        vm.expectRevert(bytes("quest exists"));
        receipt.recordQuest(user, questClaim, txHash);
        vm.stopPrank();
    }

    function test_recordQuest_revertsNotOwner() public {
        vm.prank(user);
        vm.expectRevert();
        receipt.recordQuest(user, questClaim, txHash);
    }

    function test_recordReferral() public {
        address referred = address(0xCAFE);
        vm.prank(owner);
        receipt.recordReferral(user, referred);
        assertTrue(receipt.referralRecorded(user, referred));
    }

    function test_joinSquad() public {
        vm.prank(owner);
        receipt.joinSquad(user, 42);
        assertTrue(receipt.squadJoined(user, 42));
    }

    function test_recordSeasonScore() public {
        vm.prank(owner);
        receipt.recordSeasonScore(user, 202_622, 88);
        assertEq(receipt.seasonScore(user, 202_622), 88);
    }
}
