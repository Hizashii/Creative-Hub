/** When true, JWT is skipped and permissive controller paths apply (never enable in production). */
export function skipAuthBypass(): boolean {
  return process.env.SKIP_AUTH === "true";
}
