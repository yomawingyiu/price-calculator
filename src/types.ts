export type ProductCategory = '細件皮具' | '手袋' | '配件' | '材料包' | '花花帶' | '繩結及帶' | '牌仔及標籤' | '紙香';
export type LeatherType = '有紋蘋果皮' | '滑面蘋果皮' | '意大利山羊皮' | '其他';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  '細件皮具', '手袋', '配件', '材料包', '花花帶', '繩結及帶', '牌仔及標籤', '紙香',
];

export const LEATHER_TYPES: LeatherType[] = [
  '有紋蘋果皮', '滑面蘋果皮', '意大利山羊皮', '其他',
];

export const MULTIPLIERS = [3, 3.2, 3.5, 4] as const;
export const DISCOUNT_PRESETS = [0.88, 0.9, 0.85, 0.8] as const;

export interface LineItem {
  id: string;
  name: string;         // 項目名稱
  qty: number;          // 數量
  unitPrice: number;    // 單價
  purchaseUrl?: string; // 購買連結
  note?: string;        // 備註
}

export interface CostBreakdown {
  laborCost: number;             // 手工費
  leatherQtyApple: number;       // 皮料數量(蘋果皮) 平方呎
  leatherCostApple: number;      // 皮料成本(蘋果皮)
  leatherQtyGoat: number;        // 皮料數量(山羊皮) 平方呎
  leatherCostGoat: number;       // 皮料成本(山羊皮)
  hardwareCost: number;          // 五金配件總成本 (sum of items)
  hardwareItems?: LineItem[];    // 五金項目明細
  packagingCost: number;         // 包裝總成本 (sum of items)
  packagingItems?: LineItem[];   // 包裝項目明細
  shippingCost: number;          // 運費成本
}

export interface PricingConfig {
  method: 'multiplier' | 'margin' | 'fixed';
  multiplier: number;
  discountRate: number;
  fixedPrice: number;
}

export interface Product {
  id: string;
  nameEn: string;
  nameCn: string;
  sku: string;
  category: ProductCategory;
  leatherType: LeatherType;
  costs: CostBreakdown;
  pricing: PricingConfig;
  createdAt: string;
  updatedAt: string;
}

export const emptyCosts: CostBreakdown = {
  laborCost: 0,
  leatherQtyApple: 0,
  leatherCostApple: 0,
  leatherQtyGoat: 0,
  leatherCostGoat: 0,
  hardwareCost: 0,
  hardwareItems: [],
  packagingCost: 0,
  packagingItems: [],
  shippingCost: 0,
};

export const defaultPricing: PricingConfig = {
  method: 'multiplier',
  multiplier: 4,
  discountRate: 0.88,
  fixedPrice: 0,
};

// Helpers
export function sumLineItems(items?: LineItem[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, it) => sum + (it.qty || 0) * (it.unitPrice || 0), 0);
}

export function createLineItem(): LineItem {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
    name: '',
    qty: 1,
    unitPrice: 0,
    purchaseUrl: '',
  };
}
