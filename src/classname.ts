import { clsx } from "clsx";
import type { ClassValue } from "clsx";

export type { ClassArray, ClassDictionary, ClassValue } from "clsx";

export type ClassifyFn = (value: ClassValue) => string;

type ConfigureOptions = {
  cx: ClassifyFn;
};

let activeConstructor: ClassifyFn = cxDefault;

export function configure({ cx }: ConfigureOptions): () => void {
  const previousConstructor = activeConstructor;
  activeConstructor = cx;

  return () => {
    activeConstructor = previousConstructor;
  };
}

export function cx(value: ClassValue): string {
  return activeConstructor(value);
}

export function cxDefault(value: ClassValue): string {
  return clsx(value);
}
