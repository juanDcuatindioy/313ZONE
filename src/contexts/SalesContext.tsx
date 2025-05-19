import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Sale, SaleItem, Product, PaymentMethod } from '../types';
import { API_URL } from '../config';

interface SalesContextType {
  currentSale: {
    items: SaleItem[];
    total: number;
    paymentMethod: PaymentMethod | null;
  };
  salesHistory: Sale[];
  loading: boolean;
  error: string | null;
  addToSale: (product: Product, quantity: number) => void;
  removeFromSale: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  completeSale: () => Promise<boolean>;
  clearSale: () => void;
  fetchSalesHistory: () => Promise<void>;
  closeDailySales: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [currentSale, setCurrentSale] = useState<{
    items: SaleItem[];
    total: number;
    paymentMethod: PaymentMethod | null;
  }>({
    items: [],
    total: 0,
    paymentMethod: null,
  });

  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = (items: SaleItem[]): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const addToSale = (product: Product, quantity: number) => {
    const existingItemIndex = currentSale.items.findIndex(
      item => item.productId === product.id
    );

    let updatedItems;

    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = [...currentSale.items];
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      updatedItems = [
        ...currentSale.items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        },
      ];
    }

    const total = calculateTotal(updatedItems);

    setCurrentSale({
      ...currentSale,
      items: updatedItems,
      total,
    });

    toast.success(`Added ${quantity} ${product.name} to order`);
  };

  const removeFromSale = (productId: number) => {
    const updatedItems = currentSale.items.filter(
      item => item.productId !== productId
    );

    const total = calculateTotal(updatedItems);

    setCurrentSale({
      ...currentSale,
      items: updatedItems,
      total,
    });

    toast.info('Item removed from order');
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromSale(productId);
      return;
    }

    const updatedItems = currentSale.items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );

    const total = calculateTotal(updatedItems);

    setCurrentSale({
      ...currentSale,
      items: updatedItems,
      total,
    });
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setCurrentSale({
      ...currentSale,
      paymentMethod: method,
    });
  };

  const completeSale = async (): Promise<boolean> => {
    if (currentSale.items.length === 0) {
      toast.error('Cannot complete an empty sale');
      return false;
    }

    if (!currentSale.paymentMethod) {
      toast.error('Please select a payment method');
      return false;
    }

    try {
      setLoading(true);
      const saleData = {
        items: currentSale.items,
        total: currentSale.total,
        paymentMethod: currentSale.paymentMethod,
        date: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        throw new Error('Failed to complete sale');
      }

      const completedSale = await response.json();
      setSalesHistory([completedSale, ...salesHistory]);
      clearSale();
      toast.success('Sale completed successfully!');
      return true;
    } catch (err) {
      setError('Error completing sale. Please try again.');
      console.error('Error completing sale:', err);
      toast.error('Failed to complete sale');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearSale = () => {
    setCurrentSale({
      items: [],
      total: 0,
      paymentMethod: null,
    });
  };

  const fetchSalesHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/sales`);

      if (!response.ok) {
        throw new Error('Failed to fetch sales history');
      }

      const rawData = await response.json();

      const formattedData: Sale[] = rawData.map((sale: any) => ({
        ...sale,
        paymentMethod: sale.payment_method,
      }));

      console.log('Datos formateados:', formattedData);
      setSalesHistory(formattedData);
      setError(null);
    } catch (err) {
      setError('Error fetching sales history. Please try again.');
      toast.error('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };
  const closeDailySales = async (): Promise<void> => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/sales`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al cerrar la caja');
    }

    toast.success('Caja cerrada correctamente');
    fetchSalesHistory(); // Recarga el historial actualizado
  } catch (err) {
    console.error('Error al cerrar la caja:', err);
    toast.error('No se pudo cerrar la caja');
  } finally {
    setLoading(false);
  }
};



  const value = {
    currentSale,
    salesHistory,
    loading,
    error,
    addToSale,
    removeFromSale,
    updateQuantity,
    setPaymentMethod,
    completeSale,
    clearSale,
    fetchSalesHistory,
    closeDailySales,
  };


  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};