import { getActivity } from "./providers";
import { buildReportCard } from "./reportCard";
import { semesterAt, semesterByIndex } from "./semester";

/** `term` is the 1-based term number shown on cards; omitted means the current semester. */
export async function loadReportCard(address: string, opts: { name?: string; term?: string }) {
  const now = Date.now();
  const current = semesterAt(now);
  const term = Number(opts.term);
  const semester =
    Number.isInteger(term) && term >= 1 && term <= current.term
      ? semesterByIndex(term - 1)
      : current;
  const activity = await getActivity(address, semester, now);
  // Names come from URLs; keep them card-sized.
  const name = opts.name?.replace(/\s+/g, " ").trim().slice(0, 40) || undefined;
  return buildReportCard(activity, semester, { now, studentName: name });
}
