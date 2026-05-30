import "@testing-library/jest-dom/vitest";

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => `test-id-${Math.random().toString(16).slice(2)}`,
  },
});