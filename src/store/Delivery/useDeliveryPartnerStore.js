import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { deliveryApi } from "../../services/api";
import { DELIVERY_TOKEN_KEY } from "../../utils/constants";

export const useDeliveryPartnerStore = create(
  devtools((set, get) => ({
    // Auth state
    isAuthenticated: !!localStorage.getItem(DELIVERY_TOKEN_KEY),
    partner: JSON.parse(localStorage.getItem("delivery_partner") || "null"),
    loading: false,
    error: null,

    // Dashboard data
    assignedDeliveries: [],
    deliveryHistory: [],

    // Profile data
    partnerProfile: null,

    // Auth actions
    registerPartner: async (partnerData) => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.post(
          "/partners/register/",
          partnerData
        );
        set({
          loading: false,
          error: null,
        });
        return response.data;
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Registration failed",
        });
        throw error;
      }
    },

    loginPartner: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.post(
          "/partners/login/",
          credentials
        );
        const { token, partner_id } = response.data;

        // Store token in localStorage
        localStorage.setItem(DELIVERY_TOKEN_KEY, token);

        // Get partner details or save basic info
        const partnerData = {
          id: partner_id,
          email: credentials.email,
        };
        localStorage.setItem("delivery_partner", JSON.stringify(partnerData));

        set({
          isAuthenticated: true,
          partner: partnerData,
          loading: false,
          error: null,
        });
        return response.data;
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Login failed",
        });
        throw error;
      }
    },

    // Profile management actions
    fetchPartnerProfile: async () => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.get("/partners/profile/");

        const partnerData = response.data.partner;

        set({
          partnerProfile: partnerData,
          loading: false,
          error: null,
        });

        return partnerData;
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Failed to fetch profile",
        });
        throw error;
      }
    },

    updatePartnerProfile: async (profileData) => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.patch(
          "/partners/profile/update/",
          profileData
        );

        // Refresh profile data after successful update
        await get().fetchPartnerProfile();

        set({
          loading: false,
          error: null,
        });

        return response.data;
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Failed to update profile",
        });
        throw error;
      }
    },

    logoutPartner: () => {
      localStorage.removeItem(DELIVERY_TOKEN_KEY);
      localStorage.removeItem("delivery_partner");
      set({
        isAuthenticated: false,
        partner: null,
        partnerProfile: null,
        assignedDeliveries: [],
        deliveryHistory: [],
      });
    },

    // Delivery management actions
    fetchAssignedDeliveries: async () => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.get(
          "/partners/deliveries/assigned/"
        );

        // Updated to handle assigned_orders instead of assigned_deliveries
        const assignedDeliveries = response.data.assigned_orders || [];

        set({
          assignedDeliveries: assignedDeliveries,
          loading: false,
          error: null,
        });

        return assignedDeliveries;
      } catch (error) {
        set({
          loading: false,
          error:
            error.response?.data?.error ||
            "Failed to fetch assigned deliveries",
        });
        throw error;
      }
    },

    fetchDeliveryHistory: async () => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.get("/partners/deliveries/history/");
        set({
          deliveryHistory: response.data.delivery_history,
          loading: false,
          error: null,
        });
        return response.data.delivery_history;
      } catch (error) {
        set({
          loading: false,
          error:
            error.response?.data?.error || "Failed to fetch delivery history",
        });
        throw error;
      }
    },
    updateDeliveryStatus: async (orderId, status, additionalData = {}) => {
      set({ loading: true, error: null });
      try {
        // Combine status with additional data like notes, estimated_delivery, etc.
        const updateData = {
          status,
          ...additionalData,
        };

        const response = await deliveryApi.patch(
          `/partners/deliveries/update_status/${orderId}/`,
          updateData
        );

        // Update the local state by fetching fresh data
        await useDeliveryPartnerStore.getState().fetchAssignedDeliveries();

        set({ loading: false, error: null });
        return response.data;
      } catch (error) {
        set({
          loading: false,
          error:
            error.response?.data?.error || "Failed to update delivery status",
        });
        throw error;
      }
    },

    // OTP Verification for Delivery Completion
    initiateDeliveryWithOTP: async (orderId) => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.post(
          `/partners/deliveries/initiate-otp/${orderId}/`
        );
        
        set({ loading: false, error: null });
        return response.data; // Should return { otp_sent: true, message: "OTP sent to customer" }
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Failed to send OTP to customer",
        });
        throw error;
      }
    },

    // Complete delivery with OTP verification
    completeDeliveryWithOTP: async (orderId, otp, deliveryNotes = "") => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.post(
          `/partners/deliveries/complete-with-otp/${orderId}/`,
          { 
            otp, 
            delivery_notes: deliveryNotes,
            completion_time: new Date().toISOString()
          }
        );

        // Update the local state by fetching fresh data
        await useDeliveryPartnerStore.getState().fetchAssignedDeliveries();
        await useDeliveryPartnerStore.getState().fetchDeliveryHistory();

        set({ loading: false, error: null });
        return response.data;
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Failed to complete delivery. Please verify OTP.",
        });
        throw error;
      }
    },

    // Mark delivery as failed (customer rejection)
    markDeliveryFailed: async (orderId, reason, returnToWarehouse = true) => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.post(
          `/partners/deliveries/mark-failed/${orderId}/`,
          { 
            failure_reason: reason,
            return_to_warehouse: returnToWarehouse,
            failure_time: new Date().toISOString()
          }
        );

        // Update the local state by fetching fresh data
        await useDeliveryPartnerStore.getState().fetchAssignedDeliveries();

        set({ loading: false, error: null });
        return response.data;
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Failed to mark delivery as failed",
        });
        throw error;
      }
    },

    // Return to warehouse
    returnToWarehouse: async (orderId, returnReason = "") => {
      set({ loading: true, error: null });
      try {
        const response = await deliveryApi.post(
          `/partners/deliveries/return-to-warehouse/${orderId}/`,
          { 
            return_reason: returnReason,
            return_time: new Date().toISOString()
          }
        );

        // Update the local state by fetching fresh data
        await useDeliveryPartnerStore.getState().fetchAssignedDeliveries();

        set({ loading: false, error: null });
        return response.data;
      } catch (error) {
        set({
          loading: false,
          error: error.response?.data?.error || "Failed to return to warehouse",
        });
        throw error;
      }
    },
  }))
);

export { deliveryApi };
export default useDeliveryPartnerStore;
