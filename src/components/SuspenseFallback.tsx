export function SuspenseFallback() {
  return (
    <div className="w-full py-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border border-purple-500/30 border-t-purple-500"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
