# Code Typing

Typing practice application for coding.
SPA with Vite + React + Tailwind CSS

## Project structure

Type-based structure.

- `index.html`: page entry point
- `src`: source directory
  - `hook`: React hook definition.
  - `tests`: Tests
  - `main.ts`: JavaScript entry point. DO NOT EDIT.
  - `App.tsx`: JavaScript entry point
  - `index.css`: CSS entry point
  - `assets`: Static assets

## Tools

- `pnpm build`: Build project
- `pnpm check`: Run Biome
- `pnpm check-write`: Run Biome and auto-fix if possible

## Key Principles

- Keep components to have only one responsibility.
- Extract logics into hooks.
- Split files if they are longer than 300 lines.
- Use t-wada's TDD. Write tests first.
