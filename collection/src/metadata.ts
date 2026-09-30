/**
 * ERC-721 / OpenSea metadata. Pure: no filesystem, no rendering, so the web
 * app's live endpoint can call tokenMetadata(id) directly. The whole
 * selection is computed once per seed and cached.
 */
import { BASE_URI } from "../base-uri";
import { COLLECTION, fill, UNREVEALED } from "../copy/descriptions";
import { MAX_SUPPLY as SUPPLY } from "../copy/traits";
import { assertTokenId, DEFAULT_SEED, ONE_OF_ONE_COUNT } from "./constants";
import { describe } from "./describe";
import { rarityTable } from "./rarity";
import { selectCollection, type Token } from "./select";
import { oneOfOneTraits, visibleTraits } from "./traits";

export interface StringAttribute {
  trait_type: string;
  value: string;
}
export interface NumberAttribute {
  display_type: "number";
  trait_type: string;
  value: number;
  max_value?: number;
}
export type Attribute = StringAttribute | NumberAttribute;

export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  edition: number;
  dna: string;
  attributes: Attribute[];
}

export interface MetadataOptions {
  /** Image base URI; defaults to collection/base-uri.ts. */
  baseUri?: string;
}

export const GPA_MAX = 4.33;

export function imageUri(id: number | string, baseUri: string = BASE_URI): string {
  return `${baseUri.replace(/\/+$/, "")}/${id}.png`;
}

/** Metadata for one token, generated from its id + the collection seed. */
export function tokenMetadata(id: number, seed: string = DEFAULT_SEED, opts: MetadataOptions = {}): TokenMetadata {
  assertTokenId(id);
  const sel = selectCollection(seed);
  return metadataFor(sel.tokens[id - 1], seed, opts);
}

/** Metadata for every token, id 1..3333. */
export function allMetadata(seed: string = DEFAULT_SEED, opts: MetadataOptions = {}): TokenMetadata[] {
  const sel = selectCollection(seed);
  return sel.tokens.map((t) => metadataFor(t, seed, opts));
}

function metadataFor(t: Token, seed: string, opts: MetadataOptions): TokenMetadata {
  const sel = selectCollection(seed);
  const rar = rarityTable(sel).byId[t.id - 1];
  const image = imageUri(t.id, opts.baseUri);
  const str = ([trait_type, value]: [string, string]): StringAttribute => ({ trait_type, value });
  const rarityAttrs: Attribute[] = [
    { trait_type: "Rarity Tier", value: rar.tier },
    { display_type: "number", trait_type: "Rarity Rank", value: rar.rank, max_value: SUPPLY },
  ];
  if (t.kind === "oneOfOne") {
    const p = t.piece;
    return {
      name: `Report Card #${t.id} — ${p.title}`,
      description: p.lore,
      image,
      edition: t.id,
      dna: t.dna,
      attributes: [
        ...oneOfOneTraits(t).map(str),
        { display_type: "number", trait_type: "GPA", value: p.gpa, max_value: GPA_MAX },
        ...Object.entries(p.extra ?? {}).map(([trait_type, value]) => ({ trait_type, value })),
        { trait_type: "1 of 1", value: "Yes" },
        ...rarityAttrs,
      ],
    };
  }
  return {
    name: `Report Card #${t.id}`,
    description: describe(t, seed),
    image,
    edition: t.id,
    dna: t.dna,
    attributes: [
      ...visibleTraits(t).map(str),
      { display_type: "number", trait_type: "GPA", value: t.gpa, max_value: GPA_MAX },
      ...rarityAttrs,
    ],
  };
}

/** Contract-level metadata (OpenSea contractURI). */
export function collectionMetadata(opts: MetadataOptions = {}) {
  const base = (opts.baseUri ?? BASE_URI).replace(/\/+$/, "");
  return {
    name: COLLECTION.name,
    symbol: COLLECTION.symbol,
    description: COLLECTION.description,
    tagline: COLLECTION.tagline,
    about: COLLECTION.about,
    image: `${base}/collection.png`,
    max_supply: SUPPLY,
    one_of_ones: ONE_OF_ONE_COUNT,
    // Placeholders: the contract owner sets real royalty terms at deploy.
    seller_fee_basis_points: 0,
    fee_recipient: "0x0000000000000000000000000000000000000000",
  };
}

/** Pre-reveal metadata. Same for every token except the name. */
export function unrevealedMetadata(id?: number, opts: MetadataOptions = {}) {
  if (id !== undefined) assertTokenId(id);
  const base = (opts.baseUri ?? BASE_URI).replace(/\/+$/, "");
  return {
    name: id === undefined ? "Report Card — Grades Not Posted" : fill(UNREVEALED.name, { id: String(id) } as never),
    description: UNREVEALED.description,
    image: `${base}/unrevealed.png`,
    attributes: UNREVEALED.attributes.map((a) => ({ trait_type: a.trait_type, value: a.value })),
  };
}
