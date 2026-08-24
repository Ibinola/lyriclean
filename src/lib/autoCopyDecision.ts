/**
 * Decides what should happen after a paste-triggered auto-clean, given the
 * freshly-computed pipeline result for that exact run (never stale state —
 * see runCleaningPipeline in tool/page.tsx, which returns this shape
 * directly rather than relying on React state that may not have
 * re-rendered yet).
 *
 *   "empty"        — nothing survived cleaning; there's nothing to copy.
 *   "needs-review" — possible duplicate sections were flagged; the
 *                    existing duplicate-review UI takes over, and
 *                    auto-copy must not run until the user resolves it.
 *   "ready"        — safe to attempt an automatic clipboard copy.
 *
 * This only encodes the two content-dependent gating conditions (non-empty
 * output, zero unresolved duplicates). Whether this function is even
 * reachable at all — the clean was triggered by a qualifying paste, not
 * typing or a manual Clean click — is enforced structurally by the caller
 * (only the paste-triggered code path ever calls this), not by this
 * function.
 */
export type AutoCopyOutcome = "empty" | "needs-review" | "ready";

export function decideAutoCopyOutcome(result: { text: string; duplicates: unknown[] }): AutoCopyOutcome {
  if (!result.text.trim()) return "empty";
  if (result.duplicates.length > 0) return "needs-review";
  return "ready";
}
