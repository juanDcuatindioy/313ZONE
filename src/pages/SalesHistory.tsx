import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, Loader, Filter, RefreshCw, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSales } from '../contexts/SalesContext';
import { PaymentMethod } from '../types';
import * as XLSX from 'xlsx';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesHistory: React.FC = () => {
  const { salesHistory, loading, error, fetchSalesHistory } = useSales();
  const [dateRange, setDateRange] = useState<string>('week');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOption, setReportOption] = useState<'EXCEL' | 'RESUMEN' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const refreshData = () => {
    fetchSalesHistory();
  };

  const getFilteredSales = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    return salesHistory.filter(sale => {
      const saleDate = new Date(sale.date);
      const matchesDate = saleDate >= startDate;
      const matchesPayment = paymentFilter === 'ALL' || sale.paymentMethod === paymentFilter;
      return matchesDate && matchesPayment;
    });
  };

  const getStats = () => {
    const allSales = salesHistory;

    return {
      totalSales: allSales.length,
      totalRevenue: allSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      avgTicket: allSales.length > 0
        ? allSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0) / allSales.length
        : 0,
      paymentBreakdown: {
        cash: allSales.filter(s => s.paymentMethod === PaymentMethod.CASH).length,
        card: allSales.filter(s => s.paymentMethod === PaymentMethod.CARD).length,
        nequi: allSales.filter(s => s.paymentMethod === PaymentMethod.NEQUI).length,
      }
    };
  };

  const prepareChartData = () => {
    const filteredSales = getFilteredSales();
    let groupingFunction = (date: Date) => '';

    switch (dateRange) {
      case 'today':
        groupingFunction = (date: Date) => `${date.getHours()}:00`;
        break;
      case 'semana':
        groupingFunction = (date: Date) => ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][date.getDay()];
        break;
      case 'mes':
        groupingFunction = (date: Date) => `${date.getDate()}`;
        break;
      default:
        groupingFunction = (date: Date) =>
          `${date.toLocaleString('es-CO', { month: 'long' })} ${date.getFullYear()}`;

    }

    const salesByDate = filteredSales.reduce((acc, sale) => {
      const saleDate = new Date(sale.date);
      const dateKey = groupingFunction(saleDate);
      if (!acc[dateKey]) acc[dateKey] = { total: 0, count: 0 };
      acc[dateKey].total += Number(sale.total || 0);
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const chartDataArray = Object.entries(salesByDate).map(([date, data]) => ({ date, ...data }));

    if (dateRange === 'Semana') {
      const dayOrder = { 'Dom': 0, 'Lun': 1, 'Mar': 2, 'Mie': 3, 'Jue': 4, 'vie': 5, 'sabado': 6 };
      chartDataArray.sort((a, b) => dayOrder[a.date as keyof typeof dayOrder] - dayOrder[b.date as keyof typeof dayOrder]);
    }

    return {
      labels: chartDataArray.map(item => item.date),
      datasets: [
        {
          label: 'Ingresos por ventas',
          data: chartDataArray.map(item => item.total),
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
          yAxisID: 'y',
          barThickness: 40,
        },
        {
          label: 'Número de ventas',
          data: chartDataArray.map(item => item.count),
          backgroundColor: 'rgba(252, 165, 165, 0.6)',
          yAxisID: 'y1',
          barThickness: 20,
        },
      ],
    };
  };

  const formatExcelDate = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  const exportSalesToExcel = (sales: typeof salesHistory) => {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-CO');
    const hora = now.toLocaleTimeString('es-CO').split(' ')[0];
    const fileDate = now.toISOString().split('T')[0];
    const fileTime = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const nombreArchivo = `313ZONE_Ventas_${fileDate}_${fileTime}.xlsx`;

    // Ventas detalladas
    const detalleRows: any[] = [];

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        detalleRows.push({
          Fecha: formatExcelDate(sale.date),
          'Método de pago': sale.paymentMethod,
          Producto: item.name,
          Cantidad: item.quantity,
          'Precio unitario': item.price,
          Subtotal: item.price * item.quantity,
          'Total de venta': sale.total,
        });
      });
    });

    const resumen = {
      'Fecha del reporte': `${fecha} ${hora}`,
      'Ventas totales': sales.length,
      'Ingresos totales': sales.reduce((sum, s) => sum + Number(s.total || 0), 0),
      'Promedio por venta': sales.length > 0
        ? sales.reduce((sum, s) => sum + Number(s.total || 0), 0) / sales.length
        : 0,
      'Pagos en efectivo': sales.filter(s => s.paymentMethod === 'CASH').length,
      'Pagos con tarjeta': sales.filter(s => s.paymentMethod === 'CARD').length,
      'Pagos con Nequi': sales.filter(s => s.paymentMethod === 'NEQUI').length,
    };

    // Crear hojas
    const wb = XLSX.utils.book_new();

    const hojaDetalle = XLSX.utils.json_to_sheet(detalleRows);
    XLSX.utils.book_append_sheet(wb, hojaDetalle, 'Detalle Ventas');

    const hojaResumen = XLSX.utils.json_to_sheet([
      { Indicador: 'Bar', Valor: '313 ZONE' },
      ...Object.entries(resumen).map(([key, value]) => ({ Indicador: key, Valor: value })),
    ]);
    XLSX.utils.book_append_sheet(wb, hojaResumen, 'Resumen');

    // Exportar archivo
    XLSX.writeFile(wb, nombreArchivo);
  };


  const stats = getStats();
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        type: 'linear' as const,
        position: 'left' as const,
        ticks: {
          color: '#E5E7EB',
          callback: (value: number | string) => `$${Number(value).toLocaleString()}`,
        },
        title: {
          display: true,
          text: 'Ingresos ($)',
          color: '#D1D5DB',
        },
        grid: {
          color: 'rgba(156,163,175,0.1)',
        },
      },
      y1: {
        beginAtZero: true,
        type: 'linear' as const,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#FCA5A5',
        },
        title: {
          display: true,
          text: 'N° de Ventas',
          color: '#FCA5A5',
        },
      },
      x: {
        ticks: {
          color: '#D1D5DB',
        },
        grid: {
          color: 'rgba(156,163,175,0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#F9FAFB',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            if (context.dataset.label === 'Ingresos por ventas') {
              return `Ingresos: $${context.raw.toLocaleString()}`;
            } else {
              return `Ventas: ${context.raw}`;
            }
          },
        },
      },
      title: {
        display: false,
      },
    },
  };



  const filteredSales = getFilteredSales();
  const { closeAllSales } = useSales();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Historial de ventas</h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-5"><p className="text-gray-400 text-sm mb-1">Ventas totales</p><p className="text-2xl font-bold">{stats.totalSales}</p></div>
        <div className="bg-gray-800 rounded-lg p-5"><p className="text-gray-400 text-sm mb-1">Ingresos totales</p><p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p></div>
        <div className="bg-gray-800 rounded-lg p-5"><p className="text-gray-400 text-sm mb-1">Promedio</p><p className="text-2xl font-bold">${stats.avgTicket.toFixed(2)}</p></div>
        <div className="bg-gray-800 rounded-lg p-5">
          <p className="text-gray-400 text-sm mb-1">Métodos de pago</p>
          <div className="flex space-x-3 mt-2">
            <span><DollarSign className="inline-block h-4 w-4 text-green-500 mr-1" />{stats.paymentBreakdown.cash}</span>
            <span><CreditCard className="inline-block h-4 w-4 text-blue-500 mr-1" />{stats.paymentBreakdown.card}</span>
            <span><Smartphone className="inline-block h-4 w-4 text-pink-500 mr-1" />{stats.paymentBreakdown.nequi}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-5 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center"><BarChart3 className="mr-2" /> Tendencia de ventas</h2>
        <div className="h-80">
          <Bar data={prepareChartData()} options={chartOptions} />
        </div>
      </div>
      <button
        onClick={() => setShowConfirmModal(true)}
        className="inline-flex items-center bg-red-700 hover:bg-red-800 transition-colors text-white px-4 py-2 rounded-lg shadow-md ml-4"
      >
        <AlertTriangle className="mr-2 h-4 w-4 text-yellow-300" />
        Cierre de Caja Total
      </button>
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-yellow-500 mr-2" />
                <h2 className="text-xl font-semibold">Confirmar Cierre de Caja</h2>
              </div>
              <p className="mb-6">
                Esta acción eliminará <strong>todas las ventas</strong> registradas. ¿Estás seguro? No se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    closeAllSales();
                    setShowConfirmModal(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => exportSalesToExcel(getFilteredSales())}
        className="inline-flex items-center bg-green-700 hover:bg-green-800 transition-colors text-white px-4 py-2 rounded-lg shadow-md ml-4"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 text-white" />
        Exportar Excel
      </button>


    </div>

  );
};

export default SalesHistory;
