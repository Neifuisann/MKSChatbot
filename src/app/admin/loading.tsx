export default function AdminLoading() {
  return (
    <section
      aria-label="Đang tải trang quản lý"
      aria-live="polite"
      className="flex min-w-0 flex-1 items-center justify-center bg-transparent"
    >
      <span className="size-7 animate-spin rounded-full border-2 border-[#c5d2ca] border-t-[#d76d4c]" />
    </section>
  );
}
