// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title GoodPathReceipt — on-chain attestations for quests, league, and receipts (no custody).
/// @notice UUPS upgradeable; relayer records events. Users never deposit funds here.
contract GoodPathReceipt is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    /// @dev Reserved storage gap for future upgrades.
    uint256[48] private __gap;

    mapping(address => mapping(bytes32 => bool)) public questRecorded;
    mapping(address => address) public rivalOf;
    mapping(address => bytes32) public squadOf;
    mapping(bytes32 => uint256) public seasonScores;

    event QuestRecorded(address indexed user, bytes32 indexed questId, bytes32 txHash);
    event ReferralRecorded(address indexed referrer, address indexed referred);
    event RivalSet(address indexed user, address indexed rival);
    event SquadJoined(address indexed user, bytes32 indexed squadId);
    event SeasonScoreRecorded(bytes32 indexed seasonId, address indexed user, uint256 points);
    event ReceiptIssued(address indexed user, bytes32 indexed receiptHash);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function recordQuest(address user, bytes32 questId, bytes32 txHash) external onlyOwner {
        require(!questRecorded[user][questId], "quest exists");
        questRecorded[user][questId] = true;
        emit QuestRecorded(user, questId, txHash);
    }

    function recordReferral(address referrer, address referred) external onlyOwner {
        emit ReferralRecorded(referrer, referred);
    }

    function setRival(address user, address rival) external onlyOwner {
        rivalOf[user] = rival;
        emit RivalSet(user, rival);
    }

    function recordSquadJoin(address user, bytes32 squadId) external onlyOwner {
        squadOf[user] = squadId;
        emit SquadJoined(user, squadId);
    }

    function recordSeasonScore(bytes32 seasonId, address user, uint256 points) external onlyOwner {
        seasonScores[keccak256(abi.encodePacked(seasonId, user))] = points;
        emit SeasonScoreRecorded(seasonId, user, points);
    }

    function issueReceipt(address user, bytes32 receiptHash) external onlyOwner {
        emit ReceiptIssued(user, receiptHash);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
