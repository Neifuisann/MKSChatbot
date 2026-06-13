import { NextResponse } from "next/server";

import { createChatShare, revokeChatShare } from "@/lib/chat/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { chatShareSchema } from "@/schemas/chat";

async function getAuthenticatedShareRequest(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const parsed = chatShareSchema.safeParse(await request.json());
  return { parsed, user };
}

export async function POST(request: Request): Promise<Response> {
  const { parsed, user } = await getAuthenticatedShareRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid share request" }, { status: 400 });
  }

  try {
    const token = await createChatShare({ chatId: parsed.data.id, userId: user.id });
    if (!token) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to create chat share", error);
    return NextResponse.json({ error: "Unable to share chat" }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const { parsed, user } = await getAuthenticatedShareRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid share request" }, { status: 400 });
  }

  try {
    const revoked = await revokeChatShare({ chatId: parsed.data.id, userId: user.id });
    if (!revoked) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to revoke chat share", error);
    return NextResponse.json({ error: "Unable to revoke share" }, { status: 500 });
  }
}
