import type { UIMessage } from "ai";
import { ArrowLeft, Atom, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getMessageText } from "@/lib/chat/messages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { chatShareTokenSchema } from "@/schemas/chat";

export const dynamic = "force-dynamic";

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const parsedToken = chatShareTokenSchema.safeParse(token);
  if (!parsedToken.success) notFound();

  const admin = createSupabaseAdminClient();
  const { data: session } = await admin
    .from("chat_sessions")
    .select("id, title, custom_title")
    .eq("share_token", parsedToken.data)
    .maybeSingle();

  if (!session) notFound();

  const { data: storedMessages } = await admin
    .from("chat_messages")
    .select("id, role, parts")
    .eq("session_id", session.id)
    .order("turn_index")
    .order("created_at");
  const messages = (storedMessages ?? []) as UIMessage[];

  return (
    <main className="min-h-dvh bg-[#f7f5ef] text-[#303832]">
      <header className="sticky top-0 border-b border-[#dedbd2] bg-[#f7f5ef]/95 px-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4">
          <Link
            className="flex items-center gap-2 rounded-lg text-sm text-[#626b65] hover:text-[#303832]"
            href="/"
          >
            <ArrowLeft className="size-4" />
            MKS Assistant
          </Link>
          <span className="flex items-center gap-1.5 text-xs text-[#7b827d]">
            <LockKeyhole className="size-3.5" />
            Chỉ đọc
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <div className="mb-10">
          <span className="mb-4 grid size-10 place-items-center rounded-full bg-[#e6ddd1] text-[#c76445]">
            <Atom className="size-5" />
          </span>
          <h1 className="font-serif text-3xl tracking-[-0.04em]">
            {session.custom_title || session.title}
          </h1>
          <p className="mt-2 text-sm text-[#7b827d]">
            Cuộc trò chuyện được chia sẻ công khai. Không thể gửi hoặc chỉnh sửa tin nhắn.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {messages.map((message) => {
            const text = getMessageText(message);
            return (
              <article
                className={message.role === "user" ? "flex justify-end" : ""}
                key={message.id}
              >
                {message.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#e9e6df] px-4 py-3 text-[15px] leading-6 sm:max-w-xl">
                    {text}
                  </div>
                ) : (
                  <div className="prose prose-stone max-w-none text-[15px] leading-7 prose-headings:font-serif prose-a:text-[#315c48] prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-[#e9e6df]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
