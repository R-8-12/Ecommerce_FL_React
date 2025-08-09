import { useMemo, useEffect, useState } from "react";
import {
  FiEye,
  FiEdit2,
  FiPackage,
  FiCheck,
  FiX,
  FiTruck,
  FiLoader,
  FiCreditCard,
  FiUser,
} from "react-icons/fi";
import Button from "../../ui/Button";
import useAdminStore from "../../../store/Admin/useAdminStore";

// Order status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending_payment: {
      bg: "var(--warning-color-light)",
      color: "var(--warning-color)",
      icon: <FiCreditCard size={12} className="mr-1" />,
    },
    payment_successful: {
      bg: "var(--success-color-light)",
      color: "var(--success-color)",
      icon: <FiCheck size={12} className="mr-1" />,
    },
    processing: {
      bg: "var(--info-color-light)",
      color: "var(--info-color)",
      icon: <FiPackage size={12} className="mr-1" />,
    },
    assigned: {
      bg: "var(--brand-secondary-light)",
      color: "var(--brand-secondary)",
      icon: <FiUser size={12} className="mr-1" />,
    },
    shipped: {
      bg: "var(--brand-primary-light)",
      color: "var(--brand-primary)",
      icon: <FiTruck size={12} className="mr-1" />,
    },
    delivered: {
      bg: "var(--success-color-light)",
      color: "var(--success-color)",
      icon: <FiCheck size={12} className="mr-1" />,
    },
    cancelled: {
      bg: "var(--error-color-light)",
      color: "var(--error-color)",
      icon: <FiX size={12} className="mr-1" />,
    },
  };

  const config = statusConfig[status] || statusConfig.pending_payment;

  return (
    <span
      className="px-2 py-1 inline-flex items-center rounded-full text-xs font-semibold"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.icon}
      {status.replace("_", " ").charAt(0).toUpperCase() +
        status.replace("_", " ").slice(1)}
    </span>
  );
};

// Customer display component that only fetches if needed
const CustomerDisplay = ({ order }) => {
  const { getCachedUser } = useAdminStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // First try to get customer info from order data
  const orderCustomerName = getCustomerName(order);
  const orderCustomerEmail = getCustomerEmail(order);
  
  // Only fetch user data if we don't have sufficient info from order
  const needsUserFetch = orderCustomerName.startsWith('User-') && orderCustomerEmail === 'No email';
  
  useEffect(() => {
    if (needsUserFetch) {
      setLoading(true);
      const fetchUser = async () => {
        try {
          const userData = await getCachedUser(order.user_id);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [order.user_id, getCachedUser, needsUserFetch]);

  if (loading) {
    return <FiLoader className="animate-spin" size={14} />;
  }

  // Use order data first, fallback to fetched user data
  let displayName = orderCustomerName;
  let displayEmail = orderCustomerEmail;
  
  if (needsUserFetch && user) {
    displayName = `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  user.email ||
                  user.username ||
                  orderCustomerName;
    displayEmail = user.email || orderCustomerEmail;
  }

  return (
    <>
      <div
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {displayName}
      </div>
      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {displayEmail !== 'No email' ? displayEmail : `${order.user_id.substring(0, 12)}...`}
      </div>
    </>
  );
};

// Helper function to get customer name from order data
const getCustomerName = (order) => {
  // Use the user details from the order data if available
  if (order.user_name && order.user_name !== 'Unknown') {
    return order.user_name;
  }
  if (order.customer_name) {
    return order.customer_name;
  }
  if (order.user_email && order.user_email !== 'Unknown') {
    return order.user_email;
  }
  // Fallback to user ID
  return `User-${order.user_id.substring(0, 8)}`;
};

// Helper function to get customer email
const getCustomerEmail = (order) => {
  return order.user_email && order.user_email !== 'Unknown' ? order.user_email : 'No email';
};

// Helper function to get customer phone
/* const getCustomerPhone = (order) => {
  return order.user_phone && order.user_phone !== 'Unknown' ? order.user_phone : 'No phone';
}; */

// Helper function to format date
const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const OrderTable = ({ onSelectOrder, statusFilter, searchQuery }) => {
  const { orders } = useAdminStore();
  const { list: orderList, loading } = orders;

  // Filter orders based on status and search query
  const filteredOrders = useMemo(() => {
    return orderList.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const customerName = getCustomerName(order);
      const customerEmail = getCustomerEmail(order);
      const matchesSearch =
        !searchQuery ||
        order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orderList, statusFilter, searchQuery]);

  return (
    <div
      className="overflow-x-auto rounded-lg shadow"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderRadius: "var(--rounded-lg)",
        boxShadow: "var(--shadow-medium)",
      }}
    >
      {loading ? (
        <div className="p-8 text-center animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <table
            className="min-w-full divide-y"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <thead>
              <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Order ID
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Date
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Customer
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Items
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Payment
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--border-primary)" }}
            >
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => onSelectOrder(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {order.order_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CustomerDisplay order={order} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {order.order_items?.reduce(
                          (total, item) => total + (item.quantity || 0),
                          0
                        ) || 0}
                        items
                      </div>
                      {order.order_items?.length > 0 && (
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {order.order_items[0].name}
                          {order.order_items.length > 1 &&
                            ` +${order.order_items.length - 1} more`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ₹{order.total_amount?.toLocaleString() || 0}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {order.currency || "INR"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {order.payment_details?.method || "N/A"}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color:
                            order.payment_details?.status === "captured"
                              ? "var(--success-color)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {order.payment_details?.status || "Pending"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                          style={{ color: "var(--brand-primary)" }}
                          title="View Order Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                        >
                          <FiEye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div style={{ color: "var(--text-secondary)" }}>
                      {searchQuery || statusFilter !== "all"
                        ? "No orders match your filter criteria"
                        : "No orders found"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div
            className="px-6 py-4 flex items-center justify-between border-t"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Showing {filteredOrders.length} of {orderList.length} orders
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderTable;
