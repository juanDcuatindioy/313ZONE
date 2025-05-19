import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassWater, Package, ShoppingCart, BarChart3, Zap } from 'lucide-react';
import { APP_NAME } from '../config';

const Home: React.FC = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
  {
    title: 'Gestión de Productos',
    description: 'Administra fácilmente el inventario de tu bar con nuestro sistema intuitivo de gestión de productos.',
    icon: <Package className="h-10 w-10 text-purple-500" />,
    link: '/products'
  },
  {
    title: 'Terminal de Ventas',
    description: 'Procesamiento de ventas rápido y eficiente con múltiples opciones de pago.',
    icon: <ShoppingCart className="h-10 w-10 text-purple-500" />,
    link: '/sales'
  },
  {
    title: 'Análisis de Ventas',
    description: 'Supervisa el rendimiento de tu negocio con reportes y análisis de ventas detallados.',
    icon: <BarChart3 className="h-10 w-10 text-purple-500" />,
    link: '/sales-history'
  }
  ];


  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section 
        className="text-center space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="flex justify-center">
          <GlassWater className="h-16 w-16 text-purple-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Bienvenido a {APP_NAME}
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
           Tu sistema completo de gestión de bar para seguimiento de inventario, 
           procesamiento de pedidos y análisis de ventas de forma eficiente.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/sales" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Nueva venta
          </Link>
          <Link to="/products" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200">
            Mirar productos
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-8"
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        <h2 className="text-2xl font-bold text-center mb-8">Características Clave</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
              variants={fadeIn}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300 mb-4">{feature.description}</p>
              <Link 
                to={feature.link} 
                className="text-purple-400 hover:text-purple-300 inline-flex items-center"
              >
                Comenzar
                <svg 
                  className="w-4 h-4 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        className="bg-gray-800 rounded-lg p-8"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-2xl font-bold mb-4">Acerca de 313 ZONE</h2>
        <p className="text-gray-300 mb-6">
           Tu sistema completo de gestión de bar para seguimiento de inventario, 
           procesamiento de pedidos y análisis de ventas de forma eficiente.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Horario de Atención</h3>
            <ul className="space-y-1 text-gray-300">
              <li>Viernes y Sábado: 4:00 PM - 2:00 AM</li>
            </ul>
          </div>
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Información de Contacto</h3>
            <ul className="space-y-1 text-gray-300">
              <li>Dirección: Calle Nocturna 123, Centro</li>
              <li>Teléfono: (123) 456-7890</li>
              <li>Correo: info@313zone.com</li>
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;