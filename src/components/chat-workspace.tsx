"use client";

import { useChat } from "@ai-sdk/react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  FlaskConical,
  LoaderCircle,
  Mic,
  Paperclip,
  PenLine,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DefaultChatTransport, generateId, type UIMessage } from "ai";

import type { WorkspaceUser } from "@/components/workspace-sidebar";
import { getMessageText } from "@/lib/chat/messages";
import { cn } from "@/lib/utils";

type ChatWorkspaceProps = {
  chatId: string;
  initialMessages: UIMessage[];
  title: string;
  user: WorkspaceUser;
};

const starters = [
  { icon: Search, label: "Tìm thông tin", prompt: "Tìm giúp mình thông tin chính thức từ nhà trường" },
  { icon: PenLine, label: "Soạn nội dung", prompt: "Giúp mình soạn một email gửi đến phòng ban" },
  { icon: FlaskConical, label: "Ý tưởng nghiên cứu", prompt: "Giúp mình phát triển một ý tưởng nghiên cứu" },
  { icon: Wrench, label: "Makerspace", prompt: "Mình muốn đăng ký sử dụng Makerspace" },
];

function MessageActions({
  alwaysVisible = false,
  copied,
  onCopy,
  onEdit,
  onRetry,
}: {
  alwaysVisible?: boolean;
  copied: boolean;
  onCopy: () => void;
  onEdit?: () => void;
  onRetry?: () => void;
}) {
  const actionClass =
    "grid size-8 place-items-center rounded-lg text-[#747b76] transition hover:bg-[#e9e6df] hover:text-[#303832] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7c8d82]";

  return (
    <div
      className={cn(
        "mt-1 flex items-center gap-0.5 transition-opacity",
        alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
      )}
    >
      <button aria-label="Sao chép" className={actionClass} onClick={onCopy} type="button">
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
      {onEdit && (
        <button aria-label="Chỉnh sửa tin nhắn" className={actionClass} onClick={onEdit} type="button">
          <PenLine className="size-3.5" />
        </button>
      )}
      {onRetry && (
        <button aria-label="Thử lại câu trả lời" className={actionClass} onClick={onRetry} type="button">
          <RefreshCw className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function Composer({
  compact,
  input,
  isBusy,
  onInputChange,
  onSubmit,
  onStop,
}: {
  compact: boolean;
  input: string;
  isBusy: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={cn("rounded-[1.65rem] border border-[#d6d2c9] bg-[#fffefa] p-3 shadow-[0_16px_45px_rgba(58,62,57,0.08)]", compact && "shadow-[0_10px_30px_rgba(58,62,57,0.07)]")}>
      <textarea
        aria-label="Tin nhắn trò chuyện"
        className={cn("w-full resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-[#303832] outline-none placeholder:text-[#929791]", compact ? "min-h-14 max-h-40" : "min-h-28")}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Hỏi về lịch học, chính sách, phòng ban hoặc bất cứ điều gì..."
        value={input}
      />
      <div className="flex items-center justify-between gap-3 pt-1">
        <button aria-label="Đính kèm tệp" className="grid size-9 place-items-center rounded-full text-[#68716b] transition hover:bg-[#efede7]" type="button">
          <Paperclip className="size-4.5" />
        </button>
        <div className="flex items-center gap-1.5">
          <button aria-label="Sử dụng micrô" className="grid size-9 place-items-center rounded-full text-[#68716b] transition hover:bg-[#efede7]" type="button">
            <Mic className="size-4.5" />
          </button>
          {isBusy ? (
            <button aria-label="Dừng tạo câu trả lời" className="grid size-9 place-items-center rounded-full bg-[#315c48] text-white transition hover:bg-[#264b3a]" onClick={onStop} type="button">
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button aria-label="Gửi tin nhắn" className="grid size-9 place-items-center rounded-full bg-[#315c48] text-white transition hover:bg-[#264b3a] disabled:cursor-not-allowed disabled:bg-[#d2d4d0]" disabled={!input.trim()} onClick={onSubmit} type="button">
              <ArrowUp className="size-4.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatWorkspace({ chatId, initialMessages, title, user }: ChatWorkspaceProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string>();
  const [editText, setEditText] = useState("");
  const [copiedId, setCopiedId] = useState<string>();
  const firstName = user.name.trim().split(/\s+/).at(-1) || user.name;

  const { error, messages, regenerate, sendMessage, status, stop } = useChat({
    generateId,
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { id: chatId },
    }),
    onFinish: () => router.refresh(),
  });
  const isBusy = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: status === "streaming" ? "auto" : "smooth",
    });
  }, [messages, status]);

  const submit = async () => {
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    await sendMessage({ text });
  };

  const submitEdit = async (messageId: string) => {
    const text = editText.trim();
    if (!text || isBusy) return;
    setEditingId(undefined);
    await sendMessage({ messageId, text });
  };

  const copyMessage = async (message: UIMessage) => {
    await navigator.clipboard.writeText(getMessageText(message));
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(undefined), 1500);
  };

  return (
    <section className="relative flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-7">
        <button className="flex max-w-[70%] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#616a64] transition hover:bg-[#ebe8e1]" type="button">
          <span className="truncate">{title}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
        <button aria-label="Tạo cuộc trò chuyện mới" className="grid size-9 place-items-center rounded-lg text-[#626b65] transition hover:bg-[#ebe8e1]" onClick={() => router.push("/chat")} type="button">
          <PenLine className="size-4.5" />
        </button>
      </header>

      {!hasMessages ? (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 pb-10 pt-4 sm:px-8">
          <div className="w-full max-w-3xl -translate-y-[4vh]">
            <div className="mb-9 text-center">
              <span className="mx-auto mb-5 grid size-11 place-items-center rounded-full bg-[#e6ddd1] text-[#c76445]">
                <Sparkles className="size-5" />
              </span>
              <h1 className="font-serif text-4xl tracking-[-0.045em] text-[#353a36] sm:text-5xl">Chào buổi tối, {firstName}</h1>
              <p className="mt-3 text-sm text-[#7b827d]">Bạn muốn tìm hiểu điều gì hôm nay?</p>
            </div>
            <Composer compact={false} input={input} isBusy={isBusy} onInputChange={setInput} onStop={stop} onSubmit={submit} />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {starters.map(({ icon: Icon, label, prompt }) => (
                <button className="flex h-9 items-center gap-2 rounded-xl border border-[#dedbd3] bg-[#eeece6] px-3 text-xs font-medium text-[#5d6660] transition hover:border-[#d2cec4] hover:bg-[#e8e5dd] hover:text-[#343d37]" key={label} onClick={() => setInput(prompt)} type="button">
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-8" ref={scrollRef}>
            <div className="mx-auto w-full max-w-3xl space-y-8 pb-4 pt-6">
              {messages.map((message) => {
                const text = getMessageText(message);
                const isUser = message.role === "user";
                return (
                  <article className={cn("group flex flex-col", isUser ? "items-end" : "items-start")} key={message.id}>
                    {isUser ? (
                      editingId === message.id ? (
                        <form className="w-full max-w-xl rounded-2xl border border-[#d6d2c9] bg-[#fffefa] p-3 shadow-sm" onSubmit={(event: FormEvent) => { event.preventDefault(); void submitEdit(message.id); }}>
                          <textarea autoFocus className="min-h-24 w-full resize-none bg-transparent px-1 text-[15px] leading-6 outline-none" onChange={(event) => setEditText(event.target.value)} value={editText} />
                          <div className="mt-2 flex justify-end gap-1">
                            <button aria-label="Hủy chỉnh sửa" className="grid size-8 place-items-center rounded-lg text-[#747b76] hover:bg-[#efede7]" onClick={() => setEditingId(undefined)} type="button"><X className="size-4" /></button>
                            <button aria-label="Gửi nội dung chỉnh sửa" className="grid size-8 place-items-center rounded-lg bg-[#315c48] text-white" type="submit"><ArrowUp className="size-4" /></button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#e9e6df] px-4 py-3 text-[15px] leading-6 text-[#303832] sm:max-w-xl">{text}</div>
                          <MessageActions copied={copiedId === message.id} onCopy={() => void copyMessage(message)} onEdit={() => { setEditingId(message.id); setEditText(text); }} />
                        </>
                      )
                    ) : (
                      <div className="w-full">
                        <div className="prose prose-stone max-w-none text-[15px] leading-7 text-[#303832] prose-headings:font-serif prose-headings:text-[#303832] prose-a:text-[#315c48] prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-[#e9e6df] prose-pre:text-[#303832]">
                          {text ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown> : <LoaderCircle className="size-5 animate-spin text-[#d76d4c]" />}
                        </div>
                        {text && <MessageActions alwaysVisible copied={copiedId === message.id} onCopy={() => void copyMessage(message)} onRetry={() => void regenerate({ messageId: message.id, body: { id: chatId } })} />}
                      </div>
                    )}
                  </article>
                );
              })}
              {status === "submitted" && <LoaderCircle className="size-5 animate-spin text-[#d76d4c]" />}
              {error && <p className="rounded-xl bg-[#f4e6df] px-4 py-3 text-sm text-[#914c39]">Không thể tạo câu trả lời. Vui lòng thử lại.</p>}
            </div>
          </div>
          <div className="shrink-0 px-4 pb-4 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <Composer compact input={input} isBusy={isBusy} onInputChange={setInput} onStop={stop} onSubmit={submit} />
              <p className="mt-2 text-center text-[11px] text-[#8a908c]">MKS Assistant có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
