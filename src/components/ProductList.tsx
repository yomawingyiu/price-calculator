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

  const arrow = (key: SortKey) => sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : '';

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
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-gray-800">產品列表</h2>
        <span className="text-sm text-gray-500">({filtered.length} 項)</span>
        <input
          placeholder="搜尋產品名稱、SKU..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="ml-auto border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th onClick={() => toggleSort('category')}>類別{arrow('category')}</Th>
              <Th onClick={() => toggleSort('nameCn')}>產品名稱{arrow('nameCn')}</Th>
              <th className="px-3 py-2 text-left font-medium">SKU</th>
              <Th onClick={() => toggleSort('totalCost')} align="right">總成本{arrow('totalCost')}</Th>
              <Th onClick={() => toggleSort('retailPrice')} align="right">零售價{arrow('retailPrice')}</Th>
              <th className="px-3 py-2 text-right font-medium">折扣價</th>
              <Th onClick={() => toggleSort('profitMargin')} align="right">利潤率{arrow('profitMargin')}</Th>
              <th className="px-3 py-2 text-center font-medium">操作</th>
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
      <tr className="bg-amber-50">
        <td colSpan={8} className="px-3 py-2 font-semibold text-amber-800 text-xs uppercase tracking-wider">
          {category} ({items.length})
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

  return (
    <tr className="border-t hover:bg-gray-50">
      {!hideCategory && <td className="px-3 py-2 text-gray-500">{p.category}</td>}
      {hideCategory && <td className="px-3 py-2" />}
      <td className="px-3 py-2">
        <div className="font-medium text-gray-800">{p.nameCn}</div>
        <div className="text-xs text-gray-400">{p.nameEn}</div>
      </td>
      <td className="px-3 py-2 text-gray-500 font-mono text-xs">{p.sku}</td>
      <td className="px-3 py-2 text-right">{formatCurrency(cost)}</td>
      <td className="px-3 py-2 text-right font-medium">{formatCurrency(price)}</td>
      <td className="px-3 py-2 text-right text-amber-700">{formatCurrency(disc)}</td>
      <td className="px-3 py-2 text-right">
        <span className={`px-2 py-0.5 rounded-full text-xs ${margin > 0.7 ? 'bg-green-100 text-green-700' : margin > 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {formatPercent(margin)}
        </span>
      </td>
      <td className="px-3 py-2 text-center">
        <button onClick={() => onEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs mr-2">編輯</button>
        <button onClick={() => onDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs">刪除</button>
      </td>
    </tr>
  );
}

function Th({ children, onClick, align }: { children: React.ReactNode; onClick?: () => void; align?: string }) {
  return (
    <th
      onClick={onClick}
      className={`px-3 py-2 font-medium cursor-pointer hover:bg-gray-100 select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
