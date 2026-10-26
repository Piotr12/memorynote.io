// The footer's second line: the branch and commit that built the site.
// Both values come from build-time environment variables, inlined by
// Next.js at build time. A missing value degrades the line; it never
// renders an empty placeholder.

export function footerLine(
  branch: string | undefined,
  commit: string | undefined,
): string | null {
  const b = branch?.trim() ?? "";
  const c = commit?.trim() ?? "";
  if (b === "" && c === "") {
    return null;
  }
  if (b !== "" && c !== "") {
    return `branch: ${b} · commit: ${c}`;
  }
  if (b !== "") {
    return `branch: ${b}`;
  }
  return `commit: ${c}`;
}
