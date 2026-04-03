import type { ReactElement } from "react";
import { describe, expect, it } from "vite-plus/test";
import * as ReactJSXRuntime from "react/jsx-runtime";
import { configure, cxDefault } from "./index";
import { jsx, jsxs } from "./jsx-runtime";
import { jsxDEV } from "./jsx-dev-runtime";

type ElementWithClassName = ReactElement<{
  className?: unknown;
  id?: string;
}>;

describe("jsx runtime wrappers", () => {
  it("constructs intrinsic jsx className values", () => {
    const element = jsx("div", {
      className: ["btn", { active: true, disabled: false }, 0],
    }) as ElementWithClassName;

    expect(element.props.className).toBe("btn active");
  });

  it("constructs intrinsic jsxs className values", () => {
    const element = jsxs("div", {
      className: ["stack", ["gap-sm"], { surface: true }],
      children: ["a", "b"],
    }) as ElementWithClassName;

    expect(element.props.className).toBe("stack gap-sm surface");
  });

  it("constructs intrinsic jsxDEV className values", () => {
    const element = jsxDEV(
      "div",
      {
        className: [{ card: true }, ["raised"]],
      },
      undefined,
      false,
      {
        fileName: "runtime.test.ts",
        lineNumber: 1,
        columnNumber: 1,
      },
      undefined,
    ) as ElementWithClassName;

    expect(element.props.className).toBe("card raised");
  });

  it("leaves custom component className values unchanged", () => {
    const className = ["btn", { active: true }] as const;
    const Component = () => null;
    const element = jsx(Component, { className }) as ElementWithClassName;

    expect(element.props.className).toBe(className);
  });

  it("passes through intrinsic elements with no className prop", () => {
    const props = { id: "hero" };
    const element = jsx("div", props) as ElementWithClassName;

    expect(element.props.className).toBeUndefined();
    expect(element.props).toBe(props);
  });

  it("passes through undefined and null className unchanged", () => {
    const undefinedElement = jsx("div", {
      className: undefined,
    }) as ElementWithClassName;
    const nullElement = jsx("div", {
      className: null,
    }) as ElementWithClassName;

    expect(undefinedElement.props.className).toBe("");
    expect(nullElement.props.className).toBe("");
  });

  it("passes through empty string className unchanged", () => {
    const props = { className: "" };
    const element = jsx("div", props) as ElementWithClassName;

    expect(element.props.className).toBe("");
    expect(element.props).toBe(props);
  });

  it("preserves props identity for no-op intrinsic string values", () => {
    const props = {
      className: "btn",
      id: "hero",
    };

    const element = jsx("div", props) as ElementWithClassName;
    const reactElement = ReactJSXRuntime.jsx("div", props) as ElementWithClassName;

    expect(element.props).toBe(props);
    expect(reactElement.props).toBe(props);
  });

  it("uses the configured construction function for intrinsic jsx", () => {
    const restore = configure({
      cx: (value) => `runtime:${cxDefault(value)}`,
    });

    try {
      const element = jsx("div", {
        className: ["btn", { active: true }],
      }) as ElementWithClassName;

      expect(element.props.className).toBe("runtime:btn active");
    } finally {
      restore();
    }
  });

  it("uses the configured construction function for intrinsic jsxs and jsxDEV", () => {
    const restore = configure({
      cx: (value) => `runtime:${cxDefault(value)}`,
    });

    try {
      const jsxsElement = jsxs("div", {
        className: ["stack", { surface: true }],
        children: ["a", "b"],
      }) as ElementWithClassName;
      const jsxDevElement = jsxDEV(
        "div",
        {
          className: [{ card: true }, ["raised"]],
        },
        undefined,
        false,
        {
          fileName: "runtime.test.ts",
          lineNumber: 1,
          columnNumber: 1,
        },
        undefined,
      ) as ElementWithClassName;

      expect(jsxsElement.props.className).toBe("runtime:stack surface");
      expect(jsxDevElement.props.className).toBe("runtime:card raised");
    } finally {
      restore();
    }
  });
});
