"use client";

import {
  ArrowLeft,
  BookOpenText,
  Boxes,
  FlaskConical,
  Gauge,
  LogOut,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  email?: string;
  name: string;
};

const items = [
  { href: "/admin", icon: Gauge, label: "Tổng quan" },
  { href: "/admin/research-ideas", icon: FlaskConical, label: "Ý tưởng nghiên cứu" },
  { href: "/admin/makerspace", icon: Boxes, label: "Thiết bị Makerspace" },
  { href: "/admin/prompts", icon: BookOpenText, label: "Kho prompt" },
  { href: "/admin/users", icon: UsersRound, label: "Người dùng" },
] as const;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AdminSidebar({ email, name }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[76px] shrink-0 flex-col border-r border-[#315346] bg-[#29473b] px-2.5 py-4 text-[#edf4f0] md:w-64 md:px-4">
      <Link className="flex h-11 items-center justify-center gap-3 md:justify-start" href="/admin">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#d76d4c] text-white">
          <ShieldCheck className="size-4.5" />
        </span>
        <span className="hidden font-serif text-lg tracking-[-0.03em] md:block">
          MKS Quản lý
        </span>
      </Link>

      <nav aria-label="Quản lý hệ thống" className="mt-8 flex flex-col gap-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              className={cn(
                "flex h-11 items-center justify-center rounded-xl text-sm transition md:justify-start md:gap-3 md:px-3",
                active
                  ? "bg-[#e7efe9] font-medium text-[#183126]"
                  : "text-[#c8d6cf] hover:bg-white/10 hover:text-white",
              )}
              href={href}
              key={href}
              title={label}
            >
              <Icon className="size-[17px] shrink-0" />
              <span className="hidden truncate md:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link
          className="flex h-10 items-center justify-center rounded-xl text-[#c8d6cf] transition hover:bg-white/10 hover:text-white md:justify-start md:gap-3 md:px-3"
          href="/chat"
          title="Về trang người dùng"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden text-sm md:block">Về trang người dùng</span>
        </Link>
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-center gap-3 md:justify-start md:px-1">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d76d4c] text-xs font-semibold text-white">
              {initials(name)}
            </span>
            <span className="hidden min-w-0 flex-1 md:block">
              <span className="block truncate text-sm font-medium text-white">{name}</span>
              <span className="block truncate text-[11px] text-[#b3c5bc]">{email}</span>
            </span>
          </div>
          <form action="/auth/signout" className="mt-2" method="post">
            <button
              className="flex h-10 w-full items-center justify-center rounded-xl text-[#f0b8a7] transition hover:bg-white/10 hover:text-white md:justify-start md:gap-3 md:px-3"
              title="Đăng xuất"
              type="submit"
            >
              <LogOut className="size-4" />
              <span className="hidden text-sm md:block">Đăng xuất</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
