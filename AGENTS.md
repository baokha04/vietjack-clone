# AGENTS.md

Developer commands (uses `pnpm`):
- `pnpm dev` - Seeds local DB and starts wrangler dev
- `pnpm deploy` - Deploys to Cloudflare
- `pnpm test` - Runs integration tests (dry-run deploy + vitest)
- `pnpm predeploy` - Applies migrations to remote D1
- `pnpm cf-typegen` - Generates types for D1 bindings
- `pnpm schema` - Extracts OpenAPI schema

Key quirks:
- Config is `wrangler.jsonc` (not `.toml`)
- Tests auto-apply migrations via `tests/apply-migrations.ts` before running
- D1 binding name is `DB`, database is `vietjack-db`
- Soft-delete tables use `deleted` column (0/1, not boolean in SQL)

Architecture:
- Entry: `src/index.ts`
- Content endpoints: `src/endpoints/content/`
- Uses `linkedom` for HTML parsing in crawler
- Vietnamese accent removal via `src/utils/string.ts` (`unsignedName` for duplicate checks)

Framework: Hono + Chanfana (OpenAPI 3.1) + D1 + Vitest