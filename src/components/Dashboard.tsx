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
    { label: '手工費', en: 'LABOR', value: totalLabor, color: '#0A0A0A' },
    { label: '皮料', en: 'LEATHER', value: totalLeather, color: '#E63946' },
    { label: '五金', en: 'HARDWARE', value: totalHardware, color: '#1D3557' },
    { label: '包裝', en: 'PACKAGING', value: totalPackaging, color: '#F4C842' },
    { label: '運費', en: 'SHIPPING', value: totalShipping, color: '#5C5C5C' },
  ];
  const costTotal = totalLabor + totalMat || 1;

  // Category breakdown
  const categories = new Map<string, number>();
  products.forEach(p => categories.set(p.category, (categories.get(p.category) || 0) + 1));

  return (
    <div className="mb-8">
      {/* Stat cards - bauhaus blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-8 border-2 border-black">
        <Card
          label="PRODUCTS"
          subLabel="產品數量"
          value={`${products.length}`}
          unit="款"
          bg="#F2EFE9"
          color="#0A0A0A"
          shape="circle"
        />
        <Card
          label="MARGIN"
          subLabel="平均利潤率"
          value={formatPercent(avgMargin).replace('%', '')}
          unit="%"
          bg="#E63946"
          color="#FFFFFF"
          shape="square"
        />
        <Card
          label="REVENUE"
          subLabel="總零售值"
          value={formatCurrency(totalRevenue)}
          bg="#1D3557"
          color="#FFFFFF"
          shape="triangle"
        />
        <Card
          label="COST"
          subLabel="總成本"
          value={formatCurrency(totalCosts)}
          bg="#F4C842"
          color="#0A0A0A"
          shape="rect"
        />
      </div>

      {/* Cost structure */}
      <div className="border-2 border-black bg-white p-6 mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Cost Structure / 成本結構</h3>
          <span className="text-xs font-mono opacity-60">{formatCurrency(costTotal)}</span>
        </div>
        <div className="flex h-8 border-2 border-black mb-4">
          {breakdown.map(b => (
            <div
              key={b.label}
              className="border-r-2 border-black last:border-r-0 transition-all"
              style={{
                width: `${(b.value / costTotal) * 100}%`,
                backgroundColor: b.color,
              }}
              title={`${b.label}: ${formatCurrency(b.value)}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {breakdown.map(b => (
            <div key={b.label} className="flex items-start gap-2">
              <div
                className="w-4 h-4 mt-0.5 border-2 border-black flex-shrink-0"
                style={{ backgroundColor: b.color }}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider">{b.en}</div>
                <div className="text-xs text-gray-600">{b.label}</div>
                <div className="text-xs font-mono mt-0.5">
                  {((b.value / costTotal) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category distribution */}
      <div className="border-2 border-black bg-white p-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">
          Categories / 類別分佈
        </h3>
        <div className="flex flex-wrap gap-0">
          {[...categories.entries()].map(([cat, count], i) => {
            const colors = ['#0A0A0A', '#E63946', '#1D3557', '#F4C842', '#5C5C5C'];
            const bg = colors[i % colors.length];
            const isLight = bg === '#F4C842' || bg === '#F2EFE9';
            return (
              <div
                key={cat}
                className="border-2 border-black -ml-0.5 -mt-0.5 px-4 py-2 flex items-center gap-3"
                style={{ backgroundColor: bg, color: isLight ? '#0A0A0A' : '#FFFFFF' }}
              >
                <span className="text-xs font-black uppercase tracking-wider">{cat}</span>
                <span className="text-lg font-black font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  label: string;
  subLabel: string;
  value: string;
  unit?: string;
  bg: string;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'rect';
}

function Card({ label, subLabel, value, unit, bg, color, shape }: CardProps) {
  return (
    <div
      className="relative p-5 border-r-2 border-b-2 border-black last:border-r-0 md:[&:nth-child(4)]:border-r-0 [&:nth-child(3)]:md:border-b-0 [&:nth-child(4)]:md:border-b-0 overflow-hidden min-h-[140px] flex flex-col justify-between"
      style={{ backgroundColor: bg, color }}
    >
      {/* Geometric shape decoration */}
      <div className="absolute top-3 right-3 opacity-90">
        {shape === 'circle' && (
          <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: color }} />
        )}
        {shape === 'square' && (
          <div className="w-6 h-6 border-2" style={{ borderColor: color }} />
        )}
        {shape === 'triangle' && (
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: `20px solid ${color}`,
            }}
          />
        )}
        {shape === 'rect' && (
          <div className="w-8 h-3 border-2" style={{ borderColor: color }} />
        )}
      </div>

      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">{label}</div>
        <div className="text-[10px] opacity-70 mt-0.5">{subLabel}</div>
      </div>

      <div className="flex items-baseline gap-1 mt-3">
        <span className="text-3xl font-black tracking-tight leading-none">{value}</span>
        {unit && <span className="text-sm font-bold opacity-80">{unit}</span>}
      </div>
    </div>
  );
}
