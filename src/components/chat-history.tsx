"use client";

import { LoaderCircle, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

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
import { cn } from "@/lib/utils";

export type ChatHistoryItem = {
  id: string;
  isStarred: boolean;
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
  const [renamingChat, setRenamingChat] = useState<ChatHistoryItem>();
  const [renameTitle, setRenameTitle] = useState("");
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

  const starChat = async (chat: ChatHistoryItem) => {
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/history", {
        body: JSON.stringify({
          action: "star",
          id: chat.id,
          isStarred: !chat.isStarred,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Chat star update failed");

      setChats((current) =>
        current.map((item) =>
          item.id === chat.id ? { ...item, isStarred: !item.isStarred } : item,
        ),
      );
      router.refresh();
    } catch {
      setError("Không thể cập nhật cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const renameChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = renameTitle.trim();
    if (!renamingChat || !title) return;

    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/history", {
        body: JSON.stringify({ action: "rename", id: renamingChat.id, title }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Chat rename failed");

      setChats((current) =>
        current.map((chat) =>
          chat.id === renamingChat.id ? { ...chat, title } : chat,
        ),
      );
      setRenamingChat(undefined);
      router.refresh();
    } catch {
      setError("Không thể đổi tên cuộc trò chuyện. Vui lòng thử lại.");
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
              <div
                className={cn(
                  "group relative rounded-xl transition",
                  pathname === `/chat/${chat.id}`
                    ? "bg-[#dfddd6] text-[#303832]"
                    : "text-[#636b66] hover:bg-[#e4e2dc] hover:text-[#303832] has-data-[popup-open]:bg-[#e4e2dc] has-data-[popup-open]:text-[#303832]",
                )}
                key={chat.id}
              >
                <Link
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-xl py-2 pl-3 pr-10 text-sm",
                    pathname === `/chat/${chat.id}` && "font-medium",
                  )}
                  href={`/chat/${chat.id}`}
                  title={chat.title}
                >
                  {chat.isStarred && (
                    <Star className="size-3.5 shrink-0 fill-[#c46b45] text-[#c46b45]" />
                  )}
                  <span className="truncate">{chat.title}</span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        aria-label={`Tùy chọn cho cuộc trò chuyện ${chat.title}`}
                        className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-[#6f7772] opacity-100 transition hover:bg-[#d8d5ce] hover:text-[#303832] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7c8d82] data-popup-open:bg-[#d8d5ce] data-popup-open:text-[#303832] sm:opacity-0 sm:group-hover:opacity-100 sm:data-popup-open:opacity-100"
                        type="button"
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 border border-[#d7d3ca] bg-[#fbfaf6] p-1.5 text-[#46504a] shadow-[0_14px_35px_rgba(50,61,53,0.16)]"
                    side="right"
                    sideOffset={8}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        disabled={isLoading}
                        onClick={() => void starChat(chat)}
                      >
                        <Star className={cn(chat.isStarred && "fill-current")} />
                        {chat.isStarred ? "Bỏ đánh dấu sao" : "Đánh dấu sao"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isLoading}
                        onClick={() => {
                          setRenameTitle(chat.title);
                          setRenamingChat(chat);
                        }}
                      >
                        <Pencil />
                        Đổi tên
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-[#e1ddd5]" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        disabled={isLoading}
                        onClick={() => setDeletingChat(chat)}
                        variant="destructive"
                      >
                        <Trash2 />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      <Dialog
        onOpenChange={(open) => {
          if (!open && !isLoading) setRenamingChat(undefined);
        }}
        open={Boolean(renamingChat)}
      >
        <DialogContent>
          <form className="flex flex-col gap-4" onSubmit={renameChat}>
            <DialogHeader>
              <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
              <DialogDescription>
                Đặt tên ngắn gọn để bạn dễ tìm lại cuộc trò chuyện này.
              </DialogDescription>
            </DialogHeader>
            <Input
              aria-label="Tên cuộc trò chuyện"
              autoFocus
              disabled={isLoading}
              maxLength={160}
              onChange={(event) => setRenameTitle(event.target.value)}
              value={renameTitle}
            />
            <DialogFooter>
              <Button
                disabled={!renameTitle.trim() || isLoading}
                type="submit"
              >
                {isLoading && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
                {isLoading ? "Đang lưu..." : "Lưu tên"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
