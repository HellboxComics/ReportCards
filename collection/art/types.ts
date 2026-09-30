/**
 * The art-module interface. Each art group exports one ArtModule; the
 * builder (`npm run collection:layers -- --group <group>`) writes its files
 * into the folders it owns and nothing else.
 */
import type { LayerKey } from "../src/catalog";

/** Where a file goes: a trait layer, the grade glyphs, a one-of-one, or collection extras. */
export type ArtTarget = LayerKey | "grades" | "1of1" | "extras";

export interface ArtFile {
  readonly layer: ArtTarget;
  /** File basename without "#weight" or extension (trait slug / letter slug / 1of1 slug). */
  readonly slug: string;
  /** Complete SVG document. */
  readonly svg: string;
}

export interface ArtModule {
  /** Group name used by --group. */
  readonly group: string;
  /** Folders under collection/layers this group owns (for docs and the ownership check). */
  readonly owns: readonly string[];
  /** Draw every file the group owns. Deterministic. */
  files(): ArtFile[];
}
