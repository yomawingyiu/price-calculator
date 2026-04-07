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

const inputCls = "w-full bg-transparent border-b py-2 px-1 text-sm font-mono focus:bg-stone-50/50 transition-colors";
const inputStyle = { borderColor: '#E8E4DC', color: '#1A1A1A' };
const labelCls = "block text-[10px] uppercase tracking-[0.2em] mb-2";
const labelStyle = { color: '#8B8580' };

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
      <label className={labelCls} style={labelStyle}>{label}</label>
      <div className="flex items-baseline gap-1">
        {!suffix && <span className="text-xs font-serif italic" style={{ color: '#8B8580' }}>$</span>}
        <input
          type="number" min="0" step="0.1"
          value={costs[key] || ''}
          placeholder="—"
          onChange={e => updateCost(key, e.target.value)}
          className={inputCls}
          style={inputStyle}
        />
        {suffix && <span className="text-[10px] uppercase whitespace-nowrap" style={{ color: '#8B8580' }}>{suffix}</span>}
      </div>
    </div>
  );

  const areaCm2 = leatherLengthCm * leatherWidthCm;
  const areaSqFt = areaCm2 > 0 ? areaCm2 / 929.03 : 0;

  return (
    <form onSubmit={handleSubmit} className="mb-12 pb-12 border-b" style={{ borderColor: '#E8E4DC' }}>
      {/* Editorial section header */}
      <div className="flex items-baseline gap-4 mb-10">
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8B8580' }}>
          № 02
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: '#E8E4DC' }} />
        <h2 className="font-serif text-2xl italic font-light" style={{ color: editProduct ? '#B85432' : '#1A1A1A' }}>
          {editProduct ? 'Editing' : 'New Entry'}
        </h2>
      </div>

      {/* Section: Basic Info */}
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: '#8B8580' }}>
          i. Identity / 基本資料
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <label className={labelCls} style={labelStyle}>產品名稱（中文）*</label>
            <input
              required
              value={nameCn}
              onChange={e => setNameCn(e.target.value)}
              placeholder="維度卡片套"
              className="w-full bg-transparent border-b py-2 px-1 font-serif text-lg italic placeholder:text-stone-300"
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Product Name (EN)</label>
            <input
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder="D2 Cardholder"
              className="w-full bg-transparent border-b py-2 px-1 font-serif text-lg italic placeholder:text-stone-300"
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>SKU</label>
            <input
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="APD2"
              className="w-full bg-transparent border-b py-2 px-1 font-mono text-sm placeholder:text-stone-300"
              style={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={labelStyle}>類別</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-transparent border-b py-2 px-1 text-sm"
                style={inputStyle}
              >
                {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>皮料</label>
              <select
                value={leatherType}
                onChange={e => handleLeatherTypeChange(e.target.value as LeatherType)}
                className="w-full bg-transparent border-b py-2 px-1 text-sm"
                style={inputStyle}
              >
                {LEATHER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Costs */}
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: '#8B8580' }}>
          ii. Composition of Cost / 成本明細
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {costField('Labor / 手工費', 'laborCost')}
          {costField('Hardware / 五金', 'hardwareCost')}
          {costField('Packaging / 包裝', 'packagingCost')}
          {costField('Shipping / 運費', 'shippingCost')}
        </div>

        {/* Leather block — minimal frame */}
        {(isAppleLeather || isGoatLeather) && (
          <div className="border-l-2 pl-6 py-2" style={{ borderColor: '#B85432' }}>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-xl italic font-light" style={{ color: '#1A1A1A' }}>
                {isAppleLeather ? 'Apple Leather' : 'Italian Goatskin'}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
                — {leatherType}
              </span>
            </div>

            <div className="text-[10px] italic mb-5" style={{ color: '#8B8580' }}>
              ⌗ Enter dimensions to compute leather cost automatically
            </div>

            {/* CM Calculator */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <label className={labelCls} style={labelStyle}>長 Length (cm)</label>
                <input type="number" min="0" step="0.1"
                  value={leatherLengthCm || ''}
                  placeholder="—"
                  onChange={e => {
                    const v = parseFloat(e.target.value) || 0;
                    setLeatherLengthCm(v);
                    calcLeatherFromCm(v, leatherWidthCm, leatherPricePerSqFt);
                  }}
                  className={inputCls}
                  style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>寬 Width (cm)</label>
                <input type="number" min="0" step="0.1"
                  value={leatherWidthCm || ''}
                  placeholder="—"
                  onChange={e => {
                    const v = parseFloat(e.target.value) || 0;
                    setLeatherWidthCm(v);
                    calcLeatherFromCm(leatherLengthCm, v, leatherPricePerSqFt);
                  }}
                  className={inputCls}
                  style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>單價 Price / ft²</label>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-serif italic" style={{ color: '#8B8580' }}>$</span>
                  <input type="number" min="0" step="0.1"
                    value={leatherPricePerSqFt || ''}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherPricePerSqFt(v);
                      calcLeatherFromCm(leatherLengthCm, leatherWidthCm, v);
                    }}
                    className={inputCls}
                    style={inputStyle} />
                </div>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>面積 Area</label>
                <div
                  className="font-serif text-xl font-light italic py-2 px-1"
                  style={{ color: areaSqFt > 0 ? '#B85432' : '#E8E4DC' }}
                >
                  {areaSqFt > 0 ? `${areaSqFt.toFixed(3)}` : '—'}
                  <span className="text-xs ml-1" style={{ color: '#8B8580' }}>ft²</span>
                </div>
              </div>
            </div>

            {/* Manual override */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t" style={{ borderColor: '#F0EDE6' }}>
              {isAppleLeather ? (
                <>
                  <div>
                    <label className={labelCls} style={labelStyle}>數量 Qty (ft²)</label>
                    <input type="number" min="0" step="0.001"
                      value={costs.leatherQtyApple || ''}
                      placeholder="—"
                      onChange={e => updateCost('leatherQtyApple', e.target.value)}
                      className={inputCls}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>成本 Cost ($)</label>
                    <input type="number" min="0" step="0.1"
                      value={costs.leatherCostApple || ''}
                      placeholder="—"
                      onChange={e => updateCost('leatherCostApple', e.target.value)}
                      className={inputCls}
                      style={inputStyle} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelCls} style={labelStyle}>數量 Qty (ft²)</label>
                    <input type="number" min="0" step="0.001"
                      value={costs.leatherQtyGoat || ''}
                      placeholder="—"
                      onChange={e => updateCost('leatherQtyGoat', e.target.value)}
                      className={inputCls}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>成本 Cost ($)</label>
                    <input type="number" min="0" step="0.1"
                      value={costs.leatherCostGoat || ''}
                      placeholder="—"
                      onChange={e => updateCost('leatherCostGoat', e.target.value)}
                      className={inputCls}
                      style={inputStyle} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isOtherLeather && (
          <div className="border-l-2 pl-6 py-2" style={{ borderColor: '#8B8580' }}>
            <div className="font-serif text-xl italic font-light mb-6" style={{ color: '#1A1A1A' }}>
              Other Material — 其他皮料
            </div>
            <div className="grid grid-cols-2 gap-6">
              {costField('數量 Qty', 'leatherQtyApple', 'ft²')}
              {costField('成本 Cost', 'leatherCostApple')}
            </div>
          </div>
        )}

        {/* Cost summary - elegant inline */}
        <div className="mt-10 flex items-baseline gap-12">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
              Material / 材料成本
            </div>
            <div className="font-serif text-2xl font-light italic mt-1" style={{ color: '#4A4A48' }}>
              {formatCurrency(mat)}
            </div>
          </div>
          <div className="h-12 w-px" style={{ backgroundColor: '#E8E4DC' }} />
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
              Total / 總成本
            </div>
            <div className="font-serif text-3xl font-medium mt-1" style={{ color: '#1A1A1A' }}>
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Pricing */}
      <div className="mb-12">
        <div className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: '#8B8580' }}>
          iii. Pricing / 定價設定
        </div>

        {/* Method tabs */}
        <div className="flex items-center gap-6 mb-8">
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
            Method
          </span>
          {(['multiplier', 'fixed', 'margin'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setPricing(p => ({ ...p, method: m }))}
              className="text-xs uppercase tracking-[0.15em] pb-1 transition-all"
              style={{
                borderBottom: pricing.method === m ? '1px solid #1A1A1A' : '1px solid transparent',
                color: pricing.method === m ? '#1A1A1A' : '#8B8580',
                fontWeight: pricing.method === m ? 600 : 400,
              }}
            >
              {m === 'multiplier' ? '倍數' : m === 'fixed' ? '固定價' : '利潤率'}
            </button>
          ))}
        </div>

        {pricing.method === 'multiplier' && (
          <div className="flex items-center gap-6 mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
              Multiplier
            </span>
            {MULTIPLIERS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setPricing(p => ({ ...p, multiplier: m }))}
                className="font-serif text-2xl font-light italic transition-all"
                style={{
                  color: pricing.multiplier === m ? '#B85432' : '#E8E4DC',
                }}
              >
                ×{m}
              </button>
            ))}
          </div>
        )}

        {pricing.method === 'fixed' && (
          <div className="mb-8 max-w-xs">
            <label className={labelCls} style={labelStyle}>Retail Price / 零售價</label>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl italic" style={{ color: '#8B8580' }}>$</span>
              <input type="number" min="0" step="1"
                value={pricing.fixedPrice || ''}
                onChange={e => setPricing(p => ({ ...p, fixedPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-transparent border-b py-2 px-1 font-serif text-3xl font-light"
                style={inputStyle} />
            </div>
          </div>
        )}

        {pricing.method === 'margin' && (
          <div className="mb-8 max-w-xs">
            <label className={labelCls} style={labelStyle}>Target Margin / 目標利潤率 (%)</label>
            <input type="number" min="0" max="99" step="1"
              value={pricing.multiplier || ''}
              onChange={e => setPricing(p => ({ ...p, multiplier: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-transparent border-b py-2 px-1 font-serif text-3xl font-light"
              style={inputStyle} />
          </div>
        )}

        {/* Discount */}
        <div className="flex items-center gap-6 mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
            Discount
          </span>
          {DISCOUNT_PRESETS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setPricing(p => ({ ...p, discountRate: d }))}
              className="font-serif text-base italic pb-1 transition-all"
              style={{
                borderBottom: pricing.discountRate === d ? '1px solid #1A1A1A' : '1px solid transparent',
                color: pricing.discountRate === d ? '#1A1A1A' : '#8B8580',
              }}
            >
              {Math.round(d * 100)}折
            </button>
          ))}
          <input type="number" min="0" max="1" step="0.01"
            value={pricing.discountRate}
            onChange={e => setPricing(p => ({ ...p, discountRate: parseFloat(e.target.value) || 1 }))}
            className="w-16 bg-transparent border-b text-xs font-mono py-1 px-1 ml-2"
            style={inputStyle} />
        </div>

        {/* Price summary - editorial */}
        <div className="border-t border-b py-8 grid grid-cols-2 md:grid-cols-5 gap-6" style={{ borderColor: '#1A1A1A' }}>
          <Summary label="Retail / 零售價" value={formatCurrency(price)} large />
          <Summary label={`Discount / ${Math.round(pricing.discountRate * 100)}折`} value={formatCurrency(discPrice)} accent />
          <Summary label="Profit / 利潤" value={formatCurrency(price - total)} />
          <Summary label="Margin / 利潤率" value={formatPercent(margin)} />
          <Summary label="Multiplier / 倍數" value={`×${total > 0 ? (price / total).toFixed(2) : '0'}`} muted />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-8 justify-end items-center pt-4">
        <button
          type="button"
          onClick={resetForm}
          className="text-[10px] uppercase tracking-[0.25em] hover:opacity-50 transition-opacity"
          style={{ color: '#8B8580' }}
        >
          Cancel / 取消
        </button>
        <button
          type="submit"
          className="text-[10px] uppercase tracking-[0.25em] border-b pb-1 hover:opacity-60 transition-opacity"
          style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
        >
          {editProduct ? 'Update Entry / 更新' : 'Save Entry / 新增'} →
        </button>
      </div>
    </form>
  );
}

function Summary({ label, value, large, accent, muted }: { label: string; value: string; large?: boolean; accent?: boolean; muted?: boolean }) {
  const color = accent ? '#B85432' : muted ? '#8B8580' : '#1A1A1A';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: '#8B8580' }}>
        {label}
      </div>
      <div
        className={`font-serif font-light ${large ? 'text-4xl' : 'text-2xl'} ${accent ? 'italic' : ''} leading-none`}
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
