/**
 * Writes text to the system clipboard, reporting success as a boolean
 * rather than throwing, so callers don't each need their own try/catch.
 * Deliberately does not own any user-facing wording (toast text, etc.) so
 * it stays reusable between manual Copy and auto-copy call sites, which
 * need different messages for the same underlying action.
 *
 * navigator.clipboard.writeText() can reject for reasons outside this
 * app's control - no transient user activation, an unsupported/insecure
 * context, the page losing focus, a denied permission - none of which mean
 * anything was lost: the cleaned text is already visible on screen either
 * way. Failure here should always degrade to "ask the user to click Copy,"
 * never to a retry loop or a permission prompt.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn("copyToClipboard: clipboard write failed", err);
    return false;
  }
}
