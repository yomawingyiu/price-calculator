import { useState, useMemo } from 'react';
import type { Product } from '../types';
import { totalCost, retailPrice, discountedPrice, profitMargin, formatCurrency, formatPercent } from '../utils/calculations';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'nameCn' | 'totalCost' | 'retailPrice' | 'profitMargin' | 'category';

export function ProductList({ products, onEdit, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('category');
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    let list = products;
    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter(p =>
        p.nameCn.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.includes(q)
      );
    }
    return list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'nameCn': cmp = a.nameCn.localeCompare(b.nameCn); break;
        case 'totalCost': cmp = totalCost(a.costs) - totalCost(b.costs); break;
        case 'retailPrice': cmp = retailPrice(a.costs, a.pricing) - retailPrice(b.costs, b.pricing); break;
        case 'profitMargin': cmp = profitMargin(a.costs, a.pricing) - profitMargin(b.costs, b.pricing); break;
        case 'category': cmp = a.category.localeCompare(b.category); break;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [products, sortKey, sortAsc, filter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const arrow = (key: SortKey) => sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

  // Group by category
  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    filtered.forEach(p => {
      const list = map.get(p.category) || [];
      list.push(p);
      map.set(p.category, list);
    });
    return map;
  }, [filtered]);

  return (
    <section className="mt-12">
      {/* Editorial section header */}
      <div className="flex items-baseline gap-4 mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#8B8580' }}>
          № 03
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: '#E8E4DC' }} />
        <h2 className="font-serif text-2xl italic font-light" style={{ color: '#1A1A1A' }}>
          Collection
        </h2>
      </div>

      {/* Search bar - minimal */}
      <div className="flex items-baseline gap-6 mb-8 pb-4 border-b" style={{ borderColor: '#E8E4DC' }}>
        <span className="font-serif text-lg italic" style={{ color: '#1A1A1A' }}>
          {filtered.length} <span className="text-xs tracking-wide" style={{ color: '#8B8580' }}>products</span>
        </span>
        <input
          placeholder="Search by name, SKU..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="ml-auto bg-transparent border-b text-sm py-1 px-1 w-64 placeholder:italic"
          style={{ borderColor: '#E8E4DC', color: '#1A1A1A' }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: '#1A1A1A' }}>
              <Th onClick={() => toggleSort('category')}>類別{arrow('category')}</Th>
              <Th onClick={() => toggleSort('nameCn')}>Product / 產品{arrow('nameCn')}</Th>
              <th className="px-3 py-4 text-left text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>SKU</th>
              <Th onClick={() => toggleSort('totalCost')} align="right">Cost{arrow('totalCost')}</Th>
              <Th onClick={() => toggleSort('retailPrice')} align="right">Retail{arrow('retailPrice')}</Th>
              <th className="px-3 py-4 text-right text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>折扣</th>
              <Th onClick={() => toggleSort('profitMargin')} align="right">Margin{arrow('profitMargin')}</Th>
              <th className="px-3 py-4 text-center text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}></th>
            </tr>
          </thead>
          <tbody>
            {sortKey === 'category' ? (
              [...groups.entries()].map(([cat, items]) => (
                <CategoryGroup key={cat} category={cat} items={items} onEdit={onEdit} onDelete={onDelete} />
              ))
            ) : (
              filtered.map(p => <ProductRow key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />)
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CategoryGroup({ category, items, onEdit, onDelete }: { category: string; items: Product[]; onEdit: (p: Product) => void; onDelete: (id: string) => void }) {
  return (
    <>
      <tr>
        <td colSpan={8} className="pt-10 pb-3">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-xl italic font-light" style={{ color: '#B85432' }}>
              {category}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#8B8580' }}>
              — {items.length} {items.length === 1 ? 'piece' : 'pieces'}
            </span>
            <div className="h-px flex-1 ml-2" style={{ backgroundColor: '#E8E4DC' }} />
          </div>
        </td>
      </tr>
      {items.map(p => <ProductRow key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} hideCategory />)}
    </>
  );
}

function ProductRow({ product: p, onEdit, onDelete, hideCategory }: { product: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void; hideCategory?: boolean }) {
  const cost = totalCost(p.costs);
  const price = retailPrice(p.costs, p.pricing);
  const disc = discountedPrice(price, p.pricing.discountRate);
  const margin = profitMargin(p.costs, p.pricing);

  // subtle margin indicator
  const marginColor = margin > 0.7 ? '#1A1A1A' : margin > 0.5 ? '#8B8580' : '#B85432';

  return (
    <tr
      className="border-b transition-colors hover:bg-stone-50/50"
      style={{ borderColor: '#F0EDE6' }}
    >
      {!hideCategory && (
        <td className="px-3 py-4 text-xs italic" style={{ color: '#8B8580' }}>
          {p.category}
        </td>
      )}
      {hideCategory && <td className="px-3 py-4" />}
      <td className="px-3 py-4">
        <div className="font-serif text-base font-medium" style={{ color: '#1A1A1A' }}>{p.nameCn}</div>
        <div className="text-[11px] italic mt-0.5" style={{ color: '#8B8580' }}>{p.nameEn}</div>
      </td>
      <td className="px-3 py-4 font-mono text-xs" style={{ color: '#8B8580' }}>{p.sku}</td>
      <td className="px-3 py-4 text-right font-mono text-sm" style={{ color: '#4A4A48' }}>
        {formatCurrency(cost)}
      </td>
      <td className="px-3 py-4 text-right font-serif text-base font-medium" style={{ color: '#1A1A1A' }}>
        {formatCurrency(price)}
      </td>
      <td className="px-3 py-4 text-right font-mono text-sm italic" style={{ color: '#B85432' }}>
        {formatCurrency(disc)}
      </td>
      <td className="px-3 py-4 text-right">
        <span className="font-serif text-base italic" style={{ color: marginColor }}>
          {formatPercent(margin)}
        </span>
      </td>
      <td className="px-3 py-4 text-right">
        <button
          onClick={() => onEdit(p)}
          className="text-[10px] uppercase tracking-[0.2em] mr-3 hover:opacity-50 transition-opacity"
          style={{ color: '#1A1A1A' }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="text-[10px] uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
          style={{ color: '#B85432' }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

function Th({ children, onClick, align }: { children: React.ReactNode; onClick?: () => void; align?: string }) {
  return (
    <th
      onClick={onClick}
      className={`px-3 py-4 text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:opacity-60 select-none transition-opacity ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: '#8B8580' }}
    >
      {children}
    </th>
  );
}
