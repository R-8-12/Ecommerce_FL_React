import React, { useState } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiCalendar,
  FiFilter,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiGift,
  FiDollarSign,
  FiEye,
  FiLoader
} from 'react-icons/fi';
import reportsService from '../../../services/reportsService';

const ReportsPanel = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');
  const [orderStatus, setOrderStatus] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState({});

  // Get available options from service
  const dateRangeOptions = reportsService.getDateRanges();
  const orderStatusOptions = reportsService.getOrderStatuses();

  const reportCategories = [
    {
      title: 'Financial Reports',
      reports: [
        {
          id: 'revenue',
          title: 'Revenue Report',
          description: 'Comprehensive financial overview with gross revenue, refunds, taxes, and net revenue.',
          details: 'Reports gross revenue, refunds, the value of coupons used, taxes collected, shipping costs, and net revenue for a selected date range',
          icon: <FiDollarSign size={20} />,
          color: '#10b981',
          estimatedTime: '2-3 minutes',
          hasDateRange: true
        },
        {
          id: 'tax',
          title: 'Tax Report',
          description: 'Tax collection analysis and GST calculations',
          details: 'Compares multiple tax codes, and displays data on how much tax was collected for orders and shipping',
          icon: <FiFileText size={20} />,
          color: '#6b7280',
          estimatedTime: '1-2 minutes',
          hasDateRange: true
        }
      ]
    },
    {
      title: 'Sales & Orders',
      reports: [
        {
          id: 'orders',
          title: 'Orders Report',
          description: 'Detailed order analysis with revenue metrics and customer insights.',
          details: 'Reports the total number of orders, net revenue, the average order value, and the average number of items per order for a selected date range',
          icon: <FiShoppingBag size={20} />,
          color: '#3b82f6',
          estimatedTime: '2-3 minutes',
          hasDateRange: true,
          hasStatusFilter: true
        },
        {
          id: 'order-detailed',
          title: 'Detailed Order Report',
          description: 'Advanced order filtering by status, products, and customer type.',
          details: 'Filters order data for a given time period by order status (i.e., pending and complete), product (orders with or without certain products), coupon codes (coupon codes were/were not used on orders), and new and returning customers.',
          icon: <FiBarChart2 size={20} />,
          color: '#8b5cf6',
          estimatedTime: '3-4 minutes',
          hasDateRange: true,
          hasStatusFilter: true
        }
      ]
    },
    {
      title: 'Product Analytics',
      reports: [
        {
          id: 'product',
          title: 'Product Report',
          description: 'Product performance analysis with sales, revenue, and profit metrics',
          details: 'Comprehensive product performance analysis including sales, revenue, profit margins, and trends',
          icon: <FiPackage size={20} />,
          color: '#f59e0b',
          estimatedTime: '3-5 minutes',
          hasDateRange: true
        },
        {
          id: 'stock',
          title: 'Stock Report',
          description: 'Inventory status showing in-stock, low stock, and out-of-stock products.',
          details: 'Displays the store\'s entire product catalog by products that are in stock, low stock, and out of stock.',
          icon: <FiBarChart2 size={20} />,
          color: '#ef4444',
          estimatedTime: '2-3 minutes',
          hasDateRange: false
        },
        {
          id: 'product-comparison',
          title: 'Product Comparison Report',
          description: 'Advanced product performance comparison and analysis.',
          details: 'Performs highly customized analysis of sales data by comparing the performance of different product/s and variation/s over a specified date range.',
          icon: <FiTrendingUp size={20} />,
          color: '#06b6d4',
          estimatedTime: '4-6 minutes',
          hasDateRange: true
        },
        {
          id: 'category',
          title: 'Category Report',
          description: 'Category-wise performance analysis and comparison.',
          details: 'Filters by all categories, a single category, category comparison, viewing top categories by items sold, and top categories by net revenue.',
          icon: <FiPieChart size={20} />,
          color: '#8b5cf6',
          estimatedTime: '3-4 minutes',
          hasDateRange: true
        }
      ]
    },
    {
      title: 'Customer Analytics',
      reports: [
        {
          id: 'customers',
          title: 'Customers Report',
          description: 'Complete customer analytics with lifetime value and behavior insights.',
          details: 'Displays Customer Data: Name, Sign Up date, Email, number of Orders, Lifetime Spend, Average Order Value, Last Purchase Date, and Country. Provides comprehensive customer segmentation and analysis.',
          icon: <FiUsers size={20} />,
          color: '#10b981',
          estimatedTime: '3-5 minutes',
          hasDateRange: true
        }
      ]
    },
    {
      title: 'Marketing & Promotions',
      reports: [
        {
          id: 'coupons',
          title: 'Coupons Report',
          description: 'Coupon usage analysis and discount effectiveness.',
          details: 'Compares multiple coupon codes to display how many orders used coupons and the total amount discounted. Uses advanced filters to compare coupons, and a few preset filters to displays Top Coupons by Discounted Orders or Amount Discounted using preset filters',
          icon: <FiGift size={20} />,
          color: '#f59e0b',
          estimatedTime: '2-3 minutes',
          hasDateRange: true
        }
      ]
    },
    {
      title: 'System Reports',
      reports: [
        {
          id: 'downloads',
          title: 'Downloads Report',
          description: 'Download tracking and analysis.',
          details: 'Allows filtering of Downloads by product, username, order number, and IP address',
          icon: <FiDownload size={20} />,
          color: '#6b7280',
          estimatedTime: '1-2 minutes',
          hasDateRange: true
        }
      ]
    }
  ];

  const generateReport = async (reportId) => {
    setIsGenerating(true);
    try {
      let reportData;
      
      switch (reportId) {
        case 'revenue':
          reportData = await reportsService.generateRevenueReport(dateRange);
          break;
        case 'orders':
        case 'order-detailed':
          reportData = await reportsService.generateOrdersReport(dateRange, orderStatus);
          break;
        case 'product':
          reportData = await reportsService.generateProductsReport(dateRange);
          break;
        case 'customers':
          reportData = await reportsService.generateCustomersReport(dateRange);
          break;
        case 'stock':
          reportData = await reportsService.generateStockReport();
          break;
        default:
          throw new Error('Report type not implemented yet');
      }
      
      setGeneratedReports(prev => ({
        ...prev,
        [reportId]: reportData
      }));
      
      setSelectedReport(reportId);
    } catch (error) {
      alert(`Error generating report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (reportId) => {
    setIsGenerating(true);
    try {
      switch (reportId) {
        case 'revenue':
          await reportsService.downloadRevenueReport(dateRange);
          break;
        case 'orders':
        case 'order-detailed':
          await reportsService.downloadOrdersReport(dateRange, orderStatus);
          break;
        case 'product':
          await reportsService.downloadProductsReport(dateRange);
          break;
        case 'customers':
          await reportsService.downloadCustomersReport(dateRange);
          break;
        case 'stock':
          await reportsService.downloadStockReport();
          break;
        default:
          throw new Error('Download not implemented for this report type');
      }
    } catch (error) {
      alert(`Error downloading report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAllReports = async () => {
    setIsGenerating(true);
    try {
      await reportsService.downloadDashboardReport(dateRange);
    } catch (error) {
      alert(`Error downloading comprehensive report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const ReportCard = ({ report }) => (
    <div 
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      style={{ 
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${report.color}20`, color: report.color }}
        >
          {report.icon}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => generateReport(report.id)}
            disabled={isGenerating}
            className="p-2 rounded-md border text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            {isGenerating ? <FiLoader className="animate-spin" size={14} /> : <FiEye size={14} />}
          </button>
          <button
            onClick={() => downloadReport(report.id)}
            disabled={isGenerating}
            className="p-2 rounded-md border text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            {isGenerating ? <FiLoader className="animate-spin" size={14} /> : <FiDownload size={14} />}
          </button>
        </div>
      </div>
      
      <h3 
        className="font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {report.title}
      </h3>
      
      <p 
        className="text-sm mb-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        {report.description}
      </p>
      
      <div className="text-xs">
        <div 
          className="flex items-center justify-between mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>Estimated time: {report.estimatedTime}</span>
          {generatedReports[report.id] && (
            <span className="text-green-600 font-medium">Generated ✓</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Business Reports
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Generate comprehensive business reports for analysis and compliance
          </p>
        </div>
        <button
          onClick={downloadAllReports}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <FiLoader className="animate-spin" size={16} />
          ) : (
            <FiDownload size={16} />
          )}
          <span>Download All Reports</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border"
           style={{ 
             backgroundColor: 'var(--bg-secondary)',
             borderColor: 'var(--border-primary)'
           }}>
        <div className="flex items-center space-x-2">
          <FiCalendar size={16} style={{ color: 'var(--text-secondary)' }} />
          <label 
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Date Range:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <FiFilter size={16} style={{ color: 'var(--text-secondary)' }} />
          <label 
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Order Status:
          </label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          >
            {orderStatusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Categories */}
      {reportCategories.map((category, index) => (
        <div key={index} className="space-y-4">
          <h3 
            className="text-lg font-semibold border-b pb-2"
            style={{ 
              color: 'var(--text-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            {category.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      ))}

      {/* Report Details Modal */}
      {selectedReport && generatedReports[selectedReport] && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {reportCategories
                  .flatMap(cat => cat.reports)
                  .find(r => r.id === selectedReport)?.title}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto"
                   style={{ 
                     backgroundColor: 'var(--bg-secondary)',
                     color: 'var(--text-primary)'
                   }}>
                {JSON.stringify(generatedReports[selectedReport], null, 2)}
              </pre>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadReport(selectedReport)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <FiDownload size={16} />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPanel;
