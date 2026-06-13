import Link from "next/link";

import { AccountMenu } from "@/components/account-menu";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata;

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" aria-label="MKS School home">
        <BrandMark />
      </Link>
      <nav className="hidden items-center gap-7 text-sm text-[#59665f] md:flex">
        <Link className="transition-colors hover:text-[#24352d]" href="#support">
          Hỗ trợ
        </Link>
        <Link className="transition-colors hover:text-[#24352d]" href="#how-it-works">
          Cách hoạt động
        </Link>
        <Link className="transition-colors hover:text-[#24352d]" href="#trust">
          Nguồn thông tin
        </Link>
      </nav>
      {user ? (
        <AccountMenu
          avatarUrl={
            typeof metadata?.avatar_url === "string"
              ? metadata.avatar_url
              : typeof metadata?.picture === "string"
                ? metadata.picture
                : undefined
          }
          email={user.email}
          name={
            typeof metadata?.full_name === "string"
              ? metadata.full_name
              : typeof metadata?.name === "string"
                ? metadata.name
                : undefined
          }
        />
      ) : (
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-full border-[#d6d0c3] bg-[#f7f3e9] px-5 text-[#24352d] shadow-none hover:bg-white",
          )}
        >
          Đăng nhập
        </Link>
      )}
    </header>
  );
}
