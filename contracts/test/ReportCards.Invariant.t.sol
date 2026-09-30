// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ReportCards} from "../src/ReportCards.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {CommonBase} from "forge-std/Base.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdUtils} from "forge-std/StdUtils.sol";
import {Test} from "forge-std/Test.sol";

/// @dev Hall monitor: throws random sequences of public mints, reserves, airdrops, price/limit
///      changes, sale toggles, transfers and withdrawals at the contract, predicting every outcome.
///      Anything it didn't predict (a mint past 3333, a limit bypass, an unexpected revert) fails.
contract HallMonitor is CommonBase, StdCheats, StdUtils {
    ReportCards public immutable cards;
    address public immutable principal;

    address[] internal actors;

    uint256 public ghostMinted;
    uint256 public ghostEthIn;
    uint256 public ghostEthOut;
    uint256 public ghostCapRejections;
    mapping(address => uint256) public ghostPublicMinted;

    constructor(ReportCards cards_, address principal_) {
        cards = cards_;
        principal = principal_;
        for (uint256 i; i < 12; ++i) {
            actors.push(address(uint160(uint256(keccak256(abi.encode("hall monitor actor", i))))));
        }
    }

    function actorCount() external view returns (uint256) {
        return actors.length;
    }

    function actorAt(uint256 i) external view returns (address) {
        return actors[i];
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function _seatsLeft() internal view returns (uint256) {
        return cards.MAX_SUPPLY() - ghostMinted;
    }

    // ── actions ──────────────────────────────────────────────────────────────────

    function publicMint(uint256 actorSeed, uint256 quantity) external {
        address student = _actor(actorSeed);
        quantity = bound(quantity, 1, 40);
        uint256 due = cards.mintPrice() * quantity;
        vm.deal(student, due);

        uint256 seatsLeft = _seatsLeft();
        uint256 already = ghostPublicMinted[student];
        uint256 limit = cards.maxPerWallet();
        bool saleIsOpen = cards.saleIsOpen();

        // Every external read happens above: vm.prank applies to the very next call.
        vm.prank(student);
        if (!saleIsOpen) {
            vm.expectRevert(ReportCards.DetentionIsNotOpenYet.selector);
        } else if (quantity > seatsLeft) {
            vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, seatsLeft, quantity));
            ++ghostCapRejections;
        } else if (already + quantity > limit) {
            vm.expectRevert(abi.encodeWithSelector(ReportCards.NoSecondHelpings.selector, limit, already, quantity));
        } else {
            ghostMinted += quantity;
            ghostPublicMinted[student] = already + quantity;
            ghostEthIn += due;
        }
        cards.mint{value: due}(quantity);
    }

    function reserve(uint256 actorSeed, uint256 quantity) external {
        quantity = bound(quantity, 1, 500);
        uint256 seatsLeft = _seatsLeft();
        vm.prank(principal);
        if (quantity > seatsLeft) {
            vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, seatsLeft, quantity));
            ++ghostCapRejections;
        } else {
            ghostMinted += quantity;
        }
        cards.reserve(_actor(actorSeed), quantity);
    }

    function airdrop(uint256 seed, uint256 count) external {
        count = bound(count, 1, 6);
        address[] memory students = new address[](count);
        uint256[] memory quantities = new uint256[](count);
        uint256 total;
        uint256 seatsLeft = _seatsLeft();
        bool expectFull;
        uint256 seatsAtFailure;
        uint256 failingQuantity;
        for (uint256 i; i < count; ++i) {
            students[i] = _actor(uint256(keccak256(abi.encode(seed, i))));
            quantities[i] = bound(uint256(keccak256(abi.encode(seed, i, "qty"))), 1, 120);
            if (!expectFull && total + quantities[i] > seatsLeft) {
                expectFull = true;
                seatsAtFailure = seatsLeft - total;
                failingQuantity = quantities[i];
            }
            total += quantities[i];
        }
        vm.prank(principal);
        if (expectFull) {
            vm.expectRevert(abi.encodeWithSelector(ReportCards.ClassIsFull.selector, seatsAtFailure, failingQuantity));
            ++ghostCapRejections;
        } else {
            ghostMinted += total;
        }
        cards.airdrop(students, quantities);
    }

    function toggleSale() external {
        bool open = !cards.saleIsOpen();
        vm.prank(principal);
        cards.setSaleOpen(open);
    }

    function setMaxPerWallet(uint256 limit) external {
        vm.prank(principal);
        cards.setMaxPerWallet(bound(limit, 0, 60));
    }

    function setMintPrice(uint256 price) external {
        vm.prank(principal);
        cards.setMintPrice(bound(price, 0, 0.05 ether));
    }

    function transferCard(uint256 tokenSeed, uint256 toSeed) external {
        if (ghostMinted == 0) return;
        uint256 tokenId = bound(tokenSeed, 1, ghostMinted);
        address from = cards.ownerOf(tokenId);
        vm.prank(from);
        cards.transferFrom(from, _actor(toSeed), tokenId);
    }

    function withdraw() external {
        uint256 balance = address(cards).balance;
        vm.prank(principal);
        if (balance == 0) {
            vm.expectRevert(ReportCards.PiggyBankIsEmpty.selector);
        } else {
            ghostEthOut += balance;
        }
        cards.withdraw();
    }
}

