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
    <div className="border-2 border-black bg-white mt-6">
      <div className="px-6 py-4 border-b-2 border-black flex flex-wrap items-center gap-4" style={{ backgroundColor: '#0A0A0A' }}>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
          Products / 產品列表
        </h2>
        <span className="text-xs font-mono text-white opacity-60">
          [{filtered.length}]
        </span>
        <input
          placeholder="SEARCH / 搜尋..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="ml-auto border-2 border-white bg-black text-white placeholder-gray-500 px-3 py-2 text-xs uppercase tracking-wider w-72 font-mono focus:bg-white focus:text-black"
          style={{ outline: 'none' }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead style={{ backgroundColor: '#F2EFE9' }} className="border-b-2 border-black">
            <tr>
              <Th onClick={() => toggleSort('category')}>類別{arrow('category')}</Th>
              <Th onClick={() => toggleSort('nameCn')}>產品名稱{arrow('nameCn')}</Th>
              <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest">SKU</th>
              <Th onClick={() => toggleSort('totalCost')} align="right">總成本{arrow('totalCost')}</Th>
              <Th onClick={() => toggleSort('retailPrice')} align="right">零售價{arrow('retailPrice')}</Th>
              <th className="px-3 py-3 text-right text-[10px] font-black uppercase tracking-widest">折扣價</th>
              <Th onClick={() => toggleSort('profitMargin')} align="right">利潤率{arrow('profitMargin')}</Th>
              <th className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest">操作</th>
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
    </div>
  );
}

function CategoryGroup({ category, items, onEdit, onDelete }: { category: string; items: Product[]; onEdit: (p: Product) => void; onDelete: (id: string) => void }) {
  return (
    <>
      <tr>
        <td colSpan={8} className="px-4 py-2 border-t-2 border-b-2 border-black" style={{ backgroundColor: '#F4C842' }}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3" style={{ backgroundColor: '#0A0A0A' }} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">{category}</span>
            <span className="text-xs font-mono opacity-70">[{items.length}]</span>
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

  const marginColor = margin > 0.7 ? '#1D3557' : margin > 0.5 ? '#F4C842' : '#E63946';
  const marginText = margin > 0.7 ? '#FFFFFF' : '#0A0A0A';

  return (
    <tr className="border-b border-black/20 hover:bg-yellow-50/50 transition-colors">
      {!hideCategory && <td className="px-3 py-3 text-xs uppercase tracking-wider">{p.category}</td>}
      {hideCategory && <td className="px-3 py-3" />}
      <td className="px-3 py-3">
        <div className="font-bold text-black">{p.nameCn}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">{p.nameEn}</div>
      </td>
      <td className="px-3 py-3 font-mono text-xs text-gray-600">{p.sku}</td>
      <td className="px-3 py-3 text-right font-mono text-sm">{formatCurrency(cost)}</td>
      <td className="px-3 py-3 text-right font-mono font-bold text-sm">{formatCurrency(price)}</td>
      <td className="px-3 py-3 text-right font-mono text-sm" style={{ color: '#E63946' }}>
        {formatCurrency(disc)}
      </td>
      <td className="px-3 py-3 text-right">
        <span
          className="inline-block px-2 py-1 text-[10px] font-black border-2 border-black font-mono"
          style={{ backgroundColor: marginColor, color: marginText }}
        >
          {formatPercent(margin)}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => onEdit(p)}
          className="text-[10px] font-black uppercase tracking-wider border-b-2 border-black hover:bg-yellow-200 px-1 mr-2"
        >
          編輯
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="text-[10px] font-black uppercase tracking-wider border-b-2 px-1"
          style={{ borderColor: '#E63946', color: '#E63946' }}
        >
          刪除
        </button>
      </td>
    </tr>
  );
}

function Th({ children, onClick, align }: { children: React.ReactNode; onClick?: () => void; align?: string }) {
  return (
    <th
      onClick={onClick}
      className={`px-3 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-black hover:text-white select-none transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
