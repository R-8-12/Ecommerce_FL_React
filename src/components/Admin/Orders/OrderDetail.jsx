import {
  FiPackage,
  FiCheck,
  FiX,
  FiTruck,
  FiClock,
  FiEdit,
  FiUser,
  FiSave,
  FiXCircle,
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import useAdminStore from "../../../store/Admin/useAdminStore";
import { toast } from "react-hot-toast";

const OrderDetail = ({ order }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const {
    editOrder,
    assignOrderToDeliveryPartner,
    deliveryPartners,
    fetchDeliveryPartners,
    getCachedUser,
  } = useAdminStore();

  useEffect(() => {
    if (order) {
      setEditedOrder({
        status: order.status || "",
        estimated_delivery: order.estimated_delivery || "",
        // Add other editable fields as needed
      });
    }
  }, [order]);

  useEffect(() => {
    // Fetch customer data when order changes
    if (order?.user_id) {
      setLoadingCustomer(true);
      getCachedUser(order.user_id)
        .then((user) => {
          setCustomerData(user);
        })
        .catch((error) => {
          console.error("Failed to fetch customer data:", error);
        })
        .finally(() => {
          setLoadingCustomer(false);
        });
    }
  }, [order?.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Fetch delivery partners when component mounts or when assign modal opens
    if (showAssignModal && deliveryPartners.list.length === 0) {
      fetchDeliveryPartners();
    }
  }, [showAssignModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditSave = async () => {
    try {
      // Ensure you are passing all required parameters for editOrder
      // Assuming order object has user_id and order_id
      if (!order || !order.user_id || !order.order_id) {
        toast.error("Order details are incomplete.");
        return;
      }
      await editOrder(order.user_id, order.order_id, editedOrder);
      setIsEditing(false);
      toast.success("Order updated successfully!");
      // Optionally, refresh the order list or the specific order details
      // fetchOrders(); // If you want to refresh the entire list
    } catch (error) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) {
      toast.error("Please select a delivery partner");
      return;
    }
    // Ensure order and its necessary IDs are present
    if (!order || !order.user_id || !order.order_id) {
      toast.error("Order details are incomplete for assignment.");
      return;
    }

    try {
      // Pass userId, orderId, and partnerId to the store action
      await assignOrderToDeliveryPartner(
        order.user_id,
        order.order_id,
        selectedPartnerId
      );
      setShowAssignModal(false);
      setSelectedPartnerId(""); // Reset selected partner
      toast.success("Delivery partner assigned successfully!");
      // Optionally, refresh orders to see the update immediately
      // fetchOrders();
    } catch (error) {
      // The error thrown from the store should be caught here
      toast.error(error.message || "Failed to assign delivery partner");
    }
  };

  if (!order) return null;

  const statusConfig = {
    pending_payment: {
      bg: "var(--warning-color-light)",
      color: "var(--warning-color)",
      icon: <FiClock size={14} className="mr-1" />,
    },
    payment_successful: {
      bg: "var(--success-color-light)",
      color: "var(--success-color)",
      icon: <FiCheck size={14} className="mr-1" />,
    },
    assigned: {
      bg: "var(--info-color-light)",
      color: "var(--info-color)",
      icon: <FiUser size={14} className="mr-1" />,
    },
    shipped: {
      bg: "var(--brand-secondary-light)",
      color: "var(--brand-secondary)",
      icon: <FiTruck size={14} className="mr-1" />,
    },
    delivered: {
      bg: "var(--success-color-light)",
      color: "var(--success-color)",
      icon: <FiCheck size={14} className="mr-1" />,
    },
    cancelled: {
      bg: "var(--error-color-light)",
      color: "var(--error-color)",
      icon: <FiX size={14} className="mr-1" />,
    },
  };

  // Helper function to format customer name
  const getCustomerName = () => {
    if (loadingCustomer) return "Loading...";
    if (!customerData) return `User ID: ${order.user_id.substring(0, 8)}...`;

    const { first_name = "", last_name = "", email = "" } = customerData;
    if (first_name || last_name) {
      return `${first_name} ${last_name}`.trim();
    }
    return email.split("@")[0];
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to format address
  const formatAddress = () => {
    if (!order.address) return "No address provided";
    const { street_address, city, state, postal_code } = order.address;
    return `${street_address}, ${city}, ${state} ${postal_code}`;
  };

  // Helper function to get payment method display
  const getPaymentMethodDisplay = () => {
    if (!order.payment_details) return "No payment info";
    const { method, card_last4, card_network } = order.payment_details;

    if (method === "upi") return "UPI Payment";
    if (method === "card" && card_last4)
      return `${card_network || "Card"} ending in ${card_last4}`;
    return method?.toUpperCase() || "Unknown";
  };

  const getTimelineStatus = (checkStatus) => {
    // Get the appropriate styling based on current order status and the timeline step we're checking
    const getStatusStyles = () => {
      const statuses = [
        "pending_payment",
        "payment_successful",
        "assigned",
        "shipped",
        "delivered",
      ];
      const currentStatusIndex = statuses.indexOf(order.status);
      const checkStatusIndex = statuses.indexOf(checkStatus);

      if (order.status === "cancelled") {
        return {
          iconClass:
            checkStatus === "pending_payment" ? "completed" : "cancelled",
          textClass:
            checkStatus === "pending_payment" ? "completed" : "cancelled",
        };
      }

      if (checkStatusIndex <= currentStatusIndex) {
        return { iconClass: "completed", textClass: "completed" };
      }

      return { iconClass: "pending", textClass: "pending" };
    };

    const { iconClass, textClass } = getStatusStyles();

    return {
      icon:
        iconClass === "completed" ? (
          <div
            className="h-3 w-3 rounded-full ring-4"
            style={{
              backgroundColor: "var(--success-color)",
              boxShadow: "var(--shadow-sm)",
              borderColor: "var(--success-color-light)",
            }}
          ></div>
        ) : iconClass === "cancelled" ? (
          <div
            className="h-3 w-3 rounded-full ring-4"
            style={{
              backgroundColor: "var(--error-color)",
              boxShadow: "var(--shadow-sm)",
              borderColor: "var(--error-color-light)",
            }}
          ></div>
        ) : (
          <div
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: "var(--border-secondary)",
            }}
          ></div>
        ),
      textStyle: {
        color:
          textClass === "completed"
            ? "var(--text-primary)"
            : textClass === "cancelled"
            ? "var(--error-color)"
            : "var(--text-secondary)",
        fontWeight: textClass === "pending" ? "normal" : "medium",
      },
    };
  };

  return (
    <div
      className="h-full rounded-lg shadow-md overflow-hidden animate-fadeIn"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderRadius: "var(--rounded-lg)",
        boxShadow: "var(--shadow-medium)",
      }}
    >
      <div
        className="p-6 border-b"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Order Details
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Order #{order.order_id.substring(0, 8)}...
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className="px-3 py-1 inline-flex items-center rounded-full text-xs font-semibold"
              style={{
                backgroundColor:
                  statusConfig[order.status]?.bg ||
                  statusConfig.pending_payment.bg,
                color:
                  statusConfig[order.status]?.color ||
                  statusConfig.pending_payment.color,
              }}
            >
              {statusConfig[order.status]?.icon ||
                statusConfig.pending_payment.icon}
              {order.status
                .replace("_", " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={<FiEdit size={14} />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="p-6 space-y-5 overflow-auto"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {/* Customer Information */}
        <div>
          <h3
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <FiUser className="mr-2" size={16} />
            Customer Information
          </h3>
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              <strong>Name:</strong> {getCustomerName()}
            </p>
            {customerData?.email && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <strong>Email:</strong> {customerData.email}
              </p>
            )}
            {order.address?.phone_number && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <strong>Phone:</strong> {order.address.phone_number}
              </p>
            )}
          </div>
        </div>

        {/* Status Editor */}
        {isEditing && (
          <div>
            <h3
              className="text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Order Status
            </h3>
            <div
              className="p-3 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "var(--rounded-md)",
              }}
            >
              <select
                value={editedOrder.status}
                onChange={(e) =>
                  setEditedOrder((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded text-sm"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-primary)",
                }}
              >
                <option value="pending_payment">Pending Payment</option>
                <option value="payment_successful">Payment Successful</option>
                <option value="assigned">Assigned</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {/* Delivery Partner Assignment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Delivery Partner
            </h3>
            {!order.assigned_partner_id && (
              <Button
                variant="secondary"
                size="sm"
                icon={<FiUser size={14} />}
                onClick={() => setShowAssignModal(true)}
              >
                Assign
              </Button>
            )}
          </div>
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              {order.assigned_partner_id
                ? `Partner ID: ${order.assigned_partner_id}`
                : "Not assigned"}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <FiMapPin className="mr-2" size={16} />
            Shipping Address
          </h3>
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              {formatAddress()}
            </p>
            {order.address?.type && (
              <span
                className="inline-block mt-2 px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: "var(--info-color-light)",
                  color: "var(--info-color)",
                }}
              >
                {order.address.type}
              </span>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <FiCreditCard className="mr-2" size={16} />
            Payment Information
          </h3>
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              <strong>Method:</strong> {getPaymentMethodDisplay()}
            </p>
            {order.payment_details?.status && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <strong>Status:</strong>
                {order.payment_details.status.charAt(0).toUpperCase() +
                  order.payment_details.status.slice(1)}
              </p>
            )}
            {order.payment_details?.captured_at && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <strong>Captured:</strong>
                {formatDate(order.payment_details.captured_at)}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <FiShoppingBag className="mr-2" size={16} />
            Order Items
          </h3>
          <div
            className="rounded overflow-hidden"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            <div
              className="divide-y"
              style={{ borderColor: "var(--border-primary)" }}
            >
              {order.order_items?.map((item, index) => (
                <div key={`${item.product_id}-${index}`} className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name || "Product Name"}
                      </p>
                      {item.brand && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Brand: {item.brand}
                        </p>
                      )}
                      {item.model && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Model: {item.model}
                        </p>
                      )}
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Qty: {item.quantity || 1} × ₹
                        {item.price_at_purchase?.toLocaleString()}
                      </p>
                    </div>
                    <p
                      className="text-sm font-medium ml-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ₹{item.total_item_price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="p-3 flex justify-between font-medium"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.03)",
                color: "var(--text-primary)",
              }}
            >
              <p>Total Amount</p>
              <p>₹{order.total_amount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div>
          <h3
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Order Timeline
          </h3>
          <div className="space-y-4">
            {order.tracking_info?.status_history?.length > 0 ? (
              order.tracking_info.status_history.map((step, index, arr) => {
                const { icon, textStyle } = getTimelineStatus(step.status);

                return (
                  <div className="flex" key={`${step.status}-${index}`}>
                    <div className="mr-3 relative">
                      {icon}
                      {index < arr.length - 1 && (
                        <div
                          className="h-full w-0.5 absolute top-3 left-1.5"
                          style={{ backgroundColor: "var(--border-secondary)" }}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm" style={textStyle}>
                        {step.description ||
                          step.status
                            .replace("_", " ")
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatDate(step.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback timeline if no tracking history
              <div className="flex">
                <div className="mr-3">
                  {getTimelineStatus("pending_payment").icon}
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm"
                    style={getTimelineStatus("pending_payment").textStyle}
                  >
                    Order Created
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Information */}
        {order.tracking_info?.tracking_number && (
          <div>
            <h3
              className="text-sm font-medium mb-2 flex items-center"
              style={{ color: "var(--text-primary)" }}
            >
              <FiPackage className="mr-2" size={16} />
              Tracking Information
            </h3>
            <div
              className="p-3 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "var(--rounded-md)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                <strong>Tracking Number:</strong>
                {order.tracking_info.tracking_number}
              </p>
              {order.tracking_info.carrier && (
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <strong>Carrier:</strong> {order.tracking_info.carrier}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Estimated Delivery */}
        {order.estimated_delivery && (
          <div>
            <h3
              className="text-sm font-medium mb-2 flex items-center"
              style={{ color: "var(--text-primary)" }}
            >
              <FiTruck className="mr-2" size={16} />
              Estimated Delivery
            </h3>
            <div
              className="p-3 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "var(--rounded-md)",
              }}
            >
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={
                    editedOrder.estimated_delivery
                      ? new Date(editedOrder.estimated_delivery)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      estimated_delivery: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded text-sm"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-primary)",
                  }}
                />
              ) : (
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {formatDate(order.estimated_delivery)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className="p-4 border-t flex justify-between space-x-3"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-primary)",
        }}
      >
        {isEditing && (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<FiXCircle size={16} />}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<FiSave size={16} />}
              onClick={handleEditSave}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Assign Delivery Partner Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderRadius: "var(--rounded-lg)",
            }}
          >
            <h3
              className="text-lg font-medium mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Assign Delivery Partner
            </h3>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Select Delivery Partner
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-primary)",
                }}
              >
                <option value="">Select a partner...</option>
                {deliveryPartners.list
                  .filter((partner) => partner.is_verified)
                  .map((partner) => (
                    <option key={partner.partner_id} value={partner.partner_id}>
                      {partner.name} - {partner.email}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPartnerId("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAssignPartner}
                disabled={!selectedPartnerId}
              >
                Assign Partner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
