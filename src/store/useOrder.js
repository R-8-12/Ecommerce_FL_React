import { create } from "zustand";
import api from "../services/api";
import axios from "axios";
import { useCartStore } from "./useCart";
import toast from "react-hot-toast";

// Declare razorpay payment function
const initiateRazorpayPayment = (razorpayData, onSuccess, onFailure) => {
  console.log("Initiating Razorpay payment with data:", razorpayData);

  // Check if Razorpay is available
  if (!window.Razorpay) {
    console.error("Razorpay SDK is not loaded");
    toast.error("Payment gateway not available. Please try again later.");
    return Promise.reject("Razorpay SDK not loaded");
  }

  // Validate required razorpay data
  if (
    !razorpayData.key_id ||
    !razorpayData.amount ||
    !razorpayData.razorpay_order_id
  ) {
    console.error("Missing required Razorpay data:", razorpayData);
    toast.error("Invalid payment configuration. Please try again.");
    return Promise.reject("Invalid razorpay data");
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: razorpayData.key_id,
      amount: razorpayData.amount,
      currency: razorpayData.currency || "INR",
      order_id: razorpayData.razorpay_order_id,
      name: "Anand Mobiles",
      description: "Purchase of products",
      image: "/logo.jpg",
      handler: function (response) {
        console.log("Payment successful, response:", response);

        // Handle successful payment
        const paymentData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          order_id: razorpayData.app_order_id,
        };

        // Check if admin token exists - if so, we need to use admin authentication
        const adminToken = localStorage.getItem("admin_token");
        
        if (adminToken) {
          console.log("Admin token detected, verifying payment with admin privileges");
          // Create temporary axios instance with admin token
          const adminApi = axios.create({
            baseURL: api.defaults.baseURL,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${adminToken}`
            }
          });
          
          // Verify payment using admin token
          adminApi
            .post("/users/order/razorpay/verify/", paymentData)
            .then((verifyResponse) => {
              console.log("Admin payment verified successfully:", verifyResponse.data);
              if (onSuccess) onSuccess(verifyResponse.data);
              resolve(verifyResponse.data);
            })
            .catch((error) => {
              console.error("Admin payment verification failed:", error);
              if (onFailure) onFailure(error);
              reject(error);
            });
        } else {
          // Regular user flow
          api
            .post("/users/order/razorpay/verify/", paymentData)
            .then((verifyResponse) => {
              console.log("Payment verified successfully:", verifyResponse.data);
              if (onSuccess) onSuccess(verifyResponse.data);
              resolve(verifyResponse.data);
            })
            .catch((error) => {
              console.error("Payment verification failed:", error);
              if (onFailure) onFailure(error);
              reject(error);
            });
        }
      },
      prefill: {
        // You can prefill user information if available
        // name: "Customer Name",
        // email: "customer@example.com",
        // contact: "9999999999"
      },
      notes: {
        order_id: razorpayData.app_order_id,
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal dismissed by user");
          if (onFailure) onFailure({ message: "Payment cancelled by user" });
          reject({ message: "Payment cancelled by user" });
        },
      },
    };

    console.log("Opening Razorpay modal with options:", options);

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        if (onFailure) onFailure(response.error);
        reject(response.error);
      });

      rzp.open();
      console.log("Razorpay modal opened successfully");
    } catch (error) {
      console.error("Error initiating Razorpay:", error);
      toast.error("Failed to open payment gateway. Please try again.");
      if (onFailure) onFailure(error);
      reject(error);
    }
  });
};

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  isProcessingPayment: false,
  paymentSuccessful: false,
  error: null,

  // Initialize Razorpay payment
  initiatePayment: (razorpayData) => {
    return initiateRazorpayPayment(
      razorpayData,
      (data) => {
        // Update order status on successful payment
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === razorpayData.app_order_id
              ? { ...order, status: "paid", payment_details: data }
              : order
          ),
          paymentSuccessful: true,
        }));
        toast.success("Payment successful!");

        // Reset payment success flag after a short delay
        setTimeout(() => {
          set({ paymentSuccessful: false });
        }, 1000);
      },
      (error) => {
        toast.error("Payment failed. Please try again.");
        console.error("Payment error:", error);
      }
    );
  },

  // Fetch all orders for the current user
  fetchOrders: async () => {
    if (get().isLoading) {
      console.log("Orders are already being fetched, skipping duplicate request");
      return get().orders;  
    }
    try {
      set({ isLoading: true, error: null });

      // Check if admin token exists - if so, we're an admin accessing customer pages
      const adminToken = localStorage.getItem("admin_token");
      const userToken = localStorage.getItem("token");
      
      let response;
      
      if (adminToken) {
        console.log("Admin token detected, fetching orders with admin privileges");
        // Create temporary axios instance with admin token
        const adminApi = axios.create({
          baseURL: api.defaults.baseURL,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`
          }
        });
        
        try {
          // Get orders through admin API endpoint instead - fixed URL path
          // Remove the "/api" prefix since the baseURL already includes it
          response = await adminApi.get("/admin/orders/customer/");
          console.log("Admin orders fetched successfully:", response?.data);
        } catch (error) {
          console.error("Error fetching admin orders:", error);
          toast.error("Failed to fetch admin orders");
          throw error;
        }
      } else if (userToken) {
        // Normal customer flow
        response = await api.get("/users/orders/");
      } else {
        throw new Error("No authentication token found");
      }

      const orders = response?.data?.orders || [];

      set({
        orders,
        isLoading: false,
      });

      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to fetch orders",
      });
      return [];
    }
  },
  // Place an order from the cart
  placeOrderFromCart: async (addressId) => {
    try {
      set({ isProcessingPayment: true, error: null });
      console.log("Starting placeOrderFromCart with addressId:", addressId);

      if(!addressId) {
        toast.error("Address ID is required to place an order");
        set({ isProcessingPayment: false });
        return null;
      }
      
      // Get cart items from cart store
      const cartItems = useCartStore.getState().items;
      console.log("Cart items:", cartItems);

      if (!cartItems || cartItems.length === 0) {
        toast.error("Your cart is empty");
        set({ isProcessingPayment: false });
        return null;
      }

      // Calculate total amount in paise (assuming item.price is in rupees)
      const totalAmountInPaise = Math.round(
        cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ) * 100
      );
      const orderData = {
        address_id: addressId,
        amount: totalAmountInPaise,
        currency: "INR",
        product_ids: cartItems.map((item) => item.item_id), // Use item_id (cart item ID) instead of id (product_id)
      };

      console.log("Order data being sent:", orderData);
      
      // Check if admin token exists - if so, we need to use admin authentication
      const adminToken = localStorage.getItem("admin_token");
      let response;
      
      if (adminToken) {
        console.log("Admin token detected, creating order with admin privileges");
        
        // Clean any quoted tokens (to handle token stored with quotes)
        const cleanToken = adminToken.replace ? adminToken.replace(/^"|"$/g, '') : adminToken;
        
        console.log("Using cleaned admin token (first 15 chars):", 
          cleanToken.substring(0, Math.min(15, cleanToken.length)) + "...");
        
        // Create temporary axios instance with admin token
        const adminApi = axios.create({
          baseURL: api.defaults.baseURL,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cleanToken}`
          }
        });
        
        try {
          // Special endpoint for admin placing orders - switch endpoint for admin users
          response = await adminApi.post("/admin/place-customer-order/", orderData);
          console.log("Admin order creation successful through admin endpoint");
        } catch (adminError) {
          console.error("Error using admin endpoint, falling back to standard endpoint:", adminError);
          
          // Fallback to standard endpoint
          response = await adminApi.post("/users/order/razorpay/create/", orderData);
        }
      } else {
        // Regular user flow
        response = await api.post(
          "/users/order/razorpay/create/",
          orderData
        );
      }

      console.log("API response:", response.data);

      // The response now contains Razorpay order details
      const razorpayData = response.data;

      // Validate razorpay response
      if (
        !razorpayData.key_id ||
        !razorpayData.razorpay_order_id ||
        !razorpayData.amount
      ) {
        console.error("Invalid razorpay data received:", razorpayData);
        toast.error("Invalid payment configuration received from server");
        set({ isProcessingPayment: false });
        return null;
      }

      // Create the order object
      const newOrder = {
        id: razorpayData.app_order_id,
        razorpay_order_id: razorpayData.razorpay_order_id,
        status: "pending_payment",
        // Add other order details as needed
      };

      // Add the new order to the orders list
      set((state) => ({
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
      }));

      console.log("Initiating Razorpay payment..."); // Initiate Razorpay payment
      await initiateRazorpayPayment(
        razorpayData,
        async (paymentData) => {
          // Payment successful
          console.log("Payment successful:", paymentData);

          // Clear the cart done in verification already no need

          // Update order status
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === razorpayData.app_order_id
                ? { ...order, status: "paid", payment_details: paymentData }
                : order
            ),
            isProcessingPayment: false,
            paymentSuccessful: true,
          }));

          // Reset payment success flag after a short delay
          setTimeout(() => {
            set({ paymentSuccessful: false });
          }, 1000);

          toast.success("Payment successful! Order placed successfully.");
        },
        (error) => {
          // Payment failed or cancelled
          console.error("Payment error:", error);

          set({ isProcessingPayment: false });

          if (error.message === "Payment cancelled by user") {
            toast.error("Payment was cancelled");
          } else {
            toast.error("Payment failed. Please try again.");
          }
        }
      );

      return newOrder;
    } catch (error) {
      console.error("Error placing order:", error);
      set({
        isProcessingPayment: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to place order",
      });
      toast.error("Failed to place order. Please try again.");
      return null;
    }
  },
  // Place an order for a single product
  placeSingleProductOrder: async (product, quantity, addressId) => {
    try {
      set({ isProcessingPayment: true, error: null });
      console.log("Starting placeSingleProductOrder with:", {
        product,
        quantity,
        addressId,
      });

      if (!product) {
        toast.error("Product information is missing");
        set({ isProcessingPayment: false });
        return null;
      }

      if(!addressId) {
        toast.error("Address ID is required to place an order");
        set({ isProcessingPayment: false });
        return null;
      }
      if(get().isProcessingPayment) {
        console.log("Order is already being processed, skipping duplicate request");
        return null;
      }
      // Calculate total amount in paise (assuming product.price is in rupees)
      const totalAmountInPaise = Math.round(product.price * quantity * 100);
      const orderData = {
        address_id: addressId,
        amount: totalAmountInPaise,
        currency: "INR",
        product_ids: [product.id],
        // For single product orders, include product details directly
        single_product_order: true,
        product_details: {
          product_id: product.id,
          quantity: quantity,
          variant_id: product.variant_id || null,
        },
      };

      console.log("Single product order data being sent:", orderData);

      // Check if admin token exists - if so, we need to use admin authentication
      const adminToken = localStorage.getItem("admin_token");
      let response;
      
      if (adminToken) {
        console.log("Admin token detected, creating single product order with admin privileges");
        
        // Clean any quoted tokens (to handle token stored with quotes)
        const cleanToken = adminToken.replace ? adminToken.replace(/^"|"$/g, '') : adminToken;
        
        console.log("Using cleaned admin token (first 15 chars):", 
          cleanToken.substring(0, Math.min(15, cleanToken.length)) + "...");
        
        // Create temporary axios instance with admin token
        const adminApi = axios.create({
          baseURL: api.defaults.baseURL,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cleanToken}`
          }
        });
        
        try {
          // Special endpoint for admin placing orders - switch endpoint for admin users
          response = await adminApi.post("/admin/place-customer-order/", orderData);
          console.log("Admin single product order creation successful through admin endpoint");
        } catch (adminError) {
          console.error("Error using admin endpoint, falling back to standard endpoint:", adminError);
          
          // Fallback to standard endpoint
          response = await adminApi.post("/users/order/razorpay/create/", orderData);
        }
      } else {
        // Regular user flow
        response = await api.post(
          "/users/order/razorpay/create/",
          orderData
        );
      }

      console.log("Single product API response:", response.data);

      // The response now contains Razorpay order details
      const razorpayData = response.data;

      // Validate razorpay response
      if (
        !razorpayData.key_id ||
        !razorpayData.razorpay_order_id ||
        !razorpayData.amount
      ) {
        console.error(
          "Invalid razorpay data received for single product:",
          razorpayData
        );
        toast.error("Invalid payment configuration received from server");
        set({ isProcessingPayment: false });
        return null;
      }

      // Create the order object
      const newOrder = {
        id: razorpayData.app_order_id,
        razorpay_order_id: razorpayData.razorpay_order_id,
        status: "pending_payment",
        // Add other order details as needed
      };

      // Add the new order to the orders list
      set((state) => ({
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
      }));

      console.log("Initiating Razorpay payment for single product...");

      // Initiate Razorpay payment
      await initiateRazorpayPayment(
        razorpayData,
        async (paymentData) => {
          // Payment successful
          console.log("Single product payment successful:", paymentData);

          // Update order status
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === razorpayData.app_order_id
                ? { ...order, status: "paid", payment_details: paymentData }
                : order
            ),
            isProcessingPayment: false,
            paymentSuccessful: true,
          }));

          // Reset payment success flag after a short delay
          setTimeout(() => {
            set({ paymentSuccessful: false });
          }, 1000);

          toast.success("Payment successful! Order placed successfully.");
        },
        (error) => {
          // Payment failed or cancelled
          console.error("Single product payment error:", error);

          set({ isProcessingPayment: false });

          if (error.message === "Payment cancelled by user") {
            toast.error("Payment was cancelled");
          } else {
            toast.error("Payment failed. Please try again.");
          }
        }
      );

      return newOrder;
    } catch (error) {
      console.error("Error placing single product order:", error);
      set({
        isProcessingPayment: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to place order",
      });
      toast.error("Failed to place order. Please try again.");
      return null;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get(`/users/orders/${orderId}/`);
      const order = response.data.order_details;
      console.log("Fetched order:", order);

      set({
        currentOrder: order,
        isLoading: false,
      });

      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to fetch order",
      });
      return null;
    }
  },

  // Cancel an order
  cancelOrder: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      await api.post(`/users/orders/${orderId}/cancel/`);

      // Update the order in the orders list
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        ),
        isLoading: false,
      }));

      toast.success("Order cancelled successfully");

      return true;
    } catch (error) {
      console.error("Error cancelling order:", error);
      set({
        isLoading: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to cancel order",
      });
      toast.error("Failed to cancel order");
      return false;
    }
  },

  // Clear any error
  clearError: () => set({ error: null }),
}));

export default useOrderStore;
