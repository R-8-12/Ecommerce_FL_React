import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiBarChart2,
  FiMapPin,
  FiChevronRight,
  FiChevronLeft,
  FiStar,
} from "react-icons/fi";
import { DeliveryLayout } from "../../components/Delivery";
import { DeliveryStatusModal } from "../../components/Delivery";
import OTPDeliveryModal from "../../components/Delivery/OTPDeliveryModal";
import useDeliveryPartnerStore from "../../store/Delivery/useDeliveryPartnerStore";
import { toast } from "../../utils/toast";

const DeliveryDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    rating: 4.8, // Static for now
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]); // New state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // OTP Delivery Modal state
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [selectedOTPDelivery, setSelectedOTPDelivery] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get store methods
  const {
    fetchAssignedDeliveries,
    fetchDeliveryHistory,
    updateDeliveryStatus,
  } = useDeliveryPartnerStore();

  // Helper functions for formatting
  const formatAddress = useCallback((addressObj) => {
    if (!addressObj) return "N/A";

    const { street_address, city, state, postal_code } = addressObj;
    return [street_address, city, state, postal_code]
      .filter(Boolean)
      .join(", ");
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // If today
    if (date.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // If yesterday
    if (date.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Otherwise show date and time
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }, []);

  const getPriorityFromDelivery = useCallback((delivery) => {
    // Determine priority based on delivery timing
    if (!delivery || !delivery.estimated_delivery) return "normal";

    const estimatedDate = new Date(delivery.estimated_delivery);
    const now = new Date();

    // If delivery due within 24 hours
    if (estimatedDate - now < 24 * 60 * 60 * 1000) {
      return "high";
    }

    return "normal";
  }, []);

  const capitalizeFirstLetter = useCallback((string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }, []);

  // Process delivery data for dashboard
  const processDeliveryData = useCallback(
    (assignedDeliveries = [], historyDeliveries = []) => {
      // Filter and format upcoming deliveries from assigned
      const formattedUpcoming = assignedDeliveries
        .slice(0, 3) // Just take top 3 for dashboard
        .map((delivery) => ({
          id: delivery.order_id,
          orderId: delivery.order_id,
          customer: delivery.customer_name || "Customer",
          address: formatAddress(delivery.delivery_address),
          scheduledTime: formatDate(delivery.estimated_delivery),
          priority: getPriorityFromDelivery(delivery),
        }));

      setUpcomingDeliveries(formattedUpcoming);

      // Filter and format recent completed deliveries
      const formattedRecent = historyDeliveries
        .slice(0, 3) // Just take top 3 for dashboard
        .map((delivery) => ({
          id: delivery.order_id,
          orderId: delivery.order_id,
          customer: delivery.customer_name || "Customer",
          address: formatAddress(delivery.delivery_address),
          status: capitalizeFirstLetter(delivery.delivery_status || ""),
          time: formatDate(
            delivery.delivered_at || delivery.updated_at || delivery.created_at
          ),
          reason: delivery.notes || null,
        }));

      setRecentDeliveries(formattedRecent);

      // Calculate and set stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayDeliveries = historyDeliveries.filter((delivery) => {
        const deliveryDate = new Date(
          delivery.delivered_at || delivery.updated_at
        );
        return deliveryDate >= today;
      }).length;

      setStats({
        todayDeliveries,
        pendingDeliveries: assignedDeliveries.length,
        completedDeliveries: historyDeliveries.length,
        rating: 4.8, // Static for now, could come from API in the future
      });
    },
    [formatAddress, formatDate, getPriorityFromDelivery, capitalizeFirstLetter]
  );

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch assigned deliveries for upcoming/pending
        const assignedDeliveries = await fetchAssignedDeliveries();

        // Fetch delivery history for completed
        const historyDeliveries = await fetchDeliveryHistory();

        // Process and format the delivery data for the dashboard
        processDeliveryData(assignedDeliveries, historyDeliveries);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to get color based on status
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Delivered":
        return "var(--success-color)";
      case "Failed_attempt":
      case "Failed_final":
      case "Failed":
        return "var(--error-color)";
      case "Assigned":
      case "Out_for_delivery":
      case "Pending":
        return "var(--warning-color)";
      default:
        return "var(--brand-primary)";
    }
  }, []);

  // Function to get priority color and label
  const getPriorityInfo = useCallback((priority) => {
    switch (priority) {
      case "high":
        return {
          color: "var(--error-color)",
          label: "High Priority",
        };
      case "normal":
        return {
          color: "var(--brand-primary)",
          label: "Normal",
        };
      case "low":
        return {
          color: "var(--text-secondary)",
          label: "Low Priority",
        };
      default:
        return {
          color: "var(--brand-primary)",
          label: "Normal",
        };
    }
  }, []);

  // Stat card component
  const StatCard = ({ icon, value, label, color, bgColor }) => (
    <div
      className="rounded-lg p-6 transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: "var(--bg-primary)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: bgColor, color: color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  // Delivery item component for recent deliveries
  const RecentDeliveryItem = ({ delivery }) => (
    <div
      className="rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-sm"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{
              backgroundColor: `${getStatusColor(delivery.status)}20`,
              color: getStatusColor(delivery.status),
            }}
          >
            {delivery.status === "Delivered" ? (
              <FiCheckCircle size={20} />
            ) : (
              <FiAlertCircle size={20} />
            )}
          </div>
          <div>
            <div className="flex items-center">
              <p
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Order #{delivery.orderId}
              </p>
              <span
                className="mx-2 text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${getStatusColor(delivery.status)}20`,
                  color: getStatusColor(delivery.status),
                }}
              >
                {delivery.status}
              </span>
            </div>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {delivery.customer}
            </p>
            <div className="flex items-start mt-1">
              <FiMapPin
                className="mr-1 mt-0.5 flex-shrink-0"
                size={14}
                style={{ color: "var(--text-secondary)" }}
              />
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {delivery.address}
              </p>
            </div>
          </div>
        </div>
        <div>
          <p
            className="text-xs text-right"
            style={{ color: "var(--text-secondary)" }}
          >
            {delivery.time}
          </p>
          {delivery.reason && (
            <p
              className="text-xs mt-1 text-right"
              style={{ color: "var(--error-color)" }}
            >
              {delivery.reason}
            </p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(delivery);
            }}
            className="flex items-center justify-end text-xs font-medium mt-2"
            style={{ color: "var(--brand-primary)" }}
          >
            View Details
            <FiChevronRight size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Delivery item component for upcoming deliveries
  const UpcomingDeliveryItem = ({ delivery }) => {
    const priorityInfo = getPriorityInfo(delivery.priority);

    return (
      <div
        className="rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-sm"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{
                backgroundColor: "var(--bg-accent-light)",
                color: "var(--brand-primary)",
              }}
            >
              <FiPackage size={20} />
            </div>
            <div>
              <div className="flex items-center">
                <p
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Order #{delivery.orderId}
                </p>
                <span
                  className="mx-2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${priorityInfo.color}20`,
                    color: priorityInfo.color,
                  }}
                >
                  {priorityInfo.label}
                </span>
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {delivery.customer}
              </p>
              <div className="flex items-start mt-1">
                <FiMapPin
                  className="mr-1 mt-0.5 flex-shrink-0"
                  size={14}
                  style={{ color: "var(--text-secondary)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {delivery.address}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div
              className="flex items-center text-xs mb-2"
              style={{ color: "var(--brand-primary)" }}
            >
              <FiClock size={12} className="mr-1" />
              {delivery.scheduledTime}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(delivery);
              }}
              className="flex items-center justify-end text-xs font-medium"
              style={{ color: "var(--brand-primary)" }}
            >
              View Details
              <FiChevronRight size={14} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }; // Handle opening the status update modal
  const handleViewDetails = (delivery) => {
    // When we click view details, fetch complete information for this delivery
    const fetchFullDeliveryDetails = async () => {
      try {
        // Fetch the complete delivery details using the delivery ID
        const deliveryData = await fetchAssignedDeliveries();
        const fullDelivery = deliveryData.find(
          (item) => item.order_id === delivery.id
        );

        if (fullDelivery) {
          // Transform the API data to match the format expected by DeliveryStatusModal
          const formattedDelivery = {
            id: fullDelivery.order_id,
            orderId: fullDelivery.order_id,
            customer: {
              name: fullDelivery.customer_name || "Customer",
              phone: fullDelivery.customer_phone || "N/A",
              address: formatAddress(fullDelivery.delivery_address),
            },
            status:
              fullDelivery.delivery_status || fullDelivery.status || "assigned",
            order_items:
              fullDelivery.order_items?.map((item) => ({
                ...item,
                // Ensure name is properly formatted from the available data
                name:
                  item.name ||
                  (item.brand && item.variant_details?.storage
                    ? `${item.brand} ${item.variant_details.storage}`
                    : item.brand || "Product"),
              })) || [],
            item_count:
              fullDelivery.item_count || fullDelivery.order_items?.length || 0,
            expectedDelivery: fullDelivery.estimated_delivery,
            delivery_address: fullDelivery.delivery_address,
            // Format payment information more comprehensively
            paymentType: fullDelivery.payment_method || "Online Payment",
            paymentStatus: fullDelivery.status || "payment_successful",
            paymentAmount: `₹${
              fullDelivery.total_amount?.toLocaleString() || 0
            }`,
            currency: fullDelivery.currency || "INR",
            total_amount: fullDelivery.total_amount,
            // Include all timestamps
            assignedOn: fullDelivery.assigned_at,
            created_at: fullDelivery.created_at,
            estimatedDelivery: fullDelivery.estimated_delivery,
            // Include all original data for reference
            ...fullDelivery,
          };

          setSelectedDelivery(formattedDelivery);
          setIsModalOpen(true);
        } else {
          // If no full delivery data found, just use the summary we have
          setSelectedDelivery(delivery);
          setIsModalOpen(true);
          console.warn("Could not find full delivery details", delivery.id);
        }
      } catch (error) {
        console.error("Error fetching delivery details:", error);
        // Fall back to using the summary data we already have
        setSelectedDelivery(delivery);
        setIsModalOpen(true);
        toast.error("Could not fetch complete delivery details");
      }
    };

    fetchFullDeliveryDetails();
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };
  // Calculate pagination for recent deliveries
  const indexOfLastRecentItem = currentPage * itemsPerPage;
  const indexOfFirstRecentItem = indexOfLastRecentItem - itemsPerPage;
  const currentRecentDeliveries = recentDeliveries.slice(
    indexOfFirstRecentItem,
    indexOfLastRecentItem
  );

  // Calculate pagination for upcoming deliveries
  const indexOfLastUpcomingItem = currentPage * itemsPerPage;
  const indexOfFirstUpcomingItem = indexOfLastUpcomingItem - itemsPerPage;
  const currentUpcomingDeliveries = upcomingDeliveries.slice(
    indexOfFirstUpcomingItem,
    indexOfLastUpcomingItem
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle status update
  const handleStatusUpdate = async (orderId, status, additionalData) => {
    // If trying to mark as delivered, use OTP modal for final verification
    if (status === "delivered" || status === "Delivered") {
      // Close the regular status modal
      setIsModalOpen(false);
      
      // Open OTP modal with the delivery data - OTP will be sent from the modal
      setSelectedOTPDelivery(selectedDelivery);
      setIsOTPModalOpen(true);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      // Update status using the store function
      await updateDeliveryStatus(orderId, status, additionalData);

      // Update local state for recentDeliveries
      setRecentDeliveries((prev) =>
        prev.map((delivery) =>
          delivery.id === orderId ? { ...delivery, status: status } : delivery
        )
      );

      // Update local state for upcomingDeliveries
      setUpcomingDeliveries((prev) =>
        prev.map((delivery) =>
          delivery.id === orderId ? { ...delivery, status: status } : delivery
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

  // OTP Modal handlers
  const handleOTPModalClose = () => {
    setIsOTPModalOpen(false);
    setSelectedOTPDelivery(null);
  };

  const handleOTPSuccess = (updatedDelivery) => {
    // Update local state with the completed delivery
    setRecentDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === updatedDelivery.id 
          ? { ...delivery, status: updatedDelivery.status } 
          : delivery
      )
    );

    setUpcomingDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === updatedDelivery.id 
          ? { ...delivery, status: updatedDelivery.status } 
          : delivery
      )
    );

    // Close the OTP modal
    handleOTPModalClose();
    
    toast.success("Delivery completed successfully!");
  };

  return (
    <DeliveryLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Delivery Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Welcome back! Here's an overview of your delivery activities.
            </p>
          </div>

          <div className="flex items-center mt-4 md:mt-0">
            <div
              className="mr-2 px-4 py-2 rounded-md text-sm flex items-center"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <FiCalendar
                size={16}
                className="mr-2"
                style={{ color: "var(--text-secondary)" }}
              />
              <span style={{ color: "var(--text-primary)" }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
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
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                icon={<FiTruck size={24} />}
                value={stats.todayDeliveries}
                label="Today's Deliveries"
                color="var(--brand-primary)"
                bgColor="var(--bg-accent-light)"
              />
              <StatCard
                icon={<FiPackage size={24} />}
                value={stats.pendingDeliveries}
                label="Pending Deliveries"
                color="var(--warning-color)"
                bgColor="var(--warning-color)20"
              />
              <StatCard
                icon={<FiCheckCircle size={24} />}
                value={stats.completedDeliveries}
                label="Completed Deliveries"
                color="var(--success-color)"
                bgColor="var(--success-color)20"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Recent & Upcoming Deliveries */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Deliveries */}
                <div
                  className="rounded-lg p-6"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-lg font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Upcoming Deliveries
                    </h2>
                    <Link
                      to="/delivery/assignments"
                      className="text-xs font-medium flex items-center"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      View All
                      <FiChevronRight size={14} className="ml-0.5" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {upcomingDeliveries.length > 0 ? (
                      <>
                        {currentUpcomingDeliveries.map((delivery) => (
                          <UpcomingDeliveryItem
                            key={delivery.id}
                            delivery={delivery}
                          />
                        ))}

                        {/* Pagination for upcoming deliveries */}
                        {upcomingDeliveries.length > itemsPerPage && (
                          <div className="flex justify-center mt-4">
                            <nav className="flex items-center">
                              <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 rounded-l-md"
                                style={{
                                  backgroundColor:
                                    currentPage === 1
                                      ? "var(--bg-disabled)"
                                      : "var(--bg-secondary)",
                                  color:
                                    currentPage === 1
                                      ? "var(--text-disabled)"
                                      : "var(--text-primary)",
                                  cursor:
                                    currentPage === 1
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                <FiChevronLeft size={16} />
                              </button>

                              {Array.from({
                                length: Math.ceil(
                                  upcomingDeliveries.length / itemsPerPage
                                ),
                              }).map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => paginate(index + 1)}
                                  className="px-2 py-1"
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
                                  Math.ceil(
                                    upcomingDeliveries.length / itemsPerPage
                                  )
                                }
                                className="px-2 py-1 rounded-r-md"
                                style={{
                                  backgroundColor:
                                    currentPage ===
                                    Math.ceil(
                                      upcomingDeliveries.length / itemsPerPage
                                    )
                                      ? "var(--bg-disabled)"
                                      : "var(--bg-secondary)",
                                  color:
                                    currentPage ===
                                    Math.ceil(
                                      upcomingDeliveries.length / itemsPerPage
                                    )
                                      ? "var(--text-disabled)"
                                      : "var(--text-primary)",
                                  cursor:
                                    currentPage ===
                                    Math.ceil(
                                      upcomingDeliveries.length / itemsPerPage
                                    )
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                <FiChevronRight size={16} />
                              </button>
                            </nav>
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        className="py-6 text-center"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        No upcoming deliveries at this time.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Deliveries */}
                <div
                  className="rounded-lg p-6"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-lg font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Recent Deliveries
                    </h2>
                    <Link
                      to="/delivery/history"
                      className="text-xs font-medium flex items-center"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      View History
                      <FiChevronRight size={14} className="ml-0.5" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recentDeliveries.length > 0 ? (
                      <>
                        {currentRecentDeliveries.map((delivery) => (
                          <RecentDeliveryItem
                            key={delivery.id}
                            delivery={delivery}
                          />
                        ))}

                        {/* Pagination for recent deliveries */}
                        {recentDeliveries.length > itemsPerPage && (
                          <div className="flex justify-center mt-4">
                            <nav className="flex items-center">
                              <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 rounded-l-md"
                                style={{
                                  backgroundColor:
                                    currentPage === 1
                                      ? "var(--bg-disabled)"
                                      : "var(--bg-secondary)",
                                  color:
                                    currentPage === 1
                                      ? "var(--text-disabled)"
                                      : "var(--text-primary)",
                                  cursor:
                                    currentPage === 1
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                <FiChevronLeft size={16} />
                              </button>

                              {Array.from({
                                length: Math.ceil(
                                  recentDeliveries.length / itemsPerPage
                                ),
                              }).map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => paginate(index + 1)}
                                  className="px-2 py-1"
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
                                  Math.ceil(
                                    recentDeliveries.length / itemsPerPage
                                  )
                                }
                                className="px-2 py-1 rounded-r-md"
                                style={{
                                  backgroundColor:
                                    currentPage ===
                                    Math.ceil(
                                      recentDeliveries.length / itemsPerPage
                                    )
                                      ? "var(--bg-disabled)"
                                      : "var(--bg-secondary)",
                                  color:
                                    currentPage ===
                                    Math.ceil(
                                      recentDeliveries.length / itemsPerPage
                                    )
                                      ? "var(--text-disabled)"
                                      : "var(--text-primary)",
                                  cursor:
                                    currentPage ===
                                    Math.ceil(
                                      recentDeliveries.length / itemsPerPage
                                    )
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                <FiChevronRight size={16} />
                              </button>
                            </nav>
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        className="py-6 text-center"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        No recent deliveries.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Performance */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div
                  className="rounded-lg p-6"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h2
                    className="text-lg font-medium mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Quick Actions
                  </h2>

                  <div className="space-y-3">
                    <Link
                      to="/delivery/assignments"
                      className="p-3 rounded-lg transition-all duration-200 hover:shadow-sm flex justify-between items-center"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                          style={{
                            backgroundColor: "var(--brand-primary)20",
                            color: "var(--brand-primary)",
                          }}
                        >
                          <FiPackage size={16} />
                        </div>
                        <span style={{ color: "var(--text-primary)" }}>
                          View Assignments
                        </span>
                      </div>
                      <FiChevronRight />
                    </Link>
                    <Link
                      to="/delivery/history"
                      className="p-3 rounded-lg transition-all duration-200 hover:shadow-sm flex justify-between items-center"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                          style={{
                            backgroundColor: "var(--success-color)20",
                            color: "var(--success-color)",
                          }}
                        >
                          <FiClock size={16} />
                        </div>
                        <span style={{ color: "var(--text-primary)" }}>
                          View Delivery History
                        </span>
                      </div>
                      <FiChevronRight />
                    </Link>
                    <Link
                      to="/delivery/status-update"
                      className="p-3 rounded-lg transition-all duration-200 hover:shadow-sm flex justify-between items-center"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                          style={{
                            backgroundColor: "var(--warning-color)20",
                            color: "var(--warning-color)",
                          }}
                        >
                          <FiBarChart2 size={16} />
                        </div>
                        <span style={{ color: "var(--text-primary)" }}>
                          Update Delivery Status
                        </span>
                      </div>
                      <FiChevronRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {/* Modal is declared at the bottom of the component */}
      </div>
      {/* Status Update Modal */}
      <DeliveryStatusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        delivery={selectedDelivery}
        onStatusUpdate={handleStatusUpdate}
        isSubmitting={isUpdatingStatus}
      />

      {/* OTP Delivery Modal */}
      <OTPDeliveryModal
        isOpen={isOTPModalOpen}
        onClose={handleOTPModalClose}
        delivery={selectedOTPDelivery}
        onSuccess={handleOTPSuccess}
      />
    </DeliveryLayout>
  );
};

export default DeliveryDashboard;
