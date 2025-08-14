import { useState, useEffect, useCallback } from "react";
import {
  FiDownload,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import OrderTable from "../../components/Admin/Orders/OrderTable";
import OrderDetail from "../../components/Admin/Orders/OrderDetail";
import Button from "../../components/ui/Button";
import Pagination from "../../components/common/Pagination";
import optimizedApiService from "../../services/optimizedApiService";
import { toast } from "react-hot-toast";

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // Add sorting state
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // Orders data state
  const [orders, setOrders] = useState({
    list: [],
    statusCounts: {},
    totalItems: 0,
    hasMore: true
  });

  // Function to fetch orders using the optimized API service
  const fetchOrders = useCallback(async (page = 1, status = statusFilter) => {
    try {
      setLoading(true);
      
      // Map UI sort options to API sort parameters
      const sortMapping = {
        "newest": { sortBy: "created_at", sortDirection: "desc" },
        "oldest": { sortBy: "created_at", sortDirection: "asc" },
        "amount-high": { sortBy: "total_amount", sortDirection: "desc" },
        "amount-low": { sortBy: "total_amount", sortDirection: "asc" },
        "status": { sortBy: "status", sortDirection: "asc" },
        "order-id": { sortBy: "order_id", sortDirection: "asc" }
      };
      
      const { sortBy: apiSortBy, sortDirection } = sortMapping[sortBy] || sortMapping["newest"];
      
      // Call the optimized API service
      const response = await optimizedApiService.orders.getPaginated({
        page,
        pageSize: itemsPerPage,
        sortBy: apiSortBy,
        sortDirection,
        status: status !== "all" ? status : undefined
      });
      
      if (response.status === "success") {
        const ordersData = response.data.orders || [];
        const pagination = response.data.pagination || {};
        
        // Count orders by status
        const statusCounts = {};
        ordersData.forEach(order => {
          const status = order.status || "unknown";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        setOrders({
          list: ordersData,
          statusCounts,
          totalItems: pagination.total_items || ordersData.length,
          hasMore: pagination.has_next || false
        });
        
        // Log optimization metrics
        console.info(
          `📈 Firebase optimization: ${response.optimization?.firebase_reads_saved || "Unknown"} reads saved`
        );
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error(`Error fetching orders: ${error.message}`);
      console.error("Order fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, itemsPerPage]);

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter, sortBy]); // Refetch when these values change

  // Filter orders based on search query only (status filtering is done on the server)
  const filteredOrders = orders.list.filter((order) => {
    return (
      !searchQuery || 
      order.order_id?.toString().includes(searchQuery) ||
      order.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.invoice_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination calculations
  const totalItems = searchQuery ? filteredOrders.length : orders.totalItems;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // For search filtering, we need to paginate locally
  const startIndex = searchQuery ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = searchQuery ? startIndex + itemsPerPage : itemsPerPage;
  const paginatedOrders = searchQuery 
    ? filteredOrders.slice(startIndex, endIndex)
    : filteredOrders; // If not searching, API already paginated the results
    
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Only fetch new data if search query is not active
    if (!searchQuery) {
      fetchOrders(page, statusFilter);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  // Helper function to export orders to CSV
  const exportOrdersToCSV = () => {
    try {
      const csvHeaders = [
        'Order ID',
        'Customer Name',
        'Email',
        'Phone',
        'Total Amount',
        'Status',
        'Order Date',
        'Payment Method',
        'Items Count'
      ];

      const csvData = orders.list.map(order => [
        order.order_id || '',
        order.customer_name || order.user_name || '',
        order.customer_email || order.user_email || '',
        order.customer_phone || order.phone || '',
        `₹${order.total_amount || 0}`,
        order.status || '',
        order.created_at ? new Date(order.created_at).toLocaleDateString() : '',
        order.payment_method || 'N/A',
        order.item_count || order.order_items?.length || 0
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => 
          row.map(field => 
            // Escape commas and quotes in field values
            typeof field === 'string' && (field.includes(',') || field.includes('"')) 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const fileName = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      
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
      console.error('Error exporting orders:', error);
      alert('Failed to export orders. Please try again.');
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  // Handle order update after editing
  const handleOrderUpdate = async () => {
    await fetchOrders(currentPage, statusFilter);
    setShowOrderDetailModal(false);
  };
  
  const handleCloseModal = () => {
    setShowOrderDetailModal(false);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Order Management
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            View and manage customer orders
          </p>
        </div>

        <div className="flex mt-4 sm:mt-0 space-x-3">
          <Button
            variant="secondary"
            size="sm"
            fullWidth={false}
            onClick={() => fetchOrders(1, statusFilter)}
            isLoading={loading}
            icon={<FiRefreshCw size={16} />}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <button
            onClick={exportOrdersToCSV}
            className="flex items-center px-4 py-2 rounded-md text-sm font-medium border hover:bg-gray-50 transition-colors"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-primary)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            <FiDownload className="mr-2" size={16} />
            Export Orders
          </button>
        </div>
      </div>
      {/* Order status summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {Object.entries({
          all: { label: "All Orders", color: "var(--brand-primary)" },
          pending_payment: {
            label: "Pending Payment",
            color: "var(--warning-color)",
          },
          payment_successful: {
            label: "Payment Success",
            color: "var(--success-color)",
          },
          processing: { label: "Processing", color: "var(--info-color)" },
          assigned: { label: "Assigned", color: "var(--brand-secondary)" },
          shipped: { label: "Shipped", color: "var(--brand-primary)" },
          delivered: { label: "Delivered", color: "var(--success-color)" },
          cancelled: { label: "Cancelled", color: "var(--error-color)" },
        }).map(([status, { label, color }]) => (
          <button
            key={status}
            className={`p-4 rounded-lg shadow-sm border transition-all ${
              statusFilter === status ? "ring-2" : ""
            }`}
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
              boxShadow: "var(--shadow-sm)",
              ringColor: color,
            }}
            onClick={() => setStatusFilter(status)}
          >
            <div className="text-sm font-medium" style={{ color }}>
              {label}
            </div>
            <div
              className="text-2xl font-bold mt-2"
              style={{ color: "var(--text-primary)" }}
            >
              {status === "all"
                ? orders.list.length
                : orders.statusCounts[status] || 0}
            </div>
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch
                className="h-5 w-5"
                style={{ color: "var(--text-secondary)" }}
              />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID or customer..."
              className="block w-full pl-10 pr-3 py-2 border rounded-md text-sm"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-primary)",
                borderRadius: "var(--rounded-md)",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sort by dropdown */}
        <div className="min-w-[180px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter
                className="h-4 w-4"
                style={{ color: "var(--text-secondary)" }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-10 pr-8 py-2 border rounded-md text-sm appearance-none bg-no-repeat bg-right"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-primary)",
                borderRadius: "var(--rounded-md)",
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
              <option value="status">Status A-Z</option>
              <option value="order-id">Order ID</option>
            </select>
          </div>
        </div>

        {/* Clear filters button */}
        {(searchQuery || sortBy !== "newest") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSortBy("newest");
            }}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              borderColor: "var(--border-primary)",
            }}
          >
            <FiX className="mr-1" size={14} />
            Clear
          </button>
        )}
      </div>
      {/* Order table - now full width */}
      <div className="w-full">
        <OrderTable
          onSelectOrder={handleSelectOrder}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          orders={paginatedOrders}
          loading={loading}
        />

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            showItemCount={true}
          />
        )}
      </div>
      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white w-full max-w-4xl rounded-lg shadow-2xl max-h-[90vh] overflow-auto"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderRadius: "var(--rounded-lg)",
            }}
          >
            <div
              className="sticky top-0 z-10"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div
                className="flex justify-between items-center p-6 border-b"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Order Details
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
            <OrderDetail order={selectedOrder} onOrderUpdate={handleOrderUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
