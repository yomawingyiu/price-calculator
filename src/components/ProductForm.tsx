import { useState, useEffect } from 'react';
import type { Product, CostBreakdown, PricingConfig, ProductCategory, LeatherType, LineItem } from '../types';
import { PRODUCT_CATEGORIES, LEATHER_TYPES, MULTIPLIERS, DISCOUNT_PRESETS, emptyCosts, defaultPricing, sumLineItems, createLineItem } from '../types';
import { materialCost, totalCost, retailPrice, discountedPrice, profitMargin, formatCurrency, formatPercent } from '../utils/calculations';

interface Props {
  editProduct?: Product | null;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Product>) => void;
  onCancel: () => void;
}

const LEATHER_PRICE_DEFAULTS: Record<LeatherType, number> = {
  '有紋蘋果皮': 6.2,
  '滑面蘋果皮': 6.2,
  '意大利山羊皮': 10,
  '其他': 0,
};

export function ProductForm({ editProduct, onSave, onUpdate, onCancel }: Props) {
  const [nameEn, setNameEn] = useState('');
  const [nameCn, setNameCn] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('細件皮具');
  const [leatherType, setLeatherType] = useState<LeatherType>('有紋蘋果皮');
  const [costs, setCosts] = useState<CostBreakdown>({ ...emptyCosts });
  const [pricing, setPricing] = useState<PricingConfig>({ ...defaultPricing });

  const [leatherLengthCm, setLeatherLengthCm] = useState<number>(0);
  const [leatherWidthCm, setLeatherWidthCm] = useState<number>(0);
  const [leatherPricePerSqFt, setLeatherPricePerSqFt] = useState<number>(6.2);

  const isAppleLeather = leatherType === '有紋蘋果皮' || leatherType === '滑面蘋果皮';
  const isGoatLeather = leatherType === '意大利山羊皮';
  const isOtherLeather = leatherType === '其他';

  useEffect(() => {
    if (editProduct) {
      setNameEn(editProduct.nameEn);
      setNameCn(editProduct.nameCn);
      setSku(editProduct.sku);
      setCategory(editProduct.category);
      setLeatherType(editProduct.leatherType);
      setCosts({ ...editProduct.costs });
      setPricing({ ...editProduct.pricing });
      setLeatherPricePerSqFt(LEATHER_PRICE_DEFAULTS[editProduct.leatherType]);
      setLeatherLengthCm(0);
      setLeatherWidthCm(0);
    }
  }, [editProduct]);

  const mat = materialCost(costs);
  const total = totalCost(costs);
  const price = retailPrice(costs, pricing);
  const discPrice = discountedPrice(price, pricing.discountRate);
  const margin = profitMargin(costs, pricing);
  const profit = price - total;
  const actualMultiplier = total > 0 ? price / total : 0;

  const updateCost = (key: keyof CostBreakdown, value: string) => {
    setCosts(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const calcLeatherFromCm = (lengthCm: number, widthCm: number, pricePerSqFt: number) => {
    if (lengthCm > 0 && widthCm > 0 && pricePerSqFt > 0) {
      const sqFt = (lengthCm * widthCm) / 929.03;
      const cost = sqFt * pricePerSqFt;
      const roundedSqFt = Math.round(sqFt * 1000) / 1000;
      const roundedCost = Math.round(cost * 10) / 10;
      if (isAppleLeather) {
        setCosts(prev => ({ ...prev, leatherQtyApple: roundedSqFt, leatherCostApple: roundedCost }));
      } else if (isGoatLeather) {
        setCosts(prev => ({ ...prev, leatherQtyGoat: roundedSqFt, leatherCostGoat: roundedCost }));
      }
    }
  };

  const handleLeatherTypeChange = (newType: LeatherType) => {
    setLeatherType(newType);
    setLeatherPricePerSqFt(LEATHER_PRICE_DEFAULTS[newType]);
    setLeatherLengthCm(0);
    setLeatherWidthCm(0);
    const isNewApple = newType === '有紋蘋果皮' || newType === '滑面蘋果皮';
    const isNewGoat = newType === '意大利山羊皮';
    if (isNewApple) {
      setCosts(prev => ({ ...prev, leatherQtyGoat: 0, leatherCostGoat: 0 }));
    } else if (isNewGoat) {
      setCosts(prev => ({ ...prev, leatherQtyApple: 0, leatherCostApple: 0 }));
    } else {
      setCosts(prev => ({ ...prev, leatherQtyApple: 0, leatherCostApple: 0, leatherQtyGoat: 0, leatherCostGoat: 0 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { nameEn, nameCn, sku, category, leatherType, costs, pricing };
    if (editProduct && onUpdate) {
      onUpdate(editProduct.id, data);
    } else {
      onSave(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setNameEn(''); setNameCn(''); setSku('');
    setCategory('細件皮具'); setLeatherType('有紋蘋果皮');
    setCosts({ ...emptyCosts }); setPricing({ ...defaultPricing });
    setLeatherLengthCm(0); setLeatherWidthCm(0);
    setLeatherPricePerSqFt(6.2);
    onCancel();
  };

  const areaCm2 = leatherLengthCm * leatherWidthCm;
  const areaSqFt = areaCm2 > 0 ? areaCm2 / 929.03 : 0;

  const marginColor = margin >= 0.7 ? '#1A1A1A' : margin >= 0.5 ? '#C4923B' : '#B85432';
  const marginStatus = margin >= 0.7 ? 'HEALTHY' : margin >= 0.5 ? 'ACCEPTABLE' : 'LOW';

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      {/* Editor header */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="label-xs mb-1">{editProduct ? 'Editing Entry' : 'New Entry'}</div>
          <h2 className="font-serif text-2xl" style={{ color: '#1A1A1A' }}>
            <em>{editProduct ? 'Edit Product' : 'Add Product'}</em>{' '}
            <span className="text-sm" style={{ color: '#8B8580' }}>· {editProduct ? '編輯產品' : '新增產品'}</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="text-[10px] tracking-wider hover:underline"
          style={{ color: '#8B8580' }}
        >
          × CANCEL / 取消
        </button>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity card */}
          <div
            className="border rounded-sm p-5"
            style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
          >
            <div className="flex items-baseline justify-between mb-4">
              <div className="label-xs">① Identity · 基本資料</div>
              <div className="text-[10px]" style={{ color: '#8B8580' }}>* required</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="產品名稱（中文）" required>
                <input
                  required
                  value={nameCn}
                  onChange={e => setNameCn(e.target.value)}
                  placeholder="例：維度卡片套"
                  className="input-field"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </Field>
              <Field label="Product Name (EN)">
                <input
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. D2 Cardholder"
                  className="input-field"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </Field>
              <Field label="SKU">
                <input
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="APD2"
                  className="input-field"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category 類別">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductCategory)}
                    className="input-field"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Leather 皮料">
                  <select
                    value={leatherType}
                    onChange={e => handleLeatherTypeChange(e.target.value as LeatherType)}
                    className="input-field"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {LEATHER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* Basic costs: Labor & Shipping */}
          <div
            className="border rounded-sm p-5"
            style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
          >
            <div className="label-xs mb-4">② Basic Costs · 基本成本</div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Labor · 手工費" prefix="$">
                <input
                  type="number" min="0" step="0.1"
                  value={costs.laborCost || ''}
                  placeholder="0"
                  onChange={e => updateCost('laborCost', e.target.value)}
                  className="input-field"
                />
              </Field>
              <Field label="Shipping · 運費" prefix="$">
                <input
                  type="number" min="0" step="0.1"
                  value={costs.shippingCost || ''}
                  placeholder="0"
                  onChange={e => updateCost('shippingCost', e.target.value)}
                  className="input-field"
                />
              </Field>
            </div>
          </div>

          {/* Hardware items */}
          <LineItemsCard
            number="③"
            titleEn="Hardware Items"
            titleCn="五金配件明細"
            items={costs.hardwareItems || []}
            total={costs.hardwareCost || 0}
            onChange={(items, total) =>
              setCosts(prev => ({ ...prev, hardwareItems: items, hardwareCost: total }))
            }
            namePlaceholder="例：D扣、拉鏈、磁扣..."
          />

          {/* Packaging items */}
          <LineItemsCard
            number="④"
            titleEn="Packaging Items"
            titleCn="包裝物料明細"
            items={costs.packagingItems || []}
            total={costs.packagingCost || 0}
            onChange={(items, total) =>
              setCosts(prev => ({ ...prev, packagingItems: items, packagingCost: total }))
            }
            namePlaceholder="例：紙盒、緞帶、標籤..."
          />

          {/* Leather cost */}
          {(isAppleLeather || isGoatLeather) && (
            <div
              className="border rounded-sm p-5"
              style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="label-xs mb-1">⑤ {isAppleLeather ? 'Apple Leather' : 'Italian Goatskin'} · 皮料</div>
                  <div className="font-serif text-sm italic" style={{ color: '#8B8580' }}>{leatherType}</div>
                </div>
                <div
                  className="text-[10px] px-2 py-1 rounded-sm"
                  style={{ backgroundColor: '#F5EDE8', color: '#B85432' }}
                >
                  AUTO-CALCULATE FROM CM
                </div>
              </div>

              {/* CM Calculator row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Field label="Length · 長" suffix="cm">
                  <input
                    type="number" min="0" step="0.1"
                    value={leatherLengthCm || ''}
                    placeholder="0"
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherLengthCm(v);
                      calcLeatherFromCm(v, leatherWidthCm, leatherPricePerSqFt);
                    }}
                    className="input-field"
                  />
                </Field>
                <Field label="Width · 寬" suffix="cm">
                  <input
                    type="number" min="0" step="0.1"
                    value={leatherWidthCm || ''}
                    placeholder="0"
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherWidthCm(v);
                      calcLeatherFromCm(leatherLengthCm, v, leatherPricePerSqFt);
                    }}
                    className="input-field"
                  />
                </Field>
                <Field label="Price / ft²" prefix="$">
                  <input
                    type="number" min="0" step="0.1"
                    value={leatherPricePerSqFt || ''}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherPricePerSqFt(v);
                      calcLeatherFromCm(leatherLengthCm, leatherWidthCm, v);
                    }}
                    className="input-field"
                  />
                </Field>
                <Field label="Area · 面積">
                  <div
                    className="input-field flex items-baseline gap-1"
                    style={{
                      backgroundColor: areaSqFt > 0 ? '#F5EDE8' : '#FAFAF7',
                      color: areaSqFt > 0 ? '#B85432' : '#C7C0B8',
                      borderColor: areaSqFt > 0 ? '#B85432' : '#E8E4DC',
                    }}
                  >
                    <span className="font-mono tabular font-semibold">
                      {areaSqFt > 0 ? areaSqFt.toFixed(3) : '—'}
                    </span>
                    <span className="text-[10px]">ft²</span>
                  </div>
                </Field>
              </div>

              {/* Manual override */}
              <div className="pt-4 border-t" style={{ borderColor: '#F0EDE6' }}>
                <div className="text-[10px] mb-3 tracking-wider" style={{ color: '#8B8580' }}>
                  MANUAL OVERRIDE · 手動覆寫
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {isAppleLeather ? (
                    <>
                      <Field label="Qty · 數量" suffix="ft²">
                        <input
                          type="number" min="0" step="0.001"
                          value={costs.leatherQtyApple || ''}
                          placeholder="0"
                          onChange={e => updateCost('leatherQtyApple', e.target.value)}
                          className="input-field"
                        />
                      </Field>
                      <Field label="Cost · 成本" prefix="$">
                        <input
                          type="number" min="0" step="0.1"
                          value={costs.leatherCostApple || ''}
                          placeholder="0"
                          onChange={e => updateCost('leatherCostApple', e.target.value)}
                          className="input-field"
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Qty · 數量" suffix="ft²">
                        <input
                          type="number" min="0" step="0.001"
                          value={costs.leatherQtyGoat || ''}
                          placeholder="0"
                          onChange={e => updateCost('leatherQtyGoat', e.target.value)}
                          className="input-field"
                        />
                      </Field>
                      <Field label="Cost · 成本" prefix="$">
                        <input
                          type="number" min="0" step="0.1"
                          value={costs.leatherCostGoat || ''}
                          placeholder="0"
                          onChange={e => updateCost('leatherCostGoat', e.target.value)}
                          className="input-field"
                        />
                      </Field>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {isOtherLeather && (
            <div
              className="border rounded-sm p-5"
              style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
            >
              <div className="label-xs mb-4">⑤ Other Material · 其他皮料</div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Qty · 數量" suffix="ft²">
                  <input
                    type="number" min="0" step="0.001"
                    value={costs.leatherQtyApple || ''}
                    placeholder="0"
                    onChange={e => updateCost('leatherQtyApple', e.target.value)}
                    className="input-field"
                  />
                </Field>
                <Field label="Cost · 成本" prefix="$">
                  <input
                    type="number" min="0" step="0.1"
                    value={costs.leatherCostApple || ''}
                    placeholder="0"
                    onChange={e => updateCost('leatherCostApple', e.target.value)}
                    className="input-field"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div
            className="border rounded-sm p-5"
            style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
          >
            <div className="label-xs mb-4">⑥ Pricing Strategy · 定價策略</div>

            <div className="mb-4">
              <div className="text-[10px] tracking-wider mb-2" style={{ color: '#8B8580' }}>
                PRICING METHOD
              </div>
              <div className="seg">
                {(['multiplier', 'fixed', 'margin'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    data-active={pricing.method === m}
                    onClick={() => setPricing(p => ({ ...p, method: m }))}
                  >
                    {m === 'multiplier' ? '倍數 MULTIPLIER' : m === 'fixed' ? '固定價 FIXED' : '利潤率 MARGIN'}
                  </button>
                ))}
              </div>
            </div>

            {pricing.method === 'multiplier' && (
              <div className="mb-4">
                <div className="text-[10px] tracking-wider mb-2" style={{ color: '#8B8580' }}>
                  MULTIPLIER VALUE
                </div>
                <div className="flex gap-2">
                  {MULTIPLIERS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPricing(p => ({ ...p, multiplier: m }))}
                      className="flex-1 py-3 border rounded-sm transition-all"
                      style={{
                        borderColor: pricing.multiplier === m ? '#1A1A1A' : '#E8E4DC',
                        backgroundColor: pricing.multiplier === m ? '#1A1A1A' : '#FFFFFF',
                        color: pricing.multiplier === m ? '#FFFFFF' : '#1A1A1A',
                      }}
                    >
                      <div className="font-mono tabular text-lg font-semibold leading-none">×{m}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pricing.method === 'fixed' && (
              <div className="mb-4 max-w-xs">
                <Field label="Retail Price · 零售價" prefix="$">
                  <input
                    type="number" min="0" step="1"
                    value={pricing.fixedPrice || ''}
                    placeholder="0"
                    onChange={e => setPricing(p => ({ ...p, fixedPrice: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    style={{ fontSize: '18px', fontWeight: 600 }}
                  />
                </Field>
              </div>
            )}

            {pricing.method === 'margin' && (
              <div className="mb-4 max-w-xs">
                <Field label="Target Margin · 目標利潤率" suffix="%">
                  <input
                    type="number" min="0" max="99" step="1"
                    value={pricing.multiplier || ''}
                    placeholder="0"
                    onChange={e => setPricing(p => ({ ...p, multiplier: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    style={{ fontSize: '18px', fontWeight: 600 }}
                  />
                </Field>
              </div>
            )}

            <div>
              <div className="text-[10px] tracking-wider mb-2" style={{ color: '#8B8580' }}>
                DISCOUNT
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                {DISCOUNT_PRESETS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPricing(p => ({ ...p, discountRate: d }))}
                    className="px-4 py-2 border rounded-sm text-sm transition-all"
                    style={{
                      borderColor: pricing.discountRate === d ? '#1A1A1A' : '#E8E4DC',
                      backgroundColor: pricing.discountRate === d ? '#1A1A1A' : '#FFFFFF',
                      color: pricing.discountRate === d ? '#FFFFFF' : '#1A1A1A',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {Math.round(d * 100)}折
                  </button>
                ))}
                <input
                  type="number" min="0" max="1" step="0.01"
                  value={pricing.discountRate}
                  onChange={e => setPricing(p => ({ ...p, discountRate: parseFloat(e.target.value) || 1 }))}
                  className="input-field w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky live preview */}
        <aside className="lg:col-span-1">
          <div
            className="lg:sticky lg:top-24 border rounded-sm overflow-hidden"
            style={{ borderColor: '#1A1A1A', backgroundColor: '#FFFFFF' }}
          >
            {/* Preview header */}
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#1A1A1A', backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: '#5C8A6E' }}
                />
                <span className="text-[10px] tracking-wider">LIVE PREVIEW</span>
              </div>
              <span className="text-[10px] opacity-60">即時預覽</span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Product identity */}
              <div>
                <div className="font-serif text-xl" style={{ color: '#1A1A1A' }}>
                  {nameCn || <em className="opacity-30">Product name…</em>}
                </div>
                <div className="text-[11px] italic mt-0.5" style={{ color: '#8B8580' }}>
                  {nameEn || category}{sku && ` · ${sku}`}
                </div>
              </div>

              <div className="h-px" style={{ backgroundColor: '#F0EDE6' }} />

              {/* Costs */}
              <div className="space-y-1.5">
                <PreviewRow label="Labor" cn="手工" value={formatCurrency(costs.laborCost)} muted />
                <PreviewRow
                  label={`Hardware${(costs.hardwareItems?.length || 0) > 0 ? ` (${costs.hardwareItems?.length})` : ''}`}
                  cn="五金"
                  value={formatCurrency(costs.hardwareCost)}
                  muted
                />
                <PreviewRow
                  label={`Packaging${(costs.packagingItems?.length || 0) > 0 ? ` (${costs.packagingItems?.length})` : ''}`}
                  cn="包裝"
                  value={formatCurrency(costs.packagingCost)}
                  muted
                />
                <PreviewRow label="Leather" cn="皮料" value={formatCurrency((costs.leatherCostApple || 0) + (costs.leatherCostGoat || 0))} muted />
                <PreviewRow label="Shipping" cn="運費" value={formatCurrency(costs.shippingCost)} muted />
                <div className="h-px my-1" style={{ backgroundColor: '#F0EDE6' }} />
                <PreviewRow label="Material" cn="材料小計" value={formatCurrency(mat)} muted />
                <PreviewRow label="TOTAL COST" cn="總成本" value={formatCurrency(total)} bold />
              </div>

              <div className="h-px" style={{ backgroundColor: '#F0EDE6' }} />

              {/* Prices */}
              <div className="space-y-1.5">
                <PreviewRow
                  label="Retail Price"
                  cn="零售價"
                  value={formatCurrency(price)}
                  bold
                  large
                />
                <PreviewRow
                  label={`Discount ${Math.round(pricing.discountRate * 100)}折`}
                  cn="折扣價"
                  value={formatCurrency(discPrice)}
                  accent
                />
              </div>

              <div className="h-px" style={{ backgroundColor: '#F0EDE6' }} />

              {/* Profit */}
              <div>
                <PreviewRow label="Profit" cn="利潤" value={`+${formatCurrency(profit)}`} positive />
                <div className="mt-3">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="label-xs">Margin · 利潤率</span>
                    <span
                      className="font-mono tabular text-xl font-semibold"
                      style={{ color: marginColor }}
                    >
                      {formatPercent(margin)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-sm" style={{ backgroundColor: '#F0EDE6' }}>
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{
                        width: `${Math.min(Math.max(margin * 100, 0), 100)}%`,
                        backgroundColor: marginColor,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] font-mono tabular" style={{ color: '#8B8580' }}>
                    <span>0%</span>
                    <span>target 70%</span>
                    <span>100%</span>
                  </div>
                  <div
                    className="mt-2 text-[10px] tracking-wider text-center py-1 rounded-sm"
                    style={{
                      color: marginColor,
                      backgroundColor: margin >= 0.7 ? '#F5F1E8' : margin >= 0.5 ? '#FDF7E8' : '#F5EDE8',
                    }}
                  >
                    ● {marginStatus}
                  </div>
                </div>
              </div>

              <div className="h-px" style={{ backgroundColor: '#F0EDE6' }} />

              {/* Meta */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="label-xs">Actual Multiplier</span>
                <span className="font-mono tabular font-semibold" style={{ color: '#1A1A1A' }}>
                  ×{actualMultiplier.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="px-5 py-4 border-t" style={{ borderColor: '#E8E4DC', backgroundColor: '#FAFAF7' }}>
              <button type="submit" className="btn-primary w-full">
                {editProduct ? '↻ Update Entry · 更新' : '✓ Save Entry · 儲存'}
              </button>
              <div className="text-[10px] mt-2 text-center tracking-wider" style={{ color: '#8B8580' }}>
                Auto-saved to localStorage
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Field({
  label, required, prefix, suffix, children,
}: {
  label: string;
  required?: boolean;
  prefix?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="label-xs mb-1.5">
        {label}{required && <span style={{ color: '#B85432' }}> *</span>}
      </div>
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono"
            style={{ color: '#8B8580' }}
          >
            {prefix}
          </span>
        )}
        <div className={prefix ? 'pl-4' : ''}>{children}</div>
        {suffix && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-wider"
            style={{ color: '#8B8580' }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function PreviewRow({
  label, cn, value, muted, bold, large, accent, positive,
}: {
  label: string;
  cn: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  large?: boolean;
  accent?: boolean;
  positive?: boolean;
}) {
  const color = accent ? '#B85432' : positive ? '#5C8A6E' : muted ? '#8B8580' : '#1A1A1A';
  return (
    <div className="flex items-baseline justify-between">
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[10px] tracking-wider ${bold ? 'font-semibold' : ''}`} style={{ color: muted ? '#8B8580' : '#4A4A48' }}>
          {label}
        </span>
        <span className="text-[9px]" style={{ color: '#8B8580' }}>{cn}</span>
      </div>
      <span
        className={`font-mono tabular ${large ? 'text-xl' : bold ? 'text-sm' : 'text-xs'} ${bold ? 'font-semibold' : ''}`}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Line Items Card (used for Hardware + Packaging)
// ═══════════════════════════════════════════════════════════════
function LineItemsCard({
  number, titleEn, titleCn, items, total, onChange, namePlaceholder,
}: {
  number: string;
  titleEn: string;
  titleCn: string;
  items: LineItem[];
  total: number;
  onChange: (items: LineItem[], total: number) => void;
  namePlaceholder: string;
}) {
  const recalc = (next: LineItem[]) => {
    const sum = sumLineItems(next);
    onChange(next, Math.round(sum * 100) / 100);
  };

  const addItem = () => {
    recalc([...items, createLineItem()]);
  };

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    const next = items.map(it => (it.id === id ? { ...it, ...patch } : it));
    recalc(next);
  };

  const removeItem = (id: string) => {
    recalc(items.filter(it => it.id !== id));
  };

  const hasLegacyCost = items.length === 0 && total > 0;

  const migrateLegacy = () => {
    const legacy: LineItem = {
      id: createLineItem().id,
      name: '合計 · Total',
      qty: 1,
      unitPrice: total,
      purchaseUrl: '',
    };
    recalc([legacy]);
  };

  return (
    <div
      className="border rounded-sm p-5"
      style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
    >
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="label-xs mb-1">
            {number} {titleEn} · {titleCn}
          </div>
          <div className="text-[11px]" style={{ color: '#8B8580' }}>
            {items.length === 0 ? 'No items yet · 尚未新增項目' : `${items.length} item${items.length > 1 ? 's' : ''}`}
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <div className="flex items-baseline gap-1">
            <span className="label-xs">TOTAL</span>
            <span className="font-mono tabular text-lg font-semibold" style={{ color: '#1A1A1A' }}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Legacy migration notice */}
      {hasLegacyCost && (
        <div
          className="p-3 rounded-sm mb-4 flex items-center justify-between gap-3 text-[11px]"
          style={{ backgroundColor: '#F5EDE8', color: '#B85432' }}
        >
          <span>
            ⚠ Legacy cost: <span className="font-mono tabular font-semibold">{formatCurrency(total)}</span>
            <span className="ml-2 opacity-80">· 舊資料尚未拆分明細</span>
          </span>
          <button
            type="button"
            onClick={migrateLegacy}
            className="text-[10px] tracking-wider underline whitespace-nowrap"
            style={{ color: '#B85432' }}
          >
            CONVERT TO ITEM →
          </button>
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-2 pb-1 border-b" style={{ borderColor: '#F0EDE6' }}>
            <div className="col-span-4 label-xs">Item · 項目</div>
            <div className="col-span-1 label-xs text-center">Qty</div>
            <div className="col-span-2 label-xs text-right">Unit $</div>
            <div className="col-span-2 label-xs text-right">Subtotal</div>
            <div className="col-span-2 label-xs">Purchase URL</div>
            <div className="col-span-1"></div>
          </div>

          {items.map((item) => {
            const subtotal = (item.qty || 0) * (item.unitPrice || 0);
            return (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-sm hover:bg-stone-50/50"
                style={{ backgroundColor: '#FAFAF7' }}
              >
                {/* Name */}
                <div className="col-span-4">
                  <input
                    type="text"
                    value={item.name}
                    placeholder={namePlaceholder}
                    onChange={e => updateItem(item.id, { name: e.target.value })}
                    className="input-field"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                {/* Qty */}
                <div className="col-span-1">
                  <input
                    type="number" min="0" step="1"
                    value={item.qty || ''}
                    placeholder="1"
                    onChange={e => updateItem(item.id, { qty: parseFloat(e.target.value) || 0 })}
                    className="input-field text-center"
                  />
                </div>
                {/* Unit price */}
                <div className="col-span-2">
                  <div className="relative">
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px]"
                      style={{ color: '#8B8580' }}
                    >$</span>
                    <input
                      type="number" min="0" step="0.1"
                      value={item.unitPrice || ''}
                      placeholder="0"
                      onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="input-field text-right pl-5"
                    />
                  </div>
                </div>
                {/* Subtotal (computed) */}
                <div className="col-span-2 text-right font-mono tabular text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                  {formatCurrency(subtotal)}
                </div>
                {/* URL */}
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px]">🔗</span>
                    <input
                      type="url"
                      value={item.purchaseUrl || ''}
                      placeholder="https://..."
                      onChange={e => updateItem(item.id, { purchaseUrl: e.target.value })}
                      className="input-field pl-6 text-xs"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    />
                  </div>
                </div>
                {/* Delete */}
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm hover:bg-red-50 rounded-sm w-7 h-7 flex items-center justify-center transition-colors"
                    style={{ color: '#B85432' }}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 border border-dashed rounded-sm text-[11px] tracking-wider hover:bg-stone-50 transition-colors"
        style={{ borderColor: '#C7C0B8', color: '#8B8580' }}
      >
        + ADD ITEM · 新增項目
      </button>
    </div>
  );
}
