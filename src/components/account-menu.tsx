import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

type AccountMenuProps = {
  avatarUrl?: string;
  email?: string;
  name?: string;
};

function getInitials(name?: string, email?: string): string {
  const source = name?.trim() || email?.split("@")[0] || "MKS";
  const words = source.split(/\s+/).filter(Boolean);

  return words
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function isSafeAvatarUrl(value?: string): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function AccountMenu({ avatarUrl, email, name }: AccountMenuProps) {
  const initials = getInitials(name, email);

  return (
    <details className="group relative z-20">
      <summary
        aria-label="Mở menu tài khoản"
        className="flex cursor-pointer list-none items-center rounded-full border border-[#d6d0c3] bg-[#fbf9f3] p-1 shadow-[0_8px_24px_rgba(53,62,54,0.08)] transition hover:border-[#bfc7bf] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#52715f] [&::-webkit-details-marker]:hidden"
      >
        <span className="grid size-9 overflow-hidden rounded-full bg-[#315c48] text-xs font-semibold text-white">
          {isSafeAvatarUrl(avatarUrl) ? (
            // The OAuth provider supplies this URL; the protocol is checked above.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-full object-cover"
              referrerPolicy="no-referrer"
              src={avatarUrl}
            />
          ) : (
            <span className="grid place-items-center">{initials}</span>
          )}
        </span>
      </summary>

      <div className="invisible absolute right-0 top-full w-64 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-open:visible group-open:opacity-100">
        <div className="rounded-2xl border border-[#ddd8cc] bg-[#fffdfa] p-2 shadow-[0_18px_50px_rgba(50,61,53,0.16)]">
          <div className="border-b border-[#ebe6dc] px-3 py-2.5">
            <p className="truncate text-sm font-medium text-[#263d31]">
              {name || "Tài khoản MKS"}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#7b8780]">{email}</p>
          </div>
          <Link
            className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#405349] transition hover:bg-[#edf1ea]"
            href="/profile"
          >
            <UserRound className="size-4" />
            Hồ sơ cá nhân
          </Link>
          <form action="/auth/signout" method="post">
            <button
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#8d4e3d] transition hover:bg-[#f6ebe5]"
              type="submit"
            >
              <LogOut className="size-4" />
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}
