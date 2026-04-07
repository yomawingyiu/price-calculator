import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      <header
        className="border-b sticky top-0 z-20 backdrop-blur"
        style={{ borderColor: '#E8E4DC', backgroundColor: 'rgba(250,250,247,0.92)' }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-6">
          {/* Mark */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-sm"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              <span className="font-serif text-white text-lg italic leading-none">b</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-serif text-base leading-none" style={{ color: '#1A1A1A' }}>
                Broken Fingers <em>Plus</em>
              </div>
              <div className="text-[10px] mt-0.5 tracking-wider" style={{ color: '#8B8580' }}>
                破指自愈 · COST & PRICING
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px hidden md:block" style={{ backgroundColor: '#E8E4DC' }} />

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] tracking-wide" style={{ color: '#4A4A48' }}>
            <button className="font-semibold" style={{ color: '#1A1A1A' }}>
              Dashboard
            </button>
            <button className="hover:text-stone-900 transition-colors">Products</button>
            <button className="hover:text-stone-900 transition-colors">Reports</button>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] tracking-wider" style={{ color: '#8B8580' }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#5C8A6E' }}
              />
              LIVE · LOCALHOST
            </div>
            <div className="text-[10px] tabular font-mono" style={{ color: '#8B8580' }}>
              v1.2
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">{children}</main>

      <footer className="border-t mt-16 py-6" style={{ borderColor: '#E8E4DC' }}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between text-[10px] tracking-wider" style={{ color: '#8B8580' }}>
          <span>BROKEN FINGERS PLUS · 破指自愈 · 2026</span>
          <span className="font-mono">LOCAL DATA · localStorage</span>
        </div>
      </footer>
    </div>
  );
}
