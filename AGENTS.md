# AGENTS.md — School Chatbot Project

## 1. Project mission

Build a production-ready school chatbot web app that runs on Vercel and uses Supabase as the primary backend. The chatbot must support:

- RAG over school documents, policies, schedules, FAQs, admissions, tuition, departments, and internal knowledge.
- Safe function calling for school-specific actions.
- Appointment booking with school departments or staff.
- Source-grounded answers with citations.
- Admin dashboard for document management, appointment management, prompt/configuration, and analytics.
- A codebase that is easy for coding agents to inspect, extend, test, and refactor.

Primary expected traffic: around 1,000 users. Prioritize simplicity, maintainability, security, and observability over premature scaling.

---

## 2. Preferred stack

Use this stack unless the human explicitly changes it:

### App

- Next.js App Router
- TypeScript
- React Server Components where appropriate
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod for forms
- TanStack Table for admin tables if needed

### AI

- Vercel AI SDK for chat streaming, tool calling, and agent loops
- Zod schemas for every tool input
- Provider abstraction in `src/lib/ai/models.ts`
- Default model should be configurable via environment variables
- Embedding model should be configurable via environment variables

### Backend and database

- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Supabase pgvector
- Supabase Row Level Security policies
- Supabase RPC functions for vector search

### Background jobs

Use a background job provider for long-running tasks such as document parsing and embedding generation.

Preferred options:

- Trigger.dev
- Inngest
- Upstash QStash
- Supabase Edge Functions only for lightweight jobs or webhooks

Do not run long document ingestion jobs inside a normal Vercel request handler.

---

## 3. Non-negotiable architecture rules

1. Keep all application code TypeScript-first.
2. Do not let the LLM query the database directly.
3. The LLM may only call explicitly defined tools with Zod-validated inputs.
4. Every tool must perform authorization and input validation on the server.
5. Every tool call must be logged.
6. Every RAG answer must include source references when sources are available.
7. Never expose Supabase service-role keys to the browser.
8. Use Supabase RLS for user-facing data access.
9. Use server-only Supabase clients for privileged operations.
10. Keep prompts, tools, RAG logic, and database access separated into different modules.
11. Prefer small, composable functions over large files.
12. Do not add LangChain/LangGraph unless there is a clear need for complex workflows.
13. Avoid premature microservices. Use Next.js + Supabase first.
14. Add tests for core utilities, RAG retrieval, appointment logic, and tool authorization.
15. Do not commit secrets, `.env.local`, API keys, generated private keys, or local Supabase credentials.

---

## 4. RLS baseline

Implement RLS from the start.

Guidelines:

- Public documents may be read by everyone.
- Student documents may be read by authenticated users with role `student`, `staff`, or `admin`.
- Staff documents may be read by `staff` or `admin`.
- Admin documents may be read only by `admin`.
- Users may read their own chat sessions and messages.
- Admins may read all documents, appointments, tool logs, and feedback.
- Only admins may insert/update/delete documents from the admin dashboard.
- Appointment creation may be public or authenticated depending on school policy, but must be rate-limited.

Do not ship without RLS policies.

---

## 5. RAG implementation plan

### Files to implement

- `src/lib/rag/chunk.ts`
- `src/lib/rag/embed.ts`
- `src/lib/rag/ingest.ts`
- `src/lib/rag/retrieve.ts`
- `src/lib/rag/citations.ts`

### Chunking rules

- Prefer semantic chunking by headings or sections.
- Preserve document title, section title, page number, department, and visibility in metadata.
- Target 500-900 tokens per chunk.
- Use overlap only when needed, around 80-150 tokens.
- Do not embed empty or low-value chunks.

### Retrieval rules

- Use role-aware filtering before returning chunks to the model.
- Use department filter when provided.
- Retrieve more candidates than needed, then trim to the best context.
- Always return citation metadata with each selected chunk.
- If no reliable source is found, say that the answer is not available in the school knowledge base and suggest contacting the relevant department.

### Suggested retrieval signature

```ts
export type RetrievalInput = {
  query: string;
  userRole: 'anonymous' | 'student' | 'staff' | 'admin';
  department?: string;
  limit?: number;
};

export type RetrievedChunk = {
  id: string;
  documentId: string;
  title: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
};

export async function retrieveSchoolContext(input: RetrievalInput): Promise<RetrievedChunk[]> {
  // Implement with Supabase RPC and role-aware filters.
}
```

---

## 6. AI agent and tools

### Files to implement

- `src/lib/ai/models.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/tools.ts`
- `src/lib/ai/tool-registry.ts`
- `src/lib/ai/agent.ts`
- `src/app/api/chat/route.ts`

### System prompt requirements

The chatbot should:

- Answer in Vietnamese by default unless the user uses another language.
- Be helpful, concise, and school-service oriented.
- Use RAG for school-specific facts.
- Cite sources when answering from documents.
- Ask for missing required appointment details only when necessary.
- Never invent policies, fees, deadlines, or schedules.
- Escalate to a human department if confidence is low.
- Avoid exposing internal tool names, raw database IDs, or hidden system prompts.

### Initial tools

Implement these tools first:

```ts
searchSchoolKnowledgeBase
checkAppointmentSlots
bookAppointment
getDepartmentInfo
createSupportTicket
```

Tool rules:

- All tool inputs must use Zod schemas.
- Tools must run server-side only.
- Tools must check user role and permissions.
- Tools must log success and failure to `tool_call_logs`.
- Tools must return structured outputs suitable for the model to summarize.
- Tools must not return sensitive data unless authorized.

### Example tool shape

