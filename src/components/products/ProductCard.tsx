import React, { useState } from 'react';
import { Edit, Trash2, DollarSign, PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { useProducts } from '../../contexts/ProductsContext';
import { useSales } from '../../contexts/SalesContext';
import ProductForm from './ProductForm';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { deleteProduct } = useProducts();
  const { addToSale } = useSales();
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      await deleteProduct(product.id);
    }
  };

  const handleAddToSale = () => {
    addToSale(product, quantity);
    setQuantity(1);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
        <ProductForm product={product} onCancel={toggleEdit} />
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {product.image ? (
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
          <PackageOpen className="h-16 w-16 text-gray-500" />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{product.name}</h3>
          <span className="inline-flex items-center bg-purple-600 text-white px-2 py-1 rounded-md text-sm">
            <DollarSign className="h-4 w-4 mr-1" />
            {product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Stock: {product.stock} · {product.category}
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={toggleEdit}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Edit product"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 transition-colors duration-200"
              aria-label="Delete product"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-l-md px-3 py-1"
            >
              -
            </button>
            <span className="bg-gray-700 text-white px-3 py-1">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-r-md px-3 py-1"
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleAddToSale}
            disabled={!product.isAvailable || product.stock <= 0}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              !product.isAvailable || product.stock <= 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Add to Sale
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;