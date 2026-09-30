// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ReportCards} from "../src/ReportCards.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Script, console2} from "forge-std/Script.sol";

/// @title Deploy Report Cards
/// @notice Deploys ReportCards with settings read from the environment. Nothing chain-specific is
///         hardcoded: the chain comes from --rpc-url, every knob comes from env (see .env.example).
///
///         Simulate:  forge script script/Deploy.s.sol:Deploy --rpc-url robinhood
///         Broadcast: forge script script/Deploy.s.sol:Deploy --rpc-url robinhood --broadcast --account <keystore>
///
/// Required env:
///   REPORT_CARDS_OWNER              Owner (use a multisig). Mints reserves, reveals, withdraws.
///   REPORT_CARDS_UNREVEALED_URI     Pre-reveal metadata URI (the "dog ate it" JSON).
/// Optional env (placeholder defaults — the owner has not decided economics yet):
///   REPORT_CARDS_NAME               default "Report Cards"
///   REPORT_CARDS_SYMBOL             default "GRADES"
///   REPORT_CARDS_ROYALTY_RECEIVER   default REPORT_CARDS_OWNER
///   REPORT_CARDS_ROYALTY_BPS        default 333 (3.33%), max 1000
///   REPORT_CARDS_MINT_PRICE_WEI     default 3333000000000000 (0.003333 ETH)
///   REPORT_CARDS_MAX_PER_WALLET     default 3
///   REPORT_CARDS_EXPECTED_CHAIN_ID  if set, refuse to deploy to any other chain id
contract Deploy is Script {
    /// @notice The script was pointed at a chain other than REPORT_CARDS_EXPECTED_CHAIN_ID.
    error WrongSchoolDistrict(uint256 expectedChainId, uint256 actualChainId);

    struct Syllabus {
        string name;
        string symbol;
        address owner;
        string unrevealedURI;
        address royaltyReceiver;
        uint96 royaltyBps;
        uint256 mintPriceWei;
        uint256 maxPerWallet;
    }

    function run() external returns (ReportCards cards) {
        uint256 expectedChainId = vm.envOr("REPORT_CARDS_EXPECTED_CHAIN_ID", uint256(0));
        if (expectedChainId != 0 && expectedChainId != block.chainid) {
            revert WrongSchoolDistrict(expectedChainId, block.chainid);
        }

        Syllabus memory s = readSyllabus();

        vm.startBroadcast();
        cards = new ReportCards(
            s.name, s.symbol, s.owner, s.unrevealedURI, s.royaltyReceiver, s.royaltyBps, s.mintPriceWei, s.maxPerWallet
        );
        vm.stopBroadcast();

        console2.log("Report Cards deployed at", address(cards));
        console2.log("  chain id        ", block.chainid);
        console2.log("  owner           ", s.owner);
        console2.log("  name / symbol   ", string.concat(s.name, " / ", s.symbol));
        console2.log("  max supply      ", cards.MAX_SUPPLY());
        console2.log("  mint price (wei)", s.mintPriceWei);
        console2.log("  max per wallet  ", s.maxPerWallet);
        console2.log("  royalty (bps)   ", uint256(s.royaltyBps));
        console2.log("  royalty receiver", s.royaltyReceiver);
        console2.log(
            "Next (from the owner): setContractURI, setProvenanceHash, reserve, setSaleOpen(true), reveal, lockMetadata."
        );
    }

    function readSyllabus() public view returns (Syllabus memory s) {
        s.name = vm.envOr("REPORT_CARDS_NAME", string("Report Cards"));
        s.symbol = vm.envOr("REPORT_CARDS_SYMBOL", string("GRADES"));
        s.owner = vm.envAddress("REPORT_CARDS_OWNER");
        s.unrevealedURI = vm.envString("REPORT_CARDS_UNREVEALED_URI");
        s.royaltyReceiver = vm.envOr("REPORT_CARDS_ROYALTY_RECEIVER", s.owner);

        // SafeCast so a fat-fingered value reverts instead of silently truncating; the contract
        // itself then enforces its own MAX_ROYALTY_BPS.
        s.royaltyBps = SafeCast.toUint96(vm.envOr("REPORT_CARDS_ROYALTY_BPS", uint256(333)));

        s.mintPriceWei = vm.envOr("REPORT_CARDS_MINT_PRICE_WEI", uint256(0.003333 ether));
        s.maxPerWallet = vm.envOr("REPORT_CARDS_MAX_PER_WALLET", uint256(3));
    }
}
