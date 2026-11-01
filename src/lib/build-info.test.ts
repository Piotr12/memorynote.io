import { describe, expect, it } from "vitest";
import { footerLine } from "./build-info";

describe("footerLine", () => {
  it("shows both values when both are present", () => {
    expect(footerLine("main", "8f3a2c1")).toBe(
      "branch: main · commit: 8f3a2c1",
    );
  });

  it("shows the branch alone when the commit is missing", () => {
    expect(footerLine("main", undefined)).toBe("branch: main");
    expect(footerLine("main", "")).toBe("branch: main");
    expect(footerLine("main", "   ")).toBe("branch: main");
  });

  it("shows the commit alone when the branch is missing", () => {
    expect(footerLine(undefined, "8f3a2c1")).toBe("commit: 8f3a2c1");
    expect(footerLine("", "8f3a2c1")).toBe("commit: 8f3a2c1");
  });

  it("returns null when both are missing, so the line is omitted", () => {
    expect(footerLine(undefined, undefined)).toBeNull();
    expect(footerLine("", "")).toBeNull();
    expect(footerLine("   ", "  ")).toBeNull();
  });
});
