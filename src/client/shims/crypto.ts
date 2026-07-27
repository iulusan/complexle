// Browser stand-in for Node's "crypto" module, aliased in vite.config.ts — only the one
// export gameService.ts actually uses.
export function randomUUID(): string {
  return crypto.randomUUID();
}
