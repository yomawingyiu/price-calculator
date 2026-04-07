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

      <div className="flex gap-3 mb-6 items-center">
        {!showForm && (
          <button
            onClick={() => { setEditProduct(null); setShowForm(true); }}
            className="bh-btn px-6 py-3 text-xs font-black uppercase tracking-widest border-2 border-black"
            style={{ backgroundColor: '#E63946', color: '#FFFFFF' }}
          >
            + New Product / 新增產品
          </button>
        )}
        <ExportButton products={products} onReset={resetToDefaults} />
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
