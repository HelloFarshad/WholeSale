import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Clock, 
  ShoppingBag,
  Truck,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../lib/supabase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalPurchases: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Stock Alerts
        const { data: stockData, error: stockError } = await supabase
          .from('current_stock_by_item_and_warehouse')
          .select('item_id, warehouse_id, current_stock, items:item_id(name), warehouses:warehouse_id(name)')
          .lt('current_stock', 10)
          .limit(5);
          
        if (stockError) throw stockError;
        setStockAlerts(stockData);

        // Sales Performance (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: salesData, error: salesError } = await supabase
          .from('sales_orders')
          .select('created_at, total_amount')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });
          
        if (salesError) throw salesError;
        
        // Group sales by day
        const groupedSales = salesData.reduce((acc, curr) => {
          const date = new Date(curr.created_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = { date, amount: 0 };
          }
          acc[date].amount += curr.total_amount;
          return acc;
        }, {});
        
        setSalesData(Object.values(groupedSales));

        // Top Selling Items
        const { data: topItems, error: topItemsError } = await supabase
          .from('top_selling_items_by_month')
          .select('*')
          .limit(5);
          
        if (topItemsError) throw topItemsError;
        setTopSellingItems(topItems);

        // Recent Sales
        const { data: recentSalesData, error: recentSalesError } = await supabase
          .from('sales_orders')
          .select('id, created_at, total_amount, customers(name)')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentSalesError) throw recentSalesError;
        setRecentSales(recentSalesData);

        // Recent Purchases
        const { data: recentPurchasesData, error: recentPurchasesError } = await supabase
          .from('purchase_orders')
          .select('id, order_date, total_amount, suppliers(name)')
          .order('order_date', { ascending: false })
          .limit(5);
          
        if (recentPurchasesError) throw recentPurchasesError;
        setRecentPurchases(recentPurchasesData);

        // Statistics
        const [
          { count: totalItems }, 
          { count: totalCustomers },
          { sum: totalSales },
          { sum: totalPurchases }
        ] = await Promise.all([
          supabase.from('items').select('*', { count: 'exact', head: true }),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
          supabase.from('sales_orders').select('total_amount').limit(1).then(({ data }) => ({
            sum: data.reduce((sum, order) => sum + order.total_amount, 0)
          })),
          supabase.from('purchase_orders').select('total_amount').limit(1).then(({ data }) => ({
            sum: data.reduce((sum, order) => sum + order.total_amount, 0)
          }))
        ]);

        setStatistics({
          totalItems: totalItems || 0,
          totalCustomers: totalCustomers || 0,
          totalSales: totalSales || 0,
          totalPurchases: totalPurchases || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <p className="text-sm text-gray-600">
          Welcome back, {user?.name}!
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <Package className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-2xl font-semibold">{statistics.totalItems}</p>
          </div>
        </div>

        <div className="card bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-secondary-100 p-3 mr-4">
            <Users className="h-6 w-6 text-secondary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Customers</p>
            <p className="text-2xl font-semibold">{statistics.totalCustomers}</p>
          </div>
        </div>

        <div className="card bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-success-100 p-3 mr-4">
            <ShoppingBag className="h-6 w-6 text-success-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-semibold">{formatCurrency(statistics.totalSales)}</p>
          </div>
        </div>

        <div className="card bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-accent-100 p-3 mr-4">
            <Truck className="h-6 w-6 text-accent-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Purchases</p>
            <p className="text-2xl font-semibold">{formatCurrency(statistics.totalPurchases)}</p>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="card shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
            Low Stock Alerts
          </h2>
          <Link to="/inventory" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>
        
        {stockAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockAlerts.map((alert: any) => (
                  <tr key={`${alert.item_id}-${alert.warehouse_id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.items?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.warehouses?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.current_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600 p-4">No low stock alerts at this time.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance Chart */}
        <div className="card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
              Sales Performance (Last 30 Days)
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <Package className="h-5 w-5 text-secondary-500 mr-2" />
              Top Selling Items
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topSellingItems}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="item_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_quantity" name="Quantity Sold" fill="#10B981" />
                <Bar dataKey="total_amount" name="Amount ($)" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <DollarSign className="h-5 w-5 text-success-500 mr-2" />
              Recent Sales
            </h2>
            <Link to="/sales" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          {recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSales.map((sale: any) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                        <Link to={`/sales/${sale.id}`}>
                          #{sale.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customers.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(sale.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(sale.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600 p-4">No recent sales.</p>
          )}
        </div>

        {/* Recent Purchases */}
        <div className="card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <Clock className="h-5 w-5 text-accent-500 mr-2" />
              Recent Purchases
            </h2>
            <Link to="/purchases" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          {recentPurchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPurchases.map((purchase: any) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                        <Link to={`/purchases/${purchase.id}`}>
                          #{purchase.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchase.suppliers.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(purchase.order_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(purchase.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600 p-4">No recent purchases.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;