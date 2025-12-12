import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    name: string;
    value: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    averageLifetimeValue: number;
  };
}

const COLORS = ['#9333ea', '#ec4899', '#8b5cf6', '#d946ef', '#a855f7', '#c026d3'];

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/analytics?range=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your store's performance and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          growth={analytics.revenueGrowth}
          color="purple"
        />
        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders.toString()}
          icon={ShoppingCart}
          growth={analytics.ordersGrowth}
          color="pink"
        />
        <MetricCard
          title="Total Customers"
          value={analytics.totalCustomers.toString()}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Avg Order Value"
          value={`₹${analytics.averageOrderValue.toLocaleString()}`}
          icon={Package}
          color="pink"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-6">Revenue & Orders Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis yAxisId="left" stroke="#888" />
            <YAxis yAxisId="right" orientation="right" stroke="#888" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #9333ea' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#9333ea" 
              strokeWidth={2}
              name="Revenue (₹)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="#ec4899" 
              strokeWidth={2}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-white mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #9333ea' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-white mb-6">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="status" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #9333ea' }}
              />
              <Bar dataKey="count" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-6">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/30">
                <th className="text-left text-gray-400 py-3 px-4">Product</th>
                <th className="text-right text-gray-400 py-3 px-4">Sales</th>
                <th className="text-right text-gray-400 py-3 px-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((product, index) => (
                <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-900/10">
                  <td className="text-white py-3 px-4">{product.name}</td>
                  <td className="text-gray-300 py-3 px-4 text-right">{product.sales}</td>
                  <td className="text-gray-300 py-3 px-4 text-right">₹{product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-6">Customer Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-400 mb-2">New Customers</p>
            <p className="text-white text-2xl">{analytics.customerInsights.newCustomers}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Returning Customers</p>
            <p className="text-white text-2xl">{analytics.customerInsights.returningCustomers}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Avg Lifetime Value</p>
            <p className="text-white text-2xl">₹{analytics.customerInsights.averageLifetimeValue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  growth, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  growth?: number; 
  color: 'purple' | 'pink';
}) {
  const bgColor = color === 'purple' ? 'from-purple-600 to-purple-700' : 'from-pink-600 to-pink-700';
  
  return (
    <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-white text-2xl">{value}</p>
    </div>
  );
}
