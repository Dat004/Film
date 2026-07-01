export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="text-sm font-medium text-white/70">Đang tải...</span>
      </div>
    </div>
  );
}
