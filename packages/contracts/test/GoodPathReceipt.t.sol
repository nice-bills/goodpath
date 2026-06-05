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
    bytes32 internal questId = keccak256("claim");
    bytes32 internal txHash = bytes32(uint256(1));

    function setUp() public {
        impl = new GoodPathReceipt();
        bytes memory initData = abi.encodeCall(GoodPathReceipt.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        receipt = GoodPathReceipt(address(proxy));
    }

    function test_recordQuest_emits() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit GoodPathReceipt.QuestRecorded(user, questId, txHash);
        receipt.recordQuest(user, questId, txHash);
        assertTrue(receipt.questRecorded(user, questId));
    }

    function test_recordQuest_revertsDuplicate() public {
        vm.startPrank(owner);
        receipt.recordQuest(user, questId, txHash);
        vm.expectRevert(bytes("quest exists"));
        receipt.recordQuest(user, questId, txHash);
        vm.stopPrank();
    }

    function test_referralAndRivalAndSquad() public {
        address rival = address(0xCAFE);
        bytes32 squadId = keccak256("demo-squad");
        vm.startPrank(owner);
        receipt.recordReferral(owner, user);
        receipt.setRival(user, rival);
        receipt.recordSquadJoin(user, squadId);
        vm.stopPrank();
        assertEq(receipt.rivalOf(user), rival);
        assertEq(receipt.squadOf(user), squadId);
    }

    function test_seasonScoreAndReceipt() public {
        bytes32 seasonId = keccak256("2026-W22");
        bytes32 receiptHash = keccak256("run-receipt");
        vm.startPrank(owner);
        receipt.recordSeasonScore(seasonId, user, 42);
        receipt.issueReceipt(user, receiptHash);
        vm.stopPrank();
        assertEq(receipt.seasonScores(keccak256(abi.encodePacked(seasonId, user))), 42);
    }

    function test_nonOwnerCannotRecord() public {
        vm.prank(user);
        vm.expectRevert();
        receipt.recordQuest(user, questId, txHash);
    }
}
