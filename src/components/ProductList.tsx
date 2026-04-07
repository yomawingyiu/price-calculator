import { useState, useMemo } from 'react';
import type { Product } from '../types';
import { totalCost, retailPrice, discountedPrice, profitMargin, formatCurrency, formatPercent } from '../utils/calculations';
import { PRODUCT_CATEGORIES } from '../types';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'nameCn' | 'totalCost' | 'retailPrice' | 'profitMargin' | 'category' | 'sku';

export function ProductList({ products, onEdit, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('category');
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [marginFilter, setMarginFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');

  const filtered = useMemo(() => {
    let list = products;

    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter(p =>
        p.nameCn.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter);
    }

    if (marginFilter !== 'all') {
      list = list.filter(p => {
        const m = profitMargin(p.costs, p.pricing);
        if (marginFilter === 'high') return m >= 0.7;
        if (marginFilter === 'mid') return m >= 0.5 && m < 0.7;
        return m < 0.5;
      });
    }

    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'nameCn': cmp = a.nameCn.localeCompare(b.nameCn); break;
        case 'sku': cmp = a.sku.localeCompare(b.sku); break;
        case 'totalCost': cmp = totalCost(a.costs) - totalCost(b.costs); break;
        case 'retailPrice': cmp = retailPrice(a.costs, a.pricing) - retailPrice(b.costs, b.pricing); break;
        case 'profitMargin': cmp = profitMargin(a.costs, a.pricing) - profitMargin(b.costs, b.pricing); break;
        case 'category': cmp = a.category.localeCompare(b.category); break;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [products, sortKey, sortAsc, filter, categoryFilter, marginFilter]);

  // summary of filtered
  const sumCost = filtered.reduce((s, p) => s + totalCost(p.costs), 0);
  const sumRetail = filtered.reduce((s, p) => s + retailPrice(p.costs, p.pricing), 0);
  const avgMargin = filtered.length > 0
    ? filtered.reduce((s, p) => s + profitMargin(p.costs, p.pricing), 0) / filtered.length
    : 0;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const arrow = (key: SortKey) => sortKey === key ? (sortAsc ? '↑' : '↓') : '';

  const clearFilters = () => {
    setFilter('');
    setCategoryFilter('');
    setMarginFilter('all');
  };
  const hasFilters = filter || categoryFilter || marginFilter !== 'all';

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="label-xs mb-1">Products</div>
          <h2 className="font-serif text-2xl" style={{ color: '#1A1A1A' }}>
            <em>Collection</em> <span className="text-sm" style={{ color: '#8B8580' }}>· 產品列表</span>
          </h2>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="border rounded-sm mb-0 p-3 flex flex-wrap items-center gap-3"
        style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#8B8580' }}>⌕</span>
          <input
            placeholder="Search name, SKU…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="input-field pl-8"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="input-field max-w-[150px]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Margin filter */}
        <div className="seg">
          <button
            type="button"
            data-active={marginFilter === 'all'}
            onClick={() => setMarginFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            data-active={marginFilter === 'high'}
            onClick={() => setMarginFilter('high')}
          >
            ≥70%
          </button>
          <button
            type="button"
            data-active={marginFilter === 'mid'}
            onClick={() => setMarginFilter('mid')}
          >
            50-70%
          </button>
          <button
            type="button"
            data-active={marginFilter === 'low'}
            onClick={() => setMarginFilter('low')}
          >
            &lt;50%
          </button>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] tracking-wider hover:underline ml-auto"
            style={{ color: '#B85432' }}
          >
            × CLEAR FILTERS
          </button>
        )}
      </div>

      {/* Summary bar */}
      <div
        className="px-4 py-3 border-l border-r flex items-center gap-6 text-[11px]"
        style={{ borderColor: '#E8E4DC', backgroundColor: '#F5F1E8' }}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="label-xs">SHOWING</span>
          <span className="font-mono tabular font-semibold" style={{ color: '#1A1A1A' }}>
            {filtered.length}
          </span>
          <span style={{ color: '#8B8580' }}>/ {products.length}</span>
        </div>
        <div className="h-3 w-px" style={{ backgroundColor: '#E8E4DC' }} />
        <div className="flex items-baseline gap-1.5">
          <span className="label-xs">TOTAL COST</span>
          <span className="font-mono tabular font-semibold" style={{ color: '#1A1A1A' }}>
            {formatCurrency(sumCost)}
          </span>
        </div>
        <div className="h-3 w-px" style={{ backgroundColor: '#E8E4DC' }} />
        <div className="flex items-baseline gap-1.5">
          <span className="label-xs">TOTAL RETAIL</span>
          <span className="font-mono tabular font-semibold" style={{ color: '#1A1A1A' }}>
            {formatCurrency(sumRetail)}
          </span>
        </div>
        <div className="h-3 w-px" style={{ backgroundColor: '#E8E4DC' }} />
        <div className="flex items-baseline gap-1.5">
          <span className="label-xs">AVG MARGIN</span>
          <span
            className="font-mono tabular font-semibold"
            style={{ color: avgMargin >= 0.7 ? '#1A1A1A' : avgMargin >= 0.5 ? '#C4923B' : '#B85432' }}
          >
            {formatPercent(avgMargin)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div
        className="border-l border-r border-b rounded-b-sm overflow-x-auto"
        style={{ borderColor: '#E8E4DC', backgroundColor: '#FFFFFF' }}
      >
        <table className="w-full text-sm">
          <thead className="border-b" style={{ borderColor: '#E8E4DC', backgroundColor: '#FAFAF7' }}>
            <tr>
              <Th onClick={() => toggleSort('category')} active={sortKey === 'category'}>CATEGORY {arrow('category')}</Th>
              <Th onClick={() => toggleSort('nameCn')} active={sortKey === 'nameCn'}>PRODUCT {arrow('nameCn')}</Th>
              <Th onClick={() => toggleSort('sku')} active={sortKey === 'sku'}>SKU {arrow('sku')}</Th>
              <Th onClick={() => toggleSort('totalCost')} active={sortKey === 'totalCost'} align="right">COST {arrow('totalCost')}</Th>
              <Th onClick={() => toggleSort('retailPrice')} active={sortKey === 'retailPrice'} align="right">RETAIL {arrow('retailPrice')}</Th>
              <th className="label-xs text-right px-4 py-3">DISCOUNT</th>
              <th className="label-xs text-right px-4 py-3">PROFIT</th>
              <Th onClick={() => toggleSort('profitMargin')} active={sortKey === 'profitMargin'} align="left">MARGIN {arrow('profitMargin')}</Th>
              <th className="label-xs text-right px-4 py-3 w-1">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16">
                  <div className="font-serif text-lg italic mb-2" style={{ color: '#8B8580' }}>
                    No products match your filters
                  </div>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] tracking-wider underline"
                      style={{ color: '#B85432' }}
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <ProductRow key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProductRow({ product: p, onEdit, onDelete }: { product: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void }) {
  const cost = totalCost(p.costs);
  const price = retailPrice(p.costs, p.pricing);
  const disc = discountedPrice(price, p.pricing.discountRate);
  const margin = profitMargin(p.costs, p.pricing);
  const profit = price - cost;

  const marginColor = margin >= 0.7 ? '#1A1A1A' : margin >= 0.5 ? '#C4923B' : '#B85432';

  return (
    <tr
      className="border-b hover:bg-stone-50/50 transition-colors group"
      style={{ borderColor: '#F0EDE6' }}
    >
      <td className="px-4 py-3 text-[11px]" style={{ color: '#8B8580' }}>
        {p.category}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-sm" style={{ color: '#1A1A1A' }}>{p.nameCn}</div>
        <div className="text-[11px] italic" style={{ color: '#8B8580' }}>{p.nameEn || '—'}</div>
      </td>
      <td className="px-4 py-3 font-mono tabular text-[11px]" style={{ color: '#8B8580' }}>{p.sku}</td>
      <td className="px-4 py-3 text-right font-mono tabular text-xs" style={{ color: '#4A4A48' }}>
        {formatCurrency(cost)}
      </td>
      <td className="px-4 py-3 text-right font-mono tabular text-sm font-semibold" style={{ color: '#1A1A1A' }}>
        {formatCurrency(price)}
      </td>
      <td className="px-4 py-3 text-right font-mono tabular text-xs" style={{ color: '#B85432' }}>
        {formatCurrency(disc)}
      </td>
      <td className="px-4 py-3 text-right font-mono tabular text-xs" style={{ color: '#5C8A6E' }}>
        +{formatCurrency(profit)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 w-28">
          <div className="flex-1 h-1 rounded-sm" style={{ backgroundColor: '#F0EDE6' }}>
            <div
              className="h-full rounded-sm"
              style={{ width: `${Math.min(margin * 100, 100)}%`, backgroundColor: marginColor }}
            />
          </div>
          <span className="font-mono tabular text-[11px] font-semibold w-10 text-right" style={{ color: marginColor }}>
            {(margin * 100).toFixed(0)}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <button
          onClick={() => onEdit(p)}
          className="text-[10px] tracking-wider mr-2 hover:underline"
          style={{ color: '#1A1A1A' }}
        >
          EDIT
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="text-[10px] tracking-wider hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: '#B85432' }}
        >
          DELETE
        </button>
      </td>
    </tr>
  );
}

function Th({
  children, onClick, align, active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  align?: 'right' | 'left';
  active?: boolean;
}) {
  return (
    <th
      onClick={onClick}
      className={`label-xs cursor-pointer hover:text-stone-900 select-none px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: active ? '#1A1A1A' : undefined }}
    >
      {children}
    </th>
  );
}
