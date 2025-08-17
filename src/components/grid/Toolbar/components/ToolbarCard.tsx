"use client";

export default function ToolbarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-[2px] px-3 py-2 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,.05)]">
      {children}
    </div>
  );
}
