# reclassify

`reclassify` is a custom JSX runtime for React that lets you pass arrays and objects as `className` on intrinsic elements — no `classNames()` or `clsx()` functions needed.

```tsx
// Before:
<button className={
  clsx(["btn", ["btn-primary", { "btn-disabled": false }], { "is-active": true }])
}>
  Save
</button>

// After:
<button className={
  // No need for clsx
  ["btn", ["btn-primary", { "btn-disabled": false }], { "is-active": true }]
}>
  Save
</button>
```

It constructs `className` strings for intrinsic elements only. Custom components keep their declared `className` prop types.

## Why use this

- **No imports needed**: You no longer have to import `clsx` or `classnames` in every file, the JSX runtime handles classname construction automatically for all intrinsic elements.
- **Type-safe**: TypeScript knows that `className` on intrinsic elements accepts arrays, objects, and nested combinations. No `as string` casts or loose typing.
- **Drop-in setup**: One `tsconfig.json` change (`jsxImportSource`) and your entire app is covered. No Babel plugins, no wrappers, no HOCs. It's also backwards-compatible.
- **Familiar syntax**: If you've used `clsx`, `classnames`, Vue's `:class`, or Svelte's `class:` directive, the array/object pattern already feels natural.

## Install

```bash
npm install reclassify # Requires React >= 17 (automatic JSX runtime)
```

## Usage

There are two common ways to use `reclassify`, depending on whether you are using TypeScript or Babel to compile:

### TypeScript

Set `jsxImportSource` when using the automatic JSX runtime:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "reclassify"
  }
}
```

You can also opt in per file:

```tsx
/** @jsxImportSource reclassify */
```

### Babel

Configure `@babel/preset-react` with the automatic runtime and `importSource`:

```json
{
  "presets": [
    [
      "@babel/preset-react",
      {
        "runtime": "automatic",
        "importSource": "reclassify"
      }
    ]
  ]
}
```

Once configured, intrinsic elements accept arrays and objects for `className` with full TypeScript support — no type errors:

```tsx
// All of these type-check cleanly with jsxImportSource set to "reclassify"
<div className="plain-string" />
<div className={["btn", "btn-primary"]} />
<div className={{ active: true, disabled: false }} />
<div className={["btn", { active: isActive }, ["nested"]]} />
```

## Custom construction

If you want to replace the built-in class construction function, before your app starts rendering JSX, call `configure()` once with your custom implementation. It returns a function that restores the previous construction function:

```ts
import { configure } from "reclassify";
import { cn } from "./utils/cn"; // Commonly-found in shadcn projects

const restore = configure({ fn: cn });

// Later, if needed (e.g. in tests):
restore();
```

### Where to call `configure()`

`configure()` is app-wide mutable state, so call it during startup rather than per component:

- Client-side rendering / SPAs (e.g. default Vite): Call it in your main entry module before `render()`
- Server-side rendering (e.g. Next.js): Call it in the earliest server entry and earliest client entry that render JSX (e.g. root layout component)

If your custom function wants to build on the default behavior, you can import `defaultClassify` and use it:

```ts
import { configure, defaultClassify, type ClassValue } from "reclassify";

configure({
  fn(value: ClassValue) {
    const constructed = defaultClassify(value);
    return constructed ? `custom ${constructed}` : "custom";
  },
});
```

### Manual construction

If you want the same behavior in custom components, the underlying function can be imported via `classify`:

```ts
import { classify } from "reclassify";

classify(["btn", 0, { active: true, disabled: false }, ["nested"]]);
// => "btn 0 active nested"
```

If a custom `fn` function is provided via `configure()`, the imported `classify` function points to that.

## Supported values

- Non-empty strings are kept as-is. Empty strings are dropped.
- Numbers are stringified and kept, including `0`.
- Arrays are flattened depth-first.
- Objects contribute keys whose values are truthy.
- `false`, `true`, `null`, and `undefined` are ignored when they appear as standalone entries (not as object values).

## Workspace development

This repository uses [Vite+](https://viteplus.dev/) (`vp`) on top of a pnpm workspace. The publishable library stays at the root, with example apps in `apps/vite` and `apps/next`.

```bash
npm install -g vite-plus # Install Vite+ CLI globally
vp install
vp run dev
```

Useful commands:

- `vp pack` builds the library package.
- `vp test` runs the library test suite.
- `vp check` runs formatting, linting, and type-aware checks.
- `vp run dev` runs the library watcher with the Vite example app.
- `vp run dev:next` runs the library watcher with the Next.js example app.
- `vp run build:vite` typechecks and builds the Vite example app.
- `vp run build:next` builds the Next.js example app.
- `vp run build:examples` builds both example apps.
- `vp run check` runs the library validation plus both example app smoke tests.

## Examples

Examples can be found in `apps/`:

- `apps/vite`: The Vite app demonstrates intrinsic `className` arrays and objects directly in JSX, plus a custom component that opts into the same pattern with `classify`.
- `apps/next`: The Next.js app shows the same API through a framework setup using `jsxImportSource: "reclassify"` in `tsconfig.json`.

Both apps consume `reclassify` through the workspace package itself rather than importing source files from outside their own package directories.

## License

MIT
