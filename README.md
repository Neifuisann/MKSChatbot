# MKS School Chatbot

Next.js foundation for the MKS school chatbot.

## Core Stack

- Next.js App Router, React, TypeScript, Tailwind CSS, and shadcn/ui
- React Hook Form, Zod, and TanStack Table
- Vercel AI SDK with OpenAI, Anthropic, and Google providers
- Supabase browser, server, and privileged admin clients
- Inngest for background jobs
- Vitest and Testing Library

## Local Development

Install dependencies and start the app:

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and provide credentials before using
external services. Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Verification

```bash
pnpm lint
pnpm test
pnpm build
```
