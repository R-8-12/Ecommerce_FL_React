import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiPackage,
  FiRefreshCw,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiBarChart2,
  FiGrid,
  FiList
} from "react-icons/fi";
import DashboardStats from "../../components/Admin/Dashboard/DashboardStats";
import BusinessAnalyticsWidget from "../../components/Admin/Dashboard/BusinessAnalyticsWidget";
import OrderStatisticsWidget from "../../components/Admin/Dashboard/OrderStatisticsWidget";
import UserOverviewWidget from "../../components/Admin/Dashboard/UserOverviewWidget";
import MostPopularProductsWidget from "../../components/Admin/Dashboard/MostPopularProductsWidget";
import TopSellingProductsWidget from "../../components/Admin/Dashboard/TopSellingProductsWidget";
import TopDeliveryMenWidget from "../../components/Admin/Dashboard/TopDeliveryMenWidget";
import TopCustomersWidget from "../../components/Admin/Dashboard/TopCustomersWidget";
import ReportsPanel from "../../components/Admin/ReportsPanel";
import RecentOrders from "../../components/Admin/Dashboard/RecentOrders";
import SalesChart from "../../components/Admin/Dashboard/SalesChart";
import TopProducts from "../../components/Admin/Dashboard/TopProducts";
import Button from "../../components/ui/Button";
import useAdminStore from "../../store/Admin/useAdminStore";
import useRealAnalyticsStore from "../../store/useRealAnalyticsStore";

