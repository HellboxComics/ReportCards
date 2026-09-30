// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {Deploy} from "../script/Deploy.s.sol";
import {ReportCards} from "../src/ReportCards.sol";
import {Test} from "forge-std/Test.sol";

/// @notice Rehearses the deploy script against the in-memory chain so it can't silently rot.
/// @dev Env vars are process-global, so every scenario lives in this single test (no races). forge
///      also loads contracts/.env, so default-value checks only run for vars that aren't already set.
contract DeployScriptTest is Test {
    function _assertMatchesSyllabus(ReportCards cards, Deploy.Syllabus memory s) internal view {
        assertEq(cards.name(), s.name);
        assertEq(cards.symbol(), s.symbol);
        assertEq(cards.owner(), s.owner);
        assertEq(cards.unrevealedURI(), s.unrevealedURI);
        assertEq(cards.mintPrice(), s.mintPriceWei);
        assertEq(cards.maxPerWallet(), s.maxPerWallet);
        assertEq(cards.MAX_SUPPLY(), 3333);
        assertFalse(cards.saleIsOpen());
        assertFalse(cards.revealed());
        (address receiver, uint256 royalty) = cards.royaltyInfo(1, 10_000);
        assertEq(receiver, s.royaltyReceiver);
        assertEq(royalty, s.royaltyBps);
    }

    function test_DeployScript_PlaceholdersThenOverridesThenWrongChain() public {
        address owner = makeAddr("multisig");
        Deploy deploy = new Deploy();

        // 1) Only the required settings: placeholders fill in the rest.
        vm.setEnv("REPORT_CARDS_OWNER", vm.toString(owner));
        vm.setEnv("REPORT_CARDS_UNREVEALED_URI", "ipfs://bafyexcusenote/the-dog-ate-it.json");
        vm.setEnv("REPORT_CARDS_EXPECTED_CHAIN_ID", "0");
        Deploy.Syllabus memory s = deploy.readSyllabus();
        _assertMatchesSyllabus(deploy.run(), s);

        if (!vm.envExists("REPORT_CARDS_NAME")) assertEq(s.name, "Report Cards");
        if (!vm.envExists("REPORT_CARDS_SYMBOL")) assertEq(s.symbol, "GRADES");
        if (!vm.envExists("REPORT_CARDS_ROYALTY_RECEIVER")) assertEq(s.royaltyReceiver, owner);
        if (!vm.envExists("REPORT_CARDS_ROYALTY_BPS")) assertEq(s.royaltyBps, 333);
        if (!vm.envExists("REPORT_CARDS_MINT_PRICE_WEI")) assertEq(s.mintPriceWei, 0.003333 ether);
        if (!vm.envExists("REPORT_CARDS_MAX_PER_WALLET")) assertEq(s.maxPerWallet, 3);

        // 2) Every knob overridden.
        address desk = makeAddr("royaltyDesk");
        vm.setEnv("REPORT_CARDS_NAME", "Summer School");
        vm.setEnv("REPORT_CARDS_SYMBOL", "REDO");
        vm.setEnv("REPORT_CARDS_ROYALTY_RECEIVER", vm.toString(desk));
        vm.setEnv("REPORT_CARDS_ROYALTY_BPS", "500");
        vm.setEnv("REPORT_CARDS_MINT_PRICE_WEI", "0");
        vm.setEnv("REPORT_CARDS_MAX_PER_WALLET", "10");
        vm.setEnv("REPORT_CARDS_EXPECTED_CHAIN_ID", vm.toString(block.chainid));
        s = deploy.readSyllabus();
        assertEq(s.name, "Summer School");
        assertEq(s.symbol, "REDO");
        assertEq(s.royaltyReceiver, desk);
        assertEq(s.royaltyBps, 500);
        assertEq(s.mintPriceWei, 0);
        assertEq(s.maxPerWallet, 10);
        _assertMatchesSyllabus(deploy.run(), s);

        // 3) A royalty that doesn't fit in uint96 is refused instead of silently truncated.
        vm.setEnv("REPORT_CARDS_ROYALTY_BPS", vm.toString(uint256(type(uint96).max) + 333));
        vm.expectRevert(
            abi.encodeWithSignature(
                "SafeCastOverflowedUintDowncast(uint8,uint256)", 96, uint256(type(uint96).max) + 333
            )
        );
        deploy.readSyllabus();
        vm.setEnv("REPORT_CARDS_ROYALTY_BPS", "333");

        // 4) Pointed at the wrong chain: refuses before broadcasting anything.
        vm.setEnv("REPORT_CARDS_EXPECTED_CHAIN_ID", vm.toString(block.chainid + 1));
        vm.expectRevert(abi.encodeWithSelector(Deploy.WrongSchoolDistrict.selector, block.chainid + 1, block.chainid));
        deploy.run();
    }
}