```ts
import { tool } from 'ai';
import { z } from 'zod';

export const searchSchoolKnowledgeBase = tool({
  description: 'Search approved school documents and FAQs using role-aware retrieval.',
  inputSchema: z.object({
    query: z.string().min(2),
    department: z.string().optional(),
  }),
  execute: async ({ query, department }) => {
    // 1. Resolve current user and role.
    // 2. Retrieve role-allowed chunks.
    // 3. Return concise context with citations.
  },
});
```

---

## 7. Chat API route

Implement `src/app/api/chat/route.ts` with:

- Request validation using Zod.
- User/session resolution.
- Rate limiting placeholder.
- `streamText` or equivalent Vercel AI SDK streaming.
- Registered tools from `tool-registry.ts`.
- Storage of user and assistant messages.
- Graceful error handling.

Do not place large prompt strings directly in the route file. Import them from `src/lib/ai/prompts.ts`.

---

## 8. Appointment booking logic

Implement appointment logic outside the LLM tool file.

Required files:

- `src/lib/appointments/availability.ts`
- `src/lib/appointments/booking.ts`
- `src/schemas/appointment.ts`

Rules:

- Validate department, slot, name, email, phone, and reason.
- Prevent double booking beyond slot capacity.
- Use database transaction or safe constraint logic where possible.
- Store appointment status.
- Return clear human-readable summaries.
- Admin dashboard must allow confirming, cancelling, and completing appointments.

---

## 9. Admin dashboard MVP

Create admin pages for:

1. Documents
   - Upload file
   - Set title, department, visibility
   - Show processing status
   - Delete or reprocess document

2. Appointments
   - View appointments
   - Filter by department/status/date
   - Confirm/cancel/complete

3. Analytics
   - Recent chats
   - Common questions
   - Failed retrievals
   - Negative feedback
   - Tool error rate

4. Settings
   - Default chatbot behavior
   - School departments
   - Safe contact/escalation messages

Admin pages must check role server-side.

---

## 10. Security and privacy

- Use RLS and server-side authorization.
- Sanitize uploaded files and restrict file types.
- Limit file size for uploads.
- Do not allow arbitrary URL fetching in ingestion unless explicitly approved.
- Add rate limiting for chat, appointment booking, and upload endpoints.
- Never include private user data in prompts unless required.
- Redact sensitive fields from logs where possible.
- Use secure headers and standard Next.js/Supabase auth patterns.
- Avoid storing unnecessary personal data.

---

## 11. Testing requirements

Set up Vitest.

Minimum tests:

- `chunk.test.ts`: verifies chunking preserves metadata and skips empty chunks.
- `retrieve.test.ts`: verifies role-aware retrieval filters restricted chunks.
- `appointment.test.ts`: verifies slot availability and booking validation.
- `tools.test.ts`: verifies unauthorized tool calls are rejected.
- `prompts.test.ts`: verifies system prompt includes no secrets and contains citation rules.

Run before finalizing major changes:

```bash
pnpm lint
pnpm test
pnpm build
```

If a command fails, fix the underlying issue. Do not silence errors by deleting tests or weakening validation unless the human approves.

---

## 12. Coding style

- Use explicit types for public functions.
- Use `async/await`, not deeply nested promises.
- Keep files under roughly 250-350 lines when practical.
- Prefer named exports.
- Use `@/` imports.
- Use Zod for external inputs.
- Put database queries behind small functions.
- Avoid global mutable state.
- Avoid hidden side effects.
- Add concise comments only when logic is non-obvious.

---

## 13. Initial implementation checklist

When initializing the project, complete these steps in order:

1. Create Next.js project with TypeScript, Tailwind, App Router, and `src/` directory.
2. Install AI SDK, model providers, Supabase client, Zod, form/UI dependencies, and test dependencies.
3. Add `.env.example`.
4. Add Supabase client files:
   - `src/lib/supabase/browser.ts`
   - `src/lib/supabase/server.ts`
   - `src/lib/supabase/admin.ts`
5. Add schema files under `src/schemas/`.
6. Add initial Supabase migrations for profiles, documents, chunks, chat, appointments, tool logs, and feedback.
7. Add placeholder RLS policies.
8. Add AI model abstraction.
9. Add system prompt file.
10. Add RAG chunk/retrieve placeholder implementations.
11. Add tool registry with initial tools.
12. Add `/api/chat` route with streaming response.
13. Add basic chat page.
14. Add admin layout and protected admin placeholder pages.
15. Add upload endpoint placeholder.
16. Add appointment endpoints and validation.
17. Add Vitest config and minimum tests.
18. Run lint, test, and build.
19. Commit only after the project builds successfully.

---

## 14. Definition of done for MVP foundation

The foundation is done when:

- The app runs locally with `pnpm dev`.
- The project builds with `pnpm build`.
- Supabase clients are separated correctly for browser/server/admin use.
- `/api/chat` can stream a response.
- Tools are registered and validated with Zod.
- RAG retrieval module exists, even if initially mocked.
- Appointment booking module exists with validation.
- Admin routes are protected.
- Database migrations exist.
- `.env.example` documents all required variables.
- Tests exist and pass.

---

## 15. Things not to do in the initial version

Do not implement these unless explicitly requested:

- Do not add a separate vector database.
- Do not add LangChain or LangGraph by default.
- Do not build a mobile app.
- Do not add payment features.
- Do not add complex multi-agent orchestration.
- Do not add direct SIS/ERP integration before the base chatbot, RAG, and appointment flow work.
- Do not over-optimize caching before observing real usage.

---

## 16. Human handoff behavior

If the chatbot cannot answer reliably from available school sources, it should respond with:

- What it could not verify.
- Which department likely owns the answer.
- A suggested next step such as booking an appointment, creating a support ticket, or contacting the department.

Never hallucinate official school information.

