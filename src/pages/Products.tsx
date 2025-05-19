import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { Product } from '../types';

const CATEGORIES = ["Aguardiente", "Cerveza", "Wisky", "Tequila"];

const ProductListWithModal: React.FC = () => {
  const { products, fetchProducts, deleteProduct, addProduct, updateProduct } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    isAvailable: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price.toString(),
        category: editingProduct.category,
        image: editingProduct.image ?? '',
        stock: editingProduct.stock.toString(),
        isAvailable: editingProduct.isAvailable,
      });
      setShowModal(true);
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(formData.price);
    const parsedStock = parseInt(formData.stock);
    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        ...formData,
        price: parsedPrice,
        stock: parsedStock,
      });
    } else {
      await addProduct({
        ...formData,
        price: parsedPrice,
        stock: parsedStock,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '', description: '', price: '', category: '', image: '', stock: '', isAvailable: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Productos disponibles</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '', description: '', price: '', category: '', image: '', stock: '', isAvailable: true
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          Agregar producto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(product => (
          <motion.div
            key={product.id}
            className="bg-gray-800 rounded-lg p-4 relative group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-purple-500"
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-white font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-400 text-sm">{product.description}</p>
            <p className="text-purple-400 font-bold mt-2">
              {product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </p>
            <p className="text-gray-400 text-xs">Stock: {product.stock}</p>

            <div className="absolute bottom-2 right-2 flex flex-col space-y-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingProduct(product);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-colors"
                title="Editar producto"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteProduct(product.id);
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors"
                title="Eliminar producto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full p-2 rounded bg-gray-700 text-white" placeholder="Nombre" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              <textarea className="w-full p-2 rounded bg-gray-700 text-white" placeholder="Descripción" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
              <input type="text" inputMode="numeric" pattern="[0-9]*" className="w-full p-2 rounded bg-gray-700 text-white" placeholder="Precio (COP)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
              <select className="w-full p-2 rounded bg-gray-700 text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">-- Selecciona categoría --</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input className="w-full p-2 rounded bg-gray-700 text-white" placeholder="Imagen (URL)" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
              <input type="text" inputMode="numeric" pattern="[0-9]*" className="w-full p-2 rounded bg-gray-700 text-white" placeholder="Stock" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
                  {editingProduct ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListWithModal;