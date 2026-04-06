import type { CostBreakdown, PricingConfig } from '../types';

export function materialCost(costs: CostBreakdown): number {
  return (
    costs.leatherCostApple +
    costs.leatherCostGoat +
    costs.hardwareCost +
    costs.packagingCost +
    costs.shippingCost
  );
}

export function totalCost(costs: CostBreakdown): number {
  return costs.laborCost + materialCost(costs);
}

export function retailPrice(costs: CostBreakdown, pricing: PricingConfig): number {
  const total = totalCost(costs);
  switch (pricing.method) {
    case 'multiplier':
      return Math.round(total * pricing.multiplier * 10) / 10;
    case 'margin':
      if (pricing.multiplier >= 1) return total; // margin can't be >= 100%
      return Math.round((total / (1 - pricing.multiplier / 100)) * 10) / 10;
    case 'fixed':
      return pricing.fixedPrice;
    default:
      return 0;
  }
}

export function discountedPrice(price: number, rate: number): number {
  return Math.round(price * rate * 100) / 100;
}

export function profit(costs: CostBreakdown, pricing: PricingConfig): number {
  return retailPrice(costs, pricing) - totalCost(costs);
}

export function profitMargin(costs: CostBreakdown, pricing: PricingConfig): number {
  const price = retailPrice(costs, pricing);
  if (price === 0) return 0;
  return (price - totalCost(costs)) / price;
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('zh-HK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
