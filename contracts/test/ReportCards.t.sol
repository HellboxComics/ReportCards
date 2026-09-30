// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ReportCards} from "../src/ReportCards.sol";
import {ReportCardsTest} from "./utils/ReportCardsTest.sol";
import {CardCollector, LineCutter, NoBackpack, PrincipalWithNoPockets} from "./utils/Students.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Unit tests, one syllabus section at a time.
contract ReportCardsUnitTest is ReportCardsTest {
    // ═════════════════════════════════════════════════════════════════════════════
    // Deployment
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Deploy_SetsTheSyllabus() public view {
        assertEq(cards.name(), "Report Cards");
        assertEq(cards.symbol(), "GRADES");
        assertEq(cards.owner(), principal);
        assertEq(cards.pendingOwner(), address(0));
        assertEq(cards.MAX_SUPPLY(), 3333);
        assertEq(cards.MAX_ROYALTY_BPS(), 1000);
        assertEq(cards.mintPrice(), PRICE);
        assertEq(cards.maxPerWallet(), MAX_PER_WALLET);
        assertFalse(cards.saleIsOpen());
        assertFalse(cards.revealed());
        assertFalse(cards.metadataLocked());
        assertEq(cards.totalSupply(), 0);
        assertEq(cards.remainingSupply(), 3333);
        assertEq(cards.uriSuffix(), ".json");
        assertEq(cards.unrevealedURI(), UNREVEALED_URI);
        assertEq(cards.baseURI(), "");
        assertEq(cards.contractURI(), "");
        assertEq(cards.provenanceHash(), bytes32(0));
        (address receiver, uint256 amount) = cards.royaltyInfo(1, 10_000);
        assertEq(receiver, royaltyDesk);
        assertEq(amount, ROYALTY_BPS);
    }

    function test_Deploy_NameAndSymbolAreConfigurable() public {
        ReportCards summerSchool =
            new ReportCards("Summer School", "REDO", principal, UNREVEALED_URI, royaltyDesk, 0, 0, 1);
        assertEq(summerSchool.name(), "Summer School");
        assertEq(summerSchool.symbol(), "REDO");
    }

    function test_Deploy_RevertsOnGreedyRoyalty() public {
        vm.expectRevert(abi.encodeWithSelector(ReportCards.RoyaltyTooGreedy.selector, uint96(1001), uint96(1000)));
        new ReportCards("Report Cards", "GRADES", principal, UNREVEALED_URI, royaltyDesk, 1001, PRICE, 3);
    }

    function test_Deploy_RevertsOnZeroOwner() public {
        vm.expectRevert(abi.encodeWithSignature("OwnableInvalidOwner(address)", address(0)));
        new ReportCards("Report Cards", "GRADES", address(0), UNREVEALED_URI, royaltyDesk, ROYALTY_BPS, PRICE, 3);
    }

    function test_Deploy_RevertsOnZeroRoyaltyReceiver() public {
        vm.expectRevert(abi.encodeWithSelector(ERC2981.ERC2981InvalidDefaultRoyaltyReceiver.selector, address(0)));
        new ReportCards("Report Cards", "GRADES", principal, UNREVEALED_URI, address(0), ROYALTY_BPS, PRICE, 3);
    }

    function test_SupportsInterface() public view {
        assertTrue(cards.supportsInterface(0x01ffc9a7), "ERC-165");
        assertTrue(cards.supportsInterface(0x80ac58cd), "ERC-721");
        assertTrue(cards.supportsInterface(0x5b5e139f), "ERC-721 Metadata");
        assertTrue(cards.supportsInterface(0x2a55205a), "ERC-2981");
        assertTrue(cards.supportsInterface(0x49064906), "ERC-4906");
        assertFalse(cards.supportsInterface(0x780e9d63), "not ERC-721 Enumerable");
        assertFalse(cards.supportsInterface(0xffffffff), "never 0xffffffff");
    }

    function test_PlainEthTransfersAreRefused() public {
        vm.deal(degen, 1 ether);
        vm.prank(degen);
        (bool accepted,) = address(cards).call{value: 1 ether}("");
        assertFalse(accepted, "donations are not accepted, only lunch money");
        assertEq(address(cards).balance, 0);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Sale state
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Mint_RevertsWhileSaleClosed() public {
        vm.deal(degen, PRICE);
        vm.prank(degen);
        vm.expectRevert(ReportCards.DetentionIsNotOpenYet.selector);
        cards.mint{value: PRICE}(1);
    }

    function test_SetSaleOpen_TogglesAndEmits() public {
        vm.expectEmit(address(cards));
        emit ReportCards.SchoolBellRang(true);
        vm.prank(principal);
        cards.setSaleOpen(true);
        assertTrue(cards.saleIsOpen());

        _mintAs(degen, 1);
        assertEq(cards.ownerOf(1), degen);

        vm.expectEmit(address(cards));
        emit ReportCards.SchoolBellRang(false);
        vm.prank(principal);
        cards.setSaleOpen(false);

        vm.deal(bagholder, PRICE);
        vm.prank(bagholder);
        vm.expectRevert(ReportCards.DetentionIsNotOpenYet.selector);
        cards.mint{value: PRICE}(1);
    }

    function test_SetSaleOpen_OnlyOwner() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.setSaleOpen(true);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Public mint: ids, quantity, payment
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Mint_IdsStartAtOneAndAreSequential() public {
        _openSale();
        _mintAs(degen, 2);
        _mintAs(bagholder, 3);
        assertEq(cards.ownerOf(1), degen);
        assertEq(cards.ownerOf(2), degen);
        assertEq(cards.ownerOf(3), bagholder);
        assertEq(cards.ownerOf(5), bagholder);
        assertEq(cards.totalSupply(), 5);
        assertEq(cards.remainingSupply(), 3328);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        cards.ownerOf(0);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 6));
        cards.ownerOf(6);
    }

    function test_Mint_ExactPaymentIsKept() public {
        _openSale();
        vm.deal(degen, 3 * PRICE);
        vm.prank(degen);
        cards.mint{value: 3 * PRICE}(3);
        assertEq(address(cards).balance, 3 * PRICE);
        assertEq(degen.balance, 0);
        assertEq(cards.balanceOf(degen), 3);
    }

    function test_Mint_RevertsOnUnderpayment() public {
        _openSale();
        vm.deal(degen, 1 ether);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.WrongLunchMoney.selector, 2 * PRICE, 2 * PRICE - 1));
        cards.mint{value: 2 * PRICE - 1}(2);
    }

    function test_Mint_RevertsOnOverpayment() public {
        _openSale();
        vm.deal(degen, 1 ether);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.WrongLunchMoney.selector, PRICE, PRICE + 1));
        cards.mint{value: PRICE + 1}(1);
        assertEq(degen.balance, 1 ether, "a reverted overpayment costs nothing but gas");
    }

    function testFuzz_Mint_OnlyExactChangeIsAccepted(uint256 quantity, uint256 sent) public {
        quantity = bound(quantity, 1, MAX_PER_WALLET);
        sent = bound(sent, 0, 1 ether);
        uint256 due = PRICE * quantity;
        _openSale();
        vm.deal(degen, sent);
        vm.prank(degen);
        if (sent != due) {
            vm.expectRevert(abi.encodeWithSelector(ReportCards.WrongLunchMoney.selector, due, sent));
        }
        cards.mint{value: sent}(quantity);
        assertEq(cards.totalSupply(), sent == due ? quantity : 0);
        assertEq(address(cards).balance, sent == due ? due : 0);
    }

    function test_Mint_ZeroQuantityReverts() public {
        _openSale();
        vm.prank(degen);
        vm.expectRevert(ReportCards.EmptyBackpack.selector);
        cards.mint(0);
    }

    function test_Mint_FreeWhenPriceIsZero() public {
        vm.startPrank(principal);
        cards.setMintPrice(0);
        cards.setSaleOpen(true);
        vm.stopPrank();

        vm.prank(degen);
        cards.mint(2);
        assertEq(cards.balanceOf(degen), 2);

        vm.deal(bagholder, 1);
        vm.prank(bagholder);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.WrongLunchMoney.selector, 0, 1));
        cards.mint{value: 1}(1);
    }

    function test_SetMintPrice_AppliesImmediatelyAndOldPriceBounces() public {
        _openSale();
        uint256 newPrice = 0.069 ether;

        vm.expectEmit(address(cards));
        emit ReportCards.LunchMoneyRepriced(PRICE, newPrice);
        vm.prank(principal);
        cards.setMintPrice(newPrice);
        assertEq(cards.mintPrice(), newPrice);

        // A tx built against the old price reverts instead of silently over/under-paying.
        vm.deal(degen, 1 ether);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.WrongLunchMoney.selector, newPrice, PRICE));
        cards.mint{value: PRICE}(1);

        vm.prank(degen);
        cards.mint{value: newPrice}(1);
        assertEq(address(cards).balance, newPrice);
    }

    function test_SetMintPrice_OnlyOwner() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.setMintPrice(0);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Public mint: per-wallet limit
    // ═════════════════════════════════════════════════════════════════════════════

    function test_MaxPerWallet_AcrossSeveralTransactions() public {
        _openSale();
        _mintAs(degen, 1);
        _mintAs(degen, 2);
        assertEq(cards.publicMinted(degen), 3);

        vm.deal(degen, PRICE);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.NoSecondHelpings.selector, 3, 3, 1));
        cards.mint{value: PRICE}(1);
    }

    function test_MaxPerWallet_SingleOversizedRequestReverts() public {
        _openSale();
        vm.deal(degen, 4 * PRICE);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.NoSecondHelpings.selector, 3, 0, 4));
        cards.mint{value: 4 * PRICE}(4);
    }

    function test_MaxPerWallet_IsPerWallet() public {
        _openSale();
        _mintAs(degen, 3);
        _mintAs(bagholder, 3);
        _mintAs(paperHands, 3);
        assertEq(cards.totalSupply(), 9);
    }

    function test_MaxPerWallet_TransferringCardsAwayDoesNotResetIt() public {
        _openSale();
        _mintAs(degen, 3);
        vm.startPrank(degen);
        cards.transferFrom(degen, bagholder, 1);
        cards.transferFrom(degen, bagholder, 2);
        cards.transferFrom(degen, bagholder, 3);
        vm.stopPrank();
        assertEq(cards.balanceOf(degen), 0);

        vm.deal(degen, PRICE);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.NoSecondHelpings.selector, 3, 3, 1));
        cards.mint{value: PRICE}(1);
    }

    function test_MaxPerWallet_ReserveAndAirdropDoNotCount() public {
        _reserve(degen, 10);
        address[] memory students = new address[](1);
        uint256[] memory quantities = new uint256[](1);
        students[0] = degen;
        quantities[0] = 5;
        vm.prank(principal);
        cards.airdrop(students, quantities);

        assertEq(cards.publicMinted(degen), 0);
        _openSale();
        _mintAs(degen, 3);
        assertEq(cards.balanceOf(degen), 18);
    }

    function test_SetMaxPerWallet_RaiseAndLower() public {
        _openSale();
        _mintAs(degen, 3);

        vm.expectEmit(address(cards));
        emit ReportCards.SecondHelpingsPolicyChanged(3, 5);
        _setMaxPerWallet(5);
        _mintAs(degen, 2);
        assertEq(cards.balanceOf(degen), 5);

        // Lowering below what someone already minted blocks further public mints, takes nothing back.
        _setMaxPerWallet(1);
        vm.deal(degen, PRICE);
        vm.prank(degen);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.NoSecondHelpings.selector, 1, 5, 1));
        cards.mint{value: PRICE}(1);
        assertEq(cards.balanceOf(degen), 5);

        // Zero closes the public lunch line entirely.
        _setMaxPerWallet(0);
        vm.deal(bagholder, PRICE);
        vm.prank(bagholder);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.NoSecondHelpings.selector, 0, 0, 1));
        cards.mint{value: PRICE}(1);
    }

    function test_SetMaxPerWallet_OnlyOwner() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.setMaxPerWallet(3333);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Receivers and reentrancy
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Mint_ToSmartWalletWithReceiverHook() public {
        _openSale();
        CardCollector wallet = new CardCollector();
        _mintAs(address(wallet), 2);
        assertEq(cards.balanceOf(address(wallet)), 2);
    }

    function test_Mint_ToContractWithoutReceiverHookReverts() public {
        _openSale();
        NoBackpack noBackpack = new NoBackpack();
        vm.deal(address(noBackpack), PRICE);
        vm.prank(address(noBackpack));
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InvalidReceiver.selector, address(noBackpack)));
        cards.mint{value: PRICE}(1);
    }

    function test_Mint_ReentryFromReceiverHookIsBlocked() public {
        _openSale();
        LineCutter cutter = new LineCutter(cards);
        vm.deal(address(cutter), 10 * PRICE);
        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        cutter.enroll{value: PRICE}(1);
        assertEq(cards.totalSupply(), 0);
    }

    function test_Reserve_ToZeroAddressReverts() public {
        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InvalidReceiver.selector, address(0)));
        cards.reserve(address(0), 1);
        assertEq(cards.totalSupply(), 0);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Owner mint paths: reserve and airdrop
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Reserve_MintsSequentialIdsEvenWhileSaleIsClosed() public {
        _reserve(teachersPet, 33);
        assertEq(cards.balanceOf(teachersPet), 33);
        assertEq(cards.ownerOf(1), teachersPet);
        assertEq(cards.ownerOf(33), teachersPet);
        assertEq(cards.totalSupply(), 33);

        _openSale();
        _mintAs(degen, 1);
        assertEq(cards.ownerOf(34), degen);
    }

    function test_Reserve_ZeroQuantityReverts() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.EmptyBackpack.selector);
        cards.reserve(teachersPet, 0);
    }

    function test_Reserve_OnlyOwner() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.reserve(degen, 1);
    }

    function test_Airdrop_MintsEachStudentTheirShare() public {
        address[] memory students = new address[](3);
        uint256[] memory quantities = new uint256[](3);
        (students[0], students[1], students[2]) = (degen, bagholder, paperHands);
        (quantities[0], quantities[1], quantities[2]) = (1, 5, 2);

        vm.prank(principal);
        cards.airdrop(students, quantities);

        assertEq(cards.totalSupply(), 8);
        assertEq(cards.ownerOf(1), degen);
        assertEq(cards.ownerOf(2), bagholder);
        assertEq(cards.ownerOf(6), bagholder);
        assertEq(cards.ownerOf(7), paperHands);
        assertEq(cards.ownerOf(8), paperHands);
    }

    function test_Airdrop_LengthMismatchReverts() public {
        address[] memory students = new address[](2);
        uint256[] memory quantities = new uint256[](1);
        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.AttendanceSheetMismatch.selector, 2, 1));
        cards.airdrop(students, quantities);
    }

    function test_Airdrop_EmptyListReverts() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.EmptyBackpack.selector);
        cards.airdrop(new address[](0), new uint256[](0));
    }

    function test_Airdrop_ZeroQuantityEntryRevertsTheWholeBatch() public {
        address[] memory students = new address[](2);
        uint256[] memory quantities = new uint256[](2);
        (students[0], students[1]) = (degen, bagholder);
        (quantities[0], quantities[1]) = (3, 0);
        vm.prank(principal);
        vm.expectRevert(ReportCards.EmptyBackpack.selector);
        cards.airdrop(students, quantities);
        assertEq(cards.totalSupply(), 0);
    }

    function test_Airdrop_OnlyOwner() public {
        address[] memory students = new address[](1);
        uint256[] memory quantities = new uint256[](1);
        (students[0], quantities[0]) = (degen, 1);
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.airdrop(students, quantities);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Reveal and tokenURI
    // ═════════════════════════════════════════════════════════════════════════════

    function test_TokenURI_RevertsForCardsThatDoNotExist() public {
        _reserve(degen, 1);
        uint256[3] memory ghosts = [uint256(0), 2, 3334];
        for (uint256 i; i < ghosts.length; ++i) {
            vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, ghosts[i]));
            cards.tokenURI(ghosts[i]);
        }
    }

    function test_TokenURI_BeforeRevealEveryoneGetsTheExcuseNote() public {
        _reserve(degen, 3);
        assertEq(cards.tokenURI(1), UNREVEALED_URI);
        assertEq(cards.tokenURI(3), UNREVEALED_URI);
    }

    function test_Reveal_SwitchesToBaseURIPlusIdPlusSuffix() public {
        _reserve(degen, 12);

        vm.expectEmit(address(cards));
        emit ReportCards.ReportCardsSentHome(BASE_URI);
        vm.expectEmit(address(cards));
        emit IERC4906.BatchMetadataUpdate(1, 3333);
        vm.prank(principal);
        cards.reveal(BASE_URI);

        assertTrue(cards.revealed());
        assertEq(cards.baseURI(), BASE_URI);
        assertEq(cards.tokenURI(1), "ipfs://bafygrades/1.json");
        assertEq(cards.tokenURI(12), "ipfs://bafygrades/12.json");
    }

    function test_Reveal_CardsMintedAfterRevealAreRevealedToo() public {
        _reveal();
        _openSale();
        _mintAs(degen, 1);
        assertEq(cards.tokenURI(1), "ipfs://bafygrades/1.json");
    }

    function test_Reveal_OnlyOnce() public {
        _reveal();
        vm.prank(principal);
        vm.expectRevert(ReportCards.GradesAlreadyPosted.selector);
        cards.reveal("ipfs://bafyregrade/");
    }

    function test_Reveal_RejectsBlankBaseURI() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.BlankReportCard.selector);
        cards.reveal("");
        assertFalse(cards.revealed());
    }

    function test_Reveal_OnlyOwner() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.reveal(BASE_URI);
    }

    function test_URISuffix_ExtensionlessHosting() public {
        _reserve(degen, 42);
        _reveal();

        vm.expectEmit(address(cards));
        emit ReportCards.ExtensionGranted("");
        vm.prank(principal);
        cards.setURISuffix("");
        assertEq(cards.tokenURI(42), "ipfs://bafygrades/42");
    }

    function test_URISuffix_CanBeSetBeforeReveal() public {
        _reserve(degen, 7);
        vm.prank(principal);
        cards.setURISuffix("");
        assertEq(cards.tokenURI(7), UNREVEALED_URI);
        _reveal();
        assertEq(cards.tokenURI(7), "ipfs://bafygrades/7");
    }

    function test_SetBaseURI_OnlyAfterReveal() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.GradesNotPostedYet.selector);
        cards.setBaseURI("ipfs://bafysneaky/");
    }

    function test_SetBaseURI_MovesTheFilingCabinet() public {
        _reserve(degen, 1);
        _reveal();

        vm.expectEmit(address(cards));
        emit ReportCards.GradesRegraded("https://example.org/grades/");
        vm.expectEmit(address(cards));
        emit IERC4906.BatchMetadataUpdate(1, 3333);
        vm.prank(principal);
        cards.setBaseURI("https://example.org/grades/");
        assertEq(cards.tokenURI(1), "https://example.org/grades/1.json");

        vm.prank(principal);
        vm.expectRevert(ReportCards.BlankReportCard.selector);
        cards.setBaseURI("");
    }

    function test_SetUnrevealedURI_OnlyBeforeReveal() public {
        _reserve(degen, 1);
        vm.expectEmit(address(cards));
        emit ReportCards.ExcuseNoteRewritten("ipfs://bafyexcuse2/my-grandma-ate-it.json");
        vm.prank(principal);
        cards.setUnrevealedURI("ipfs://bafyexcuse2/my-grandma-ate-it.json");
        assertEq(cards.tokenURI(1), "ipfs://bafyexcuse2/my-grandma-ate-it.json");

        _reveal();
        vm.prank(principal);
        vm.expectRevert(ReportCards.GradesAlreadyPosted.selector);
        cards.setUnrevealedURI("ipfs://bafytoolate/");
    }

    function test_LockMetadata_OnlyAfterReveal() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.GradesNotPostedYet.selector);
        cards.lockMetadata();
    }

    function test_LockMetadata_IsForever() public {
        _reserve(degen, 1);
        _reveal();

        vm.expectEmit(address(cards));
        emit ReportCards.PermanentRecordSealed();
        vm.prank(principal);
        cards.lockMetadata();
        assertTrue(cards.metadataLocked());

        vm.startPrank(principal);
        vm.expectRevert(ReportCards.PermanentRecord.selector);
        cards.setBaseURI("ipfs://bafyrevisionism/");
        vm.expectRevert(ReportCards.PermanentRecord.selector);
        cards.setURISuffix("");
        vm.expectRevert(ReportCards.PermanentRecord.selector);
        cards.lockMetadata();
        vm.expectRevert(ReportCards.GradesAlreadyPosted.selector);
        cards.reveal("ipfs://bafyrevisionism/");
        vm.stopPrank();

        assertEq(cards.tokenURI(1), "ipfs://bafygrades/1.json");
    }

    function test_MetadataSetters_OnlyOwner() public {
        vm.startPrank(degen);
        _expectNotOwner(degen);
        cards.setBaseURI(BASE_URI);
        _expectNotOwner(degen);
        cards.setURISuffix("");
        _expectNotOwner(degen);
        cards.setUnrevealedURI("");
        _expectNotOwner(degen);
        cards.lockMetadata();
        _expectNotOwner(degen);
        cards.setContractURI("");
        vm.stopPrank();
    }

    function test_ContractURI_SetAndAnnounced() public {
        vm.expectEmit(address(cards));
        emit ReportCards.ContractURIUpdated();
        vm.prank(principal);
        cards.setContractURI("ipfs://bafyschool/collection.json");
        assertEq(cards.contractURI(), "ipfs://bafyschool/collection.json");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Provenance
    // ═════════════════════════════════════════════════════════════════════════════

    bytes32 internal constant ANSWER_KEY = keccak256("3,333 report cards, none of them good");

    function test_Provenance_SetOnceBeforeReveal() public {
        vm.expectEmit(address(cards));
        emit ReportCards.AnswerKeySealed(ANSWER_KEY);
        vm.prank(principal);
        cards.setProvenanceHash(ANSWER_KEY);
        assertEq(cards.provenanceHash(), ANSWER_KEY);

        _reveal();
        assertEq(cards.provenanceHash(), ANSWER_KEY, "survives reveal");
    }

    function test_Provenance_CannotBeChanged() public {
        vm.startPrank(principal);
        cards.setProvenanceHash(ANSWER_KEY);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.AnswersAlreadyTurnedIn.selector, ANSWER_KEY));
        cards.setProvenanceHash(keccak256("actually everyone got an A"));
        vm.stopPrank();
        assertEq(cards.provenanceHash(), ANSWER_KEY);
    }

    function test_Provenance_CannotBeSetAfterReveal() public {
        _reveal();
        vm.prank(principal);
        vm.expectRevert(ReportCards.PencilsDown.selector);
        cards.setProvenanceHash(ANSWER_KEY);
    }

    function test_Provenance_RejectsZero() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.BlankAnswerSheet.selector);
        cards.setProvenanceHash(bytes32(0));
    }

    function test_Provenance_OnlyOwner() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.setProvenanceHash(ANSWER_KEY);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Royalties (ERC-2981)
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Royalty_PlaceholderIs333Bps() public view {
        (address receiver, uint256 amount) = cards.royaltyInfo(1, 1 ether);
        assertEq(receiver, royaltyDesk);
        assertEq(amount, 0.0333 ether);
    }

    function test_Royalty_OwnerCanUpdate() public {
        vm.expectEmit(address(cards));
        emit ReportCards.LunchMoneyTaxChanged(teachersPet, 500);
        vm.prank(principal);
        cards.setDefaultRoyalty(teachersPet, 500);

        (address receiver, uint256 amount) = cards.royaltyInfo(3333, 2 ether);
        assertEq(receiver, teachersPet);
        assertEq(amount, 0.1 ether);
    }

    function test_Royalty_CappedAtTenPercent() public {
        vm.startPrank(principal);
        cards.setDefaultRoyalty(royaltyDesk, 1000);
        vm.expectRevert(abi.encodeWithSelector(ReportCards.RoyaltyTooGreedy.selector, uint96(1001), uint96(1000)));
        cards.setDefaultRoyalty(royaltyDesk, 1001);
        vm.stopPrank();
    }

    function test_Royalty_ZeroPercentIsAllowed() public {
        vm.prank(principal);
        cards.setDefaultRoyalty(royaltyDesk, 0);
        (, uint256 amount) = cards.royaltyInfo(1, 1 ether);
        assertEq(amount, 0);
    }

    function test_Royalty_ZeroReceiverReverts() public {
        vm.prank(principal);
        vm.expectRevert(abi.encodeWithSelector(ERC2981.ERC2981InvalidDefaultRoyaltyReceiver.selector, address(0)));
        cards.setDefaultRoyalty(address(0), 333);
    }

    function test_Royalty_OnlyOwner() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.setDefaultRoyalty(degen, 1000);
    }

    function testFuzz_Royalty_Math(uint256 salePrice, uint96 bps) public {
        salePrice = bound(salePrice, 0, 1_000_000 ether);
        bps = uint96(bound(bps, 0, 1000));
        vm.prank(principal);
        cards.setDefaultRoyalty(royaltyDesk, bps);
        (, uint256 amount) = cards.royaltyInfo(1, salePrice);
        assertEq(amount, salePrice * bps / 10_000);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Withdraw
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Withdraw_SendsTheWholePiggyBankToTheOwner() public {
        _openSale();
        _mintAs(degen, 3);
        _mintAs(bagholder, 2);
        uint256 collected = 5 * PRICE;
        assertEq(address(cards).balance, collected);

        vm.expectEmit(address(cards));
        emit ReportCards.LunchMoneyCollected(principal, collected);
        vm.prank(principal);
        cards.withdraw();

        assertEq(address(cards).balance, 0);
        assertEq(principal.balance, collected);
    }

    function test_Withdraw_EmptyPiggyBankReverts() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.PiggyBankIsEmpty.selector);
        cards.withdraw();
    }

    function test_Withdraw_OnlyOwner() public {
        _openSale();
        _mintAs(degen, 1);
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.withdraw();
    }

    function test_Withdraw_OwnerThatRefusesEthReverts() public {
        _openSale();
        _mintAs(degen, 1);

        PrincipalWithNoPockets pocketless = new PrincipalWithNoPockets(cards);
        vm.prank(principal);
        cards.transferOwnership(address(pocketless));
        pocketless.acceptOwnership();

        vm.expectRevert(ReportCards.LunchMoneyStuck.selector);
        pocketless.withdraw();
        assertEq(address(cards).balance, PRICE, "funds stay put");
    }

    function test_Withdraw_FollowsTheNewOwner() public {
        _openSale();
        _mintAs(degen, 2);
        address newPrincipal = makeAddr("newPrincipal");

        vm.prank(principal);
        cards.transferOwnership(newPrincipal);
        vm.prank(newPrincipal);
        cards.acceptOwnership();

        _expectNotOwner(principal);
        vm.prank(principal);
        cards.withdraw();

        vm.prank(newPrincipal);
        cards.withdraw();
        assertEq(newPrincipal.balance, 2 * PRICE);
        assertEq(principal.balance, 0);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // Ownership (Ownable2Step)
    // ═════════════════════════════════════════════════════════════════════════════

    function test_Ownership_IsTwoStep() public {
        address newPrincipal = makeAddr("newPrincipal");

        vm.prank(principal);
        cards.transferOwnership(newPrincipal);
        assertEq(cards.owner(), principal, "old owner keeps the keys until the new one accepts");
        assertEq(cards.pendingOwner(), newPrincipal);

        // Old owner still in charge before acceptance.
        vm.prank(principal);
        cards.setSaleOpen(true);

        vm.prank(newPrincipal);
        cards.acceptOwnership();
        assertEq(cards.owner(), newPrincipal);
        assertEq(cards.pendingOwner(), address(0));

        _expectNotOwner(principal);
        vm.prank(principal);
        cards.setSaleOpen(false);

        vm.prank(newPrincipal);
        cards.setSaleOpen(false);
        assertFalse(cards.saleIsOpen());
    }

    function test_Ownership_OnlyThePendingOwnerCanAccept() public {
        address newPrincipal = makeAddr("newPrincipal");
        vm.prank(principal);
        cards.transferOwnership(newPrincipal);

        _expectNotOwner(degen);
        vm.prank(degen);
        cards.acceptOwnership();
        assertEq(cards.owner(), principal);
    }

    function test_Ownership_TransferIsOwnerOnly() public {
        _expectNotOwner(degen);
        vm.prank(degen);
        cards.transferOwnership(degen);
    }

    function test_Ownership_CannotBeRenounced() public {
        vm.prank(principal);
        vm.expectRevert(ReportCards.PrincipalCannotResign.selector);
        cards.renounceOwnership();
        assertEq(cards.owner(), principal);

        vm.prank(degen);
        vm.expectRevert(ReportCards.PrincipalCannotResign.selector);
        cards.renounceOwnership();
    }
}
