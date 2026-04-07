import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { ExportButton } from './components/ExportButton';
import { useProducts } from './hooks/useProducts';
import type { Product } from './types';

function App() {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefaults } = useProducts();
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditProduct(null);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此產品嗎？')) deleteProduct(id);
  };

  return (
    <Layout>
      <Dashboard products={products} />

      <div className="flex items-center gap-8 mb-12 pb-4 border-b" style={{ borderColor: '#E8E4DC' }}>
        {!showForm && (
          <button
            onClick={() => { setEditProduct(null); setShowForm(true); }}
            className="text-[10px] uppercase tracking-[0.25em] border-b pb-1 hover:opacity-60 transition-opacity"
            style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
          >
            + New Entry / 新增產品
          </button>
        )}
        <div className="ml-auto">
          <ExportButton products={products} onReset={resetToDefaults} />
        </div>
      </div>

      {showForm && (
        <ProductForm
          editProduct={editProduct}
          onSave={p => { addProduct(p); handleCancel(); }}
          onUpdate={(id, updates) => { updateProduct(id, updates); handleCancel(); }}
          onCancel={handleCancel}
        />
      )}

      <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />
    </Layout>
  );
}

export default App;
