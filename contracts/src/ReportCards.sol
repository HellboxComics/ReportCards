// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Report Cards
/// @author The Front Office of Mr. Harrow's Homeroom
/// @notice 3,333 report cards for 3,333 wallets that should have known better. Every student is
///         graded on Buying the Top, Taking Profit, Risk Management, Holding Bags, Chasing Memes,
///         Selling Too Early and Attendance. Nobody is passing. RETURN SIGNED BY MONDAY.
/// @dev The jokes live in the names. The logic is deliberately boring:
///      - OpenZeppelin v5 ERC-721 + ERC-2981 + Ownable2Step + ReentrancyGuard. No assembly, no
///        cleverness, no burn.
///      - Token ids are exactly 1..3333, minted in order. Every mint path (public `mint`, owner
///        `reserve`, owner `airdrop`) funnels through `_enroll`, which refuses to exceed
///        MAX_SUPPLY. `_update` independently refuses any id outside 1..3333, so even a future
///        mint path added by a tired intern cannot seat a 3,334th student.
///      - Public mints must pay the exact price (`msg.value == mintPrice * quantity`), so there is
///        nothing to refund and no way to overpay if the price changes while a tx is in flight.
///      - tokenURI = unrevealedURI until `reveal`, then baseURI + id + uriSuffix (".json" by
///        default; set it to "" for extensionless hosting).
contract ReportCards is IERC4906, ERC721, ERC2981, Ownable2Step, ReentrancyGuard {
    using Strings for uint256;

    // ─────────────────────────────────────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Class size. Fire code. Not a suggestion. There will never be a 3,334th student.
    uint256 public constant MAX_SUPPLY = 3333;

    /// @notice Royalties above 10% are not a fee, they are a hostage situation.
    uint96 public constant MAX_ROYALTY_BPS = 1000;

    /// @dev ERC-4906 magic interface id (the standard defines it as a constant, not an XOR).
    bytes4 private constant ERC4906_INTERFACE_ID = bytes4(0x49064906);

    // ─────────────────────────────────────────────────────────────────────────────
    // Storage
    // ─────────────────────────────────────────────────────────────────────────────

    /// @dev Cards minted so far. Also the id of the most recent card, because ids start at 1.
    uint256 private _totalMinted;

    /// @notice Price of one report card in wei. Exact change only; the lunch lady does not do refunds.
    uint256 public mintPrice;

    /// @notice Max cards one wallet may mint through the public `mint`. Reserve/airdrop don't count.
    uint256 public maxPerWallet;

    /// @notice Whether public minting is open.
    bool public saleIsOpen;

    /// @notice Whether grades have been posted (tokenURI points at the real metadata).
    bool public revealed;

    /// @notice Once true, baseURI and uriSuffix can never change again. It's on your permanent record.
    bool public metadataLocked;

    /// @notice Hash committing to the full, final metadata/art set before anyone sees it.
    ///         Settable once, and only before reveal. See contracts/README.md for the recipe.
    bytes32 public provenanceHash;

    /// @notice Cards minted by each wallet through the public `mint` (the per-wallet limit counter).
    mapping(address student => uint256 cardsMinted) public publicMinted;

    /// @notice Appended after the token id in tokenURI. ".json" by default; "" for extensionless.
    string public uriSuffix = ".json";

    /// @notice What every card says before reveal. (The dog ate it.)
    string public unrevealedURI;

    /// @notice ERC-7572 collection-level metadata URI (name, description, image, banner).
    string public contractURI;

    string private _baseTokenURI;

    // ─────────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Public minting opened (true) or closed (false).
    event SchoolBellRang(bool saleIsOpen);

    /// @notice The public mint price changed.
    event LunchMoneyRepriced(uint256 oldPriceWei, uint256 newPriceWei);

    /// @notice The per-wallet public mint limit changed.
    event SecondHelpingsPolicyChanged(uint256 oldMaxPerWallet, uint256 newMaxPerWallet);

    /// @notice Grades are posted: tokenURI now resolves to `baseURI` + id + suffix.
    event ReportCardsSentHome(string baseURI);

    /// @notice The base URI changed after reveal (e.g. a gateway move). Same grades, new filing cabinet.
    event GradesRegraded(string baseURI);

    /// @notice The tokenURI suffix changed. The only extension anyone in this class ever got.
    event ExtensionGranted(string uriSuffix);

    /// @notice The pre-reveal URI changed.
    event ExcuseNoteRewritten(string unrevealedURI);

    /// @notice Metadata is frozen forever.
    event PermanentRecordSealed();

    /// @notice The provenance hash was committed.
    event AnswerKeySealed(bytes32 provenanceHash);

    /// @notice Default ERC-2981 royalty changed.
    event LunchMoneyTaxChanged(address indexed receiver, uint96 royaltyBps);

    /// @notice Mint proceeds were withdrawn to the owner.
    event LunchMoneyCollected(address indexed principal, uint256 amount);

    /// @notice ERC-7572: collection-level metadata changed.
    event ContractURIUpdated();

    // ─────────────────────────────────────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Public minting is closed. Go home.
    error DetentionIsNotOpenYet();

    /// @notice Asked for zero cards (or airdropped to nobody). You have to at least show up.
    error EmptyBackpack();

    /// @notice This would take the class past MAX_SUPPLY. Nothing was minted.
    error ClassIsFull(uint256 seatsLeft, uint256 requested);

    /// @notice Token id outside 1..3333. Belt-and-suspenders check; unreachable via the public API.
    error NotOnTheClassRoster(uint256 tokenId);

    /// @notice This wallet would exceed the public per-wallet limit.
    error NoSecondHelpings(uint256 maxPerWallet, uint256 alreadyMinted, uint256 requested);

    /// @notice msg.value must equal mintPrice * quantity exactly.
    error WrongLunchMoney(uint256 expected, uint256 sent);

    /// @notice Airdrop arrays have different lengths.
    error AttendanceSheetMismatch(uint256 students, uint256 quantities);

    /// @notice A base URI cannot be empty.
    error BlankReportCard();

    /// @notice Already revealed.
    error GradesAlreadyPosted();

    /// @notice Not revealed yet.
    error GradesNotPostedYet();

    /// @notice Metadata is locked forever. This is going on your permanent record.
    error PermanentRecord();

    /// @notice Provenance can only be committed before reveal. Pencils down.
    error PencilsDown();

    /// @notice Provenance was already committed and cannot be changed.
    error AnswersAlreadyTurnedIn(bytes32 provenanceHash);

    /// @notice A zero provenance hash commits to nothing.
    error BlankAnswerSheet();

    /// @notice Royalty above MAX_ROYALTY_BPS.
    error RoyaltyTooGreedy(uint96 requestedBps, uint96 maxBps);

    /// @notice Nothing to withdraw.
    error PiggyBankIsEmpty();

    /// @notice The owner could not receive ETH.
    error LunchMoneyStuck();

    /// @notice Ownership cannot be renounced (it would strand funds and unrevealed metadata).
    error PrincipalCannotResign();

    // ─────────────────────────────────────────────────────────────────────────────
    // Construction
    // ─────────────────────────────────────────────────────────────────────────────

    /// @param name_ Collection name ("Report Cards").
    /// @param symbol_ Collection symbol ("GRADES").
    /// @param initialOwner Owner (use a multisig). Can mint reserves, reveal, withdraw.
    /// @param unrevealedURI_ tokenURI for every card until reveal.
    /// @param royaltyReceiver Default ERC-2981 royalty receiver (non-zero).
    /// @param royaltyBps Default royalty in basis points (<= MAX_ROYALTY_BPS).
    /// @param mintPrice_ Public mint price in wei (placeholder until economics are decided).
    /// @param maxPerWallet_ Public mint limit per wallet (placeholder until economics are decided).
    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner,
        string memory unrevealedURI_,
        address royaltyReceiver,
        uint96 royaltyBps,
        uint256 mintPrice_,
        uint256 maxPerWallet_
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        unrevealedURI = unrevealedURI_;
        mintPrice = mintPrice_;
        maxPerWallet = maxPerWallet_;
        _setRoyalty(royaltyReceiver, royaltyBps);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Minting
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Enroll. Mints `quantity` report cards to the caller at `mintPrice` each.
    /// @dev Checks, in order: sale open, quantity > 0, supply left, per-wallet limit, exact payment.
    ///      Reverts leave no partial mint behind; a request that doesn't fit is rejected whole.
    function mint(uint256 quantity) external payable nonReentrant {
        if (!saleIsOpen) revert DetentionIsNotOpenYet();
        _requireSeats(quantity);

        uint256 alreadyMinted = publicMinted[msg.sender];
        // quantity <= MAX_SUPPLY here, so this addition cannot overflow.
        if (alreadyMinted + quantity > maxPerWallet) {
            revert NoSecondHelpings(maxPerWallet, alreadyMinted, quantity);
        }

        uint256 due = mintPrice * quantity;
        if (msg.value != due) revert WrongLunchMoney(due, msg.value);

        publicMinted[msg.sender] = alreadyMinted + quantity;
        _enroll(msg.sender, quantity);
    }

    /// @notice Teacher's pets. Owner mints `quantity` free cards to `to` (team, giveaways, partners).
    function reserve(address to, uint256 quantity) external onlyOwner nonReentrant {
        _enroll(to, quantity);
    }

    /// @notice Owner mints `quantities[i]` free cards to each `students[i]`.
    function airdrop(address[] calldata students, uint256[] calldata quantities) external onlyOwner nonReentrant {
        uint256 count = students.length;
        if (count != quantities.length) revert AttendanceSheetMismatch(count, quantities.length);
        if (count == 0) revert EmptyBackpack();
        for (uint256 i; i < count; ++i) {
            _enroll(students[i], quantities[i]);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Owner: sale settings (placeholders until the economics are decided)
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Open or close public minting.
    function setSaleOpen(bool open) external onlyOwner {
        saleIsOpen = open;
        emit SchoolBellRang(open);
    }

    /// @notice Set the public mint price in wei. In-flight mints at the old price revert (exact change).
    function setMintPrice(uint256 newPriceWei) external onlyOwner {
        emit LunchMoneyRepriced(mintPrice, newPriceWei);
        mintPrice = newPriceWei;
    }

    /// @notice Set the per-wallet public mint limit. Lowering it never claws back cards.
    function setMaxPerWallet(uint256 newMaxPerWallet) external onlyOwner {
        emit SecondHelpingsPolicyChanged(maxPerWallet, newMaxPerWallet);
        maxPerWallet = newMaxPerWallet;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Owner: metadata
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Post the grades. Sets the base URI (include the trailing slash, e.g. "ipfs://<cid>/")
    ///         and switches every card from the unrevealed URI to its real metadata. One time only.
    function reveal(string calldata baseURI_) external onlyOwner {
        if (revealed) revert GradesAlreadyPosted();
        if (bytes(baseURI_).length == 0) revert BlankReportCard();
        _baseTokenURI = baseURI_;
        revealed = true;
        emit ReportCardsSentHome(baseURI_);
        emit BatchMetadataUpdate(1, MAX_SUPPLY);
    }

    /// @notice Move revealed metadata to a new base URI (gateway change, typo). Only until locked.
    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _requireUnlocked();
        if (!revealed) revert GradesNotPostedYet();
        if (bytes(baseURI_).length == 0) revert BlankReportCard();
        _baseTokenURI = baseURI_;
        emit GradesRegraded(baseURI_);
        emit BatchMetadataUpdate(1, MAX_SUPPLY);
    }

    /// @notice Set what comes after the token id in tokenURI (".json", or "" for extensionless).
    function setURISuffix(string calldata suffix) external onlyOwner {
        _requireUnlocked();
        uriSuffix = suffix;
        emit ExtensionGranted(suffix);
        emit BatchMetadataUpdate(1, MAX_SUPPLY);
    }

    /// @notice Change the pre-reveal URI. Pointless after reveal, so not allowed after reveal.
    function setUnrevealedURI(string calldata uri) external onlyOwner {
        if (revealed) revert GradesAlreadyPosted();
        unrevealedURI = uri;
        emit ExcuseNoteRewritten(uri);
        emit BatchMetadataUpdate(1, MAX_SUPPLY);
    }

    /// @notice Freeze baseURI and uriSuffix forever. Irreversible. Only after reveal.
    function lockMetadata() external onlyOwner {
        _requireUnlocked();
        if (!revealed) revert GradesNotPostedYet();
        metadataLocked = true;
        emit PermanentRecordSealed();
    }

    /// @notice Commit the provenance hash. Once, and only before reveal.
    function setProvenanceHash(bytes32 hash) external onlyOwner {
        if (revealed) revert PencilsDown();
        if (provenanceHash != bytes32(0)) revert AnswersAlreadyTurnedIn(provenanceHash);
        if (hash == bytes32(0)) revert BlankAnswerSheet();
        provenanceHash = hash;
        emit AnswerKeySealed(hash);
    }

    /// @notice Set the ERC-7572 collection metadata URI. Not covered by `lockMetadata`
    ///         (collection banners and links are allowed to change; grades are not).
    function setContractURI(string calldata uri) external onlyOwner {
        contractURI = uri;
        emit ContractURIUpdated();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Owner: money
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Set the default ERC-2981 royalty (receiver must be non-zero, bps <= MAX_ROYALTY_BPS).
    function setDefaultRoyalty(address receiver, uint96 royaltyBps) external onlyOwner {
        _setRoyalty(receiver, royaltyBps);
    }

    /// @notice Send the entire mint balance to the current owner.
    function withdraw() external onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        if (amount == 0) revert PiggyBankIsEmpty();
        address principal = owner();
        (bool sent,) = principal.call{value: amount}("");
        if (!sent) revert LunchMoneyStuck();
        emit LunchMoneyCollected(principal, amount);
    }

    /// @notice Disabled. A principal who resigns mid-semester strands the lunch money and the grades.
    ///         Hand the keys over with transferOwnership + acceptOwnership instead.
    function renounceOwnership() public pure override {
        revert PrincipalCannotResign();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Views
    // ─────────────────────────────────────────────────────────────────────────────

    /// @notice Cards minted so far. There is no burn, so this is also the circulating supply.
    function totalSupply() external view returns (uint256) {
        return _totalMinted;
    }

    /// @notice Seats left in the class.
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _totalMinted;
    }

    /// @notice The revealed base URI ("" until reveal).
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /// @inheritdoc ERC721
    /// @dev Reverts for ids that are not minted (including 0 and anything above 3333).
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (!revealed) return unrevealedURI;
        return string.concat(_baseTokenURI, tokenId.toString(), uriSuffix);
    }

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId) public view override(IERC165, ERC721, ERC2981) returns (bool) {
        return interfaceId == ERC4906_INTERFACE_ID || super.supportsInterface(interfaceId);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Internals
    // ─────────────────────────────────────────────────────────────────────────────

    /// @dev The single chokepoint every mint path goes through. Ids are sequential from 1.
    ///      Supply is bumped before `_safeMint` calls out to receiver contracts (and all callers are
    ///      nonReentrant), so a receiver callback can never observe or reuse a stale counter.
    function _enroll(address to, uint256 quantity) private {
        _requireSeats(quantity);
        uint256 firstId = _totalMinted + 1;
        _totalMinted += quantity;
        for (uint256 i; i < quantity; ++i) {
            _safeMint(to, firstId + i);
        }
    }

    /// @dev Reverts unless `quantity` is non-zero and fits in the remaining supply.
    function _requireSeats(uint256 quantity) private view {
        if (quantity == 0) revert EmptyBackpack();
        uint256 seatsLeft = MAX_SUPPLY - _totalMinted;
        if (quantity > seatsLeft) revert ClassIsFull(seatsLeft, quantity);
    }

    function _requireUnlocked() private view {
        if (metadataLocked) revert PermanentRecord();
    }

    function _setRoyalty(address receiver, uint96 royaltyBps) private {
        if (royaltyBps > MAX_ROYALTY_BPS) revert RoyaltyTooGreedy(royaltyBps, MAX_ROYALTY_BPS);
        _setDefaultRoyalty(receiver, royaltyBps); // reverts on a zero receiver
        emit LunchMoneyTaxChanged(receiver, royaltyBps);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @dev Second lock on the classroom door: whatever mints, it can only ever seat ids 1..3333.
    ///      With no burn and unique ids, the contract can never hold more than MAX_SUPPLY tokens.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if (tokenId == 0 || tokenId > MAX_SUPPLY) revert NotOnTheClassRoster(tokenId);
        return super._update(to, tokenId, auth);
    }
}
