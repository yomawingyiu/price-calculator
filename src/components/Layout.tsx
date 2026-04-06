import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amber-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🤚</span>
          <div>
            <h1 className="text-xl font-bold tracking-wide">破指自愈 Broken Fingers Plus</h1>
            <p className="text-amber-200 text-sm">產品成本及定價計算器</p>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
