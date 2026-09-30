/**
 * --force support for sample renders and layer sheets: override a token's
 * trait by layer ("Background", "Pen Marks", "Status", a subject name for a
 * grade) with a value (slug or marketplace name). Forced tokens skip the
 * rules on purpose (art review only); they are never written as metadata.
 */
import { STATUSES } from "../copy/traits";
import type { LetterGrade, SubjectKey } from "../copy/types";
import { findLayer, findValue, LETTERS, PEN_MARK_ANCHORS, SUBJECT_KEYS, SUBJECT_NAMES, type LayerKey } from "./catalog";
import { worstSubject } from "./grades";
import type { GenerativeToken, TraitLayer } from "./select";

export type Force = { layer: LayerKey | SubjectKey; value: string };

/** Parse "Layer=Value" (e.g. "Background=Liquidation Red", "Buying the Top=A+"). */
export function parseForce(spec: string): Force {
  const eq = spec.indexOf("=");
  if (eq < 0) throw new Error(`--force expects "Layer=Trait", got "${spec}"`);
  const layerQ = spec.slice(0, eq).trim();
  const valueQ = spec.slice(eq + 1).trim();
  const subject = SUBJECT_KEYS.find((k) => SUBJECT_NAMES[k].toLowerCase() === layerQ.toLowerCase() || k.toLowerCase() === layerQ.toLowerCase());
  if (subject) {
    const g = valueQ.toUpperCase() as LetterGrade;
    if (!LETTERS.includes(g)) throw new Error(`unknown grade "${valueQ}"`);
    return { layer: subject, value: g };
  }
  const layer = findLayer(layerQ);
  if (!layer || layer === "grades") throw new Error(`unknown layer "${layerQ}"`);
  if (layer === "status") {
    const st = STATUSES.find((s) => s.id === valueQ || s.name.toLowerCase() === valueQ.toLowerCase() || s.key.toLowerCase() === valueQ.toLowerCase());
    if (!st) throw new Error(`unknown status "${valueQ}"`);
    return { layer, value: st.key };
  }
  const v = findValue(layer, valueQ);
  if (!v) throw new Error(`unknown ${layer} value "${valueQ}"`);
  return { layer, value: v.id };
}

export function applyForce(t: GenerativeToken, forces: readonly Force[]): GenerativeToken {
  if (forces.length === 0) return t;
  const traits = { ...t.traits } as Record<TraitLayer, string>;
  const grades = { ...t.grades };
  let status = t.status;
  for (const f of forces) {
    if ((SUBJECT_KEYS as readonly string[]).includes(f.layer)) grades[f.layer as SubjectKey] = f.value as LetterGrade;
    else if (f.layer === "status") status = f.value as GenerativeToken["status"];
    else traits[f.layer as TraitLayer] = f.value;
  }
  const anchor = PEN_MARK_ANCHORS[traits.penMarks];
  let penAnchor: number | null = null;
  if (anchor === "firstF") penAnchor = Math.max(0, SUBJECT_KEYS.findIndex((k) => grades[k] === "F"));
  else if (anchor === "worst") penAnchor = SUBJECT_KEYS.indexOf(worstSubject(t.scores) ?? "buyingTheTop");
  return { ...t, traits, grades, status, penAnchor };
}
