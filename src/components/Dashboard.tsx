import type { Product } from '../types';
import { totalCost, retailPrice, profitMargin, materialCost, formatCurrency, formatPercent } from '../utils/calculations';

export function Dashboard({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const margins = products.map(p => profitMargin(p.costs, p.pricing));
  const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
  const maxMargin = Math.max(...margins);
  const minMargin = Math.min(...margins);
  const aboveTarget = margins.filter(m => m >= 0.7).length;
  const belowTarget = margins.filter(m => m < 0.5).length;

  const retailPrices = products.map(p => retailPrice(p.costs, p.pricing));
  const totalRevenue = retailPrices.reduce((a, b) => a + b, 0);
  const maxPrice = Math.max(...retailPrices);
  const avgPrice = totalRevenue / products.length;

  const costsArr = products.map(p => totalCost(p.costs));
  const totalCosts = costsArr.reduce((a, b) => a + b, 0);
  const avgCost = totalCosts / products.length;

  // Cost breakdown
  const totalLabor = products.reduce((s, p) => s + p.costs.laborCost, 0);
  const totalLeather = products.reduce((s, p) => s + p.costs.leatherCostApple + p.costs.leatherCostGoat, 0);
  const totalHardware = products.reduce((s, p) => s + p.costs.hardwareCost, 0);
  const totalPackaging = products.reduce((s, p) => s + p.costs.packagingCost, 0);
  const totalShipping = products.reduce((s, p) => s + p.costs.shippingCost, 0);
  const totalMat = products.reduce((s, p) => s + materialCost(p.costs), 0);
  const costTotal = totalLabor + totalMat || 1;

  const breakdown = [
    { label: 'Labor', cn: '手工費', value: totalLabor, opacity: 1 },
    { label: 'Leather', cn: '皮料', value: totalLeather, opacity: 0.78 },
    { label: 'Hardware', cn: '五金', value: totalHardware, opacity: 0.58 },
    { label: 'Packaging', cn: '包裝', value: totalPackaging, opacity: 0.4 },
    { label: 'Shipping', cn: '運費', value: totalShipping, opacity: 0.22 },
  ];

  // Category stats
  const catStats = new Map<string, { count: number; revenue: number; cost: number; margins: number[] }>();
  products.forEach(p => {
    const s = catStats.get(p.category) || { count: 0, revenue: 0, cost: 0, margins: [] };
    s.count += 1;
    s.revenue += retailPrice(p.costs, p.pricing);
    s.cost += totalCost(p.costs);
    s.margins.push(profitMargin(p.costs, p.pricing));
    catStats.set(p.category, s);
  });

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <div className="label-xs mb-1">Overview</div>
          <h2 className="font-serif text-2xl" style={{ color: '#1A1A1A' }}>
            <em>Dashboard</em> <span className="text-sm" style={{ color: '#8B8580' }}>· 總覽</span>
          </h2>
        </div>
        <div className="text-[10px] tracking-wider text-right" style={{ color: '#8B8580' }}>
          Last updated <span className="font-mono tabular">just now</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Products"
          cn="產品數量"
          value={`${products.length}`}
          unit="款"
          footer={
            <div className="flex items-baseline gap-3 text-[10px]" style={{ color: '#8B8580' }}>
              <span><span className="font-mono tabular font-semibold" style={{ color: '#1A1A1A' }}>{catStats.size}</span> categories</span>
              <span>·</span>
              <span>active</span>
            </div>
          }
          visual={
            <div className="flex items-end gap-0.5 h-6 mt-2">
              {[...catStats.values()].map((s, i) => {
                const max = Math.max(...[...catStats.values()].map(x => x.count));
                return (
                  <div
                    key={i}
                    className="flex-1"
                    style={{
                      height: `${(s.count / max) * 100}%`,
                      backgroundColor: '#1A1A1A',
                      minHeight: '2px',
                    }}
                  />
                );
              })}
            </div>
          }
        />

        <KPICard
          label="Avg. Margin"
          cn="平均利潤率"
          value={`${(avgMargin * 100).toFixed(1)}`}
          unit="%"
          footer={
            <div className="flex items-baseline gap-3 text-[10px]" style={{ color: '#8B8580' }}>
              <span>
                <span className="font-mono tabular font-semibold" style={{ color: '#5C8A6E' }}>↑{aboveTarget}</span> above 70%
              </span>
              {belowTarget > 0 && (
                <span>
                  <span className="font-mono tabular font-semibold" style={{ color: '#B85432' }}>↓{belowTarget}</span> below 50%
                </span>
              )}
            </div>
          }
          visual={
            <div className="mt-2">
              <div className="h-1 w-full" style={{ backgroundColor: '#F0EDE6' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(avgMargin * 100, 100)}%`,
                    backgroundColor: avgMargin >= 0.7 ? '#1A1A1A' : avgMargin >= 0.5 ? '#C4923B' : '#B85432',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[9px] font-mono tabular" style={{ color: '#8B8580' }}>
                <span>{(minMargin * 100).toFixed(0)}%</span>
                <span>target 70%</span>
                <span>{(maxMargin * 100).toFixed(0)}%</span>
              </div>
            </div>
          }
        />

        <KPICard
          label="Total Revenue"
          cn="總零售值"
          value={formatCurrency(totalRevenue)}
          footer={
            <div className="flex items-baseline gap-3 text-[10px]" style={{ color: '#8B8580' }}>
              <span>avg <span className="font-mono tabular font-semibold" style={{ color: '#1A1A1A' }}>{formatCurrency(avgPrice)}</span></span>
              <span>·</span>
              <span>max {formatCurrency(maxPrice)}</span>
            </div>
          }
        />

        <KPICard
          label="Total Cost"
          cn="總成本"
          value={formatCurrency(totalCosts)}
          footer={
            <div className="flex items-baseline gap-3 text-[10px]" style={{ color: '#8B8580' }}>
              <span>avg <span className="font-mono tabular font-semibold" style={{ color: '#1A1A1A' }}>{formatCurrency(avgCost)}</span></span>
              <span>·</span>
              <span>{((totalCosts / totalRevenue) * 100).toFixed(1)}% of revenue</span>
            </div>
          }
        />
      </div>

      {/* Cost structure */}
      <div
        className="p-6 border rounded-sm mb-6"
        style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="label-xs mb-1">Cost Structure</div>
            <div className="font-serif text-lg" style={{ color: '#1A1A1A' }}>
              成本結構分佈
            </div>
          </div>
          <div className="font-mono text-sm tabular" style={{ color: '#8B8580' }}>
            total {formatCurrency(costTotal)}
          </div>
        </div>

        {/* Stacked bar */}
        <div className="flex h-3 w-full rounded-sm overflow-hidden mb-4" style={{ backgroundColor: '#F0EDE6' }}>
          {breakdown.map(b => (
            <div
              key={b.label}
              className="h-full transition-all hover:opacity-80"
              style={{
                width: `${(b.value / costTotal) * 100}%`,
                backgroundColor: '#1A1A1A',
                opacity: b.opacity,
              }}
              title={`${b.label}: ${formatCurrency(b.value)}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {breakdown.map(b => (
            <div key={b.label} className="flex items-start gap-2">
              <div
                className="w-2 h-2 mt-1.5 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: '#1A1A1A', opacity: b.opacity }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="label-xs">{b.label}</span>
                  <span className="font-mono tabular text-xs font-semibold" style={{ color: '#1A1A1A' }}>
                    {((b.value / costTotal) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: '#8B8580' }}>
                  {b.cn} · <span className="font-mono tabular">{formatCurrency(b.value)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories table */}
      <div
        className="border rounded-sm overflow-hidden"
        style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
      >
        <div className="flex items-baseline justify-between px-6 py-4 border-b" style={{ borderColor: '#E8E4DC' }}>
          <div>
            <div className="label-xs mb-1">Category Performance</div>
            <div className="font-serif text-lg" style={{ color: '#1A1A1A' }}>
              類別表現
            </div>
          </div>
          <div className="text-[10px] tracking-wider" style={{ color: '#8B8580' }}>
            {catStats.size} CATEGORIES · {products.length} PRODUCTS
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: '#F0EDE6' }}>
              <th className="label-xs text-left px-6 py-2.5">Category</th>
              <th className="label-xs text-right px-6 py-2.5">Count</th>
              <th className="label-xs text-right px-6 py-2.5">Revenue</th>
              <th className="label-xs text-right px-6 py-2.5">Avg Price</th>
              <th className="label-xs text-right px-6 py-2.5">Avg Margin</th>
              <th className="label-xs text-left px-6 py-2.5 w-1/4">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {[...catStats.entries()]
              .sort((a, b) => b[1].revenue - a[1].revenue)
              .map(([cat, s]) => {
                const avgMargin = s.margins.reduce((a, b) => a + b, 0) / s.margins.length;
                const catAvgPrice = s.revenue / s.count;
                const countPct = (s.count / products.length) * 100;
                return (
                  <tr key={cat} className="border-b hover:bg-stone-50/50" style={{ borderColor: '#F0EDE6' }}>
                    <td className="px-6 py-3 font-medium" style={{ color: '#1A1A1A' }}>{cat}</td>
                    <td className="px-6 py-3 text-right font-mono tabular text-xs" style={{ color: '#4A4A48' }}>
                      {s.count}
                    </td>
                    <td className="px-6 py-3 text-right font-mono tabular text-xs" style={{ color: '#4A4A48' }}>
                      {formatCurrency(s.revenue)}
                    </td>
                    <td className="px-6 py-3 text-right font-mono tabular text-xs" style={{ color: '#4A4A48' }}>
                      {formatCurrency(catAvgPrice)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className="font-mono tabular text-xs font-semibold"
                        style={{ color: avgMargin >= 0.7 ? '#1A1A1A' : avgMargin >= 0.5 ? '#C4923B' : '#B85432' }}
                      >
                        {formatPercent(avgMargin)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-sm" style={{ backgroundColor: '#F0EDE6' }}>
                          <div
                            className="h-full rounded-sm"
                            style={{ width: `${countPct}%`, backgroundColor: '#1A1A1A' }}
                          />
                        </div>
                        <span className="text-[10px] font-mono tabular" style={{ color: '#8B8580' }}>
                          {countPct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function KPICard({
  label, cn, value, unit, footer, visual,
}: {
  label: string;
  cn: string;
  value: string;
  unit?: string;
  footer?: React.ReactNode;
  visual?: React.ReactNode;
}) {
  return (
    <div
      className="p-5 border rounded-sm"
      style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="label-xs">{label}</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#8B8580' }}>{cn}</div>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono tabular text-3xl font-semibold leading-none" style={{ color: '#1A1A1A' }}>
          {value}
        </span>
        {unit && <span className="text-base font-mono tabular" style={{ color: '#8B8580' }}>{unit}</span>}
      </div>
      {visual}
      {footer && <div className="mt-3 pt-3 border-t" style={{ borderColor: '#F0EDE6' }}>{footer}</div>}
    </div>
  );
}
