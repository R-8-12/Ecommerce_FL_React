import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import Button from "../../ui/Button";
import { useOptimizedAdminStore } from "../../../store/Admin/useOptimizedAdminStore";

const OptimizedAdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  const { 
    dashboard, 
    fetchDashboardData,
    clearAllCaches 
  } = useOptimizedAdminStore();

  // OPTIMIZATION: Load dashboard data on mount with cache check
  useEffect(() => {
    if (!dashboard.loading && dashboard.stats.length === 0) {
      loadDashboardData(false);
    }
  }, [dashboard.loading, dashboard.stats.length, loadDashboardData]);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    setRefreshing(true);
    try {
      await fetchDashboardData(forceRefresh);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  // OPTIMIZATION: Memoized stats calculation
  const dashboardStats = useMemo(() => {
    if (!dashboard.stats || dashboard.stats.length === 0) {
      return [
        {
          title: "Total Users",
          value: "0",
          change: "+0%",
          trend: "neutral",
          icon: <FiUsers size={24} />,
          color: "var(--brand-primary)"
        },
        {
          title: "Total Orders", 
          value: "0",
          change: "+0%",
          trend: "neutral",
          icon: <FiShoppingBag size={24} />,
          color: "var(--success-color)"
        },
        {
          title: "Revenue",
          value: "₹0",
          change: "+0%",
          trend: "neutral", 
          icon: <FiDollarSign size={24} />,
          color: "var(--warning-color)"
        },
        {
          title: "Growth",
          value: "0%",
          change: "+0%",
          trend: "neutral",
          icon: <FiTrendingUp size={24} />,
          color: "var(--info-color)"
        }
      ];
    }

    return dashboard.stats.map(stat => ({
      ...stat,
      icon: getStatIcon(stat.title),
      color: getStatColor(stat.title)
    }));
  }, [dashboard.stats]);

  const getStatIcon = (title) => {
    const iconMap = {
      "Total Users": <FiUsers size={24} />,
      "Total Orders": <FiShoppingBag size={24} />,
      "Revenue": <FiDollarSign size={24} />,
      "Revenue (₹)": <FiDollarSign size={24} />
    };
    return iconMap[title] || <FiTrendingUp size={24} />;
  };

  const getStatColor = (title) => {
    const colorMap = {
      "Total Users": "var(--brand-primary)",
      "Total Orders": "var(--success-color)", 
      "Revenue": "var(--warning-color)",
      "Revenue (₹)": "var(--warning-color)"
    };
    return colorMap[title] || "var(--info-color)";
  };

  // OPTIMIZATION: Memoized chart data
  const chartData = useMemo(() => {
    if (!dashboard.salesData || dashboard.salesData.length === 0) {
      // Generate mock data for better UX
      const mockData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          sales: 0,
          orders: 0
        });
      }
      return mockData;
    }
    return dashboard.salesData;
  }, [dashboard.salesData]);

  // OPTIMIZATION: Memoized top products
  const topProducts = useMemo(() => {
    return dashboard.topProducts || [];
  }, [dashboard.topProducts]);

  // OPTIMIZATION: Memoized recent orders
  const recentOrders = useMemo(() => {
    return (dashboard.recentOrders || []).slice(0, 5); // Show only top 5
  }, [dashboard.recentOrders]);

  const handleRefresh = async () => {
    await loadDashboardData(true);
  };

  const handleClearCache = () => {
    clearAllCaches();
    loadDashboardData(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header with Cache Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            {lastRefresh 
              ? `Last updated: ${lastRefresh.toLocaleTimeString()}`
              : "Welcome to your admin dashboard"
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            icon={<FiRefreshCw size={16} />}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
          >
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Stats Grid - OPTIMIZED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {typeof stat.value === 'number' && stat.title.includes('₹') 
                    ? `₹${stat.value.toLocaleString()}`
                    : stat.value
                  }
                </p>
                <p className={`text-sm mt-1 ${
                  stat.trend === 'up' ? 'text-green-600' :
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change || '+0%'}
                </p>
              </div>
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - OPTIMIZED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Overview (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `₹${value}` : value,
                    name === 'sales' ? 'Revenue' : 'Orders'
                  ]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--brand-primary)" 
                  strokeWidth={2}
                  name="sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [value, 'Orders']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Bar 
                  dataKey="orders" 
                  fill="var(--success-color)"
                  name="orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section - OPTIMIZED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Products (This Week)
          </h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{product.revenue}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products data available</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.amount}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {dashboard.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading dashboard data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedAdminDashboard;
