import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCreditCard,
  FiMapPin,
  FiLoader,
  FiCheck,
  FiPlus,
  FiMapPin as FiLocation,
  FiPhone,
  FiUser,
  FiShield,
  FiZap,
  FiTruck,
  FiStar,
  FiGift,
  FiShoppingBag,
} from "react-icons/fi";
import useAddressStore from "../../store/useAddress";
import { useCartStore } from "../../store/useCart";
import { useOrderStore } from "../../store/useOrder";
import { useAuthStore } from "../../store/useAuth";
import { useAdminAuthStore } from "../../store/Admin/useAdminAuth";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import toast from "react-hot-toast";

const Checkout = ({ isOpen, onClose, product = null, quantity = 1 }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isAuthenticated: isAdminAuthenticated, admin } = useAdminAuthStore();
  const { items: cartItems, totalAmount: cartTotal } = useCartStore();
  const {
    placeOrderFromCart,
    placeSingleProductOrder,
    isProcessingPayment,
    paymentSuccessful,
  } = useOrderStore();
  const {
    addresses,
    fetchAddresses,
    isLoading: addressLoading,
  } = useAddressStore();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [adminAddress, setAdminAddress] = useState(null);
  // Calculate order details
  const isCartOrder = !product;
  const orderItems = isCartOrder ? cartItems : [{ ...product, quantity }];
  const subtotal = isCartOrder ? cartTotal : product?.price * quantity;
  const tax = 0;
  const shipping = 0;
  const orderTotal = subtotal + tax + shipping;

  // Check if current user is an admin
  const isAdmin = isAdminAuthenticated;

  // Function to create address from admin profile
  const createAddressFromAdminProfile = () => {
    if (!admin || !admin.address) {
      console.error("Admin profile or address is missing", admin);
      return null;
    }
    
    // Generate a unique ID for the admin address
    const adminAddressId = `admin-${admin.id || Date.now()}`;
    
    console.log("Creating admin address from profile:", admin.address);
    
    // Create an address object in the format expected by the checkout component
    return {
      id: adminAddressId,
      name: admin.name || 'Admin',
      address: admin.address?.street || '',
      city: admin.address?.city || '',
      state: admin.address?.state || '',
      pincode: admin.address?.zipCode || '',
      phone: admin.phone || admin.phoneNumber || '',
      isDefault: true,
      // Add any other required fields
      type: 'Work',
      street_address: admin.address?.street || '',
      postal_code: admin.address?.zipCode || '',
      phone_number: admin.phone || admin.phoneNumber || '',
      is_default: true,
    };
  };

  useEffect(() => {
    if (!isOpen) return;
    
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      console.error("Razorpay SDK not loaded when checkout opened");
      toast.error(
        "Payment gateway not available. Please refresh and try again."
      );
      return;
    }
    console.log("Razorpay SDK is available:", !!window.Razorpay);
    
    // Handle different auth scenarios
    if (isAuthenticated) {
      // Regular user flow - fetch addresses from API
      console.log("Regular user authenticated, fetching addresses");
      fetchAddresses();
    } else if (isAdmin) {
      // Admin flow - create address from admin profile
      console.log("Admin user detected, creating address from admin profile:", admin);
      const formattedAdminAddress = createAddressFromAdminProfile();
      if (formattedAdminAddress) {
        setAdminAddress(formattedAdminAddress);
        console.log("Using admin address for checkout:", formattedAdminAddress);
      } else {
        console.error("Failed to create admin address from profile:", admin);
        toast.error("Admin profile address is incomplete. Please update your profile first.");
      }
    } else {
      console.log("No authentication detected");
    }
  }, [isOpen, isAuthenticated, isAdmin, admin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle address selection
  useEffect(() => {
    // For regular users
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      setSelectedAddressId(defaultAddress?.id || addresses[0]?.id);
    }
    
    // For admin users
    if (isAdmin && adminAddress && !selectedAddressId) {
      setSelectedAddressId(adminAddress.id);
    }
  }, [addresses, adminAddress, selectedAddressId, isAdmin]);

  // Close checkout modal when payment is successful
  useEffect(() => {
    if (paymentSuccessful && isOpen) {
      console.log("Payment successful, closing checkout modal");
      // Add a small delay before closing to allow state updates
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [paymentSuccessful, isOpen, onClose]);
  const handlePlaceOrder = async () => {
    console.log("handlePlaceOrder called", {
      isAuthenticated,
      isAdmin,
      selectedAddressId,
    });

    // User must be either a regular authenticated user or an admin
    if (!isAuthenticated && !isAdmin) {
      toast.error("Please login to place order");
      navigate("/login");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    
    // For admin users, ensure the admin token is available
    if (isAdmin) {
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        toast.error("Admin authentication required. Please re-login.");
        navigate("/admin/login");
        return;
      }
      // Clean token and log for debugging
      const cleanToken = adminToken.replace ? adminToken.replace(/^"|"$/g, '') : adminToken;
      console.log("Admin token found (first 15 chars):", 
        cleanToken.substring(0, Math.min(15, cleanToken.length)) + "...");
      console.log("Proceeding with order placement as admin");
    }

    try {
      console.log("Attempting to place order...", {
        isCartOrder,
        product,
        quantity,
        selectedAddressId,
        isAdmin
      });

      let result;
      if (isCartOrder) {
        console.log("Placing cart order...");
        result = await placeOrderFromCart(selectedAddressId);
      } else {
        console.log("Placing single product order...");
        result = await placeSingleProductOrder(
          product,
          quantity,
          selectedAddressId
        );
      }

      console.log("Order placement result:", result);

      // Only close the modal if payment was successful
      // The payment status will be handled by the useOrder store
      if (result) {
        console.log(
          "Order placed successfully, waiting for payment completion..."
        );
        // Payment process initiated successfully
        // Modal will close after payment completion or be kept open if payment fails
      } else {
        console.log("Order placement failed - no result returned");
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      closeOnBackdropClick={!isProcessingPayment}
      className="animate-fadeIn w-11/12 max-w-5xl"
    >
      <div
        className="relative w-full"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {/* Enhanced Header with Gradient Background */}
        <div
          className="relative px-8 py-8 text-center overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%)",
            color: "var(--text-on-brand)",
          }}
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 transform translate-x-8 -translate-y-8">
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: "var(--text-on-brand)" }}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 transform -translate-x-4 translate-y-4">
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: "var(--text-on-brand)" }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div
                className="p-4 rounded-full transform hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <FiShoppingBag className="text-3xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Complete Your Order</h2>
            <p className="text-lg opacity-90">
              Review your order details and complete the secure checkout
            </p>
            {/* Progress indicator */}
            <div className="flex items-center justify-center mt-6 space-x-2">
              <div className="w-3 h-3 rounded-full bg-white opacity-100"></div>
              <div className="w-8 h-1 bg-white opacity-60 rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-60"></div>
              <div className="w-8 h-1 bg-white opacity-30 rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-30"></div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Order Summary & Address */}
            <div
              className="lg:col-span-2 space-y-6 md:space-y-8"
              style={{ animation: "slideInLeft 0.6s ease-out" }}
            >
              {/* Enhanced Order Summary */}
              <div
                className="group rounded-2xl p-8 border-2 border-transparent transition-all duration-500 hover:border-opacity-30 hover:shadow-xl transform hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  background:
                    "linear-gradient(145deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
                }}
              >
                <div className="flex items-center mb-8">
                  <div
                    className="p-3 rounded-xl mr-4 transform group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundColor: "var(--bg-accent-light)",
                      color: "var(--brand-primary)",
                      boxShadow: "0 4px 14px 0 rgba(0, 118, 255, 0.15)",
                    }}
                  >
                    <FiShoppingBag className="text-xl" />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Order Summary
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {orderItems.length} item{orderItems.length > 1 ? "s" : ""}
                      in your order
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {orderItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`group/item flex items-center justify-between p-6 rounded-xl transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] ${
                        index < orderItems.length - 1 ? "border-b-2" : ""
                      }`}
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-primary)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="flex items-center flex-1">
                        <div
                          className="relative w-24 h-24 rounded-xl overflow-hidden mr-6 group-hover/item:shadow-lg transition-shadow duration-300"
                          style={{
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            border: "2px solid var(--border-primary)",
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="flex-1">
                          <h4
                            className="font-semibold mb-2 text-lg group-hover:item:text-opacity-80 transition-all duration-300"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.name}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <span
                              className="text-sm px-4 py-2 rounded-full font-medium"
                              style={{
                                backgroundColor: "var(--bg-accent-light)",
                                color: "var(--brand-primary)",
                              }}
                            >
                              Qty: {item.quantity}
                            </span>
                            <div className="flex items-center">
                              <FiStar
                                className="text-yellow-400 mr-1"
                                size={14}
                              />
                              <span
                                className="text-sm font-medium"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                4.5
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className="font-bold text-xl mb-1 group-hover:item:scale-105 transition-transform duration-300"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Enhanced Total Section */}
                  <div
                    className="p-6 rounded-xl border-2"
                    style={{
                      borderColor: "var(--brand-primary)",
                      backgroundColor: "var(--bg-accent-light)",
                      background:
                        "linear-gradient(145deg, var(--bg-accent-light) 0%, rgba(255, 255, 255, 0.8) 100%)",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FiGift
                          className="mr-3 text-2xl"
                          style={{ color: "var(--brand-primary)" }}
                        />
                        <div>
                          <span
                            className="text-xl font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Total Amount
                          </span>
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Including all taxes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-3xl font-bold"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {formatPrice(orderTotal)}
                        </span>
                        <div className="flex items-center justify-end mt-1">
                          <FiTruck className="mr-1 text-green-500" size={14} />
                          <span className="text-sm font-medium text-green-500">
                            FREE Delivery
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Enhanced Address Selection */}
              <div
                className="group rounded-2xl p-8 border-2 border-transparent transition-all duration-500 hover:border-opacity-30 hover:shadow-xl transform hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  background:
                    "linear-gradient(145deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
                }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div
                      className="p-3 rounded-xl mr-4 transform group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundColor: "var(--bg-accent-light)",
                        color: "var(--brand-primary)",
                        boxShadow: "0 4px 14px 0 rgba(0, 118, 255, 0.15)",
                      }}
                    >
                      <FiMapPin className="text-xl" />
                    </div>
                    <div>
                      <h3
                        className="text-xl font-bold mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Delivery Address
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Choose where you want your order delivered
                      </p>
                    </div>
                  </div>
                </div>

                {addressLoading ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 rounded-xl"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <div
                      className="p-4 rounded-full mb-4"
                      style={{
                        backgroundColor: "var(--bg-accent-light)",
                        color: "var(--brand-primary)",
                      }}
                    >
                      <FiLoader className="animate-spin" size={32} />
                    </div>
                    <p
                      className="text-lg font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Loading addresses...
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Please wait while we fetch your saved addresses
                    </p>
                  </div>
                ) : isAdmin && adminAddress ? (
                  // Admin address display
                  <div className="space-y-4">
                    <div
                      className="group/addr p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 transform shadow-lg scale-[1.02]"
                      style={{
                        backgroundColor: "var(--bg-accent-light)",
                        borderColor: "var(--brand-primary)",
                        boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.25)"
                      }}
                      onClick={() => setSelectedAddressId(adminAddress.id)}
                    >
                      <div className="flex items-start">
                        <div className="flex items-center mr-6 mt-1">
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 scale-110"
                            style={{
                              borderColor: "var(--brand-primary)",
                              backgroundColor: "var(--brand-primary)"
                            }}
                          >
                            <FiCheck
                              className="text-sm animate-fadeIn"
                              style={{ color: "var(--text-on-brand)" }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="flex items-center mr-4">
                              <FiUser
                                className="mr-2 text-lg"
                                style={{ color: "var(--brand-primary)" }}
                              />
                              <span
                                className="font-semibold text-lg"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {adminAddress.name}
                              </span>
                            </div>
                            <span
                              className="px-3 py-1 text-xs font-semibold rounded-full transform group-hover/addr:scale-105 transition-transform duration-300"
                              style={{
                                backgroundColor: "var(--success-color)",
                                color: "white",
                              }}
                            >
                              ⭐ Admin
                            </span>
                          </div>
                          <div className="flex items-start mb-3">
                            <FiLocation
                              className="mr-3 mt-1 text-lg flex-shrink-0"
                              style={{ color: "var(--brand-primary)" }}
                            />
                            <p
                              className="text-base leading-relaxed"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {adminAddress.address}, {adminAddress.city},
                              {adminAddress.state} - {adminAddress.pincode}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <FiPhone
                              className="mr-3 text-lg"
                              style={{ color: "var(--brand-primary)" }}
                            />
                            <p
                              className="text-base font-medium"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {adminAddress.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`group/addr p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 transform ${
                          selectedAddressId === address.id
                            ? "shadow-lg scale-[1.02] border-2"
                            : "hover:shadow-md hover:scale-[1.01]"
                        }`}
                        style={{
                          backgroundColor:
                            selectedAddressId === address.id
                              ? "var(--bg-accent-light)"
                              : "var(--bg-primary)",
                          borderColor:
                            selectedAddressId === address.id
                              ? "var(--brand-primary)"
                              : "var(--border-primary)",
                          boxShadow:
                            selectedAddressId === address.id
                              ? "0 10px 25px -5px rgba(245, 158, 11, 0.25)"
                              : "0 4px 15px rgba(0, 0, 0, 0.05)",
                        }}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex items-center mr-6 mt-1">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                selectedAddressId === address.id
                                  ? "border-2 scale-110"
                                  : "group-hover/addr:scale-105"
                              }`}
                              style={{
                                borderColor:
                                  selectedAddressId === address.id
                                    ? "var(--brand-primary)"
                                    : "var(--border-secondary)",
                                backgroundColor:
                                  selectedAddressId === address.id
                                    ? "var(--brand-primary)"
                                    : "transparent",
                              }}
                            >
                              {selectedAddressId === address.id && (
                                <FiCheck
                                  className="text-sm animate-fadeIn"
                                  style={{ color: "var(--text-on-brand)" }}
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="flex items-center mr-4">
                                <FiUser
                                  className="mr-2 text-lg"
                                  style={{ color: "var(--brand-primary)" }}
                                />
                                <span
                                  className="font-semibold text-lg"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {address.name}
                                </span>
                              </div>
                              {address.isDefault && (
                                <span
                                  className="px-3 py-1 text-xs font-semibold rounded-full transform group-hover/addr:scale-105 transition-transform duration-300"
                                  style={{
                                    backgroundColor: "var(--success-color)",
                                    color: "white",
                                  }}
                                >
                                  ⭐ Default
                                </span>
                              )}
                            </div>
                            <div className="flex items-start mb-3">
                              <FiLocation
                                className="mr-3 mt-1 text-lg flex-shrink-0"
                                style={{ color: "var(--brand-primary)" }}
                              />
                              <p
                                className="text-base leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {address.address}, {address.city},
                                {address.state} - {address.pincode}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <FiPhone
                                className="mr-3 text-lg"
                                style={{ color: "var(--brand-primary)" }}
                              />
                              <p
                                className="text-base font-medium"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {address.phone}
                              </p>
                            </div>
                          </div>
                          {selectedAddressId === address.id && (
                            <div className="ml-4">
                              <div
                                className="p-2 rounded-full animate-fadeIn"
                                style={{
                                  backgroundColor: "var(--brand-primary)",
                                  color: "var(--text-on-brand)",
                                }}
                              >
                                <FiCheck className="text-lg" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center py-16 rounded-xl"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <FiMapPin
                        size={40}
                        style={{ color: "var(--text-secondary)" }}
                      />
                    </div>
                    <p
                      className="mb-4 text-xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      No addresses found
                    </p>
                    <p
                      className="mb-8 text-base"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Add a delivery address from profile section to continue
                      with your order
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Right Column - Payment & Order */}
            <div className="lg:col-span-1">
              <div
                className="rounded-xl p-6 border sticky top-4"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)",
                  boxShadow: "var(--shadow-medium)",
                  borderTop: "4px solid var(--brand-primary)",
                }}
              >
                <div className="flex items-center mb-6">
                  <div
                    className="p-2 rounded-lg mr-3"
                    style={{
                      backgroundColor: "var(--bg-accent-light)",
                      color: "var(--brand-primary)",
                    }}
                  >
                    <FiCreditCard className="text-lg" />
                  </div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Payment
                  </h3>
                </div>
                {/* Payment Method */}
                <div className="mb-6">
                  <div
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--brand-primary)",
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3"
                        style={{
                          borderColor: "var(--brand-primary)",
                          backgroundColor: "var(--brand-primary)",
                        }}
                      >
                        <FiCheck
                          className="text-xs"
                          style={{ color: "var(--text-on-brand)" }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Razorpay
                          </span>
                          <FiShield
                            className="ml-2 text-sm"
                            style={{ color: "var(--success-color)" }}
                          />
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Secure payment with UPI, Cards, Net Banking
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Order Total Summary */}
                <div
                  className="p-4 rounded-lg mb-6"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Subtotal:
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <hr style={{ borderColor: "var(--border-primary)" }} />
                    <div className="flex justify-between items-center">
                      <span
                        className="font-bold text-lg"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Total:
                      </span>
                      <span
                        className="font-bold text-xl"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {formatPrice(orderTotal)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddressId || isProcessingPayment}
                  className="w-full transition-transform hover:scale-105 duration-300 mb-2"
                  size="lg"
                  style={{
                    backgroundColor:
                      !selectedAddressId || isProcessingPayment
                        ? "var(--text-secondary)"
                        : "var(--brand-primary)",
                    color: "var(--text-on-brand)",
                  }}
                  icon={
                    isProcessingPayment ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiZap />
                    )
                  }
                >
                  {isProcessingPayment
                    ? "Processing Payment..."
                    : `Place Order`}
                </Button>
                {/* Continue Shopping Button */}
                <button
                  onClick={onClose}
                  className="w-full py-2 mt-2 text-center font-medium transition-all duration-300 rounded-lg hover:bg-opacity-10"
                  style={{
                    color: "var(--brand-primary)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--brand-primary)",
                  }}
                  disabled={isProcessingPayment}
                >
                  Continue Shopping
                </button>
                {/* Security Notice */}
                <div
                  className="mt-4 p-3 rounded-lg flex items-center"
                  style={{
                    backgroundColor: "var(--bg-accent-light)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <FiShield
                    className="mr-2 flex-shrink-0"
                    style={{ color: "var(--success-color)" }}
                  />
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Checkout;
