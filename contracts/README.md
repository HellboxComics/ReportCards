# Report Cards — the contract

> **3,333 report cards. One teacher. Zero chance of honor roll.**
> *RETURN SIGNED BY MONDAY.*

The ERC-721 behind the Report Cards collection on Robinhood Chain. Every student gets graded on
Buying the Top, Taking Profit, Risk Management, Holding Bags, Chasing Memes, Selling Too Early and
Attendance. The jokes live in the error and event names. The logic is boring on purpose.

This folder is a self-contained Foundry project with its own `package.json` and lockfile. It does
not touch the web app, and the web app's `npm run typecheck` / `npm test` / `npm run build` do not
see it (there are no `.ts` files in here).

```bash
cd contracts
npm ci
npm test          # 90 tests: unit, fuzz, full 3,333 sell-outs, invariants
```

## At a glance

| | |
| --- | --- |
| Contract | [`src/ReportCards.sol`](src/ReportCards.sol) |
| Standards | ERC-721 + Metadata (OpenZeppelin 5.6.1), ERC-2981 royalties, ERC-4906 metadata-update events, ERC-7572 `contractURI` |
| Name / symbol | `Report Cards` / `GRADES` (constructor args, so Summer School / `REDO` is one deploy away) |
| Max supply | **3,333**, a `constant`. There is no function that changes it. |
| Token ids | exactly **1..3333**, minted in order |
| Mint paths | `mint(quantity)` public + paid · `reserve(to, quantity)` owner · `airdrop(students[], quantities[])` owner |
| Price / per-wallet / sale | owner-set **placeholders**: 0.003333 ETH, 3 per wallet, sale closed at deploy |
| Payment | exact change only: `msg.value == mintPrice * quantity`, or it reverts. Nothing to refund. |
| Royalties | ERC-2981, placeholder 333 bps (3.33%) to a configurable receiver, hard-capped at 10% |
| Metadata | `unrevealedURI` until `reveal(baseURI)`, then `baseURI + id + uriSuffix` (`.json` by default, `""` for extensionless) |
| Provenance | `bytes32`, settable **once** and **only before reveal** |
| Ownership | `Ownable2Step` (transfer + accept). `renounceOwnership` is disabled. |
| Compiler | solc 0.8.34, optimizer 1000 runs, `evm_version = cancun`, pinned pragma |
| Size | 11.0 kB runtime (13.5 kB under the 24 kB limit) |

### Why plain OpenZeppelin ERC-721 and not ERC721A

ERC721A makes big batch mints cheaper by writing ownership lazily. For 3,333 tokens on an L2 the
saving is pennies per mint, and it costs you a larger, less-audited surface and non-obvious gas
costs on first transfer. OpenZeppelin v5 is the boring, audited default, which is exactly what the
money-handling part of a joke collection should be. Measured with this repo's tests:

| Call | Gas (whole tx) |
| --- | --- |
| `mint(1)` | ~113k |
| `mint(3)` | ~169k |
| `reserve(to, 100)` | ~2.6M |

Keep a single `reserve`/`airdrop` to roughly **1,000 cards or fewer** so it fits comfortably under a
32M block gas limit; the full-class tests mint all 3,333 in one call only because the test EVM has
no block limit.

## How "never more than 3,333" is enforced

Three independent locks on the classroom door:

1. **One chokepoint.** `mint`, `reserve` and `airdrop` all go through the private `_enroll`, which
   rejects a request that doesn't fit (`ClassIsFull(seatsLeft, requested)`) *before* anything is
   minted. A request is filled whole or not at all: 3 seats left and you ask for 4, you get 0.
2. **Ids can only be 1..3333.** The `_update` hook (which every OpenZeppelin mint, transfer and burn
   passes through) reverts `NotOnTheClassRoster(id)` for id 0 or anything above 3333, no matter
   which function asked. A test deploys a subclass with a raw `_mint` backdoor to prove it.
3. **No burn, unique ids.** ERC-721 can't mint an id twice, there is no burn, and only 3,333 ids are
   legal. The token physically cannot have a 3,334th owner.

The tests sell the class out every way we could think of and then try every mint path again:
1,111 public wallets × 3; reserve 333 + airdrop 500 + public 2,500; a single `reserve(3333)`;
requests that straddle the last seat; `type(uint256).max` quantities; and an invariant campaign
that throws thousands of random mints/reserves/airdrops/price changes/transfers/withdrawals at the
contract and checks it never gets past 3,333 (every run is required to hit the cap, otherwise the
campaign proves nothing and the test fails).

