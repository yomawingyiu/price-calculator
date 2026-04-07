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

export function ProductForm({ editProduct, onSave, onUpdate, onCancel }: Props) {
  const [nameEn, setNameEn] = useState('');
  const [nameCn, setNameCn] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('細件皮具');
  const [leatherType, setLeatherType] = useState<LeatherType>('有紋蘋果皮');
  const [costs, setCosts] = useState<CostBreakdown>({ ...emptyCosts });
  const [pricing, setPricing] = useState<PricingConfig>({ ...defaultPricing });

  // Leather cm calculator state
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

  // Calculate leather cost from cm dimensions
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

  // When leather type changes, zero out unused leather fields
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

  const inputClass = "w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500";

  const costField = (label: string, key: keyof CostBreakdown, suffix?: string) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {!suffix && <span className="text-xs text-gray-400">$</span>}
        <input
          type="number" min="0" step="0.1"
          value={costs[key] || ''}
          onChange={e => updateCost(key, e.target.value)}
          className={inputClass}
        />
        {suffix && <span className="text-xs text-gray-400 whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );

  const areaCm2 = leatherLengthCm * leatherWidthCm;
  const areaSqFt = areaCm2 > 0 ? areaCm2 / 929.03 : 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {editProduct ? '✏️ 編輯產品' : '➕ 新增產品'}
      </h2>

      {/* Basic info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">產品名稱（中文）*</label>
          <input required value={nameCn} onChange={e => setNameCn(e.target.value)}
            placeholder="例：維度卡片套"
            className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Product Name (EN)</label>
          <input value={nameEn} onChange={e => setNameEn(e.target.value)}
            placeholder="e.g. D2 Cardholder"
            className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">SKU</label>
          <input value={sku} onChange={e => setSku(e.target.value)}
            placeholder="例：APD2"
            className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">類別</label>
            <select value={category} onChange={e => setCategory(e.target.value as ProductCategory)}
              className={inputClass}>
              {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">皮料類型</label>
            <select value={leatherType} onChange={e => handleLeatherTypeChange(e.target.value as LeatherType)}
              className={inputClass}>
              {LEATHER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="border-t pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">成本明細</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          {costField('手工費', 'laborCost')}
          {costField('五金配件', 'hardwareCost')}
          {costField('包裝成本', 'packagingCost')}
          {costField('運費成本', 'shippingCost')}
        </div>

        {/* Leather section — only shows relevant type */}
        {(isAppleLeather || isGoatLeather) && (
          <div className={`rounded-lg p-3 mb-3 border ${isAppleLeather ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <h4 className={`text-xs font-semibold mb-3 ${isAppleLeather ? 'text-green-700' : 'text-amber-700'}`}>
              {isAppleLeather ? '🍎 蘋果皮成本' : '🐐 意大利山羊皮成本'} — {leatherType}
            </h4>

            {/* CM Calculator */}
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-2">📐 輸入皮料尺寸自動計算成本：</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">長 (cm)</label>
                  <input type="number" min="0" step="0.1"
                    value={leatherLengthCm || ''}
                    placeholder="0"
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherLengthCm(v);
                      calcLeatherFromCm(v, leatherWidthCm, leatherPricePerSqFt);
                    }}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">寬 (cm)</label>
                  <input type="number" min="0" step="0.1"
                    value={leatherWidthCm || ''}
                    placeholder="0"
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherWidthCm(v);
                      calcLeatherFromCm(leatherLengthCm, v, leatherPricePerSqFt);
                    }}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">每平方呎單價 ($)</label>
                  <input type="number" min="0" step="0.1"
                    value={leatherPricePerSqFt || ''}
                    onChange={e => {
                      const v = parseFloat(e.target.value) || 0;
                      setLeatherPricePerSqFt(v);
                      calcLeatherFromCm(leatherLengthCm, leatherWidthCm, v);
                    }}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">計算面積</label>
                  <div className={`px-2 py-1.5 text-sm rounded border text-gray-700 font-medium ${areaSqFt > 0 ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    {areaSqFt > 0 ? `${areaSqFt.toFixed(3)} ft²` : '— ft²'}
                  </div>
                </div>
              </div>
            </div>

            {/* Leather cost result (auto-filled, but can also manually edit) */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {isAppleLeather ? (
                <>
                  {costField('皮料數量 (平方呎)', 'leatherQtyApple', 'ft²')}
                  {costField('皮料成本', 'leatherCostApple')}
                </>
              ) : (
                <>
                  {costField('皮料數量 (平方呎)', 'leatherQtyGoat', 'ft²')}
                  {costField('皮料成本', 'leatherCostGoat')}
                </>
              )}
            </div>
          </div>
        )}

        {isOtherLeather && (
          <div className="rounded-lg p-3 mb-3 bg-gray-50 border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">🧵 其他皮料成本</h4>
            <div className="grid grid-cols-2 gap-3">
              {costField('皮料數量', 'leatherQtyApple', '平方呎')}
              {costField('皮料成本', 'leatherCostApple')}
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-gray-500">材料成本: <strong className="text-gray-800">{formatCurrency(mat)}</strong></span>
          <span className="text-gray-500">總成本: <strong className="text-amber-700 text-base">{formatCurrency(total)}</strong></span>
        </div>
      </div>

      {/* Pricing */}
      <div className="border-t pt-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">定價設定</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs text-gray-500 self-center mr-1">定價方式:</span>
          {(['multiplier', 'fixed', 'margin'] as const).map(m => (
            <button key={m} type="button"
              onClick={() => setPricing(p => ({ ...p, method: m }))}
              className={`px-3 py-1 rounded-full text-xs ${pricing.method === m ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {m === 'multiplier' ? '倍數' : m === 'fixed' ? '固定價格' : '目標利潤率'}
            </button>
          ))}
        </div>

        {pricing.method === 'multiplier' && (
          <div className="flex gap-2 mb-3">
            {MULTIPLIERS.map(m => (
              <button key={m} type="button"
                onClick={() => setPricing(p => ({ ...p, multiplier: m }))}
                className={`px-4 py-2 rounded text-sm font-medium ${pricing.multiplier === m ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                X {m}
              </button>
            ))}
          </div>
        )}

        {pricing.method === 'fixed' && (
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">零售價</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">$</span>
              <input type="number" min="0" step="1"
                value={pricing.fixedPrice || ''}
                onChange={e => setPricing(p => ({ ...p, fixedPrice: parseFloat(e.target.value) || 0 }))}
                className="w-40 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
            </div>
          </div>
        )}

        {pricing.method === 'margin' && (
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">目標利潤率 (%)</label>
            <input type="number" min="0" max="99" step="1"
              value={pricing.multiplier || ''}
              onChange={e => setPricing(p => ({ ...p, multiplier: parseFloat(e.target.value) || 0 }))}
              className="w-40 border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500" />
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <span className="text-xs text-gray-500 self-center mr-1">折扣:</span>
          {DISCOUNT_PRESETS.map(d => (
            <button key={d} type="button"
              onClick={() => setPricing(p => ({ ...p, discountRate: d }))}
              className={`px-3 py-1 rounded text-xs ${pricing.discountRate === d ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {Math.round(d * 100)}折
            </button>
          ))}
          <input type="number" min="0" max="1" step="0.01"
            value={pricing.discountRate}
            onChange={e => setPricing(p => ({ ...p, discountRate: parseFloat(e.target.value) || 1 }))}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-xs" />
        </div>

        {/* Price summary */}
        <div className="bg-amber-50 rounded-lg p-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>
            <span className="text-xs text-gray-500 block">零售價</span>
            <span className="text-lg font-bold text-amber-800">{formatCurrency(price)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">折扣價 ({Math.round(pricing.discountRate * 100)}折)</span>
            <span className="text-lg font-bold text-amber-700">{formatCurrency(discPrice)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">利潤</span>
            <span className="text-lg font-bold text-green-700">{formatCurrency(price - total)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">利潤率</span>
            <span className="text-lg font-bold text-green-700">{formatPercent(margin)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">倍數</span>
            <span className="text-lg font-bold text-gray-700">X {total > 0 ? (price / total).toFixed(2) : '0'}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={resetForm}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
          取消
        </button>
        <button type="submit"
          className="px-6 py-2 text-sm text-white bg-amber-700 rounded hover:bg-amber-800 font-medium">
          {editProduct ? '更新產品' : '新增產品'}
        </button>
      </div>
    </form>
  );
}
