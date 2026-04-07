import { useState, useEffect } from 'react';
import type { Product, CostBreakdown, PricingConfig, ProductCategory, LeatherType } from '../types';
import { PRODUCT_CATEGORIES, LEATHER_TYPES, MULTIPLIERS, DISCOUNT_PRESETS, emptyCosts, defaultPricing } from '../types';
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

const inputCls = "w-full border-2 border-black bg-white px-3 py-2 text-sm font-mono focus:bg-yellow-50";
const labelCls = "block text-[10px] font-black uppercase tracking-widest mb-1.5";
const sectionTitleCls = "text-xs font-black uppercase tracking-[0.2em] mb-4 pb-2 border-b-2 border-black inline-block";

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

  const costField = (label: string, key: keyof CostBreakdown, suffix?: string) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-1">
        {!suffix && <span className="text-xs font-black">$</span>}
        <input
          type="number" min="0" step="0.1"
          value={costs[key] || ''}
          onChange={e => updateCost(key, e.target.value)}
          className={inputCls}
        />
        {suffix && <span className="text-[10px] font-black uppercase whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );

  const areaCm2 = leatherLengthCm * leatherWidthCm;
  const areaSqFt = areaCm2 > 0 ? areaCm2 / 929.03 : 0;

  return (
    <form onSubmit={handleSubmit} className="border-2 border-black bg-white mb-6">
      {/* Header bar */}
      <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between" style={{ backgroundColor: editProduct ? '#1D3557' : '#F4C842' }}>
        <h2 className={`text-sm font-black uppercase tracking-[0.2em] ${editProduct ? 'text-white' : 'text-black'}`}>
          {editProduct ? '✎ Edit Product / 編輯產品' : '+ New Product / 新增產品'}
        </h2>
        <span className={`text-xs font-mono ${editProduct ? 'text-white opacity-60' : 'opacity-60'}`}>
          {editProduct ? `[${editProduct.sku || editProduct.id.slice(0, 8)}]` : '[NEW]'}
        </span>
      </div>

      <div className="p-6">
        {/* Section: Basic Info */}
        <div className="mb-8">
          <h3 className={sectionTitleCls}>01 / Basic Info / 基本資料</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>產品名稱（中文）*</label>
              <input required value={nameCn} onChange={e => setNameCn(e.target.value)}
                placeholder="維度卡片套" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Product Name (EN)</label>
              <input value={nameEn} onChange={e => setNameEn(e.target.value)}
                placeholder="D2 Cardholder" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>SKU</label>
              <input value={sku} onChange={e => setSku(e.target.value)}
                placeholder="APD2" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>類別</label>
                <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)}
                  className={inputCls}>
                  {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>皮料</label>
                <select value={leatherType} onChange={e => handleLeatherTypeChange(e.target.value as LeatherType)}
                  className={inputCls}>
                  {LEATHER_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Costs */}
        <div className="mb-8">
          <h3 className={sectionTitleCls}>02 / Costs / 成本明細</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {costField('手工費 LABOR', 'laborCost')}
            {costField('五金 HARDWARE', 'hardwareCost')}
            {costField('包裝 PACKAGING', 'packagingCost')}
            {costField('運費 SHIPPING', 'shippingCost')}
          </div>

          {/* Leather block */}
          {(isAppleLeather || isGoatLeather) && (
            <div
              className="border-2 border-black p-5 relative"
              style={{ backgroundColor: isAppleLeather ? '#F2EFE9' : '#1D3557' }}
            >
              {/* Geometric corner shape */}
              <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center">
                {isAppleLeather ? (
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#E63946' }} />
                ) : (
                  <div className="w-6 h-6" style={{ backgroundColor: '#F4C842' }} />
                )}
              </div>

              <div className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${isGoatLeather ? 'text-white' : 'text-black'}`}>
                Leather Cost / {isAppleLeather ? '蘋果皮' : '意大利山羊皮'} — {leatherType}
              </div>

              <div className={`text-[10px] uppercase tracking-wider mb-3 ${isGoatLeather ? 'text-white opacity-70' : 'opacity-60'}`}>
                ▸ 輸入皮料尺寸自動計算成本
              </div>

              {/* CM Calculator Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className={`${labelCls} ${isGoatLeather ? 'text-white' : ''}`}>長 LENGTH (cm)</label>
                  <input type="number" min="0" step="0.1"
                    value={leatherLengthCm || ''}
                    placeholder="0"
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherLengthCm(v);
                      calcLeatherFromCm(v, leatherWidthCm, leatherPricePerSqFt);
                    }}
                    className={inputCls} />
                </div>
                <div>
                  <label className={`${labelCls} ${isGoatLeather ? 'text-white' : ''}`}>寬 WIDTH (cm)</label>
                  <input type="number" min="0" step="0.1"
                    value={leatherWidthCm || ''}
                    placeholder="0"
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherWidthCm(v);
                      calcLeatherFromCm(leatherLengthCm, v, leatherPricePerSqFt);
                    }}
                    className={inputCls} />
                </div>
                <div>
                  <label className={`${labelCls} ${isGoatLeather ? 'text-white' : ''}`}>單價 PRICE/FT² ($)</label>
                  <input type="number" min="0" step="0.1"
                    value={leatherPricePerSqFt || ''}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherPricePerSqFt(v);
                      calcLeatherFromCm(leatherLengthCm, leatherWidthCm, v);
                    }}
                    className={inputCls} />
                </div>
                <div>
                  <label className={`${labelCls} ${isGoatLeather ? 'text-white' : ''}`}>面積 AREA</label>
                  <div
                    className="border-2 border-black px-3 py-2 text-sm font-mono font-bold"
                    style={{
                      backgroundColor: areaSqFt > 0 ? '#F4C842' : '#FFFFFF',
                      color: '#0A0A0A',
                    }}
                  >
                    {areaSqFt > 0 ? `${areaSqFt.toFixed(3)} ft²` : '— ft²'}
                  </div>
                </div>
              </div>

              {/* Manual override fields */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t-2" style={{ borderColor: isGoatLeather ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}>
                {isAppleLeather ? (
                  <>
                    <div>
                      <label className={labelCls}>數量 QTY (ft²)</label>
                      <input type="number" min="0" step="0.001"
                        value={costs.leatherQtyApple || ''}
                        onChange={e => updateCost('leatherQtyApple', e.target.value)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>成本 COST ($)</label>
                      <input type="number" min="0" step="0.1"
                        value={costs.leatherCostApple || ''}
                        onChange={e => updateCost('leatherCostApple', e.target.value)}
                        className={inputCls} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={`${labelCls} text-white`}>數量 QTY (ft²)</label>
                      <input type="number" min="0" step="0.001"
                        value={costs.leatherQtyGoat || ''}
                        onChange={e => updateCost('leatherQtyGoat', e.target.value)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={`${labelCls} text-white`}>成本 COST ($)</label>
                      <input type="number" min="0" step="0.1"
                        value={costs.leatherCostGoat || ''}
                        onChange={e => updateCost('leatherCostGoat', e.target.value)}
                        className={inputCls} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {isOtherLeather && (
            <div className="border-2 border-black p-5 bg-white">
              <div className="text-xs font-black uppercase tracking-[0.2em] mb-4">
                Other Material / 其他皮料
              </div>
              <div className="grid grid-cols-2 gap-3">
                {costField('數量 QTY', 'leatherQtyApple', 'ft²')}
                {costField('成本 COST', 'leatherCostApple')}
              </div>
            </div>
          )}

          {/* Cost summary strip */}
          <div className="mt-6 border-2 border-black grid grid-cols-2">
            <div className="px-4 py-3 border-r-2 border-black" style={{ backgroundColor: '#F2EFE9' }}>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Material Cost / 材料成本</div>
              <div className="text-xl font-black font-mono mt-1">{formatCurrency(mat)}</div>
            </div>
            <div className="px-4 py-3" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Cost / 總成本</div>
              <div className="text-xl font-black font-mono mt-1">{formatCurrency(total)}</div>
            </div>
          </div>
        </div>

        {/* Section: Pricing */}
        <div className="mb-8">
          <h3 className={sectionTitleCls}>03 / Pricing / 定價設定</h3>

          {/* Pricing method tabs */}
          <div className="flex gap-0 mb-5 border-2 border-black w-fit">
            {(['multiplier', 'fixed', 'margin'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setPricing(p => ({ ...p, method: m }))}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest border-r-2 border-black last:border-r-0 transition-colors"
                style={{
                  backgroundColor: pricing.method === m ? '#0A0A0A' : '#FFFFFF',
                  color: pricing.method === m ? '#FFFFFF' : '#0A0A0A',
                }}
              >
                {m === 'multiplier' ? '倍數' : m === 'fixed' ? '固定價' : '利潤率'}
              </button>
            ))}
          </div>

          {pricing.method === 'multiplier' && (
            <div className="flex gap-0 mb-5 border-2 border-black w-fit">
              {MULTIPLIERS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPricing(p => ({ ...p, multiplier: m }))}
                  className="px-5 py-2 text-sm font-black border-r-2 border-black last:border-r-0 font-mono"
                  style={{
                    backgroundColor: pricing.multiplier === m ? '#E63946' : '#FFFFFF',
                    color: pricing.multiplier === m ? '#FFFFFF' : '#0A0A0A',
                  }}
                >
                  ×{m}
                </button>
              ))}
            </div>
          )}

          {pricing.method === 'fixed' && (
            <div className="mb-5">
              <label className={labelCls}>零售價 RETAIL PRICE</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black">$</span>
                <input type="number" min="0" step="1"
                  value={pricing.fixedPrice || ''}
                  onChange={e => setPricing(p => ({ ...p, fixedPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-48 border-2 border-black bg-white px-3 py-2 text-base font-mono font-bold" />
              </div>
            </div>
          )}

          {pricing.method === 'margin' && (
            <div className="mb-5">
              <label className={labelCls}>目標利潤率 TARGET MARGIN (%)</label>
              <input type="number" min="0" max="99" step="1"
                value={pricing.multiplier || ''}
                onChange={e => setPricing(p => ({ ...p, multiplier: parseFloat(e.target.value) || 0 }))}
                className="w-48 border-2 border-black bg-white px-3 py-2 text-base font-mono font-bold" />
            </div>
          )}

          {/* Discount */}
          <div className="mb-6">
            <label className={labelCls}>折扣 Discount</label>
            <div className="flex gap-0 border-2 border-black w-fit">
              {DISCOUNT_PRESETS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setPricing(p => ({ ...p, discountRate: d }))}
                  className="px-4 py-2 text-xs font-black border-r-2 border-black last:border-r-0 font-mono"
                  style={{
                    backgroundColor: pricing.discountRate === d ? '#1D3557' : '#FFFFFF',
                    color: pricing.discountRate === d ? '#FFFFFF' : '#0A0A0A',
                  }}
                >
                  {Math.round(d * 100)}折
                </button>
              ))}
              <input type="number" min="0" max="1" step="0.01"
                value={pricing.discountRate}
                onChange={e => setPricing(p => ({ ...p, discountRate: parseFloat(e.target.value) || 1 }))}
                className="w-20 border-l-2 border-black px-2 py-2 text-xs font-mono" />
            </div>
          </div>

          {/* Price summary blocks */}
          <div className="border-2 border-black grid grid-cols-2 md:grid-cols-5">
            <Summary label="Retail / 零售價" value={formatCurrency(price)} bg="#F4C842" />
            <Summary label={`Discount / ${Math.round(pricing.discountRate * 100)}折`} value={formatCurrency(discPrice)} bg="#E63946" color="#FFFFFF" />
            <Summary label="Profit / 利潤" value={formatCurrency(price - total)} bg="#FFFFFF" />
            <Summary label="Margin / 利潤率" value={formatPercent(margin)} bg="#1D3557" color="#FFFFFF" />
            <Summary label="Multiplier / 倍數" value={`×${total > 0 ? (price / total).toFixed(2) : '0'}`} bg="#0A0A0A" color="#FFFFFF" last />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-6 border-t-2 border-black">
          <button
            type="button"
            onClick={resetForm}
            className="bh-btn px-6 py-3 text-xs font-black uppercase tracking-widest border-2 border-black bg-white"
          >
            Cancel / 取消
          </button>
          <button
            type="submit"
            className="bh-btn px-8 py-3 text-xs font-black uppercase tracking-widest border-2 border-black"
            style={{ backgroundColor: '#E63946', color: '#FFFFFF' }}
          >
            {editProduct ? 'Update / 更新' : 'Save / 新增'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Summary({ label, value, bg, color, last }: { label: string; value: string; bg: string; color?: string; last?: boolean }) {
  return (
    <div
      className={`px-4 py-3 ${last ? '' : 'border-r-2 border-black'} border-b-2 md:border-b-0`}
      style={{ backgroundColor: bg, color: color || '#0A0A0A' }}
    >
      <div className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</div>
      <div className="text-lg font-black font-mono mt-1 leading-none">{value}</div>
    </div>
  );
}
