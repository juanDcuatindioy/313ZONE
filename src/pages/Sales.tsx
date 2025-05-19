import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Trash, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { useSales } from '../contexts/SalesContext';
import { PaymentMethod, Product } from '../types';

const Sales: React.FC = () => {
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const {
    currentSale,
    addToSale,
    removeFromSale,
    updateQuantity,
    setPaymentMethod,
    completeSale,
    clearSale
  } = useSales();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchProducts();
    console.log('PRODUCTOS:', products);
  }, []);

  const categories = ['All', 'Aguardiente', 'Cerveza', 'Wisky', 'Tequila'];

  const filteredProducts = products.filter(product => {
  const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory =
    selectedCategory === '' ||
    selectedCategory === 'All' ||
    product.category === selectedCategory;

  return matchesSearch && matchesCategory && product.isAvailable && product.stock > 0;
});


  const handleAddToSale = (product: Product) => {
    addToSale(product, 1);
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: number) => {
    removeFromSale(productId);
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleCompleteSale = async () => {
    if (currentSale.items.length === 0 || !currentSale.paymentMethod) return;
    setProcessingPayment(true);
    try {
      await completeSale();
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold">Nueva compra</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar producto..."
            className="bg-gray-800 text-white w-full pl-4 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">Todas las categorías</option>
            {categories.filter(c => c !== 'All').map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {productsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddToSale(product)}
              >
                <div className="flex items-center mb-2">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 flex items-center justify-center rounded-md mr-3">
                      <Package className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{product.name}</h3>
                    <p className="text-sm text-gray-400">{product.category}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-semibold">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-lg p-6 sticky top-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Orden actual</h2>
            <button
              onClick={clearSale}
              disabled={currentSale.items.length === 0}
              className={`text-sm px-3 py-1 rounded ${
                currentSale.items.length === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Limpiar
            </button>
          </div>

          {currentSale.items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
              <p>No hay productos en esta orden</p>
              <p className="text-sm mt-2">Selecciona productos para comenzar</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto mb-4">
                {currentSale.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-purple-400">
                        {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="bg-gray-700 hover:bg-gray-600 text-white rounded-l-md px-2 py-1"
                      >-</button>
                      <span className="bg-gray-700 text-white px-3 py-1">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="bg-gray-700 hover:bg-gray-600 text-white rounded-r-md px-2 py-1"
                      >+</button>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(currentSale.total)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(currentSale.total)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Método de pago</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handlePaymentMethodChange(PaymentMethod.CASH)}
                    className={`flex flex-col items-center justify-center p-3 rounded border ${
                      currentSale.paymentMethod === PaymentMethod.CASH
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <DollarSign className="h-6 w-6 mb-1" />
                    <span className="text-xs">Efectivo</span>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodChange(PaymentMethod.CARD)}
                    className={`flex flex-col items-center justify-center p-3 rounded border ${
                      currentSale.paymentMethod === PaymentMethod.CARD
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mb-1" />
                    <span className="text-xs">Tarjeta</span>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodChange(PaymentMethod.NEQUI)}
                    className={`flex flex-col items-center justify-center p-3 rounded border ${
                      currentSale.paymentMethod === PaymentMethod.NEQUI
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <Smartphone className="h-6 w-6 mb-1" />
                    <span className="text-xs">Nequi</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleCompleteSale}
                disabled={
                  currentSale.items.length === 0 ||
                  !currentSale.paymentMethod ||
                  processingPayment
                }
                className={`w-full py-3 rounded-md font-medium flex items-center justify-center ${
                  currentSale.items.length === 0 || !currentSale.paymentMethod || processingPayment
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  'Completar Venta'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
