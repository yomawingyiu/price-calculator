import * as XLSX from 'xlsx';
import type { Product } from '../types';
import { materialCost, totalCost, retailPrice, discountedPrice, profitMargin } from './calculations';

function productToRow(p: Product) {
  const price = retailPrice(p.costs, p.pricing);
  return {
    '產品名稱(中)': p.nameCn,
    '產品名稱(英)': p.nameEn,
    'SKU': p.sku,
    '類別': p.category,
    '皮料類型': p.leatherType,
    '手工費': p.costs.laborCost,
    '蘋果皮數量(呎)': p.costs.leatherQtyApple,
    '蘋果皮成本': p.costs.leatherCostApple,
    '山羊皮數量(呎)': p.costs.leatherQtyGoat,
    '山羊皮成本': p.costs.leatherCostGoat,
    '五金配件': p.costs.hardwareCost,
    '包裝成本': p.costs.packagingCost,
    '運費成本': p.costs.shippingCost,
    '材料成本': materialCost(p.costs),
    '總成本': totalCost(p.costs),
    '定價方式': p.pricing.method === 'multiplier' ? `X${p.pricing.multiplier}` : p.pricing.method === 'fixed' ? '固定' : `${p.pricing.multiplier}%利潤率`,
    '零售價': price,
    '折扣率': `${Math.round(p.pricing.discountRate * 100)}折`,
    '折扣價': discountedPrice(price, p.pricing.discountRate),
    '利潤率': `${(profitMargin(p.costs, p.pricing) * 100).toFixed(1)}%`,
  };
}

export function exportToExcel(products: Product[], filename = '破指自愈_產品成本表.xlsx') {
  const rows = products.map(productToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '產品成本');
  XLSX.writeFile(wb, filename);
}

export function exportToCSV(products: Product[], filename = '破指自愈_產品成本表.csv') {
  const rows = products.map(productToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
