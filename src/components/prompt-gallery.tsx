"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  mapPromptRow,
  type PromptRow,
  type ResearchPrompt,
} from "@/lib/prompts/research-prompts";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

function PromptCard({
  onOpen,
  prompt,
}: {
  onOpen: (prompt: ResearchPrompt) => void;
  prompt: ResearchPrompt;
}) {
  return (
    <button
      className="group flex min-h-56 flex-col rounded-[1.35rem] border border-[#d9d3c7] bg-[#fbfaf6] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#b9b0a1] hover:shadow-[0_18px_45px_rgba(60,53,43,0.09)]"
      onClick={() => onOpen(prompt)}
      type="button"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.12em] text-[#a04f38]">
          {prompt.code}
        </span>
        <span className="rounded-full border border-[#e0d9cc] px-2.5 py-1 text-[10px] text-[#766e63]">
          {prompt.category}
        </span>
      </div>
      <h2 className="mt-5 font-serif text-[22px] leading-7 tracking-[-0.025em] text-[#302d28]">
        {prompt.title}
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#706a61]">
        {prompt.purpose}
      </p>
      <span className="mt-auto pt-6 text-xs font-medium text-[#8e4d39] transition group-hover:text-[#bd5f42]">
        Xem prompt →
      </span>
    </button>
  );
}

export function PromptGallery() {
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("Tất cả");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [prompts, setPrompts] = useState<ResearchPrompt[]>([]);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<ResearchPrompt | null>(
    null,
  );
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(query.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function loadCategories() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("prompts")
        .select("category")
        .eq("is_active", true)
        .order("category");

      setCategories(
        Array.from(new Set((data ?? []).map((row) => row.category))),
      );
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadPrompts() {
      setIsLoading(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      let request = supabase
        .from("prompts")
        .select("id, code, category, title, purpose, content, tip, sort_order", {
          count: "exact",
        })
        .eq("is_active", true)
        .order("sort_order")
        .order("code")
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (category !== "Tất cả") {
        request = request.eq("category", category);
      }

      if (searchQuery) {
        request = request.textSearch("search_document", searchQuery, {
          config: "simple",
          type: "websearch",
        });
      }

      const { count, data, error: requestError } = await request;

      if (ignore) return;

      if (requestError) {
        setError("Không thể tải thư viện prompt lúc này.");
        setPrompts([]);
        setTotal(0);
      } else {
        setPrompts((data as PromptRow[]).map(mapPromptRow));
        setTotal(count ?? 0);
      }

      setIsLoading(false);
    }

    void loadPrompts();

    return () => {
      ignore = true;
    };
  }, [category, page, searchQuery]);

  async function copyPrompt(prompt: ResearchPrompt) {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-12 lg:py-12">
          <header className="border-b border-[#d8d1c5] pb-9">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#a04f38]">
                MKS Research Collection · 32 prompts
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-[1.02] tracking-[-0.055em] text-[#2e2b27] sm:text-6xl">
                Bắt đầu nghiên cứu với một câu hỏi tốt.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#706a61]">
                Bộ prompt dành cho sinh viên HCM-UTE, từ khám phá ý tưởng đến
                bảo vệ kết quả trước hội đồng.
              </p>
            </div>
          </header>

          <div className="sticky top-0 z-10 -mx-2 bg-[#f7f5ef]/95 px-2 py-5 backdrop-blur">
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a837a]" />
              <input
                aria-label="Tìm prompt"
                className="h-11 w-full rounded-xl border border-[#d7d0c4] bg-[#fbfaf6] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#969087] focus:border-[#9f9485] focus:ring-2 focus:ring-[#d8c8ba]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên, mục đích hoặc mã prompt..."
                value={query}
              />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {["Tất cả", ...categories].map((item) => (
                <button
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs transition",
                    category === item
                      ? "border-[#35312c] bg-[#35312c] text-[#f8f5ee]"
                      : "border-[#d8d1c5] bg-[#f8f5ee] text-[#706a61] hover:border-[#a9a094]",
                  )}
                  key={item}
                  onClick={() => {
                    setCategory(item);
                    setPage(1);
                  }}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-[#817a71]">
              {isLoading ? "Đang tải prompt..." : `${total} prompt`}
            </p>
          </div>
          {error && (
            <div className="mb-4 rounded-xl border border-[#e2c3b8] bg-[#faeee9] px-4 py-3 text-sm text-[#98513d]">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} onOpen={setSelectedPrompt} prompt={prompt} />
            ))}
          </div>
          {!isLoading && !error && prompts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#cfc7bb] py-20 text-center text-sm text-[#807970]">
              Không tìm thấy prompt phù hợp.
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                aria-label="Trang trước"
                className="grid size-9 place-items-center rounded-xl border border-[#d8d1c5] bg-[#fbfaf6] text-[#625e57] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((value) => value - 1)}
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-xs text-[#756e64]">
                Trang {page} / {totalPages}
              </span>
              <button
                aria-label="Trang sau"
                className="grid size-9 place-items-center rounded-xl border border-[#d8d1c5] bg-[#fbfaf6] text-[#625e57] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage((value) => value + 1)}
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      {selectedPrompt && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#211d18]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          role="dialog"
        >
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[1.75rem] border border-[#d9d1c4] bg-[#fbfaf6] p-6 shadow-2xl sm:rounded-[1.75rem] sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-[#a04f38]">
                  {selectedPrompt.code} · {selectedPrompt.category}
                </p>
                <h2 className="mt-3 font-serif text-3xl tracking-[-0.035em]">
                  {selectedPrompt.title}
                </h2>
              </div>
              <button
                aria-label="Đóng"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[#ddd5c9] text-[#6f685f] hover:bg-[#eee9e0]"
                onClick={() => setSelectedPrompt(null)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#756e64]">
              {selectedPrompt.purpose}
            </p>
            <div className="mt-6 rounded-2xl border border-[#ddd5c8] bg-[#f2eee6] p-5 text-sm leading-7 text-[#39352f]">
              {selectedPrompt.content}
            </div>
            <p className="mt-4 border-l-2 border-[#d66c4b] pl-3 text-xs leading-5 text-[#7b7369]">
              {selectedPrompt.tip}
            </p>
            <button
              className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d66c4b] text-sm font-medium text-white transition hover:bg-[#c65d3e]"
              onClick={() => copyPrompt(selectedPrompt)}
              type="button"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Đã sao chép" : "Sao chép prompt"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
