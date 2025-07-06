import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiArrowLeft,
  FiSearch,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { DeliveryLayout, DeliveryStatusModal } from "../../components/Delivery";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useDeliveryPartnerStore from "../../store/Delivery/useDeliveryPartnerStore";
import { toast } from "../../utils/toast";

const DeliveryStatusUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [delivery, setDelivery] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get store methods
  const { fetchAssignedDeliveries, updateDeliveryStatus, assignedDeliveries } =
    useDeliveryPartnerStore();

  // Helper function to format address wrapped in useCallback
  const formatAddress = useCallback((addressObj) => {
    if (!addressObj) return "N/A";

    const { street_address, city, state, postal_code } = addressObj;
    return [street_address, city, state, postal_code]
      .filter(Boolean)
      .join(", ");
  }, []);

  console.log("assigned", assignedDeliveries);
  // Fetch all assigned deliveries
  const fetchAssignedDeliveriesData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchAssignedDeliveries();
    } catch (error) {
      console.error("Error fetching assigned deliveries:", error);
      toast.error("Failed to load deliveries");
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Transform the API response to match our component's data structure
    const formattedDeliveries = assignedDeliveries?.map((delivery) => ({
      id: delivery.order_id,
      orderId: delivery.order_id,
      customerName: delivery.customer_name || "Customer",
      customerAddress: formatAddress(delivery.delivery_address),
      customerPhone: delivery.customer_phone || "N/A",
      status: delivery.delivery_status || delivery.status || "assigned",
      // Properly format order items for display
      order_items:
        delivery.order_items?.map((item) => ({
          ...item,
          // Ensure name is properly formatted from the available data
          name:
            item.name ||
            (item.brand && item.variant_details?.storage
              ? `${item.brand} ${item.variant_details.storage}`
              : item.brand || "Product"),
        })) || [],
      items: delivery.order_items || [], // Keep for backward compatibility
      item_count: delivery.item_count || delivery.order_items?.length || 0,
      itemCount: delivery.item_count || delivery.order_items?.length || 0,
      expectedDelivery: delivery.estimated_delivery,
      assignedOn: delivery.assigned_at,
      paymentType: delivery.payment_method || "Online Payment",
      paymentAmount: `₹${delivery.total_amount?.toLocaleString() || 0}`,
      // Ensure customer information is properly structured
      customer: {
        name: delivery.customer_name || "Customer",
        phone: delivery.customer_phone || "N/A",
        address: formatAddress(delivery.delivery_address),
      },
      // Include all original data for reference
      ...delivery,
    }));

    setDeliveries(formattedDeliveries);
  }, [assignedDeliveries, formatAddress]);

  // Fetch delivery details by ID
  const fetchDeliveryById = useCallback(
    async (deliveryId) => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all assigned deliveries
        const assignedDeliveries = await fetchAssignedDeliveries();

        // Find the delivery with the matching ID
        const foundDelivery = assignedDeliveries.find(
          (d) => d.order_id === deliveryId
        );
        if (foundDelivery) {
          // Transform the delivery data to match our component structure
          setDelivery({
            id: foundDelivery.order_id,
            orderId: foundDelivery.order_id,
            status:
              foundDelivery.delivery_status ||
              foundDelivery.status ||
              "assigned",
            customer: {
              name: foundDelivery.customer_name || "Customer",
              phone: foundDelivery.customer_phone || "N/A",
              address: formatAddress(foundDelivery.delivery_address),
            },
            // Properly format order items for display
            order_items:
              foundDelivery.order_items?.map((item) => ({
                ...item,
                // Ensure name is properly formatted from the available data
                name:
                  item.name ||
                  (item.brand && item.variant_details?.storage
                    ? `${item.brand} ${item.variant_details.storage}`
                    : item.brand || "Product"),
              })) || [],
            items: foundDelivery.order_items || [], // Keep for backward compatibility
            item_count:
              foundDelivery.item_count ||
              foundDelivery.order_items?.length ||
              0,
            itemCount:
              foundDelivery.item_count ||
              foundDelivery.order_items?.length ||
              0,
            // Format payment information
            paymentType: foundDelivery.payment_method || "Online Payment",
            payment_method: foundDelivery.payment_method || "Online Payment",
            paymentStatus: foundDelivery.status || "payment_successful",
            paymentAmount: `₹${
              foundDelivery.total_amount?.toLocaleString() || 0
            }`,
            total_amount: foundDelivery.total_amount,
            currency: foundDelivery.currency || "INR",
            deliveryInstructions: foundDelivery.delivery_instructions || "",
            // Multiple date fields to ensure compatibility
            expectedDelivery: foundDelivery.estimated_delivery,
            estimatedDelivery: foundDelivery.estimated_delivery,
            estimated_delivery: foundDelivery.estimated_delivery,
            assignedOn: foundDelivery.assigned_at,
            assigned_at: foundDelivery.assigned_at,
            assignedPartnerName: foundDelivery.assigned_partner_name,
            delivery_address: foundDelivery.delivery_address,
            // Include all original data for reference
            ...foundDelivery,
          });
        } else {
          throw new Error("Delivery not found");
        }
      } catch (error) {
        setError("Failed to load delivery information. Please try again.");
        console.error("Error fetching delivery:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAssignedDeliveries, formatAddress]
  );

  // Load delivery data based on ID parameter
  useEffect(() => {
    if (id) {
      fetchDeliveryById(id);
    } else {
      // If no ID provided, fetch all assigned deliveries
      fetchAssignedDeliveriesData();
    }
  }, [id, fetchDeliveryById, fetchAssignedDeliveriesData]);

  // Handle search for deliveries
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      fetchAssignedDeliveriesData();
      return;
    }

    const filtered = deliveries.filter(
      (delivery) =>
        delivery.id.toLowerCase().includes(query) ||
        delivery.orderId.toLowerCase().includes(query) ||
        delivery.customerName.toLowerCase().includes(query) ||
        delivery.customerAddress.toLowerCase().includes(query)
    );

    setDeliveries(filtered);
  }; // Handle selecting a delivery from the list
  const handleSelectDelivery = (deliveryId) => {
    try {
      const delivery = deliveries.find((d) => d.id === deliveryId);
      if (delivery) {
        // Format the delivery data for the modal to ensure all required fields
        const formattedDelivery = {
          ...delivery,
          // Ensure proper customer object structure
          customer: {
            name:
              delivery.customer?.name || delivery.customerName || "Customer",
            phone: delivery.customer?.phone || delivery.customerPhone || "N/A",
            address: delivery.customer?.address || delivery.customerAddress,
          },
          // Ensure order_items exists and is properly formatted
          order_items: delivery.order_items || delivery.items || [],
          // Set correct item count
          item_count:
            delivery.item_count ||
            delivery.itemCount ||
            delivery.order_items?.length ||
            0 ||
            delivery.items?.length ||
            0,
        };

        setSelectedDelivery(formattedDelivery);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error processing delivery details:", error);
      toast.error("Could not load delivery details");
    }
  };
  // Handle status update
  const handleStatusUpdate = async (orderId, status, additionalData) => {
    setIsUpdatingStatus(true);
    try {
      await updateDeliveryStatus(orderId, status, additionalData);

      // Update local delivery state if we're viewing a specific delivery
      if (delivery && delivery.id === orderId) {
        setDelivery((prev) => ({ ...prev, status }));
      }

      // Update local deliveries state
      setDeliveries((prev) =>
        prev.map((d) => (d.id === orderId ? { ...d, status } : d))
      );

      toast.success("Delivery status updated successfully");
      setIsModalOpen(false);
      setSelectedDelivery(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update delivery status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }; // Handle opening modal for specific delivery
  const handleOpenModal = () => {
    // Ensure the delivery object has all the fields needed by the modal
    const formattedDelivery = {
      ...delivery,
      // Make sure order_items is properly structured
      order_items:
        delivery.order_items?.map((item) => ({
          ...item,
          name:
            item.name ||
            (item.brand && item.variant_details?.storage
              ? `${item.brand} ${item.variant_details.storage}`
              : item.brand || "Product"),
        })) ||
        delivery.items ||
        [],

      // Ensure customer information is properly formatted
      customer: {
        name: delivery.customer?.name || delivery.customerName || "Customer",
        phone: delivery.customer?.phone || delivery.customerPhone || "N/A",
        address:
          delivery.customer?.address ||
          formatAddress(delivery.delivery_address) ||
          delivery.customerAddress,
      },

      // Ensure all necessary fields exist
      item_count:
        delivery.item_count ||
        delivery.itemCount ||
        delivery.order_items?.length ||
        0 ||
        delivery.items?.length ||
        0,

      // Format payment information consistently
      paymentType:
        delivery.paymentType || delivery.payment_method || "Online Payment",
      paymentAmount:
        delivery.paymentAmount ||
        `₹${delivery.total_amount?.toLocaleString() || 0}`,
    };

    setSelectedDelivery(formattedDelivery);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = deliveries.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // If no ID is provided, show the list of deliveries for status update
  if (!id) {
    return (
      <DeliveryLayout>
        <div className="w-full">
          <h1
            className="text-2xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Update Delivery Status
          </h1>

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Address..."
              value={searchQuery}
              onChange={handleSearch}
              icon={<FiSearch />}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                style={{ borderColor: "var(--brand-primary)" }}
              ></div>
            </div>
          ) : deliveries?.length === 0 ? (
            <div
              className="p-6 text-center rounded-lg"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
            >
              <FiPackage className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No deliveries found</h3>
              <p className="mt-2">
                Try a different search term or check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-md"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderLeft: "4px solid var(--brand-primary)",
                  }}
                  onClick={() => handleSelectDelivery(delivery.id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3
                        className="text-lg font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {delivery.customerName}
                      </h3>
                      <p style={{ color: "var(--text-secondary)" }}>
                        {delivery.customerAddress}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span
                          className="text-sm px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              delivery.status === "delivered"
                                ? "var(--success-color)20"
                                : delivery.status === "failed_attempt" ||
                                  delivery.status === "failed_final"
                                ? "var(--error-color)20"
                                : delivery.status === "shipped" ||
                                  delivery.status === "payment_successful" ||
                                  delivery.status === "assigned"
                                ? "var(--brand-primary)20"
                                : "var(--warning-color)20",
                            color:
                              delivery.status === "delivered"
                                ? "var(--success-color)"
                                : delivery.status === "failed_attempt" ||
                                  delivery.status === "failed_final"
                                ? "var(--error-color)"
                                : delivery.status === "shipped" ||
                                  delivery.status === "payment_successful" ||
                                  delivery.status === "assigned"
                                ? "var(--brand-primary)"
                                : "var(--warning-color)",
                          }}
                        >
                          {delivery.status === "assigned" ||
                          delivery.status === "shipped" ||
                          delivery.status === "payment_successful"
                            ? "Assigned"
                            : delivery.status === "out_for_delivery"
                            ? "Out For Delivery"
                            : delivery.status === "delivered"
                            ? "Delivered"
                            : delivery.status === "failed_attempt"
                            ? "Failed Attempt"
                            : delivery.status === "failed_final"
                            ? "Failed"
                            : delivery.status === "returning_to_warehouse"
                            ? "Returning"
                            : delivery.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {delivery.id}
                      </span>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Order: {delivery.orderId}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {deliveries.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-l-md"
                      style={{
                        backgroundColor:
                          currentPage === 1
                            ? "var(--bg-disabled)"
                            : "var(--bg-secondary)",
                        color:
                          currentPage === 1
                            ? "var(--text-disabled)"
                            : "var(--text-primary)",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      <FiChevronLeft />
                    </button>

                    {Array.from({
                      length: Math.ceil(deliveries.length / itemsPerPage),
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className="px-4 py-2"
                        style={{
                          backgroundColor:
                            currentPage === index + 1
                              ? "var(--brand-primary)"
                              : "var(--bg-secondary)",
                          color:
                            currentPage === index + 1
                              ? "white"
                              : "var(--text-primary)",
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(deliveries.length / itemsPerPage)
                      }
                      className="px-3 py-2 rounded-r-md"
                      style={{
                        backgroundColor:
                          currentPage ===
                          Math.ceil(deliveries.length / itemsPerPage)
                            ? "var(--bg-disabled)"
                            : "var(--bg-secondary)",
                        color:
                          currentPage ===
                          Math.ceil(deliveries.length / itemsPerPage)
                            ? "var(--text-disabled)"
                            : "var(--text-primary)",
                        cursor:
                          currentPage ===
                          Math.ceil(deliveries.length / itemsPerPage)
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <FiChevronRight />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        <DeliveryStatusModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          delivery={selectedDelivery}
          onStatusUpdate={handleStatusUpdate}
          isSubmitting={isUpdatingStatus}
        />
      </DeliveryLayout>
    );
  }

  if (isLoading || !delivery) {
    return (
      <DeliveryLayout>
        <div className="flex justify-center items-center py-20">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: "var(--brand-primary)" }}
          ></div>
        </div>
      </DeliveryLayout>
    );
  }

  return (
    <DeliveryLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/delivery/assignments")}
            className="flex items-center text-sm font-medium mb-4"
            style={{ color: "var(--brand-primary)" }}
          >
            <FiArrowLeft className="mr-2" /> Back to Assignments
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Update Delivery Status
              </h1>
              <div className="flex items-center mt-2">
                <span
                  className="text-sm font-medium mr-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Delivery ID:
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {delivery.id}
                </span>
                <span
                  className="mx-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  •
                </span>
                <span
                  className="text-sm font-medium mr-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Order:
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {delivery.orderId}
                </span>
              </div>
            </div>
            <div
              className="mt-4 md:mt-0 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor:
                  delivery.status === "delivered"
                    ? "var(--success-color)20"
                    : delivery.status === "failed_attempt" ||
                      delivery.status === "failed_final"
                    ? "var(--error-color)20"
                    : "var(--brand-primary)20",
                color:
                  delivery.status === "delivered"
                    ? "var(--success-color)"
                    : delivery.status === "failed_attempt" ||
                      delivery.status === "failed_final"
                    ? "var(--error-color)"
                    : "var(--brand-primary)",
              }}
            >
              {(delivery.status === "assigned" ||
                delivery.status === "shipped" ||
                delivery.status === "payment_successful") &&
                "Assigned"}
              {delivery.status === "out_for_delivery" && "Out For Delivery"}
              {delivery.status === "delivered" && "Delivered"}
              {delivery.status === "failed_attempt" && "Failed Attempt"}
              {delivery.status === "failed_final" && "Failed"}
              {delivery.status === "returning_to_warehouse" && "Returning"}
            </div>
          </div>
        </div>
        {error && (
          <div
            className="p-4 mb-6 rounded-lg"
            style={{
              backgroundColor: "var(--error-color)10",
              borderLeft: "4px solid var(--error-color)",
            }}
          >
            <p style={{ color: "var(--error-color)" }}>{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Delivery Status Update Section */}
            <div
              className="rounded-lg p-6 mb-6"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: "var(--text-primary)" }}
              >
                <FiPackage className="mr-2" /> Update Status
              </h2>

              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                Click the button below to update the delivery status for this
                order.
              </p>

              <Button
                variant="primary"
                onClick={handleOpenModal}
                className="transition-transform hover:scale-105"
              >
                Update Delivery Status
              </Button>
            </div>
          </div>

          {/* Delivery Details Panel */}
          <div>
            <div
              className="rounded-lg p-6"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <h2
                className="font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Customer Information
                  </h3>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {delivery.customer.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {delivery.customer.phone}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {delivery.customer.address}
                  </p>
                </div>
                {delivery.estimatedDelivery && (
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <h3
                      className="text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Estimated Delivery
                    </h3>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {new Date(
                        delivery.estimatedDelivery
                      ).toLocaleDateString()}
                      at
                      {new Date(delivery.estimatedDelivery).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                )}
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Items (
                    {delivery.item_count ||
                      (delivery.order_items && delivery.order_items.length) ||
                      (delivery.items && delivery.items.length) ||
                      "Unknown"}
                    )
                  </h3>
                  {delivery.order_items && delivery.order_items.length > 0 ? (
                    <ul className="space-y-2">
                      {delivery.order_items.map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between text-sm border-b pb-1 last:border-b-0"
                          style={{ borderColor: "var(--border-primary)" }}
                        >
                          <div className="flex flex-col">
                            <span
                              className="font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {item.name ||
                                item.brand +
                                  " " +
                                  (item.variant_details?.storage || "") ||
                                "Product"}
                            </span>
                            <span style={{ color: "var(--text-secondary)" }}>
                              Qty: {item.quantity}
                            </span>
                            {item.variant_details && (
                              <span
                                className="text-xs mt-0.5"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {[
                                  item.variant_details.ram,
                                  item.variant_details.storage,
                                  item.variant_details.colors,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className="font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              ₹
                              {item.price_at_purchase ||
                                item.variant_details?.discounted_price ||
                                item.price ||
                                "N/A"}
                            </span>
                            {item.variant_details?.price &&
                              item.variant_details?.discounted_price &&
                              item.variant_details.price >
                                item.variant_details.discounted_price && (
                                <span
                                  className="line-through text-xs"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  ₹{item.variant_details.price}
                                </span>
                              )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : delivery.items && delivery.items.length > 0 ? (
                    <ul className="space-y-2">
                      {delivery.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span style={{ color: "var(--text-primary)" }}>
                            {item.name} x{item.quantity}
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            ₹{item.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Item details not available. Contact support for order
                      details.
                    </p>
                  )}
                </div>
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <h3
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Payment Information
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-primary)" }}>
                      Payment Type
                    </span>
                    <span
                      className="font-medium"
                      style={{
                        color:
                          delivery.paymentType === "Cash on Delivery"
                            ? "var(--warning-color)"
                            : "var(--success-color)",
                      }}
                    >
                      {delivery.paymentType}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span style={{ color: "var(--text-primary)" }}>Amount</span>
                    <span
                      className="font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {delivery.paymentAmount}
                    </span>
                  </div>
                </div>
                {delivery.deliveryInstructions && (
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <h3
                      className="text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Delivery Instructions
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {delivery.deliveryInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Status Update Modal */}
        <DeliveryStatusModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          delivery={selectedDelivery}
          onStatusUpdate={handleStatusUpdate}
          isSubmitting={isUpdatingStatus}
        />
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryStatusUpdate;
