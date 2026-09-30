/** Filesystem locations (node-only). */
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** collection/ */
export const COLLECTION_ROOT = path.resolve(here, "..", "..");
export const LAYERS_ROOT = path.join(COLLECTION_ROOT, "layers");
export const FONTS_DIR = path.join(COLLECTION_ROOT, "fonts");
export const OUTPUT_ROOT = path.join(COLLECTION_ROOT, "output");
export const PREVIEW_ROOT = path.join(COLLECTION_ROOT, "preview");
