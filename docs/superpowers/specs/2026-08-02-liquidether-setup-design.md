# NornStudio: Next.js scaffold + shadcn LiquidEther component

## Context

`NornStudio` is currently an empty directory. The user wants to install the
`@react-bits/LiquidEther-JS-CSS` component via the `shadcn` CLI, which requires
an existing Next.js + Tailwind + shadcn project to run against.

## Goal

Stand up a minimal Next.js project with shadcn configured, then install the
LiquidEther component and render it on the homepage so it's visibly working.

## Decisions

- Package manager: npm
- Language: TypeScript
- Router: App Router
- Styling: Tailwind CSS (required by shadcn)
- Version control: initialize git, one initial commit after scaffolding
- Homepage: replace the default `create-next-app` homepage content with the
  `LiquidEther` component so the result is visually verifiable

## Steps

1. `git init`
2. `npx create-next-app@latest .` with TypeScript, App Router, Tailwind CSS,
   ESLint, npm, default `@/*` import alias
3. `npx shadcn@latest init` to generate `components.json` and theme tokens
4. `npx shadcn@latest add @react-bits/LiquidEther-JS-CSS`
5. Update `app/page.tsx` to render `<LiquidEther />` (full-viewport background,
   per the component's typical usage)
6. Initial git commit

## Out of scope

- No additional pages, routes, or content beyond the default scaffold and the
  LiquidEther demo on the homepage
- No deployment configuration
- No additional shadcn components beyond the one requested