## Launch runbook (owner)

The owner should be a multisig. In order:

1. **Deploy** with [`script/Deploy.s.sol`](script/Deploy.s.sol) (see [Deploying](#deploying)). The
   sale starts closed and every card points at the unrevealed "the dog ate it" JSON.
2. `setContractURI("ipfs://<cid>/collection.json")` — collection name, description, banner.
3. `setProvenanceHash(0x…)` — commit to the final art + metadata **before** the sale (recipe below).
   It can be set once, and never after reveal.
4. `reserve(to, n)` / `airdrop([...], [...])` for team, partners and giveaways. These are free,
   ignore the sale switch and the per-wallet limit, and still count toward 3,333.
5. `setMintPrice(wei)` and `setMaxPerWallet(n)` once the economics are decided, then
   `setSaleOpen(true)`. (Price changes apply instantly; anyone who signed at the old price just
   reverts instead of over- or under-paying.)
6. Sold out: minting reverts with `ClassIsFull(0, n)` on its own. `setSaleOpen(false)` for tidiness.
7. `reveal("ipfs://<cid>/")` — **include the trailing slash.** Token 42 becomes
   `ipfs://<cid>/42.json`. If the metadata is hosted without extensions (or on the app's live
   per-token endpoint), also call `setURISuffix("")` → `…/42`. Emits ERC-4906
   `BatchMetadataUpdate(1, 3333)` so marketplaces refresh.
8. Check a handful of tokens on a marketplace, then `lockMetadata()`. After that `baseURI` and
   `uriSuffix` can never change (`PermanentRecord()`). `contractURI` stays editable on purpose.
9. `withdraw()` sends the whole balance to the current owner.

### tokenURI

| State | `tokenURI(id)` |
| --- | --- |
| id not minted (incl. 0 and > 3333) | reverts `ERC721NonexistentToken(id)` |
| before `reveal` | `unrevealedURI` (same for every card) |
| after `reveal` | `baseURI + id + uriSuffix`, e.g. `ipfs://<cid>/3333.json` |

`setBaseURI` exists for moving already-revealed metadata (gateway change, typo) and only works after
reveal and before `lockMetadata`. `setUnrevealedURI` only works before reveal.

### Provenance recipe

Provenance proves the art and metadata were fixed before anyone could see which id got which card
(important here because ids are minted in order and the 33 one-of-ones sit at ids fixed by the collection seed). Recommended,
BAYC-style:

1. For each token id 1..3333 in order, take the SHA-256 of its final image file (hex, lowercase).
2. Concatenate those 3,333 hex strings with no separator.
3. SHA-256 that string. The 32-byte result is the `provenanceHash` (`0x` + 64 hex chars).

Publish the per-token hashes and the recipe alongside the collection so anyone can recompute it
after reveal.

**Keep the collection seed and the per-token metadata private until the reveal.** Metadata is
generated deterministically from token id + seed, and ids are minted in order, so anyone who can
see the seed (or a live metadata endpoint serving unminted ids before reveal) can tell which upcoming
ids are one-of-ones and time their mints. The provenance hash is what lets you keep it secret and
still prove you didn't swap anything afterwards.

## Error and event glossary

Funny names, precise meanings. Front-ends should decode these (the ABI is in
[`abi/ReportCards.json`](abi/ReportCards.json); regenerate with `npm run abi`).

| Error | Means |
| --- | --- |
| `DetentionIsNotOpenYet()` | public sale is closed |
| `EmptyBackpack()` | quantity 0, or an empty airdrop list |
| `ClassIsFull(seatsLeft, requested)` | request doesn't fit under 3,333; nothing minted |
| `NoSecondHelpings(maxPerWallet, alreadyMinted, requested)` | per-wallet public limit |
| `WrongLunchMoney(expected, sent)` | `msg.value` isn't exactly `mintPrice * quantity` |
| `AttendanceSheetMismatch(students, quantities)` | airdrop arrays differ in length |
| `NotOnTheClassRoster(tokenId)` | id outside 1..3333 (defense in depth; unreachable via the public API) |
| `BlankReportCard()` | empty base URI |
| `GradesAlreadyPosted()` / `GradesNotPostedYet()` | already revealed / not revealed yet |
| `PermanentRecord()` | metadata is locked |
| `PencilsDown()` | provenance after reveal |
| `AnswersAlreadyTurnedIn(hash)` | provenance already set |
| `BlankAnswerSheet()` | zero provenance hash |
| `RoyaltyTooGreedy(requestedBps, maxBps)` | royalty above 10% |
| `PiggyBankIsEmpty()` | nothing to withdraw |
| `LunchMoneyStuck()` | the owner address refused ETH |
| `PrincipalCannotResign()` | `renounceOwnership` is disabled |

OpenZeppelin's own errors (`OwnableUnauthorizedAccount`, `ERC721InvalidReceiver`,
`ReentrancyGuardReentrantCall`, `ERC2981InvalidDefaultRoyaltyReceiver`, …) are unchanged.

| Event | Emitted by |
| --- | --- |
| `SchoolBellRang(saleIsOpen)` | `setSaleOpen` |
| `LunchMoneyRepriced(oldPriceWei, newPriceWei)` | `setMintPrice` |
| `SecondHelpingsPolicyChanged(old, new)` | `setMaxPerWallet` |
| `ReportCardsSentHome(baseURI)` + `BatchMetadataUpdate(1, 3333)` | `reveal` |
| `GradesRegraded(baseURI)` + `BatchMetadataUpdate` | `setBaseURI` |
| `ExtensionGranted(uriSuffix)` + `BatchMetadataUpdate` | `setURISuffix` (the only extension anyone in this class ever got) |
| `ExcuseNoteRewritten(unrevealedURI)` + `BatchMetadataUpdate` | `setUnrevealedURI` |
| `PermanentRecordSealed()` | `lockMetadata` |
| `AnswerKeySealed(provenanceHash)` | `setProvenanceHash` |
| `LunchMoneyTaxChanged(receiver, royaltyBps)` | constructor, `setDefaultRoyalty` |
| `LunchMoneyCollected(principal, amount)` | `withdraw` |
| `ContractURIUpdated()` | `setContractURI` (ERC-7572 name, must not be renamed) |

## What the owner can and cannot do

**Can:** open/close the sale; change price and per-wallet limit at any time; mint free cards to
anyone via `reserve`/`airdrop` (still capped at 3,333 total); reveal; move the base URI and suffix
until `lockMetadata`; change `contractURI`; set royalties up to 10%; withdraw everything to itself;
hand ownership to a new address that must accept it.

**Cannot:** raise the supply; mint an id outside 1..3333; mint without the supply check; change
provenance once set or after reveal; change `baseURI`/`uriSuffix` after `lockMetadata`; set royalties
above 10%; renounce ownership (it would strand the lunch money and the unrevealed grades); touch
anyone's tokens.

Public mints go through `_safeMint`, so smart-contract wallets must implement `onERC721Received`.
The per-wallet limit counts `msg.sender`, so people should mint from their own wallets, not through a
shared relayer or launchpad contract (that contract would get one allowance for everyone).
Every state-changing mint and `withdraw` is `nonReentrant`, and the supply counter is bumped before
any receiver callback runs (a test tries to cut back into the lunch line from inside the callback
and gets `ReentrancyGuardReentrantCall`). The contract has no `receive`/`fallback`: stray ETH sent
directly is refused.

## Tooling

Foundry, installed entirely from npm so `npm ci && npm test` works anywhere Node 20+ runs, including
CI runners and sandboxes that can't reach GitHub or `binaries.soliditylang.org`:

| Piece | Source (pinned in `package-lock.json`) |
| --- | --- |
| `forge` 1.7.1 | `@foundry-rs/forge` (official npm distribution of the Foundry binary) |
| solc 0.8.34 | `solc` (the official compiler built to WebAssembly) via [`tools/solc.mjs`](tools/solc.mjs) |
| OpenZeppelin 5.6.1 | `@openzeppelin/contracts` |
| forge-std 1.9.7 | `@layerzerolabs/toolbox-foundry` (an npm package that vendors forge-std unmodified; used only by tests and the deploy script) |

[`tools/forge.mjs`](tools/forge.mjs) launches the pinned `forge` (npm deletes `node_modules/.bin/forge`
when it prunes Foundry's other-platform packages) and points it at `tools/solc.mjs`, a ~40-line
shim that exposes solcjs through the `solc --version` / `solc --standard-json` interface Foundry
expects. Same compiler version and settings means the same bytecode as a native solc; only the
download source differs. Prefer native solc? `FOUNDRY_SOLC=0.8.34 npm test`, or just run your own
`forge test` in this folder (it reads the same `foundry.toml`).

| Script | Does |
| --- | --- |
| `npm test` | all tests (fixed fuzz seed `0x3333`, so failures reproduce) |
| `npm run build` | compile |
| `npm run check` | `fmt:check` + `lint` + `test --force` from a clean compile (what CI should run) |
| `npm run test:gas` | tests with a gas report |
| `npm run sizes` | contract sizes |
| `npm run abi` | rebuild and regenerate `abi/ReportCards.json` from the build artifact |
| `npm run fmt` / `fmt:check` / `lint` | forge fmt / forge lint |
| `npm run deploy:simulate` | dry-run the deploy against `ROBINHOOD_CHAIN_RPC_URL` (no broadcast) |
| `npm run forge -- <args>` | any other forge command with the pinned toolchain |

### Tests

| Suite | Proves |
| --- | --- |
| [`test/ReportCards.t.sol`](test/ReportCards.t.sol) | deployment args and validation, ERC-165 ids, sale toggle, exact-price payments (incl. fuzzed), per-wallet limit (across txs, transfers, per wallet, reserves excluded, raise/lower/zero), receivers + reentrancy, reserve/airdrop, reveal/tokenURI before and after, extensionless suffix, base URI moves, lock, provenance once/before-reveal, royalties + cap (fuzzed math), withdraw (incl. owner that refuses ETH, after ownership transfer), two-step ownership, renounce disabled, stray ETH refused |
| [`test/ReportCards.Cap.t.sol`](test/ReportCards.Cap.t.sol) | full sell-outs through each path and mixed paths at exactly 3,333, then every path reverts; all ids 1..3333 exist and balances sum to 3,333; no partial fills; overflow-sized requests; fuzzed double reserves; the `_update` backstop against a raw `_mint` backdoor (fuzzed over all ids) |
| [`test/ReportCards.Invariant.t.sol`](test/ReportCards.Invariant.t.sol) | 64 runs × 128 random calls (mints, reserves, airdrops, price/limit/sale changes, transfers, withdrawals): supply ≤ 3,333, supply = successful mints, balances sum to supply, ids are exactly 1..supply, per-wallet counters track only public mints, ETH fully accounted for |
| [`test/Deploy.t.sol`](test/Deploy.t.sol) | the deploy script's env handling: placeholders, overrides, uint96 overflow, wrong-chain refusal |

## Deploying

Nothing chain-specific is hardcoded. The RPC comes from `ROBINHOOD_CHAIN_RPC_URL` (via the
`robinhood` alias in `foundry.toml`), the chain id comes from that RPC, and every setting comes from
the environment. Copy [`.env.example`](.env.example) to `.env` (gitignored; forge loads it
automatically) and fill in at least:

- `ROBINHOOD_CHAIN_RPC_URL`
- `REPORT_CARDS_OWNER` — the multisig that will own the collection
- `REPORT_CARDS_UNREVEALED_URI` — the pre-reveal JSON
- `REPORT_CARDS_EXPECTED_CHAIN_ID` — strongly recommended; the script refuses to run anywhere else
  (`WrongSchoolDistrict`)

Optional placeholders: `REPORT_CARDS_NAME`, `REPORT_CARDS_SYMBOL`, `REPORT_CARDS_ROYALTY_RECEIVER`
(defaults to the owner), `REPORT_CARDS_ROYALTY_BPS` (333), `REPORT_CARDS_MINT_PRICE_WEI`
(0.003333 ETH), `REPORT_CARDS_MAX_PER_WALLET` (3). All of these except name/symbol can be changed
by the owner after deploy.

```bash
# 1. Rehearse (simulates against the live chain, sends nothing)
npm run deploy:simulate

# 2. Broadcast and verify on the chain's Blockscout explorer. Sign with a hardware wallet
#    (--ledger), an encrypted keystore (--account <name>), or type the key at a prompt
#    (--interactives 1). Don't put private keys in .env.
npm run forge -- script script/Deploy.s.sol:Deploy --rpc-url robinhood --broadcast \
  --ledger \
  --verify --verifier blockscout --verifier-url "$ROBINHOOD_CHAIN_VERIFIER_URL"
```

The deployer only pays gas; the constructor makes `REPORT_CARDS_OWNER` the owner directly, so the
post-deploy runbook above is executed from the multisig.

`evm_version` is `cancun` (PUSH0, MCOPY, transient storage), which Arbitrum-stack and other modern
EVM L2s support. If Robinhood Chain's docs list an older EVM target, lower it in `foundry.toml` and
re-run `npm test`.
