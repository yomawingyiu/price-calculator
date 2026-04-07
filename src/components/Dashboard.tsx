import type { Product } from '../types';
import { totalCost, retailPrice, profitMargin, materialCost, formatCurrency, formatPercent } from '../utils/calculations';

export function Dashboard({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const avgMargin = products.reduce((sum, p) => sum + profitMargin(p.costs, p.pricing), 0) / products.length;
  const totalRevenue = products.reduce((sum, p) => sum + retailPrice(p.costs, p.pricing), 0);
  const totalCosts = products.reduce((sum, p) => sum + totalCost(p.costs), 0);

  // Cost breakdown
  const totalLabor = products.reduce((s, p) => s + p.costs.laborCost, 0);
  const totalLeather = products.reduce((s, p) => s + p.costs.leatherCostApple + p.costs.leatherCostGoat, 0);
  const totalHardware = products.reduce((s, p) => s + p.costs.hardwareCost, 0);
  const totalPackaging = products.reduce((s, p) => s + p.costs.packagingCost, 0);
  const totalShipping = products.reduce((s, p) => s + p.costs.shippingCost, 0);
  const totalMat = products.reduce((s, p) => s + materialCost(p.costs), 0);

  const breakdown = [
    { label: 'Labor', cn: '手工費', value: totalLabor },
    { label: 'Leather', cn: '皮料', value: totalLeather },
    { label: 'Hardware', cn: '五金', value: totalHardware },
    { label: 'Packaging', cn: '包裝', value: totalPackaging },
    { label: 'Shipping', cn: '運費', value: totalShipping },
  ];
  const costTotal = totalLabor + totalMat || 1;

  // Category breakdown
  const categories = new Map<string, number>();
  products.forEach(p => categories.set(p.category, (categories.get(p.category) || 0) + 1));

  return (
    <section className="mb-16">
      {/* Editorial section header */}
      <div className="flex items-baseline gap-4 mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8B8580' }}>
          № 01
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: '#E8E4DC' }} />
        <h2 className="font-serif text-2xl italic font-light" style={{ color: '#1A1A1A' }}>
          Overview
        </h2>
      </div>

      {/* Hero stats - editorial layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 mb-16">
        <Stat label="Products" cn="產品數量" value={`${products.length}`} suffix="款" />
        <Stat label="Avg. Margin" cn="平均利潤率" value={formatPercent(avgMargin).replace('%', '')} suffix="%" />
        <Stat label="Total Revenue" cn="總零售值" value={formatCurrency(totalRevenue)} />
        <Stat label="Total Cost" cn="總成本" value={formatCurrency(totalCosts)} />
      </div>

      <div className="h-px mb-12" style={{ backgroundColor: '#E8E4DC' }} />

      {/* Cost structure - minimal editorial */}
      <div className="mb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h3 className="font-serif text-xl font-light italic" style={{ color: '#1A1A1A' }}>
            Cost Composition
          </h3>
          <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8B8580' }}>
            成本結構 · {formatCurrency(costTotal)}
          </div>
        </div>

        {/* Hairline bar */}
        <div className="flex h-1 mb-8" style={{ backgroundColor: '#F0EDE6' }}>
          {breakdown.map((b, i) => {
            const opacities = [1, 0.78, 0.6, 0.42, 0.24];
            return (
              <div
                key={b.label}
                className="h-full transition-all"
                style={{
                  width: `${(b.value / costTotal) * 100}%`,
                  backgroundColor: '#1A1A1A',
                  opacity: opacities[i],
                }}
                title={`${b.label}: ${formatCurrency(b.value)}`}
              />
            );
          })}
        </div>

        {/* Legend - elegant grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {breakdown.map((b, i) => {
            const opacities = [1, 0.78, 0.6, 0.42, 0.24];
            return (
              <div key={b.label} className="flex items-start gap-3">
                <div
                  className="w-2 h-2 mt-2 flex-shrink-0"
                  style={{ backgroundColor: '#1A1A1A', opacity: opacities[i] }}
                />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
                    {b.label}
                  </div>
                  <div className="font-serif text-lg font-light leading-tight mt-0.5" style={{ color: '#1A1A1A' }}>
                    {((b.value / costTotal) * 100).toFixed(1)}<span className="text-xs italic">%</span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#8B8580' }}>
                    {b.cn}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px mb-12" style={{ backgroundColor: '#E8E4DC' }} />

      {/* Categories */}
      <div>
        <div className="flex items-baseline justify-between mb-6">
          <h3 className="font-serif text-xl font-light italic" style={{ color: '#1A1A1A' }}>
            Categories
          </h3>
          <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8B8580' }}>
            類別分佈
          </div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {[...categories.entries()].map(([cat, count]) => (
            <div key={cat} className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-light italic" style={{ color: '#B85432' }}>
                {count}
              </span>
              <span className="text-xs tracking-wide" style={{ color: '#4A4A48' }}>
                {cat}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, cn, value, suffix }: { label: string; cn: string; value: string; suffix?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: '#8B8580' }}>
        {label}
      </div>
      <div className="font-serif text-5xl font-light leading-none tracking-tight" style={{ color: '#1A1A1A' }}>
        {value}
        {suffix && <span className="text-2xl ml-1 italic font-light" style={{ color: '#8B8580' }}>{suffix}</span>}
      </div>
      <div className="text-[10px] mt-3 tracking-wide" style={{ color: '#8B8580' }}>
        {cn}
      </div>
    </div>
  );
}
