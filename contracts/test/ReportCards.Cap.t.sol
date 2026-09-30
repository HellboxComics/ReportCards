// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ReportCards} from "../src/ReportCards.sol";
import {ReportCardsTest} from "./utils/ReportCardsTest.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

/// @dev Exposes raw `_mint` so we can prove the `_update` backstop holds even for a mint path that
///      skips `_enroll` entirely (the "tired intern adds a function in v2" scenario).
contract ReportCardsWithABackdoor is ReportCards {
    constructor(address owner_) ReportCards("Report Cards", "GRADES", owner_, "ipfs://unrevealed", owner_, 333, 0, 3) {}

    function rogueMint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}

/// @notice MAX_SUPPLY = 3333, enforced on every path. The class is full at 3,333. Not 3,334. Ever.
contract ReportCardsCapTest is ReportCardsTest {
    function _assertClassIsFullForEveryPath() internal {
        // Public mint.
        vm.deal(degen, 1 ether);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 0, 1));
        cards.mint{value: PRICE}(1);

        // Owner reserve.
        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 0, 1));
        cards.reserve(teachersPet, 1);

        // Owner airdrop.
        address[] memory students = new address[](1);
        uint256[] memory quantities = new uint256[](1);
        (students[0], quantities[0]) = (paperHands, 1);
        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 0, 1));
        cards.airdrop(students, quantities);

        assertEq(cards.totalSupply(), MAX_SUPPLY);
        assertEq(cards.remainingSupply(), 0);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 3334));
        cards.ownerOf(3334);
    }

    /// @dev Every id 1..3333 exists, 0 and 3334 don't, and balances add up to exactly 3333.
    function _assertRosterIsExactly1To3333(address[] memory holders) internal view {
        for (uint256 id = 1; id <= MAX_SUPPLY; ++id) {
            assertTrue(cards.ownerOf(id) != address(0));
        }
        uint256 sum;
        for (uint256 i; i < holders.length; ++i) {
            sum += cards.balanceOf(holders[i]);
        }
        assertEq(sum, MAX_SUPPLY, "every card is accounted for");
    }

    // ─────────────────────────────────────────────────────────────────────────────

    function test_Cap_PublicMintSellsOutAtExactly3333() public {
        _openSale();
        // 1,111 students x 3 cards = 3,333. The math was always the joke.
        for (uint256 i; i < 1111; ++i) {
            _mintAs(_student(i), 3);
        }
        assertEq(cards.totalSupply(), MAX_SUPPLY);
        assertEq(cards.ownerOf(3333), _student(1110));
        assertEq(address(cards).balance, MAX_SUPPLY * PRICE);
        _assertClassIsFullForEveryPath();
    }

    function test_Cap_MixedMintPathsFillExactly3333() public {
        address[] memory holders = new address[](1 + 100 + 834);
        uint256 h;

        // 1) Owner reserve: 333 for the teacher's pets (1/1 giveaways, team, partners).
        _reserve(teachersPet, 333);
        holders[h++] = teachersPet;

        // 2) Owner airdrop: 100 students x 5 = 500.
        address[] memory students = new address[](100);
        uint256[] memory quantities = new uint256[](100);
        for (uint256 i; i < 100; ++i) {
            students[i] = _student(10_000 + i);
            quantities[i] = 5;
            holders[h++] = students[i];
        }
        vm.prank(principal);
        cards.airdrop(students, quantities);
        assertEq(cards.totalSupply(), 833);

        // 3) Public mint: 833 wallets x 3 + 1 wallet x 1 = 2,500.
        _openSale();
        for (uint256 i; i < 833; ++i) {
            _mintAs(_student(i), 3);
            holders[h++] = _student(i);
        }
        assertEq(cards.remainingSupply(), 1);
        _mintAs(_student(833), 1);
        holders[h++] = _student(833);

        assertEq(h, holders.length);
        assertEq(cards.totalSupply(), MAX_SUPPLY);
        _assertClassIsFullForEveryPath();
        _assertRosterIsExactly1To3333(holders);

        // And the last card still gets a real report card after reveal.
        _reveal();
        assertEq(cards.tokenURI(3333), "ipfs://bafygrades/3333.json");
    }

    function test_Cap_SingleReserveOfTheWholeClass() public {
        _reserve(teachersPet, MAX_SUPPLY);
        assertEq(cards.balanceOf(teachersPet), MAX_SUPPLY);
        _openSale();
        _assertClassIsFullForEveryPath();
    }

    function test_Cap_RequestsThatDoNotFitAreRejectedWholeNotPartiallyFilled() public {
        _reserve(teachersPet, 3330);

        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 3, 4));
        cards.reserve(teachersPet, 4);

        _openSale();
        _setMaxPerWallet(10);
        vm.deal(degen, 4 * PRICE);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 3, 4));
        cards.mint{value: 4 * PRICE}(4);

        // Airdrop whose second entry crosses the line: the first entry is rolled back too.
        address[] memory students = new address[](2);
        uint256[] memory quantities = new uint256[](2);
        (students[0], students[1]) = (bagholder, paperHands);
        (quantities[0], quantities[1]) = (2, 2);
        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 1, 2));
        cards.airdrop(students, quantities);

        assertEq(cards.totalSupply(), 3330, "nothing leaked through");
        assertEq(cards.balanceOf(bagholder), 0);
        assertEq(degen.balance, 4 * PRICE, "reverted mint kept its lunch money");

        // Exactly-fits still works: 1 public + 2 reserve = 3,333.
        _mintAs(degen, 1);
        _reserve(teachersPet, 2);
        _assertClassIsFullForEveryPath();
    }

    function test_Cap_AbsurdQuantitiesRevertCleanlyInsteadOfOverflowing() public {
        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 3333, type(uint256).max));
        cards.reserve(teachersPet, type(uint256).max);

        _openSale();
        _setMaxPerWallet(type(uint256).max);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 3333, type(uint256).max));
        cards.mint(type(uint256).max);

        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, 3333, 3334));
        cards.mint(3334);

        assertEq(cards.totalSupply(), 0);
    }

    /// forge-config: default.fuzz.runs = 48
    function testFuzz_Cap_TwoReservesNeverExceed3333(uint256 first, uint256 second) public {
        first = bound(first, 1, MAX_SUPPLY);
        second = bound(second, 1, 2 * MAX_SUPPLY);
        _reserve(teachersPet, first);

        uint256 seatsLeft = MAX_SUPPLY - first;
        vm.prank(principal);
        if (second > seatsLeft) {
            vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, seatsLeft, second));
        }
        cards.reserve(degen, second);

        uint256 expected = second > seatsLeft ? first : first + second;
        assertEq(cards.totalSupply(), expected);
        assertEq(cards.balanceOf(teachersPet) + cards.balanceOf(degen), expected);
        assertLe(cards.totalSupply(), MAX_SUPPLY);
    }

    // ── the backstop in _update ────────────────────────────────────────────────

    function test_Backstop_UpdateRefusesIdsOutside1To3333() public {
        ReportCardsWithABackdoor backdoor = new ReportCardsWithABackdoor(principal);

        vm.expectRevert(abi.encodeWithSelector(ReportCards.NotOnTheClassRoster.selector, 0));
        backdoor.rogueMint(degen, 0);

        vm.expectRevert(abi.encodeWithSelector(ReportCards.NotOnTheClassRoster.selector, 3334));
        backdoor.rogueMint(degen, 3334);

        vm.expectRevert(abi.encodeWithSelector(ReportCards.NotOnTheClassRoster.selector, type(uint256).max));
        backdoor.rogueMint(degen, type(uint256).max);

        backdoor.rogueMint(degen, 3333); // in range: allowed (and a reused id would hit ERC721InvalidSender)
        assertEq(backdoor.ownerOf(3333), degen);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InvalidSender.selector, address(0)));
        backdoor.rogueMint(bagholder, 3333);
    }

    /// forge-config: default.fuzz.runs = 256
    function testFuzz_Backstop_NoIdAbove3333CanEverBeSeated(uint256 tokenId) public {
        ReportCardsWithABackdoor backdoor = new ReportCardsWithABackdoor(principal);
        if (tokenId == 0 || tokenId > MAX_SUPPLY) {
            vm.expectRevert(abi.encodeWithSelector(ReportCards.NotOnTheClassRoster.selector, tokenId));
            backdoor.rogueMint(degen, tokenId);
        } else {
            backdoor.rogueMint(degen, tokenId);
            assertEq(backdoor.ownerOf(tokenId), degen);
        }
    }
}