const AdminDashboard = () => {
  // Use both stores
  const { dashboard, fetchDashboardData } = useAdminStore();
  const { analytics, loading: enhancedLoading, fetchAnalytics, selectedDateRange, setDateRange } = useRealAnalyticsStore();
  const { stats, loading } = dashboard;
  
  // UI state
  const [activeView, setActiveView] = useState('overview'); // overview, products, customers, delivery, reports
  
  // Date range options
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // View navigation
  const viewOptions = [
    { value: 'overview', label: 'Overview', icon: <FiGrid size={16} /> },
    { value: 'products', label: 'Products', icon: <FiPackage size={16} /> },
    { value: 'customers', label: 'Customers', icon: <FiUsers size={16} /> },
    { value: 'delivery', label: 'Delivery', icon: <FiShoppingBag size={16} /> },
    { value: 'reports', label: 'Reports', icon: <FiBarChart2 size={16} /> }
  ];

  // Add icons to the stats data
  const enhancedStats = stats.map((stat, index) => {
    const icons = [
      <FiDollarSign size={24} />,
      <FiShoppingBag size={24} />,
      <FiUsers size={24} />,
      <FiPackage size={24} />,
    ];

    const colors = [
      "var(--brand-primary)",
      "var(--brand-secondary)",
      "var(--success-color)",
      "var(--error-color)",
    ];

    return {
      ...stat,
      icon: icons[index],
      color: colors[index],
    };
  });
  
  // Fetch both dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchDashboardData();
    fetchAnalytics();
  };

  const isLoading = loading || enhancedLoading;

  // Export dashboard data to CSV
  const exportDashboardToCSV = () => {
    try {
      const csvHeaders = [
        'Metric',
        'Value',
        'Change',
        'Period'
      ];

      const csvData = [
        ['Total Revenue', `₹${stats.totalRevenue?.toLocaleString() || 0}`, stats.revenueChange || 'N/A', selectedDateRange],
        ['Total Orders', stats.totalOrders || 0, stats.ordersChange || 'N/A', selectedDateRange],
        ['New Customers', stats.newCustomers || 0, stats.customersChange || 'N/A', selectedDateRange],
        ['Pending Orders', stats.pendingOrders || 0, 'N/A', selectedDateRange],
        ['Low Stock Items', stats.lowStockItems || 0, 'N/A', selectedDateRange],
      ];

      // Add analytics data if available
      if (analytics?.businessMetrics) {
        csvData.push(['', '', '', '']); // Empty row
        csvData.push(['Business Analytics', '', '', '']);
        csvData.push(['Total Revenue (Analytics)', `₹${analytics.businessMetrics.totalRevenue?.toLocaleString() || 0}`, analytics.businessMetrics.totalRevenueChange || 'N/A', selectedDateRange]);
        csvData.push(['Average Order Value', `₹${analytics.businessMetrics.averageOrderValue?.toLocaleString() || 0}`, analytics.businessMetrics.averageOrderValueChange || 'N/A', selectedDateRange]);
      }

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => 
          row.map(field => 
            typeof field === 'string' && (field.includes(',') || field.includes('"')) 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const fileName = `dashboard-report-${selectedDateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      alert('Failed to export dashboard data. Please try again.');
    }
  };

  // Render different views
  const renderContent = () => {
    switch (activeView) {
      case 'products':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MostPopularProductsWidget products={analytics?.mostPopularProducts || []} />
              <TopSellingProductsWidget products={analytics?.topSellingProducts || []} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesChart />
              </div>
              <div>
                <TopProducts />
              </div>
            </div>
          </div>
        );
      
      case 'customers':
        return (
          <div className="space-y-6">
            <TopCustomersWidget customers={analytics?.topCustomers || []} />
            <UserOverviewWidget overview={analytics?.userOverview || null} />
          </div>
        );
      
      case 'delivery':
        return (
          <div className="space-y-6">
            <TopDeliveryMenWidget deliveryMen={analytics?.topDeliveryMen || []} />
            <OrderStatisticsWidget statistics={analytics?.orderStatistics || null} />
          </div>
        );
      
      case 'reports':
        return <ReportsPanel />;
      
      default: // overview
        return (
          <div className="space-y-6">
            {/* Business Analytics Widget */}
            {isLoading ? (
              <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-64" style={{ borderRadius: "var(--rounded-lg)", boxShadow: "var(--shadow-medium)" }}>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (<div key={i} className="h-20 bg-gray-200 rounded"></div>))}
                </div>
              </div>
            ) : (
              <BusinessAnalyticsWidget analytics={analytics?.businessAnalytics || null} />
            )}

            {/* Order Statistics & User Overview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-80" style={{ borderRadius: "var(--rounded-lg)", boxShadow: "var(--shadow-medium)" }}>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-2 gap-4">{[...Array(8)].map((_, i) => (<div key={i} className="h-24 bg-gray-200 rounded"></div>))}</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-80" style={{ borderRadius: "var(--rounded-lg)", boxShadow: "var(--shadow-medium)" }}>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => (<div key={i} className="h-32 bg-gray-200 rounded"></div>))}</div>
                  </div>
                </>                ) : (
                  <>
                    <OrderStatisticsWidget statistics={analytics?.orderStatistics || null} />
                    <UserOverviewWidget overview={analytics?.userOverview || null} />
                  </>
                )}
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-72" style={{ borderRadius: "var(--rounded-lg)", boxShadow: "var(--shadow-medium)" }}>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-56 bg-gray-200 rounded w-full"></div>
                  </div>
                ) : (
                  <SalesChart />
                )}
              </div>
              <div>
                {isLoading ? (
                  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-72" style={{ borderRadius: "var(--rounded-lg)", boxShadow: "var(--shadow-medium)" }}>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="flex items-center"><div className="h-10 w-10 bg-gray-200 rounded mr-3"></div><div className="flex-1"><div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div></div>))}</div>
                  </div>
                ) : (
                  <TopProducts />
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              {isLoading ? (
                <div className="bg-white p-6 rounded-lg shadow-md animate-pulse" style={{ borderRadius: "var(--rounded-lg)", boxShadow: "var(--shadow-medium)" }}>
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="h-12 bg-gray-200 rounded w-full"></div>))}</div>
                </div>
              ) : (
                <RecentOrders />
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Analytics Dashboard
          </h1>
          <p 
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Comprehensive business insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <FiCalendar size={16} style={{ color: "var(--text-secondary)" }} />
            <select
              value={selectedDateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)"
              }}
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <Button
            variant="secondary"
            size="sm"
            fullWidth={false}
            icon={<FiDownload size={16} />}
            onClick={exportDashboardToCSV}
          >
            Export
          </Button>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            fullWidth={false}
            onClick={handleRefresh}
            isLoading={isLoading}
            icon={<FiRefreshCw size={16} />}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* View Navigation */}
      <div 
        className="bg-white p-2 rounded-lg shadow-sm border"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)",
          borderRadius: "var(--rounded-lg)"
        }}
      >
        <div className="flex items-center space-x-2 overflow-x-auto">
          {viewOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveView(option.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === option.value
                  ? 'text-white shadow-sm'
                  : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: activeView === option.value ? 'var(--brand-primary)' : 'transparent',
                color: activeView === option.value ? 'white' : 'var(--text-primary)'
              }}
            >
              {option.icon}
              <span className="hidden sm:block">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Cards - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md animate-pulse"
                style={{
                  borderRadius: "var(--rounded-lg)",
                  boxShadow: "var(--shadow-medium)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))
          : enhancedStats.map((stat, index) => (
              <DashboardStats key={index} {...stat} />
            ))}
      </div>

      {/* Dynamic Content Based on Active View */}
      {renderContent()}
      
      
    </div>
  );
};

export default AdminDashboard;
