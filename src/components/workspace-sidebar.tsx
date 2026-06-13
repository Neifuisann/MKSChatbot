"use client";

import {
  Atom,
  BookOpenText,
  ChevronLeft,
  FlaskConical,
  FolderKanban,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type WorkspaceUser = {
  avatarUrl?: string;
  email?: string;
  name: string;
  studentId?: string;
};

type WorkspaceSidebarProps = {
  chatHistory: Array<{ id: string; title: string }>;
  user: WorkspaceUser;
};

const primaryItems = [
  { id: "chats", icon: MessageSquareText, label: "Trò chuyện", href: "/chat" },
  { id: "projects", icon: FolderKanban, label: "Dự án", href: undefined },
  { id: "prompts", icon: BookOpenText, label: "Thư viện prompts", href: "/prompts" },
] as const;

const schoolItems = [
  { icon: FlaskConical, label: "Gửi ý tưởng nghiên cứu" },
  { icon: Wrench, label: "Đăng ký sử dụng Makerspace" },
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function isSafeAvatarUrl(value?: string): value is string {
  if (!value) return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function WorkspaceSidebar({ chatHistory, user }: WorkspaceSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initials = getInitials(user.name);
  const pathname = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const syncSidebar = () => setIsExpanded(desktop.matches);
    syncSidebar();
    desktop.addEventListener("change", syncSidebar);
    return () => desktop.removeEventListener("change", syncSidebar);
  }, []);

  return (
    <aside
      className={cn(
        "relative z-20 flex shrink-0 flex-col border-r border-[#dedbd2] bg-[#eeece6] px-2.5 py-3 transition-[width] duration-300 ease-out",
        isExpanded
          ? "absolute inset-y-0 left-0 w-64 shadow-[12px_0_30px_rgba(50,55,51,0.08)] md:relative md:shadow-none"
          : "w-[68px]",
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-11 items-center",
          isExpanded ? "justify-between px-1.5" : "justify-center",
        )}
      >
        {isExpanded && (
          <Link
            className="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-1"
            href="/chat"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#d76d4c] text-white">
              <Atom className="size-4.5" />
            </span>
            <span className="truncate font-serif text-lg tracking-[-0.03em] text-[#353a36]">
              MKS Assistant
            </span>
          </Link>
        )}
        <button
          aria-label={isExpanded ? "Thu gọn thanh công cụ" : "Mở rộng thanh công cụ"}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-[#6b726d] transition hover:bg-[#dfddd6] hover:text-[#303732] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c8d82]"
          onClick={() => setIsExpanded((value) => !value)}
          type="button"
        >
          {isExpanded ? (
            <ChevronLeft className="size-4.5" />
          ) : (
            <Menu className="size-4.5" />
          )}
        </button>
      </div>

      <Link
        className={cn(
          "flex h-11 items-center rounded-xl text-sm font-medium text-[#36453d] transition hover:bg-[#dfddd6]",
          isExpanded ? "gap-3 px-3" : "justify-center",
        )}
        href="/chat"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#c9c7bf] bg-[#f8f7f3]">
          <Plus className="size-4" />
        </span>
        {isExpanded && <span>Cuộc trò chuyện mới</span>}
      </Link>

      <nav className="mt-4 space-y-1" aria-label="Chat tools">
        {primaryItems.map(({ href, icon: Icon, id, label }) => {
          const className = cn(
            "flex h-10 w-full items-center rounded-xl text-sm transition",
            isExpanded ? "gap-3 px-3" : "justify-center",
            pathname === href
              ? "bg-[#dfddd6] font-medium text-[#2f3933]"
              : "text-[#5f6862] hover:bg-[#e4e2dc] hover:text-[#313a35]",
          );
          const content = (
            <>
              <Icon className="size-[17px] shrink-0" />
              {isExpanded && <span className="truncate">{label}</span>}
            </>
          );

          return href ? (
            <Link
              className={className}
              href={href}
              key={id}
              title={isExpanded ? undefined : label}
            >
              {content}
            </Link>
          ) : (
            <button
              className={className}
              key={id}
              title={isExpanded ? undefined : label}
              type="button"
            >
              {content}
            </button>
          );
        })}
      </nav>

      {isExpanded && chatHistory.length > 0 && (
        <div className="mt-5 min-h-0">
          <p className="px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#90958f]">
            Gần đây
          </p>
          <nav className="mt-2 space-y-0.5" aria-label="Lịch sử trò chuyện">
            {chatHistory.map((chat) => (
              <Link
                className={cn(
                  "block truncate rounded-xl px-3 py-2 text-sm transition",
                  pathname === `/chat/${chat.id}`
                    ? "bg-[#dfddd6] font-medium text-[#303832]"
                    : "text-[#636b66] hover:bg-[#e4e2dc] hover:text-[#303832]",
                )}
                href={`/chat/${chat.id}`}
                key={chat.id}
                title={chat.title}
              >
                {chat.title}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div className="my-4 border-t border-[#d9d6ce]" />

      <nav className="space-y-1" aria-label="School actions">
        {schoolItems.map(({ icon: Icon, label }) => (
          <button
            className={cn(
              "flex min-h-10 w-full items-center rounded-xl text-left text-sm leading-5 text-[#5f6862] transition hover:bg-[#e4e2dc] hover:text-[#313a35]",
              isExpanded ? "gap-3 px-3 py-2" : "justify-center",
            )}
            key={label}
            title={isExpanded ? undefined : label}
            type="button"
          >
            <Icon className="size-[17px] shrink-0" />
            {isExpanded && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <details className="group relative">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center rounded-xl py-2 transition hover:bg-[#dfddd6] [&::-webkit-details-marker]:hidden",
              isExpanded ? "gap-3 px-2" : "justify-center",
            )}
          >
            <span className="grid size-9 shrink-0 overflow-hidden rounded-full bg-[#315c48] text-xs font-semibold text-white">
              {isSafeAvatarUrl(user.avatarUrl) ? (
                // OAuth providers supply this URL; only HTTPS URLs are rendered.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                  src={user.avatarUrl}
                />
              ) : (
                <span className="grid place-items-center">{initials}</span>
              )}
            </span>
            {isExpanded && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[#303a34]">
                    {user.name}
                  </span>
                  <span className="block truncate text-[11px] text-[#7a827d]">
                    {user.studentId || "Student ID not set"}
                  </span>
                </span>
                <MoreHorizontal className="size-4 shrink-0 text-[#767d78]" />
              </>
            )}
          </summary>

          <div
            className={cn(
              "absolute bottom-12 z-30 hidden w-56 rounded-2xl border border-[#d7d3ca] bg-[#fbfaf6] p-1.5 shadow-[0_18px_50px_rgba(50,61,53,0.16)] group-open:block",
              isExpanded ? "left-0" : "left-12",
            )}
          >
            <div className="border-b border-[#e8e4dc] px-3 py-2.5">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="mt-0.5 truncate text-xs text-[#7b837e]">
                {user.email}
              </p>
            </div>
            <Link
              className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#49564f] hover:bg-[#eeece6]"
              href="/profile"
            >
              <UserRound className="size-4" />
              Profile
            </Link>
            <form action="/auth/signout" method="post">
              <button
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#98513d] hover:bg-[#f5e9e3]"
                type="submit"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </form>
          </div>
        </details>
      </div>
    </aside>
  );
}
