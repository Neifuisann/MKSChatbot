# MKS School Chatbot

Next.js foundation for the MKS school chatbot.

## Core Stack

- Next.js App Router, React, TypeScript, Tailwind CSS, and shadcn/ui
- React Hook Form, Zod, and TanStack Table
- Vercel AI SDK with OpenAI, Anthropic, and Google providers
- Supabase browser, server, and privileged admin clients
- Inngest for background jobs
- Vitest and Testing Library

## Supabase OAuth redirects

In Supabase Dashboard, open **Authentication > URL Configuration** and set:

- **Site URL** to the production app URL, such as `https://school.example.com`
- **Redirect URLs** to `http://localhost:3000/**` and the production callback,
  such as `https://school.example.com/auth/callback`
- For Vercel preview login, also allow
  `https://*-<team-or-account-slug>.vercel.app/auth/callback`

Set `NEXT_PUBLIC_APP_URL` to the production app URL in Vercel. OAuth redirects
use the incoming request host, so local login continues to return to localhost.

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
