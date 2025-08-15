import React from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiPercent,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';

const BusinessAnalyticsWidget = ({ analytics }) => {
  // Provide default values if analytics is null or undefined
  const safeAnalytics = analytics || {};
  
  // Extract values with comprehensive fallbacks for both camelCase and snake_case
  // Ensure all values are numbers with proper fallbacks
  const totalRevenue = Number(safeAnalytics.totalRevenue || safeAnalytics.total_revenue || 0);
  const totalRevenueChange = safeAnalytics.totalRevenueChange || safeAnalytics.total_revenue_change || '+0.0%';
  const netRevenue = Number(safeAnalytics.netRevenue || safeAnalytics.net_revenue || 0);
  const netRevenueChange = safeAnalytics.netRevenueChange || safeAnalytics.net_revenue_change || '+0.0%';
  const grossProfit = Number(safeAnalytics.grossProfit || safeAnalytics.gross_profit || 0);
  const grossProfitChange = safeAnalytics.grossProfitChange || safeAnalytics.gross_profit_change || '+0.0%';
  const operatingCosts = Number(safeAnalytics.operatingCosts || safeAnalytics.operating_costs || 0);
  const operatingCostsChange = safeAnalytics.operatingCostsChange || safeAnalytics.operating_costs_change || '+0.0%';
  const conversionRate = Number(safeAnalytics.conversionRate || safeAnalytics.conversion_rate || 0);
  const conversionRateChange = safeAnalytics.conversionRateChange || safeAnalytics.conversion_rate_change || '+0.0%';
  const averageOrderValue = Number(safeAnalytics.averageOrderValue || safeAnalytics.average_order_value || 0);
  const averageOrderValueChange = safeAnalytics.averageOrderValueChange || safeAnalytics.average_order_value_change || '+0.0%';
  const customersAcquired = Number(safeAnalytics.customersAcquired || safeAnalytics.customers_acquired || 0);
  const customersAcquiredChange = safeAnalytics.customersAcquiredChange || safeAnalytics.customers_acquired_change || '+0.0%';
  const customerRetentionRate = Number(safeAnalytics.customerRetentionRate || safeAnalytics.customer_retention_rate || 0);
  const customerRetentionRateChange = safeAnalytics.customerRetentionRateChange || safeAnalytics.customer_retention_rate_change || '+0.0%';
  const returnRate = Number(safeAnalytics.returnRate || safeAnalytics.return_rate || 0);
  const returnRateChange = safeAnalytics.returnRateChange || safeAnalytics.return_rate_change || '+0.0%';
  const customerAcquisitionCost = Number(safeAnalytics.customerAcquisitionCost || safeAnalytics.customer_acquisition_cost || 0);
  const customerAcquisitionCostChange = safeAnalytics.customerAcquisitionCostChange || safeAnalytics.customer_acquisition_cost_change || '+0.0%';

  const metrics = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: totalRevenueChange,
      icon: <FiDollarSign size={24} />,
      color: 'var(--brand-primary)'
    },
    {
      title: 'Net Revenue',
      value: `₹${netRevenue.toLocaleString()}`,
      change: netRevenueChange,
      icon: <FiBarChart2 size={24} />,
      color: '#10b981'
    },
    {
      title: 'Gross Profit',
      value: `₹${grossProfit.toLocaleString()}`,
      change: grossProfitChange,
      icon: <FiTrendingUp size={24} />,
      color: '#3b82f6'
    },
    {
      title: 'Operating Costs',
      value: `₹${operatingCosts.toLocaleString()}`,
      change: operatingCostsChange,
      icon: <FiPieChart size={24} />,
      color: '#ef4444'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: conversionRateChange,
      icon: <FiPercent size={24} />,
      color: '#8b5cf6'
    },
    {
      title: 'Avg Order Value',
      value: `₹${averageOrderValue}`,
      change: averageOrderValueChange,
      icon: <FiDollarSign size={24} />,
      color: 'var(--brand-primary)'
    },
    {
      title: 'Return Rate',
      value: `${returnRate}%`,
      change: returnRateChange,
      icon: <FiTrendingDown size={24} />,
      color: '#ef4444'
    },

    {
      title: 'Customers Acquired',
      value: customersAcquired.toLocaleString(),
      change: customersAcquiredChange,
      icon: <FiTrendingUp size={24} />,
      color: '#10b981'
    },
    {
      title: 'Customer Retention Rate',
      value: `${customerRetentionRate}%`,
      change: customerRetentionRateChange,
      icon: <FiTrendingUp size={24} />,
      color: '#3b82f6'
    },
    {
      title: 'Customer Acq. Cost',
      value: `₹${customerAcquisitionCost}`,
      change: customerAcquisitionCostChange,
      icon: <FiDollarSign size={24} />,
      color: '#06b6d4'
    }
  ];

  const MetricCard = ({ title, value, change, icon, color }) => {
    const safeChange = change || '+0.0%';
    const isPositive = safeChange.toString().startsWith('+');
    const isNegative = safeChange.toString().startsWith('-');
    const isGoodChange = (title.includes('Cost') || title.includes('Return')) ? isNegative : isPositive;

    return (
      <div 
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--rounded-lg)',
          boxShadow: 'var(--shadow-small)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div 
            className="p-2 rounded-lg"
            style={{
              backgroundColor: `${color}15`,
              color: color
            }}
          >
            {icon}
          </div>
          <div 
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isGoodChange ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {safeChange}
          </div>
        </div>
        <div>
          <h3 
            className="text-sm font-medium mb-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {title}
          </h3>
          <p 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-md"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--rounded-lg)',
        boxShadow: 'var(--shadow-medium)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Business Analytics
        </h2>
        <div 
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Last 30 days
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default BusinessAnalyticsWidget;
