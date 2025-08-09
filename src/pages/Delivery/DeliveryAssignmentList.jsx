import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiFilter,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { DeliveryLayout, DeliveryStatusModal } from "../../components/Delivery";
import { DeliveryCard } from "../../components/Delivery";
import useDeliveryPartnerStore from "../../store/Delivery/useDeliveryPartnerStore";
import { toast } from "../../utils/toast";

const DeliveryAssignmentList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get fetchAssignedDeliveries and updateDeliveryStatus functions from the store
  const { fetchAssignedDeliveries, updateDeliveryStatus, assignedDeliveries } =
    useDeliveryPartnerStore();

  // Helper functions for data formatting - wrapped in useCallback to prevent recreation on each render
  const formatAddress = useCallback((addressObj) => {
    if (!addressObj) return "N/A";

    const { street_address, city, state, postal_code } = addressObj;
    return [street_address, city, state, postal_code]
      .filter(Boolean)
      .join(", ");
  }, []);

  useEffect(() => {
    // Fetch assigned deliveries from API
    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        await fetchAssignedDeliveries();
      } catch (error) {
        console.error("Error fetching assigned deliveries:", error);
        toast.error("Failed to load delivery assignments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Transform the API response to match our component's data structure
    const formattedDeliveries = assignedDeliveries?.map((delivery) => ({
      id: delivery.order_id,
      orderId: delivery.order_id,
      customer: {
        name: delivery.customer_name || "Customer",
        phone: delivery.customer_phone || "N/A",
        address: formatAddress(delivery.delivery_address),
      },
      address: formatAddress(delivery.delivery_address),
      customerPhone: delivery.customer_phone || "N/A",
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
      item_count: delivery.item_count || delivery.order_items?.length || 0,
      status: delivery.delivery_status || "pending",
      priority: getPriority(delivery),
      distance: "N/A", // Calculate if needed
      expectedDelivery: delivery.estimated_delivery,
      estimated_delivery: delivery.estimated_delivery,
      estimatedDelivery: delivery.estimated_delivery,
      assignedDate: delivery.assigned_at,
      assigned_at: delivery.assigned_at,
      // Format payment information
      paymentType: delivery.payment_method || "Online Payment",
      payment_method: delivery.payment_method || "Online Payment",
      paymentStatus: delivery.status || "payment_successful",
      paymentAmount: `₹${delivery.total_amount?.toLocaleString() || 0}`,
      createdAt: delivery.created_at,
      created_at: delivery.created_at,
      total_amount: delivery.total_amount,
      currency: delivery.currency || "INR",
      delivery_address: delivery.delivery_address,
      // Include all original data for reference
      ...delivery,
    }));

    setAssignments(formattedDeliveries);
    setFilteredAssignments(formattedDeliveries);

    console.log(
      "DeliveryAssignmentList assignments loaded:",
      formattedDeliveries.length,
      "deliveries"
    );
  }, [assignedDeliveries, formatAddress]);

  const getPriority = (delivery) => {
    // Determine priority based on delivery data - can be customized
    if (!delivery) return "normal";

    // Logic to determine priority - for example, based on estimated delivery time
    const estimatedDate = delivery.estimated_delivery
      ? new Date(delivery.estimated_delivery)
      : null;
    const now = new Date();

    if (estimatedDate && estimatedDate - now < 24 * 60 * 60 * 1000) {
      return "high"; // High priority if delivery is due within 24 hours
    }
    return "normal";
  };

  useEffect(() => {
    // Filter and search assignments
    const results = assignments?.filter((assignment) => {
      const matchesSearch =
        assignment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.customer.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.customer.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (filter === "all") return matchesSearch;
      if (filter === "high-priority")
        return matchesSearch && assignment.priority === "high";
      if (filter === "normal-priority")
        return matchesSearch && assignment.priority === "normal";

      return matchesSearch;
    });

    setFilteredAssignments(results);
  }, [searchTerm, filter, assignments]);
  const handleAcceptDelivery = async (orderId) => {
    try {
      // Find the delivery to show in modal
      const delivery = assignments.find(
        (assignment) => assignment.id === orderId
      );

      if (delivery) {
        // Transform the delivery data to ensure it has the format expected by the modal
        const formattedDelivery = {
          ...delivery,
          // Ensure these fields exist for the modal
          id: delivery.id || delivery.order_id,
          orderId: delivery.orderId || delivery.order_id,
          customer: {
            name:
              delivery.customer?.name || delivery.customer_name || "Customer",
            phone:
              delivery.customer?.phone ||
              delivery.customer_phone ||
              delivery.customerPhone ||
              "N/A",
            address:
              delivery.customer?.address ||
              formatAddress(delivery.delivery_address),
          },
          status: delivery.status || delivery.delivery_status || "assigned",
          order_items: delivery.order_items || [],
          item_count:
            delivery.item_count ||
            delivery.itemCount ||
            (delivery.order_items && delivery.order_items.length) ||
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
  const handleStatusUpdate = async (orderId, status, additionalData) => {
    setIsUpdatingStatus(true);
    try {
      // Update status using the store function
      await updateDeliveryStatus(orderId, status, additionalData);

      // Update local state
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === orderId
            ? { ...assignment, status: status }
            : assignment
        )
      );

      // Update filtered assignments as well
      setFilteredAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === orderId
            ? { ...assignment, status: status }
            : assignment
        )
      );

      toast.success("Delivery status updated successfully");

      // Close modal
      setIsModalOpen(false);
      setSelectedDelivery(null);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Failed to update delivery status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <DeliveryLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1
            className="text-2xl font-bold mb-4 md:mb-0"
            style={{ color: "var(--text-primary)" }}
          >
            Available Delivery Assignments
          </h1>

          <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
            <div className="relative flex-grow md:w-64">
              <span
                className="absolute inset-y-0 left-0 flex items-center pl-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <FiSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by order ID or customer"
                className="w-full pl-10 pr-4 py-2 rounded-md text-sm"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-primary)",
                  borderWidth: "1px",
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative md:w-48">
              <span
                className="absolute inset-y-0 left-0 flex items-center pl-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <FiFilter size={18} />
              </span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md text-sm appearance-none"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-primary)",
                  borderWidth: "1px",
                }}
              >
                <option value="all">All Assignments</option>
                <option value="high-priority">High Priority</option>
                <option value="normal-priority">Normal Priority</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
              style={{ borderColor: "var(--brand-primary)" }}
            ></div>
          </div>
        ) : filteredAssignments?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentItems.map((assignment) => (
                <DeliveryCard
                  key={assignment.id}
                  delivery={assignment}
                  onAccept={() => handleAcceptDelivery(assignment.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {filteredAssignments.length > itemsPerPage && (
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
                    length: Math.ceil(
                      filteredAssignments.length / itemsPerPage
                    ),
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
                      Math.ceil(filteredAssignments.length / itemsPerPage)
                    }
                    className="px-3 py-2 rounded-r-md"
                    style={{
                      backgroundColor:
                        currentPage ===
                        Math.ceil(filteredAssignments.length / itemsPerPage)
                          ? "var(--bg-disabled)"
                          : "var(--bg-secondary)",
                      color:
                        currentPage ===
                        Math.ceil(filteredAssignments.length / itemsPerPage)
                          ? "var(--text-disabled)"
                          : "var(--text-primary)",
                      cursor:
                        currentPage ===
                        Math.ceil(filteredAssignments.length / itemsPerPage)
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <FiChevronRight />
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-8 rounded-lg"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <FiAlertCircle
              size={48}
              style={{ color: "var(--text-secondary)" }}
              className="mb-4"
            />
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No assignments found
            </h3>
            <p
              className="text-center max-w-md"
              style={{ color: "var(--text-secondary)" }}
            >
              {searchTerm || filter !== "all"
                ? "Try changing your search terms or filters"
                : "There are currently no delivery assignments available. Check back later!"}
            </p>
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
};

export default DeliveryAssignmentList;
