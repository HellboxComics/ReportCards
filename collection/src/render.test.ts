import { describe, expect, it } from "vitest";
import { selectCollection } from "./select";
import { checkLayerFiles } from "./node/checks-fs";
import { renderToken } from "./node/render";

describe("rendering", () => {
  it("every trait value has a layer file of the right size", () => {
    expect(checkLayerFiles().problems).toEqual([]);
  });

  it("is deterministic: same token -> byte-identical 2000x2000 PNG", () => {
    const id = selectCollection().tokens.find((t) => t.kind === "generative")!.id;
    const a = renderToken(id);
    const b = renderToken(id);
    expect(a.equals(b)).toBe(true);
    expect(a.readUInt32BE(16)).toBe(2000);
    expect(a.readUInt32BE(20)).toBe(2000);
    expect(a.length).toBeLessThan(2 * 1024 * 1024);
  });

  it("renders one-of-ones and refuses ids outside the supply", () => {
    const one = selectCollection().oneOfOneIds[0];
    expect(renderToken(one, { width: 300 }).readUInt32BE(16)).toBe(300);
    expect(() => renderToken(3334)).toThrow();
  });
});
