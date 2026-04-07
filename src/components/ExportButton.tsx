import type { Product } from '../types';
import { exportToExcel, exportToCSV } from '../utils/export';

interface Props {
  products: Product[];
  onReset: () => void;
}

export function ExportButton({ products, onReset }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => exportToExcel(products)}
        className="btn-secondary flex items-center gap-1.5"
        title="Export as Excel file"
      >
        <span>⬇</span> Excel
      </button>
      <button
        onClick={() => exportToCSV(products)}
        className="btn-secondary flex items-center gap-1.5"
        title="Export as CSV file"
      >
        <span>⬇</span> CSV
      </button>
      <button
        onClick={() => {
          if (confirm('確定要重設為預設產品資料嗎？所有變更將會遺失。')) onReset();
        }}
        className="text-[11px] tracking-wider ml-2 hover:underline"
        style={{ color: '#8B8580' }}
      >
        ↺ Reset
      </button>
    </div>
  );
}
