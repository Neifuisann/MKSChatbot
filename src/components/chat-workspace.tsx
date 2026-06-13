"use client";

import { useChat } from "@ai-sdk/react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  FlaskConical,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mic,
  Paperclip,
  Pencil,
  PenLine,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Square,
  Star,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DefaultChatTransport, generateId, type UIMessage } from "ai";

import type { WorkspaceUser } from "@/components/workspace-sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getMessageText } from "@/lib/chat/messages";
import { cn } from "@/lib/utils";

type ChatWorkspaceProps = {
  chatId?: string;
  initialIsStarred: boolean;
  initialMessages: UIMessage[];
  initialShareToken?: string | null;
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

export function ChatWorkspace({
  chatId,
  initialIsStarred,
  initialMessages,
  initialShareToken,
  title,
  user,
}: ChatWorkspaceProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeChatId, setActiveChatId] = useState(chatId);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [renameTitle, setRenameTitle] = useState(title);
  const [actionError, setActionError] = useState<string>();
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string>();
  const [editText, setEditText] = useState("");
  const [copiedId, setCopiedId] = useState<string>();
  const firstName = user.name.trim().split(/\s+/).at(-1) || user.name;

  const { error, messages, regenerate, sendMessage, status, stop } = useChat({
    generateId,
    ...(chatId ? { id: chatId } : {}),
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
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
    const nextChatId = activeChatId ?? crypto.randomUUID();
    if (!activeChatId) {
      setActiveChatId(nextChatId);
      window.history.replaceState(null, "", `/chat/${nextChatId}`);
    }
    setInput("");
    await sendMessage({ text }, { body: { id: nextChatId } });
  };

  const submitEdit = async (messageId: string) => {
    const text = editText.trim();
    if (!text || isBusy || !activeChatId) return;
    setEditingId(undefined);
    await sendMessage({ messageId, text }, { body: { id: activeChatId } });
  };

  const copyMessage = async (message: UIMessage) => {
    await navigator.clipboard.writeText(getMessageText(message));
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(undefined), 1500);
  };

  const updateChat = async (
    body:
      | { action: "rename"; id: string; title: string }
      | { action: "star"; id: string; isStarred: boolean },
  ) => {
    const response = await fetch("/api/chat/history", {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Chat update failed");
  };

  const toggleStar = async () => {
    if (!chatId) return;
    setActionError(undefined);
    setIsActionLoading(true);
    try {
      await updateChat({ action: "star", id: chatId, isStarred: !isStarred });
      setIsStarred((value) => !value);
      router.refresh();
    } catch {
      setActionError("Không thể cập nhật cuộc trò chuyện.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const renameChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = renameTitle.trim();
    if (!chatId || !nextTitle) return;
    setActionError(undefined);
    setIsActionLoading(true);
    try {
      await updateChat({ action: "rename", id: chatId, title: nextTitle });
      setCurrentTitle(nextTitle);
      setIsRenameOpen(false);
      router.refresh();
    } catch {
      setActionError("Không thể đổi tên cuộc trò chuyện.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const deleteChat = async () => {
    if (!chatId) return;
    setActionError(undefined);
    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/chat/history?id=${encodeURIComponent(chatId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Chat deletion failed");
      router.push("/chat");
      router.refresh();
    } catch {
      setActionError("Không thể xóa cuộc trò chuyện.");
      setIsActionLoading(false);
    }
  };

  const enableSharing = async () => {
    if (!chatId) return;
    setActionError(undefined);
    setIsActionLoading(true);
    try {
      const response = await fetch("/api/chat/share", {
        body: JSON.stringify({ id: chatId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error("Share creation failed");
      const result = (await response.json()) as { token: string };
      setShareToken(result.token);
    } catch {
      setActionError("Không thể tạo liên kết chia sẻ.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const disableSharing = async () => {
    if (!chatId) return;
    setActionError(undefined);
    setIsActionLoading(true);
    try {
      const response = await fetch("/api/chat/share", {
        body: JSON.stringify({ id: chatId }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Share revocation failed");
      setShareToken(undefined);
    } catch {
      setActionError("Không thể tắt liên kết chia sẻ.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareToken) return;
    await navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    setIsLinkCopied(true);
    window.setTimeout(() => setIsLinkCopied(false), 1500);
  };

  return (
    <section className="relative flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-7">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={!chatId}
            render={
              <button
                className="flex max-w-[70%] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#616a64] transition hover:bg-[#ebe8e1] data-popup-open:bg-[#ebe8e1]"
                type="button"
              />
            }
          >
            <span className="truncate">{currentTitle}</span>
            <ChevronDown className="size-3.5 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-44 border border-[#d7d3ca] bg-[#fbfaf6] p-1.5 text-[#46504a] shadow-[0_14px_35px_rgba(50,61,53,0.16)]"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem disabled={isActionLoading} onClick={() => void toggleStar()}>
                <Star className={cn(isStarred && "fill-current")} />
                {isStarred ? "Bỏ đánh dấu sao" : "Đánh dấu sao"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isActionLoading}
                onClick={() => {
                  setRenameTitle(currentTitle);
                  setIsRenameOpen(true);
                }}
              >
                <Pencil />
                Đổi tên
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#e1ddd5]" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={isActionLoading}
                onClick={() => setIsDeleteOpen(true)}
                variant="destructive"
              >
                <Trash2 />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          aria-label="Chia sẻ cuộc trò chuyện"
          className="grid size-9 place-items-center rounded-lg text-[#626b65] transition hover:bg-[#ebe8e1] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!chatId}
          onClick={() => setIsShareOpen(true)}
          type="button"
        >
          <Share2 className="size-4.5" />
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
                        {text && <MessageActions alwaysVisible copied={copiedId === message.id} onCopy={() => void copyMessage(message)} onRetry={activeChatId ? () => void regenerate({ messageId: message.id, body: { id: activeChatId } }) : undefined} />}
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

      <Dialog onOpenChange={setIsShareOpen} open={isShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ cuộc trò chuyện</DialogTitle>
            <DialogDescription>
              Bất kỳ ai có liên kết công khai đều có thể xem cuộc trò chuyện ở chế độ chỉ đọc.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl border border-[#dedbd2]">
            <button
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f0eee8]",
                !shareToken && "bg-[#eeece6]",
              )}
              disabled={isActionLoading}
              onClick={() => void disableSharing()}
              type="button"
            >
              <LockKeyhole className="size-4.5 shrink-0 text-[#68716b]" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">Giữ riêng tư</span>
                <span className="block text-xs text-[#7b827d]">Chỉ bạn có quyền truy cập</span>
              </span>
              {!shareToken && <Check className="size-4 text-[#315c48]" />}
            </button>
            <button
              className={cn(
                "flex w-full items-center gap-3 border-t border-[#dedbd2] px-4 py-3 text-left transition hover:bg-[#f0eee8]",
                shareToken && "bg-[#eeece6]",
              )}
              disabled={isActionLoading}
              onClick={() => void enableSharing()}
              type="button"
            >
              <Globe2 className="size-4.5 shrink-0 text-[#68716b]" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">Tạo liên kết công khai</span>
                <span className="block text-xs text-[#7b827d]">Ai có liên kết đều có thể xem</span>
              </span>
              {shareToken && <Check className="size-4 text-[#315c48]" />}
            </button>
          </div>
          {shareToken && (
            <div className="flex gap-2 rounded-xl border border-[#dedbd2] bg-[#eeece6] p-2">
              <Input
                aria-label="Liên kết chia sẻ"
                readOnly
                value={`/share/${shareToken}`}
              />
              <Button onClick={() => void copyShareLink()} type="button">
                {isLinkCopied ? "Đã sao chép" : "Sao chép"}
              </Button>
            </div>
          )}
          {actionError && <p className="text-sm text-[#98513d]">{actionError}</p>}
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsRenameOpen} open={isRenameOpen}>
        <DialogContent>
          <form className="flex flex-col gap-4" onSubmit={renameChat}>
            <DialogHeader>
              <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
              <DialogDescription>Đặt tên ngắn gọn để dễ tìm lại cuộc trò chuyện.</DialogDescription>
            </DialogHeader>
            <Input
              aria-label="Tên cuộc trò chuyện"
              autoFocus
              disabled={isActionLoading}
              maxLength={160}
              onChange={(event) => setRenameTitle(event.target.value)}
              value={renameTitle}
            />
            <DialogFooter>
              <Button disabled={!renameTitle.trim() || isActionLoading} type="submit">
                {isActionLoading && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
                {isActionLoading ? "Đang lưu..." : "Lưu tên"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Cuộc trò chuyện “{currentTitle}” và toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isActionLoading}
              onClick={() => void deleteChat()}
              variant="destructive"
            >
              {isActionLoading && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
              {isActionLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