contract ReportCardsInvariantTest is Test {
    ReportCards internal cards;
    HallMonitor internal monitor;
    address internal principal = makeAddr("principal");

    function setUp() public {
        cards = new ReportCards(
            "Report Cards", "GRADES", principal, "ipfs://unrevealed", principal, 333, 0.003333 ether, 3
        );
        vm.prank(principal);
        cards.setSaleOpen(true);

        monitor = new HallMonitor(cards, principal);
        targetContract(address(monitor));
        bytes4[] memory actions = new bytes4[](8);
        actions[0] = HallMonitor.publicMint.selector;
        actions[1] = HallMonitor.reserve.selector;
        actions[2] = HallMonitor.airdrop.selector;
        actions[3] = HallMonitor.toggleSale.selector;
        actions[4] = HallMonitor.setMaxPerWallet.selector;
        actions[5] = HallMonitor.setMintPrice.selector;
        actions[6] = HallMonitor.transferCard.selector;
        actions[7] = HallMonitor.withdraw.selector;
        targetSelector(FuzzSelector({addr: address(monitor), selectors: actions}));
    }

    /// @dev A campaign that never reaches the cap proves nothing about it. The handler's mint sizes
    ///      are tuned so every run slams into 3,333 and gets turned away at least once.
    function afterInvariant() public view {
        assertGt(monitor.ghostCapRejections(), 0, "this run never filled the class; raise the handler's mint sizes");
    }

    /// @notice The one that matters.
    function invariant_NeverMoreThan3333() public view {
        assertLe(cards.totalSupply(), 3333);
        assertEq(cards.totalSupply() + cards.remainingSupply(), 3333);
    }

    function invariant_SupplyMatchesEverySuccessfulMint() public view {
        assertEq(cards.totalSupply(), monitor.ghostMinted());
    }

    function invariant_BalancesAddUpToSupply() public view {
        uint256 sum = cards.balanceOf(principal);
        for (uint256 i; i < monitor.actorCount(); ++i) {
            sum += cards.balanceOf(monitor.actorAt(i));
        }
        assertEq(sum, cards.totalSupply());
    }

    function invariant_IdsAreExactly1ToTotalSupply() public {
        uint256 supply = cards.totalSupply();
        if (supply > 0) {
            assertTrue(cards.ownerOf(1) != address(0));
            assertTrue(cards.ownerOf(supply) != address(0));
        }
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, supply + 1));
        cards.ownerOf(supply + 1);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        cards.ownerOf(0);
    }

    function invariant_PerWalletCountersOnlyTrackPublicMints() public view {
        for (uint256 i; i < monitor.actorCount(); ++i) {
            address actor = monitor.actorAt(i);
            assertEq(cards.publicMinted(actor), monitor.ghostPublicMinted(actor));
        }
    }

    function invariant_LunchMoneyIsFullyAccountedFor() public view {
        assertEq(address(cards).balance, monitor.ghostEthIn() - monitor.ghostEthOut());
    }
}
