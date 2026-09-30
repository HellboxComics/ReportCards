/**
 * Collection-wide constants. MAX_SUPPLY is the single source of truth for the
 * 3,333 cap (it lives in the comedy bible so copy and engine can't disagree).
 */
import { MAX_SUPPLY } from "../copy/traits";

export { MAX_SUPPLY };

/** Hand-composed legendary cards, placed at seeded-random token ids. */
export const ONE_OF_ONE_COUNT = 33;

/** Layer-generated cards: 3,333 - 33 = 3,300. Every quota sums to this. */
export const GENERATIVE_COUNT = MAX_SUPPLY - ONE_OF_ONE_COUNT;

/** The collection seed. Same seed -> byte-identical metadata and images. */
export const DEFAULT_SEED = "report-cards/harrow/3333/v1";

/** Canvas edge in px. Every token image is CANVAS x CANVAS. */
export const CANVAS = 2000;

/** Throws unless `id` is an integer token id in 1..MAX_SUPPLY. */
export function assertTokenId(id: number): void {
  if (!Number.isInteger(id) || id < 1 || id > MAX_SUPPLY) {
    throw new RangeError(`token id ${id} is outside 1..${MAX_SUPPLY}; max supply is ${MAX_SUPPLY}`);
  }
}

/** Throws if someone asks for more than MAX_SUPPLY tokens. */
export function assertSupply(count: number): void {
  if (!Number.isInteger(count) || count < 1) throw new RangeError(`count must be a positive integer, got ${count}`);
  if (count > MAX_SUPPLY) {
    throw new RangeError(`refusing to generate ${count} tokens: max supply is ${MAX_SUPPLY}`);
  }
}

/** True for integer ids in 1..MAX_SUPPLY (for the live endpoint's 404). */
export function isTokenId(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= MAX_SUPPLY;
}
