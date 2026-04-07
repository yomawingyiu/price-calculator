import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2EFE9' }}>
      {/* Bauhaus colored stripe */}
      <div className="flex h-2">
        <div className="flex-1" style={{ backgroundColor: '#E63946' }} />
        <div className="flex-1" style={{ backgroundColor: '#F4C842' }} />
        <div className="flex-1" style={{ backgroundColor: '#1D3557' }} />
      </div>

      <header className="border-b-2 border-black" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-5">
          {/* Bauhaus geometric logo */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="absolute top-0 left-0 w-8 h-8 rounded-full" style={{ backgroundColor: '#E63946' }} />
            <div className="absolute bottom-0 right-0 w-7 h-7" style={{ backgroundColor: '#F4C842' }} />
            <div
              className="absolute top-1 right-0 w-0 h-0"
              style={{
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderBottom: '20px solid #1D3557',
              }}
            />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase leading-none">
              Broken Fingers Plus
            </h1>
            <p className="text-sm text-white opacity-70 tracking-widest uppercase mt-1 font-medium">
              破指自愈 · Cost & Pricing System
            </p>
          </div>

          <div className="hidden md:flex items-center gap-1 text-xs font-mono text-white opacity-50">
            <span>v1.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="border-t-2 border-black mt-12 py-6" style={{ backgroundColor: '#F2EFE9' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs uppercase tracking-widest font-medium">
          <span>BROKEN FINGERS PLUS · 破指自愈</span>
          <span className="font-mono opacity-60">2026</span>
        </div>
      </footer>
    </div>
  );
}
