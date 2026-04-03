import { describe, expect, it } from "vite-plus/test";
import { cx, cxDefault, configure } from "./index";

describe("cxDefault", () => {
  it("returns strings unchanged", () => {
    expect(cxDefault("btn primary")).toBe("btn primary");
  });

  it("keeps truthy number tokens while dropping zero", () => {
    expect(cxDefault(0)).toBe("");
    expect(cxDefault(42)).toBe("42");
  });

  it("flattens nested arrays depth-first", () => {
    expect(cxDefault(["btn", ["primary", ["focus"]], "wide"])).toBe("btn primary focus wide");
  });

  it("includes object keys with truthy values", () => {
    expect(
      cxDefault({
        btn: true,
        primary: 1,
        disabled: false,
      }),
    ).toBe("btn primary");
  });

  it("supports mixed values while ignoring falsy entries", () => {
    expect(
      cxDefault([
        "btn",
        0,
        false,
        null,
        undefined,
        { active: true, hidden: false },
        ["nested", { ready: 1 }],
      ]),
    ).toBe("btn active nested ready");
  });

  it("preserves object and array order", () => {
    expect(cxDefault(["first", { second: true, third: true }, ["fourth", { fifth: true }]])).toBe(
      "first second third fourth fifth",
    );
  });

  it("supports class keys containing spaces", () => {
    expect(
      cxDefault({
        "btn primary": true,
        hidden: false,
      }),
    ).toBe("btn primary");
  });

  it("returns an empty string when no class names are enabled", () => {
    expect(cxDefault(false)).toBe("");
    expect(cxDefault([null, undefined, false, { hidden: 0 }])).toBe("");
  });

  it("matches documented clsx falsy handling", () => {
    expect(cxDefault([true, false, "", null, undefined, 0, Number.NaN])).toBe("");
  });

  it("drops empty strings", () => {
    expect(cxDefault("")).toBe("");
    expect(cxDefault(["btn", "", "primary"])).toBe("btn primary");
  });

  it("returns an empty string for null and undefined", () => {
    expect(cxDefault(null)).toBe("");
    expect(cxDefault(undefined)).toBe("");
  });
});

describe("cx", () => {
  it("uses the default construction function when unconfigured", () => {
    expect(cx(["btn", { active: true }])).toBe("btn active");
  });

  it("uses the configured construction function", () => {
    const restore = configure({
      cx: (value) => `configured:${cxDefault(value)}`,
    });

    try {
      expect(cx(["btn", { active: true }])).toBe("configured:btn active");
    } finally {
      restore();
    }

    expect(cx(["btn", { active: true }])).toBe("btn active");
  });

  it("keeps cxDefault stable while configured", () => {
    const restore = configure({
      cx: () => "configured",
    });

    try {
      expect(cxDefault(["btn", { active: true }])).toBe("btn active");
      expect(cx(["btn", { active: true }])).toBe("configured");
    } finally {
      restore();
    }
  });

  it("restores nested configuration in LIFO order", () => {
    const restoreOuter = configure({
      cx: (value) => `outer:${cxDefault(value)}`,
    });
    const restoreInner = configure({
      cx: (value) => `inner:${cxDefault(value)}`,
    });

    try {
      expect(cx(["btn"])).toBe("inner:btn");
    } finally {
      restoreInner();
    }

    try {
      expect(cx(["btn"])).toBe("outer:btn");
    } finally {
      restoreOuter();
    }

    expect(cx(["btn"])).toBe("btn");
  });
});
