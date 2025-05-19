import React, { useEffect, useState } from 'react';
import {BarChart3, Calendar, Loader, Filter, RefreshCw,CreditCard, DollarSign, Smartphone} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSales } from '../contexts/SalesContext';
import { PaymentMethod } from '../types';
import * as XLSX from 'xlsx';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesHistory: React.FC = () => {
  const { salesHistory, loading, error, fetchSalesHistory } = useSales();
  const [dateRange, setDateRange] = useState<string>('week');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOption, setReportOption] = useState<'EXCEL' | 'RESUMEN' | null>(null);

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
      case 'week':
        groupingFunction = (date: Date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        break;
      case 'month':
        groupingFunction = (date: Date) => `${date.getDate()}`;
        break;
      default:
        groupingFunction = (date: Date) => `${date.getMonth() + 1}/${date.getFullYear()}`;
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

    if (dateRange === 'week') {
      const dayOrder = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
      chartDataArray.sort((a, b) => dayOrder[a.date as keyof typeof dayOrder] - dayOrder[b.date as keyof typeof dayOrder]);
    }

    return {
      labels: chartDataArray.map(item => item.date),
      datasets: [
        {
          label: 'Ingresos por ventas',
          data: chartDataArray.map(item => item.total),
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
        },
        {
          label: 'Número de ventas',
          data: chartDataArray.map(item => item.count),
          backgroundColor: 'rgba(244, 63, 94, 0.7)',
        },
      ],
    };
  };


  const exportSalesToExcel = (sales: typeof salesHistory) => {
    const rows: any[] = [];

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        rows.push({
          Fecha: new Date(sale.date).toLocaleString(),
          'Método de pago': sale.paymentMethod,
          Producto: item.name,
          Cantidad: item.quantity,
          'Precio unitario': item.price,
          Subtotal: item.price * item.quantity,
          'Total de venta': sale.total,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas del Día');

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Reporte_Ventas_${fecha}.xlsx`);
  };

  const stats = getStats();
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { color: '#D1D5DB' }, grid: { color: 'rgba(156,163,175,0.1)' } },
      x: { ticks: { color: '#D1D5DB' }, grid: { color: 'rgba(156,163,175,0.1)' } }
    },
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#F9FAFB' } },
      title: { display: false }
    }
  };

  const filteredSales = getFilteredSales();

  const { closeDailySales } = useSales();
  const handleCerrarCaja = async () => {
    exportSalesToExcel(getFilteredSales());
    await closeDailySales();
    setShowReportModal(false);
  };
  

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Historial de ventas</h1>
        <button onClick={refreshData} className="inline-flex items-center bg-gray-700 text-white px-3 py-1 rounded-md">
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </button>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-white">¿Cómo desea generar el reporte del día?</h2>
            <div className="space-y-2">
              <button
                onClick={handleCerrarCaja}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                📊 Generar en Excel y Cerrar Caja
              </button>

            </div>
          </div>
        </div>
      )}

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

      {/* Botón Cerrar Caja */}
      <button onClick={() => setShowReportModal(true)} className="inline-flex items-center bg-violet-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200">
        Generar reporte
      </button>
    </div>
  );
};

export default SalesHistory;
