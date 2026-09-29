/** Default display bound for a single Before/After value in human output. */
export const DISPLAY_PREVIEW_MAX_CHARS = 120;

export const TRUNCATION_MARKER = "…";

/**
 * One-line, terminal-safe rendering of a stored evidence preview.
 * Previews are already bounded and redacted at capture time; this only drops one trailing
 * newline, makes control characters visible, and truncates with a marker.
 */
export function formatPreviewForDisplay(
  preview: string | undefined,
  options: { maxChars?: number; sourceTruncated?: boolean } = {},
): string {
  if (preview === undefined) {
    return "(no preview stored)";
  }
  const maxChars = options.maxChars ?? DISPLAY_PREVIEW_MAX_CHARS;
  const body = preview.endsWith("\n") ? preview.slice(0, -1) : preview;
  if (body.length === 0) {
    return "(empty)";
  }
  const visible = body.replace(/[\u0000-\u001f\u007f]/g, (c) => CONTROL_ESCAPES[c] ?? `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
  if (visible.length > maxChars) {
    return `${visible.slice(0, maxChars - 1)}${TRUNCATION_MARKER}`;
  }
  return options.sourceTruncated === true ? `${visible}${TRUNCATION_MARKER}` : visible;
}

const CONTROL_ESCAPES: Readonly<Record<string, string>> = {
  "\n": "\\n",
  "\t": "\\t",
  "\r": "\\r",
};
