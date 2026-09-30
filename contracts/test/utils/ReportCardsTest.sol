// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ReportCards} from "../../src/ReportCards.sol";
import {Test} from "forge-std/Test.sol";

/// @dev Shared homeroom for every test file.
abstract contract ReportCardsTest is Test {
    uint256 internal constant MAX_SUPPLY = 3333;
    uint256 internal constant PRICE = 0.003333 ether;
    uint256 internal constant MAX_PER_WALLET = 3;
    uint96 internal constant ROYALTY_BPS = 333;
    string internal constant UNREVEALED_URI = "ipfs://bafyexcusenote/the-dog-ate-it.json";
    string internal constant BASE_URI = "ipfs://bafygrades/";

    ReportCards internal cards;

    address internal principal = makeAddr("principal");
    address internal royaltyDesk = makeAddr("royaltyDesk");
    address internal degen = makeAddr("degen");
    address internal bagholder = makeAddr("bagholder");
    address internal paperHands = makeAddr("paperHands");
    address internal teachersPet = makeAddr("teachersPet");

    function setUp() public virtual {
        cards = new ReportCards(
            "Report Cards", "GRADES", principal, UNREVEALED_URI, royaltyDesk, ROYALTY_BPS, PRICE, MAX_PER_WALLET
        );
    }

    // ── helpers ──────────────────────────────────────────────────────────────────

    function _openSale() internal {
        vm.prank(principal);
        cards.setSaleOpen(true);
    }

    function _setMaxPerWallet(uint256 limit) internal {
        vm.prank(principal);
        cards.setMaxPerWallet(limit);
    }

    /// @dev Public mint at the current price, funding the student first.
    function _mintAs(address student, uint256 quantity) internal {
        uint256 due = cards.mintPrice() * quantity;
        vm.deal(student, student.balance + due);
        vm.prank(student);
        cards.mint{value: due}(quantity);
    }

    function _reserve(address to, uint256 quantity) internal {
        vm.prank(principal);
        cards.reserve(to, quantity);
    }

    function _reveal() internal {
        vm.prank(principal);
        cards.reveal(BASE_URI);
    }

    /// @dev Deterministic EOA #i (no code, far from precompiles and cheatcode addresses).
    function _student(uint256 i) internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encode("student", i)))));
    }

    function _expectNotOwner(address caller) internal {
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", caller));
    }
}
