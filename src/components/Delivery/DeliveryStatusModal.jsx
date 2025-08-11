import React, { useState, useEffect } from "react";
import {
  FiX,
  FiPackage,
  FiCamera,
  FiImage,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiInfo,
  FiEdit,
} from "react-icons/fi";
import Button from "../ui/Button";

const DeliveryStatusModal = ({
  isOpen,
  onClose,
  delivery,
  onStatusUpdate,
  isSubmitting = false,
}) => {
  const [photoPreview, setPhotoPreview] = useState(null);
  console.log("de", delivery);
  const [newStatus, setNewStatus] = useState(delivery?.status || "processing");
  const [otp, setOtp] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [error, setError] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [otherStatusText, setOtherStatusText] = useState("");
  // Initialize form when delivery changes
  useEffect(() => {
    if (delivery) {
      setNewStatus(delivery.status || "processing");
      setEstimatedDelivery(
        delivery.expectedDelivery
          ? new Date(delivery.expectedDelivery).toISOString().slice(0, 16)
          : ""
      );
      setCarrier(delivery.carrier || "");
      setTrackingNumber(delivery.tracking_number || "");
      setOtp("");
      setNotes("");
      setError("");
      setPhotoPreview(null);
      setOtherStatusText("");
    }
  }, [delivery]);
  if (!isOpen || !delivery) return null;
  // Comprehensive status options for delivery partner aligned with OrderTrackingDetail
  const statusOptions = [
    {
      value: "processing",
      label: "Processing",
      icon: <FiPackage />,
      color: "var(--info-color)",
      description: "Order is being processed",
    },
    {
      value: "packed",
      label: "Packed",
      icon: <FiPackage />,
      color: "var(--info-color)",
      description: "Package is packed and ready for shipping",
    },
    {
      value: "shipped",
      label: "Shipped",
      icon: <FiTruck />,
      color: "var(--info-color)",
      description: "Package has been shipped",
      requiresTrackingInfo: true,
    },
    {
      value: "out_for_delivery",
      label: "Out for Delivery",
      icon: <FiTruck />,
      color: "var(--brand-primary)",
      description: "Package is out for delivery",
      requiresTrackingInfo: true,
    },
    {
      value: "delivered",
      label: "Delivered",
      icon: <FiCheckCircle />,
      color: "var(--success-color)",
      requiresOtp: false, // Set to true if OTP verification needed
      description: "Package successfully delivered",
    },
    {
      value: "failed_attempt",
      label: "Failed Delivery",
      icon: <FiX />,
      color: "var(--error-color)",
      requiresNotes: true,
      description: "Delivery attempt failed",
    },
    {
      value: "returning_to_warehouse",
      label: "Returning to Warehouse",
      icon: <FiAlertCircle />,
      color: "var(--warning-color)",
      requiresNotes: true,
      description: "Package being returned to warehouse",
    },
    {
      value: "other",
      label: "Other Status",
      icon: <FiEdit />,
      color: "var(--info-color)",
      requiresNotes: true,
      description: "Specify a custom status for this delivery",
      isCustom: true,
    },
  ];

  // Find selected status option
  const selectedStatus = statusOptions.find(
    (option) => option.value === newStatus
  );

  // Handle photo capture
  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPhotoPreview(null);
  };
  // Handle status update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form based on selected status
    if (selectedStatus?.requiresOtp && !otp) {
      setError("OTP is required for delivered status");
      return;
    }

    if (selectedStatus?.requiresNotes && !notes) {
      setError("Please provide a reason for delivery failure");
      return;
    }

    try {
      // If custom status is selected, use the otherStatusText as status
      const statusToSubmit = newStatus === "other" ? "other" : newStatus;

      // Only attempt to update if we have a valid status
      if (newStatus === "other" && !otherStatusText) {
        setError("Please specify a custom status");
        return;
      }

      // Check for carrier and tracking number requirements
      if (selectedStatus?.requiresTrackingInfo) {
        if (!carrier) {
          setError("Please provide a carrier name for shipped packages");
          return;
        }
        if (!trackingNumber) {
          setError("Please provide a tracking number for shipped packages");
          return;
        }
      }

      // Prepare update payload
      const updatePayload = {
        photo: photoPreview,
        otp,
        notes,
        estimated_delivery: estimatedDelivery
          ? new Date(estimatedDelivery).toISOString()
          : null,
        updatedAt: new Date().toISOString(),
        carrier,
        tracking_number: trackingNumber,
      };

      // If status is "other", include the custom text in notes
      if (newStatus === "other") {
        updatePayload.notes = `Custom status: ${otherStatusText}${
          notes ? ` - ${notes}` : ""
        }`;
      }

      await onStatusUpdate(delivery.id, statusToSubmit, updatePayload);

      // Reset form
      setPhotoPreview(null);
      setOtp("");
      setNotes("");
      setEstimatedDelivery("");
      setCarrier("");
      setTrackingNumber("");
      setOtherStatusText("");
      setError("");
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div className="flex items-center">
              <FiPackage
                className="mr-3"
                size={24}
                style={{ color: "var(--brand-primary)" }}
              />
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Update Delivery Status
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Order ID: {delivery.orderId} • Customer:
                  {delivery.customer?.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <FiX size={20} />
            </button>
          </div>
          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Status Update Form */}
                  <div
                    className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <h4
                      className="text-md font-semibold mb-4 flex items-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FiPackage className="mr-2" /> Update Status
                    </h4>
                    {/* Status Selection */}
                    <div className="mb-4">
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Select Status
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`p-3 rounded-lg flex items-center border transition-all duration-200 ${
                              newStatus === option.value
                                ? "border-2"
                                : "hover:border-gray-300"
                            }`}
                            style={{
                              backgroundColor:
                                newStatus === option.value
                                  ? `${option.color}10`
                                  : "var(--bg-primary)",
                              borderColor:
                                newStatus === option.value
                                  ? option.color
                                  : "var(--border-primary)",
                            }}
                            onClick={() => {
                              setNewStatus(option.value);
                            }}
                          >
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                              style={{
                                backgroundColor:
                                  newStatus === option.value
                                    ? `${option.color}20`
                                    : "var(--bg-secondary)",
                                color: option.color,
                              }}
                            >
                              {option.icon}
                            </span>
                            <span
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Custom Status Field (when "Other" is selected) */}
                    {newStatus === "other" && (
                      <div className="mb-4">
                        <label
                          htmlFor="customStatus"
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Specify Custom Status
                        </label>
                        <div className="relative">
                          <div
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            <FiEdit size={16} />
                          </div>
                          <input
                            type="text"
                            id="customStatus"
                            value={otherStatusText}
                            onChange={(e) => setOtherStatusText(e.target.value)}
                            placeholder="Enter custom delivery status"
                            className="w-full pl-10 p-3 rounded-md text-sm border-2"
                            style={{
                              backgroundColor: "var(--bg-primary)",
                              borderColor: "var(--brand-primary)",
                              color: "var(--text-primary)",
                            }}
                          />
                        </div>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Please specify a descriptive status for this delivery
                        </p>
                      </div>
                    )}
                    {/* OTP field shown only for delivered status */}
                    {selectedStatus?.requiresOtp && (
                      <div className="mb-4">
                        <label
                          htmlFor="otp"
                          className="block text-sm font-medium mb-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Delivery OTP
                        </label>
                        <input
                          type="text"
                          id="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full p-3 border rounded-md text-sm"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-primary)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="Enter OTP provided by the customer"
                        />
                        <p
                          className="mt-1 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Please collect the OTP from the customer upon delivery
                        </p>
                      </div>
                    )}
                    {/* Carrier field */}
                    {(newStatus === "shipped" ||
                      newStatus === "out_for_delivery") && (
                      <div className="mb-4">
                        <label
                          htmlFor="carrier"
                          className="text-sm font-medium mb-2 flex justify-between items-center"
                        >
                          <span style={{ color: "var(--text-primary)" }}>
                            Shipping Carrier
                          </span>
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "var(--info-color)15",
                              color: "var(--info-color)",
                            }}
                          >
                            Required
                          </span>
                        </label>
                        <input
                          type="text"
                          id="carrier"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full p-3 border rounded-md text-sm"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-primary)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="Enter shipping carrier name (e.g., FedEx, UPS)"
                        />
                        <p
                          className="mt-1 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          The carrier responsible for delivering this package
                        </p>
                      </div>
                    )}
                    {/* Tracking Number field */}
                    {(newStatus === "shipped" ||
                      newStatus === "out_for_delivery") && (
                      <div className="mb-4">
                        <label
                          htmlFor="trackingNumber"
                          className="text-sm font-medium mb-2 flex justify-between items-center"
                        >
                          <span style={{ color: "var(--text-primary)" }}>
                            Tracking Number
                          </span>
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "var(--info-color)15",
                              color: "var(--info-color)",
                            }}
                          >
                            Required
                          </span>
                        </label>
                        <input
                          type="text"
                          id="trackingNumber"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full p-3 border rounded-md text-sm"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-primary)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="Enter tracking number"
                        />
                        <p
                          className="mt-1 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Tracking number provided by the shipping carrier
                        </p>
                      </div>
                    )}
                    {/* Estimated Delivery Date field */}
                    <div className="mb-4">
                      <label
                        htmlFor="estimatedDelivery"
                        className="text-sm font-medium mb-2 flex justify-between items-center"
                      >
                        <span style={{ color: "var(--text-primary)" }}>
                          Estimated Delivery Date & Time
                        </span>
                        {newStatus === "out_for_delivery" && (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "var(--warning-color)15",
                              color: "var(--warning-color)",
                            }}
                          >
                            Recommended
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          <FiCalendar size={16} />
                        </div>
                        <input
                          type="datetime-local"
                          id="estimatedDelivery"
                          value={estimatedDelivery}
                          onChange={(e) => setEstimatedDelivery(e.target.value)}
                          className={`w-full pl-10 p-3 border rounded-md text-sm ${
                            newStatus === "out_for_delivery" ? "border-2" : ""
                          }`}
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor:
                              newStatus === "out_for_delivery"
                                ? "var(--brand-primary)"
                                : "var(--border-primary)",
                            color: "var(--text-primary)",
                          }}
                        />
                      </div>
                      {estimatedDelivery && (
                        <div
                          className="mt-2 py-2 px-3 rounded-md"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--border-primary)",
                          }}
                        >
                          <span
                            className="text-xs font-medium"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Current Estimate:
                          </span>
                          <span
                            className="ml-2 text-sm font-semibold"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            {new Date(estimatedDelivery).toLocaleDateString() +
                              " at " +
                              new Date(estimatedDelivery).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                          </span>
                        </div>
                      )}
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {newStatus === "out_for_delivery"
                          ? "Please provide an estimated delivery time when going out for delivery"
                          : "Update the estimated delivery date and time for this order"}
                      </p>
                    </div>
                    {/* Notes field */}
                    <div className="mb-4">
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Notes {selectedStatus?.requiresNotes && "(Required)"}
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border rounded-md text-sm"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-primary)",
                          color: "var(--text-primary)",
                        }}
                        placeholder={
                          selectedStatus?.requiresNotes
                            ? "Please provide a reason for delivery failure"
                            : "Add any relevant notes (optional)"
                        }
                        rows={3}
                      />
                    </div>
                    {/* Error message */}
                    {error && (
                      <div
                        className="p-3 rounded-md flex items-start mb-4"
                        style={{
                          backgroundColor: "var(--error-color)10",
                          color: "var(--error-color)",
                        }}
                      >
                        <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </div>
                  {/* Delivery Photo Section */}
                  {(delivery.status === "out_for_delivery" ||
                    delivery.status === "assigned") && (
                    <div
                      className="rounded-lg p-4"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <h4
                        className="text-md font-semibold mb-3 flex items-center"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FiCamera className="mr-2" /> Delivery Photo (Optional)
                      </h4>

                      <p
                        className="text-sm mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Take a photo as proof of delivery
                      </p>

                      {photoPreview ? (
                        <div className="mb-3">
                          <div className="relative inline-block">
                            <img
                              src={photoPreview}
                              alt="Delivery proof"
                              className="rounded-md max-h-40 max-w-full"
                            />
                            <button
                              onClick={removePhoto}
                              className="absolute top-2 right-2 rounded-full p-1"
                              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                            >
                              <FiX size={14} style={{ color: "white" }} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <label
                            className="flex flex-col items-center justify-center w-full h-24 rounded-md cursor-pointer border-2 border-dashed"
                            style={{
                              borderColor: "var(--border-primary)",
                              backgroundColor: "var(--bg-primary)",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center">
                              <FiImage
                                size={24}
                                style={{ color: "var(--text-secondary)" }}
                                className="mb-2"
                              />
                              <p
                                className="text-xs text-center"
                                style={{ color: "var(--text-primary)" }}
                              >
                                <span className="font-semibold">
                                  Click to capture
                                </span>
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              capture="environment"
                              onChange={handlePhotoCapture}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Details Panel */}
                <div>
                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <h4
                      className="font-semibold mb-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Delivery Details
                    </h4>
                    <div className="space-y-3">
                      {/* Current Status */}
                      <div>
                        <h5
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Current Status
                        </h5>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
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
                      {/* Customer Information */}
                      <div>
                        <h5
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Customer Information
                        </h5>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {delivery.customer?.name || "Customer"}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {delivery.customer?.phone ||
                            delivery.customer_phone ||
                            "N/A"}
                        </p>

                        {/* Delivery Address */}
                        <h5
                          className="text-xs font-medium mb-1 mt-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Delivery Address
                        </h5>
                        {delivery.delivery_address ? (
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {delivery.delivery_address.street_address}
                            <br />
                            {delivery.delivery_address.city},
                            {delivery.delivery_address.state}
                            {delivery.delivery_address.postal_code}
                          </p>
                        ) : delivery.customer?.address ? (
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {delivery.customer.address}
                          </p>
                        ) : (
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Address not available
                          </p>
                        )}
                      </div>
                      {/* Items */}
                      <div>
                        <h5
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Items (
                          {delivery.item_count ||
                            (delivery.order_items &&
                              delivery.order_items.length) ||
                            (delivery.items && delivery.items.length) ||
                            "Unknown"}
                          )
                        </h5>
                        <div className="max-h-32 overflow-y-auto">
                          {delivery.order_items &&
                          delivery.order_items.length > 0 ? (
                            <ul className="space-y-2">
                              {delivery.order_items.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex justify-between text-xs border-b pb-1 last:border-b-0"
                                  style={{
                                    borderColor: "var(--border-primary)",
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span
                                      className="font-medium"
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {item.name ||
                                        item.brand +
                                          " " +
                                          (item.variant_details?.storage ||
                                            "") ||
                                        "Product"}
                                    </span>
                                    <span
                                      style={{ color: "var(--text-secondary)" }}
                                    >
                                      Qty: {item.quantity}
                                    </span>
                                    {item.variant_details && (
                                      <span
                                        className="text-xs mt-0.5"
                                        style={{
                                          color: "var(--text-secondary)",
                                        }}
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
                                        item.variant_details
                                          ?.discounted_price ||
                                        item.price ||
                                        "N/A"}
                                    </span>
                                    {item.variant_details?.price &&
                                      item.variant_details?.discounted_price &&
                                      item.variant_details.price >
                                        item.variant_details
                                          .discounted_price && (
                                        <span
                                          className="line-through text-xs"
                                          style={{
                                            color: "var(--text-secondary)",
                                          }}
                                        >
                                          ₹{item.variant_details.price}
                                        </span>
                                      )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : delivery.items && delivery.items.length > 0 ? (
                            <ul className="space-y-1">
                              {delivery.items.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex justify-between text-xs"
                                >
                                  <span
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {item.name} x{item.quantity}
                                  </span>
                                  <span
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    ₹{item.price}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Item details not available
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Estimated Delivery */}
                      <div>
                        <h5
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Estimated Delivery
                        </h5>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {delivery.expectedDelivery ||
                          delivery.estimated_delivery ||
                          delivery.estimatedDelivery
                            ? new Date(
                                delivery.expectedDelivery ||
                                  delivery.estimated_delivery ||
                                  delivery.estimatedDelivery
                              ).toLocaleDateString()
                            : "Not specified"}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {delivery.expectedDelivery ||
                          delivery.estimated_delivery ||
                          delivery.estimatedDelivery
                            ? new Date(
                                delivery.expectedDelivery ||
                                  delivery.estimated_delivery ||
                                  delivery.estimatedDelivery
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                      {/* Payment Information */}
                      <div className="mt-3">
                        <h5
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Payment Information
                        </h5>
                        <div className="flex justify-between text-xs">
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
                            {delivery.payment_method ||
                              delivery.paymentType ||
                              "Online Payment"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span style={{ color: "var(--text-primary)" }}>
                            Amount
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {delivery.paymentAmount ||
                              `₹${delivery.total_amount || 0}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="mt-6 pt-4 border-t flex justify-end space-x-3"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="transition-transform hover:scale-105"
                >
                  {isSubmitting ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStatusModal;
