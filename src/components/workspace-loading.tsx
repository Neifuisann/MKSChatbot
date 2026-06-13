export function WorkspaceLoading() {
  return (
    <section
      aria-label="Đang tải trang"
      aria-live="polite"
      className="flex min-w-0 flex-1 items-center justify-center bg-[#f7f5ef]"
    >
      <span className="size-7 animate-spin rounded-full border-2 border-[#d8d3ca] border-t-[#d76d4c]" />
    </section>
  );
}
