import type { Product } from '../types';
import { exportToExcel, exportToCSV } from '../utils/export';

interface Props {
  products: Product[];
  onReset: () => void;
}

export function ExportButton({ products, onReset }: Props) {
  return (
    <div className="flex flex-wrap gap-6 items-center">
      <button
        onClick={() => exportToExcel(products)}
        className="bh-btn text-[10px] uppercase tracking-[0.25em] border-b pb-1"
        style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
      >
        Export Excel ↓
      </button>
      <button
        onClick={() => exportToCSV(products)}
        className="bh-btn text-[10px] uppercase tracking-[0.25em] border-b pb-1"
        style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
      >
        Export CSV ↓
      </button>
      <button
        onClick={() => {
          if (confirm('確定要重設為預設產品資料嗎？所有變更將會遺失。')) onReset();
        }}
        className="bh-btn text-[10px] uppercase tracking-[0.25em] ml-auto"
        style={{ color: '#8B8580' }}
      >
        Reset / 重設 ↺
      </button>
    </div>
  );
}
