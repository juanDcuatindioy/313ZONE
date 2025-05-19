import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import Footer from './components/layout/Footer';
import { ProductsProvider } from './contexts/ProductsContext';
import { SalesProvider } from './contexts/SalesContext';

function App() {
  useEffect(() => {
    document.title = '313 ZONE - Bar Management System';
  }, []);

  return (
    <Router>
      <ProductsProvider>
        <SalesProvider>
          <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/sales-history" element={<SalesHistory />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <ToastContainer 
            position="bottom-right" 
            autoClose={3000} 
            theme="dark" 
          />
        </SalesProvider>
      </ProductsProvider>
    </Router>
  );
}

export default App;