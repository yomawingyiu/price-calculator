import type { Product } from '../types';
import { exportToExcel, exportToCSV } from '../utils/export';

interface Props {
  products: Product[];
  onReset: () => void;
}

export function ExportButton({ products, onReset }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => exportToExcel(products)}
        className="bh-btn px-5 py-3 text-xs font-black uppercase tracking-widest border-2 border-black"
        style={{ backgroundColor: '#1D3557', color: '#FFFFFF' }}
      >
        Export Excel
      </button>
      <button
        onClick={() => exportToCSV(products)}
        className="bh-btn px-5 py-3 text-xs font-black uppercase tracking-widest border-2 border-black"
        style={{ backgroundColor: '#FFFFFF', color: '#0A0A0A' }}
      >
        Export CSV
      </button>
      <button
        onClick={() => {
          if (confirm('確定要重設為預設產品資料嗎？所有變更將會遺失。')) onReset();
        }}
        className="bh-btn px-5 py-3 text-xs font-black uppercase tracking-widest border-2 border-black ml-auto"
        style={{ backgroundColor: '#F2EFE9', color: '#0A0A0A' }}
      >
        Reset / 重設
      </button>
    </div>
  );
}
