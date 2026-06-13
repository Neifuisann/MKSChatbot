import type { User } from "@supabase/supabase-js";
import Link from "next/link";

import { AccountMenu } from "@/components/account-menu";
import { BrandMark } from "@/components/brand-mark";

type AuthenticatedHeaderProps = {
  user: User;
};

function getMetadataString(user: User, key: string): string | undefined {
  const value = user.user_metadata[key];
  return typeof value === "string" ? value : undefined;
}

export function AuthenticatedHeader({ user }: AuthenticatedHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
      <Link href="/chat" aria-label="MKS School Assistant">
        <BrandMark />
      </Link>
      <AccountMenu
        avatarUrl={
          getMetadataString(user, "avatar_url") ??
          getMetadataString(user, "picture")
        }
        email={user.email}
        name={
          getMetadataString(user, "full_name") ?? getMetadataString(user, "name")
        }
      />
    </header>
  );
}
