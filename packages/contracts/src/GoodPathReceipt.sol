// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title GoodPathReceipt
/// @notice Upgradeable Celo mainnet proof ledger for GoodPath 2.0. Does not custody G$.
/// @dev Only the owner (API relayer) may write. Users move G$ via GoodDollar / Superfluid / savings SDKs.
contract GoodPathReceipt is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint256[48] private __gap;

    event QuestRecorded(
        address indexed user,
        bytes32 indexed questId,
        bytes32 indexed txHash,
        uint256 timestamp
    );

    event ReferralRecorded(
        address indexed referrer,
        address indexed referred,
        uint256 timestamp
    );

    event SquadJoined(address indexed user, uint256 indexed squadId, uint256 timestamp);

    event SeasonScoreRecorded(
        address indexed user,
        uint256 indexed periodId,
        uint256 score,
        uint256 timestamp
    );

    mapping(address => mapping(bytes32 => bool)) public questRecorded;
    mapping(address => mapping(address => bool)) public referralRecorded;
    mapping(address => mapping(uint256 => bool)) public squadJoined;
    mapping(address => mapping(uint256 => uint256)) public seasonScore;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner_) external initializer {
        __Ownable_init(owner_);
        __UUPSUpgradeable_init();
    }

    function recordQuest(address user, bytes32 questId, bytes32 txHash) external onlyOwner {
        require(user != address(0), "zero user");
        require(!questRecorded[user][questId], "quest exists");
        questRecorded[user][questId] = true;
        emit QuestRecorded(user, questId, txHash, block.timestamp);
    }

    function recordReferral(address referrer, address referred) external onlyOwner {
        require(referrer != address(0) && referred != address(0), "zero address");
        require(!referralRecorded[referrer][referred], "referral exists");
        referralRecorded[referrer][referred] = true;
        emit ReferralRecorded(referrer, referred, block.timestamp);
    }

    function joinSquad(address user, uint256 squadId) external onlyOwner {
        require(user != address(0), "zero user");
        require(!squadJoined[user][squadId], "squad joined");
        squadJoined[user][squadId] = true;
        emit SquadJoined(user, squadId, block.timestamp);
    }

    function recordSeasonScore(address user, uint256 periodId, uint256 score) external onlyOwner {
        require(user != address(0), "zero user");
        seasonScore[user][periodId] = score;
        emit SeasonScoreRecorded(user, periodId, score, block.timestamp);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
