// lib/logger.ts
export const DEBUG = process.env.NODE_ENV !== "production";
// or use an explicit flag: process.env.DEBUG === "true"

export function debugLog(...args: unknown[]) {
  if (DEBUG) {
    console.log(...args);
  }
}
