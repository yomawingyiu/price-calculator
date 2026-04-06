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
    { label: '手工費', value: totalLabor, color: 'bg-amber-500' },
    { label: '皮料', value: totalLeather, color: 'bg-emerald-500' },
    { label: '五金配件', value: totalHardware, color: 'bg-blue-500' },
    { label: '包裝', value: totalPackaging, color: 'bg-purple-500' },
    { label: '運費', value: totalShipping, color: 'bg-red-500' },
  ];
  const costTotal = totalLabor + totalMat;

  // Category breakdown
  const categories = new Map<string, number>();
  products.forEach(p => categories.set(p.category, (categories.get(p.category) || 0) + 1));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card label="產品數量" value={`${products.length} 款`} />
      <Card label="平均利潤率" value={formatPercent(avgMargin)} />
      <Card label="總零售值" value={formatCurrency(totalRevenue)} />
      <Card label="總成本" value={formatCurrency(totalCosts)} />

      <div className="col-span-2 md:col-span-4 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">成本結構分佈</h3>
        <div className="flex rounded-full overflow-hidden h-6 mb-3">
          {breakdown.map(b => (
            <div
              key={b.label}
              className={`${b.color} transition-all`}
              style={{ width: `${(b.value / costTotal) * 100}%` }}
              title={`${b.label}: ${formatCurrency(b.value)}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {breakdown.map(b => (
            <span key={b.label} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full ${b.color}`} />
              {b.label}: {formatCurrency(b.value)} ({((b.value / costTotal) * 100).toFixed(1)}%)
            </span>
          ))}
        </div>
      </div>

      <div className="col-span-2 md:col-span-4 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">類別分佈</h3>
        <div className="flex flex-wrap gap-2">
          {[...categories.entries()].map(([cat, count]) => (
            <span key={cat} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
              {cat}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}
