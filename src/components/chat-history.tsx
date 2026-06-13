"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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
import { cn } from "@/lib/utils";

export type ChatHistoryItem = {
  id: string;
  title: string;
};

type ChatHistoryProps = {
  initialHasMore: boolean;
  initialItems: ChatHistoryItem[];
};

type ChatHistoryResponse = {
  hasMore: boolean;
  items: ChatHistoryItem[];
};

export function ChatHistory({
  initialHasMore,
  initialItems,
}: ChatHistoryProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [chats, setChats] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [previousInitialItems, setPreviousInitialItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingChat, setDeletingChat] = useState<ChatHistoryItem>();
  const [error, setError] = useState<string>();

  if (initialItems !== previousInitialItems) {
    setPreviousInitialItems(initialItems);
    setChats((current) => {
      const initialIds = new Set(initialItems.map((chat) => chat.id));
      return [...initialItems, ...current.filter((chat) => !initialIds.has(chat.id))];
    });
    setHasMore(initialHasMore);
  }

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/history?offset=${chats.length}`);
      if (!response.ok) throw new Error("Chat history request failed");

      const result = (await response.json()) as ChatHistoryResponse;
      setChats((current) => {
        const currentIds = new Set(current.map((chat) => chat.id));
        return [...current, ...result.items.filter((chat) => !currentIds.has(chat.id))];
      });
      setHasMore(result.hasMore);
    } catch {
      setError("Không thể tải thêm lịch sử. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async () => {
    if (!deletingChat) return;

    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/chat/history?id=${encodeURIComponent(deletingChat.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Chat deletion failed");

      const deletedPath = `/chat/${deletingChat.id}`;
      setChats((current) => current.filter((chat) => chat.id !== deletingChat.id));
      setDeletingChat(undefined);

      if (pathname === deletedPath) {
        router.push("/chat");
      } else {
        router.refresh();
      }
    } catch {
      setError("Không thể xóa cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (chats.length === 0) {
    return <div className="min-h-0 flex-1" />;
  }

  return (
    <>
      <div className="mt-5 flex min-h-0 flex-1 flex-col">
        <p className="shrink-0 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#90958f]">
          Gần đây
        </p>
        <nav
          aria-label="Lịch sử trò chuyện"
          className="mt-2 min-h-0 overflow-y-auto pr-1"
        >
          <div className="flex flex-col gap-0.5">
            {chats.map((chat) => (
              <div className="group relative" key={chat.id}>
                <Link
                  className={cn(
                    "block truncate rounded-xl py-2 pl-3 pr-10 text-sm transition",
                    pathname === `/chat/${chat.id}`
                      ? "bg-[#dfddd6] font-medium text-[#303832]"
                      : "text-[#636b66] hover:bg-[#e4e2dc] hover:text-[#303832]",
                  )}
                  href={`/chat/${chat.id}`}
                  title={chat.title}
                >
                  {chat.title}
                </Link>
                <button
                  aria-label={`Xóa cuộc trò chuyện ${chat.title}`}
                  className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-[#8b5c4d] opacity-100 transition hover:bg-[#f3dfd7] hover:text-[#913f29] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#a45a43] sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => setDeletingChat(chat)}
                  type="button"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#68716b] transition hover:bg-[#e4e2dc] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              onClick={() => void loadMore()}
              type="button"
            >
              {isLoading && <LoaderCircle className="size-3.5 animate-spin" />}
              {isLoading ? "Đang tải..." : "Tải thêm"}
            </button>
          )}
          {error && (
            <p aria-live="polite" className="px-3 py-2 text-xs text-[#98513d]">
              {error}
            </p>
          )}
        </nav>
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !isLoading) setDeletingChat(undefined);
        }}
        open={Boolean(deletingChat)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Cuộc trò chuyện “{deletingChat?.title}” và toàn bộ tin nhắn sẽ bị
              xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={() => void deleteChat()}
              variant="destructive"
            >
              {isLoading && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
              {isLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
