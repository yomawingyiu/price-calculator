import type { Product } from '../types';
import { exportToExcel, exportToCSV } from '../utils/export';

interface Props {
  products: Product[];
  onReset: () => void;
}

export function ExportButton({ products, onReset }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => exportToExcel(products)}
        className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
      >
        匯出 Excel
      </button>
      <button
        onClick={() => exportToCSV(products)}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
      >
        匯出 CSV
      </button>
      <button
        onClick={() => {
          if (confirm('確定要重設為預設產品資料嗎？所有變更將會遺失。')) onReset();
        }}
        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 ml-auto"
      >
        重設預設資料
      </button>
    </div>
  );
}
