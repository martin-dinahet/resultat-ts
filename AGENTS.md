# AGENTS.md

## Commands

- `pnpm test` - Run all tests (vitest)
- `pnpm typecheck` - Type check without emit (`tsc --noEmit`)
- `pnpm build` - Compile to `dist/` (`tsc`)
- `pnpm dev` - Run src/index.ts directly via tsx

## Stack

- **Runtime**: TypeScript 6+, ES modules (`"type": "module"`)
- **Package manager**: pnpm 10 (`packageManager` field locked)
- **Test**: Vitest, tests in `tests/` (not `src/`), import from `../src/index.js`
- **Lint/format**: Biome 2.4, double quotes, 100 char line width, spaces
- **No ESLint, no Prettier**

## Architecture

- Single package, flat structure: `src/helpers/`, `src/types/`
- Entrypoint: `src/index.ts` re-exports everything
- Types: `Result<T, E = string>`, `Success<T>`, `Failure<E = string>` defined in `src/types/` (error type `E` defaults to `string` for backward compatibility)
- `dist/` is build output; `dist/__tests__` and `dist/**/*.test.*` excluded from npm via `.npmignore`

## CI

- Publishes to npm on GitHub Release
- CI runs: `pnpm install → pnpm build → pnpm test`
- Uses Node 20, pnpm 10

## Notes

- Tests import from `../src/index.js` (with `.js` extension, ESM)
- Biome formats with spaces, not tabs
- `prepublishOnly` script runs `pnpm build` automatically
