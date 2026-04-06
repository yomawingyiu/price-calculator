import type { Product, CostBreakdown, PricingConfig } from '../types';

function p(
  nameEn: string, nameCn: string, sku: string,
  category: Product['category'], leatherType: Product['leatherType'],
  costs: CostBreakdown, fixedPrice: number, discountPrice: number
): Product {
  const discountRate = fixedPrice > 0 ? Math.round((discountPrice / fixedPrice) * 100) / 100 : 0.88;
  return {
    id: sku || crypto.randomUUID(),
    nameEn, nameCn, sku, category, leatherType, costs,
    pricing: { method: 'fixed', multiplier: 4, discountRate: discountRate || 0.88, fixedPrice },
    createdAt: '2025-10-01', updatedAt: '2025-10-01',
  };
}

const c = (labor: number, qtyA: number, costA: number, qtyG: number, costG: number, hw: number, pkg: number, ship: number): CostBreakdown => ({
  laborCost: labor, leatherQtyApple: qtyA, leatherCostApple: costA,
  leatherQtyGoat: qtyG, leatherCostGoat: costG,
  hardwareCost: hw, packagingCost: pkg, shippingCost: ship,
});

export const initialProducts: Product[] = [
  // 細件皮具
  p('D2 Cardholder', '維度卡片套', 'APD2', '細件皮具', '有紋蘋果皮',
    c(50, 0.5, 3.1, 0.5, 5, 0, 15, 8), 289, 254.32),
  p('ID Holder', '掛頸證件套', 'APID', '細件皮具', '有紋蘋果皮',
    c(40, 0.5, 3.1, 0.5, 5, 0, 15, 8), 249, 219.12),
  p('Zip Holder', '卡位散銀包', 'APZH', '細件皮具', '有紋蘋果皮',
    c(70, 1, 6.2, 1, 10, 2.1, 15, 8), 390, 343.2),
  p('Boyfriend Coinsbag', '男友散銀包', 'APBF', '細件皮具', '有紋蘋果皮',
    c(60, 0.5, 3.1, 0.5, 5, 2.1, 15, 8), 330, 290.4),
  p('Mini Wallet', '迷你銀包', 'APMIW', '細件皮具', '有紋蘋果皮',
    c(90, 1.5, 9.3, 1.5, 15, 0, 15, 8), 549, 483.12),
  p('Medium Wallet', '中長銀包', 'APMEW', '細件皮具', '有紋蘋果皮',
    c(150, 3.5, 21.7, 3.5, 35, 0, 15, 8), 959, 843.92),
  p('Luggage Tag', '行李牌', 'APLGT', '細件皮具', '有紋蘋果皮',
    c(40, 0.5, 3.1, 0.5, 5, 0, 15, 8), 249, 219.12),
  p('Passport Case', '護照套', 'APPAC', '細件皮具', '有紋蘋果皮',
    c(70, 1, 6.2, 1, 10, 0, 18, 8), 449, 395.12),
  p('Passport Holder', '對摺護照套', 'APPAH', '細件皮具', '有紋蘋果皮',
    c(90, 1.5, 9.3, 1.5, 15, 0, 18, 8), 549, 483.12),
  p('Cross Cable Strap', '十字集線器', 'APCCS', '配件', '有紋蘋果皮',
    c(15, 0.2, 1, 0.2, 2, 0, 0, 8), 79, 79),
  p('Cross Tag', '十字吊牌', 'APCTG', '配件', '有紋蘋果皮',
    c(15, 0.2, 1, 0.2, 2, 0, 0, 8), 79, 79),
  p('Heal Keeper', '愈守', 'ASKP', '配件', '滑面蘋果皮',
    c(25, 0.2, 1, 0.2, 2, 0, 0, 8), 113, 99),

  // 手袋
  p('Boxy Bag', '長方袋', 'APBX', '手袋', '有紋蘋果皮',
    c(200, 4, 24.8, 4, 40, 15, 25, 8), 1390, 1223.2),
  p('Square Bag', '正方袋', 'APSQ', '手袋', '有紋蘋果皮',
    c(180, 3, 18.6, 3, 30, 10, 25, 8), 1190, 1047.2),
  p('Harvest Bag', '籃形袋', 'APHV', '手袋', '有紋蘋果皮',
    c(200, 4, 24.8, 4, 40, 15, 25, 8), 1390, 1223.2),
  p('Box Tote XS', '框形袋', 'GTBTX', '手袋', '意大利山羊皮',
    c(250, 0, 0, 5, 50, 20, 25, 8), 1690, 1487.2),
  p('Dome Bag', '拱形袋', 'GTDM', '手袋', '意大利山羊皮',
    c(250, 0, 0, 5, 50, 15, 25, 8), 1590, 1399.2),
  p('Ladder Bag', '梯形袋', 'APLD', '手袋', '有紋蘋果皮',
    c(200, 4, 24.8, 4, 40, 12, 25, 8), 1290, 1135.2),
  p('Mini Boxy', '迷你長方袋', 'APMBX', '手袋', '有紋蘋果皮',
    c(120, 2, 12.4, 2, 20, 8, 20, 8), 390, 343.2),
  p('Frame Tote H', '橫向電腦套', 'GTFRH', '手袋', '意大利山羊皮',
    c(200, 0, 0, 5, 50, 10, 25, 8), 1490, 1311.2),

  // 繩結及帶
  p('Healink 35L', '愈結35L', 'HLK35L', '繩結及帶', '有紋蘋果皮',
    c(25, 0, 0, 0, 20, 4, 0, 8), 188, 165),
  p('Healink 35S', '愈結35S', 'HLK35S', '繩結及帶', '有紋蘋果皮',
    c(25, 0, 0, 0, 12, 4, 0, 8), 148, 130),
  p('Healink 45L', '愈結45L', 'HLK45L', '繩結及帶', '有紋蘋果皮',
    c(25, 0, 0, 0, 20, 4, 0, 8), 199, 175),
  p('Healink 45S', '愈結45S', 'HLK45S', '繩結及帶', '有紋蘋果皮',
    c(25, 0, 0, 0, 12, 4, 0, 8), 168, 148),
];
