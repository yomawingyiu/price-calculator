import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      <header className="border-b" style={{ borderColor: '#E8E4DC' }}>
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: '#8B8580' }}>
                Est. 2025 — Hong Kong
              </div>
              <h1 className="font-serif text-5xl md:text-6xl font-light leading-none tracking-tight" style={{ color: '#1A1A1A' }}>
                Broken Fingers <em className="font-medium">Plus</em>
              </h1>
              <div className="mt-4 text-sm font-light tracking-wide" style={{ color: '#4A4A48' }}>
                破指自愈 — Cost &amp; Pricing Atelier
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8B8580' }}>
                Volume
              </div>
              <div className="font-serif text-2xl font-light italic mt-1" style={{ color: '#1A1A1A' }}>
                I
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {children}
      </main>

      <footer className="border-t mt-20 py-10" style={{ borderColor: '#E8E4DC' }}>
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8B8580' }}>
            Broken Fingers Plus &nbsp;·&nbsp; 破指自愈
          </div>
          <div className="font-serif text-sm italic" style={{ color: '#8B8580' }}>
            Made with care, MMXXVI
          </div>
        </div>
      </footer>
    </div>
  );
}
