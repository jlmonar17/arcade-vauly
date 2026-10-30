# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: a platform to play games online and compete for the highest score. The README says the project follows Spec Driven Design (`/spec` and `/spec-impl` workflow, skills from `Klerith/fernando-skills`, installed with `npx skills@latest add Klerith/fernando-skills`). The code is currently the untouched Next.js scaffold (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`).

## Commands

- `npm run dev`: start dev server
- `npm run build` / `npm start`: production build / serve
- `npm run lint`: ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- No test runner is configured.

## Next.js version warning

`next` is 16.4.3 with React 19.3 and differs from what you may know (see `AGENTS.md`). Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `03-architecture`, etc.) and heed deprecation notices.

`next.config.ts` enables non-default features that affect how code must be written:
- `cacheComponents: true` and `partialPrefetching: true`
- `experimental.agentFeedback: true`
- Tailwind v4 is wired through Turbopack rules (`@tailwindcss/turbopack` loader on `*.css`), not PostCSS.

## Conventions

- App Router only (`app/`); path alias `@/*` maps to the repo root.
- TypeScript `strict` is on.
