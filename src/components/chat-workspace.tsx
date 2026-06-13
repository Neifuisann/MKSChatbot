"use client";

import {
  ArrowUp,
  ChevronRight,
  FlaskConical,
  Mic,
  Paperclip,
  PenLine,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import type { WorkspaceUser } from "@/components/workspace-sidebar";

type ChatWorkspaceProps = {
  user: WorkspaceUser;
};

const starters = [
  {
    icon: Search,
    label: "Tìm thông tin",
    prompt: "Tìm giúp mình thông tin chính thức từ nhà trường",
  },
  {
    icon: PenLine,
    label: "Soạn nội dung",
    prompt: "Giúp mình soạn một email gửi đến phòng ban",
  },
  {
    icon: FlaskConical,
    label: "Ý tưởng nghiên cứu",
    prompt: "Giúp mình phát triển một ý tưởng nghiên cứu",
  },
  {
    icon: Wrench,
    label: "Makerspace",
    prompt: "Mình muốn đăng ký sử dụng Makerspace",
  },
];

export function ChatWorkspace({ user }: ChatWorkspaceProps) {
  const [message, setMessage] = useState("");
  const firstName = user.name.trim().split(/\s+/).at(-1) || user.name;

  return (
    <section className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between px-5 sm:px-7">
          <button
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#616a64] transition hover:bg-[#ebe8e1]"
            type="button"
          >
            MKS Assistant
            <ChevronRight className="size-3.5 rotate-90" />
          </button>
          <button
            aria-label="Create new chat"
            className="grid size-9 place-items-center rounded-lg text-[#626b65] transition hover:bg-[#ebe8e1]"
            type="button"
          >
            <PenLine className="size-4.5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 pb-10 pt-4 sm:px-8">
          <div className="w-full max-w-3xl -translate-y-[4vh]">
            <div className="mb-9 text-center">
              <span className="mx-auto mb-5 grid size-11 place-items-center rounded-full bg-[#e6ddd1] text-[#c76445]">
                <Sparkles className="size-5" />
              </span>
              <h1 className="font-serif text-4xl tracking-[-0.045em] text-[#353a36] sm:text-5xl">
                Chào buổi tối, {firstName}
              </h1>
              <p className="mt-3 text-sm text-[#7b827d]">
                Bạn muốn tìm hiểu điều gì hôm nay?
              </p>
            </div>

            <div className="rounded-[1.65rem] border border-[#d6d2c9] bg-[#fffefa] p-3 shadow-[0_16px_45px_rgba(58,62,57,0.08)]">
              <textarea
                aria-label="Chat message"
                className="min-h-28 w-full resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-[#303832] outline-none placeholder:text-[#929791]"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Hỏi về lịch học, chính sách, phòng ban hoặc bất cứ điều gì..."
                value={message}
              />
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  aria-label="Attach file"
                  className="grid size-9 place-items-center rounded-full text-[#68716b] transition hover:bg-[#efede7]"
                  type="button"
                >
                  <Paperclip className="size-4.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label="Use microphone"
                    className="grid size-9 place-items-center rounded-full text-[#68716b] transition hover:bg-[#efede7]"
                    type="button"
                  >
                    <Mic className="size-4.5" />
                  </button>
                  <button
                    aria-label="Send message"
                    className="grid size-9 place-items-center rounded-full bg-[#315c48] text-white transition hover:bg-[#264b3a] disabled:cursor-not-allowed disabled:bg-[#d2d4d0]"
                    disabled={!message.trim()}
                    type="button"
                  >
                    <ArrowUp className="size-4.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {starters.map(({ icon: Icon, label, prompt }) => (
                <button
                  className="flex h-9 items-center gap-2 rounded-xl border border-[#dedbd3] bg-[#eeece6] px-3 text-xs font-medium text-[#5d6660] transition hover:border-[#d2cec4] hover:bg-[#e8e5dd] hover:text-[#343d37]"
                  key={label}
                  onClick={() => setMessage(prompt)}
                  type="button"
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
    </section>
  );
}
