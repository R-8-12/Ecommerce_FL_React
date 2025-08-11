import React, { useEffect, useState } from "react";
import { useAdminStore } from "../../store/Admin/useAdminStore";
import { toast } from "react-hot-toast";
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiTruck,
  FiClock,
  FiEye,
} from "react-icons/fi";
import Pagination from "../../components/common/Pagination";

const AdminDeliveryPartners = () => {
  const { deliveryPartners, fetchDeliveryPartners, verifyDeliveryPartner } =
    useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  useEffect(() => {
    fetchDeliveryPartners().catch((error) => {
      toast.error("Failed to load delivery partners");
      console.error("Error fetching delivery partners:", error);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const openVerifyModal = (partner) => {
    setSelectedPartner(partner);
    setShowModal(true);
  };

  const openDetailsModal = (partner) => {
    setPartnerDetails(partner);
    setShowDetailsModal(true);
  };
  const confirmVerify = async () => {
    if (selectedPartner) {
      toast.promise(verifyDeliveryPartner(selectedPartner.partner_id), {
        loading: `Verifying ${selectedPartner.name}...`,
        success: `${selectedPartner.name} has been verified successfully!`,
        error: `Failed to verify ${selectedPartner.name}`,
      });
      setShowModal(false);
    }
  };

  // Filter partners based on search term and filter status with null safety
  const filteredPartners = (deliveryPartners?.list || []).filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.phone.includes(searchTerm);

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "verified")
      return matchesSearch && partner.is_verified;
    if (filterStatus === "unverified")
      return matchesSearch && !partner.is_verified;
    return matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredPartners.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Delivery Partners</h1>
        <button
          onClick={() => {
            toast.promise(fetchDeliveryPartners(), {
              loading: "Refreshing partners list...",
              success: "Partners list updated!",
              error: "Failed to refresh partners",
            });
          }}
          className="flex items-center bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all duration-200"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Statistics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Partners Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FiUser className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Partners</p>
              <p className="text-2xl font-bold">
                {deliveryPartners?.list?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Verified Partners Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FiCheck className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Verified Partners</p>
              <p className="text-2xl font-bold">
                {
                  (deliveryPartners?.list || []).filter((partner) => partner.is_verified)
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Pending Verification Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <FiX className="text-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold">
                {
                  (deliveryPartners?.list || []).filter(
                    (partner) => !partner.is_verified
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>
        <div className="w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3">
            <FiFilter className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent py-2 focus:outline-none"
            >
              <option value="all">All Partners</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {deliveryPartners?.loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      ) : deliveryPartners?.error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500 flex items-center">
          <FiAlertTriangle className="mr-2" size={20} />
          <span>{deliveryPartners.error}</span>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPartners.length > 0 ? (
                  paginatedPartners.map((partner) => (
                    <tr key={partner.partner_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {partner.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {partner.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {partner.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {partner.is_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending Verification
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!partner.is_verified && (
                          <button
                            onClick={() => openVerifyModal(partner)}
                            className="text-brand-primary hover:text-brand-primary-dark mr-3"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => openDetailsModal(partner)}
                        >
                          <FiEye className="inline mr-1" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No delivery partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              showItemCount={true}
            />
          )}

          {/* Verification Modal */}
          {showModal && selectedPartner && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div
                className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200 scale-100"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <FiCheck className="text-green-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Verify Delivery Partner
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Are you sure you want to verify
                        <span className="font-semibold">
                          {selectedPartner.name}
                        </span>
                        as a delivery partner?
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: "var(--border-color)",
                        color: "var(--text-secondary)",
                        backgroundColor: "transparent",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmVerify}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Verify Partner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Partner Details Modal */}
          {showDetailsModal && partnerDetails && (
            <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
              <div
                className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-90vh overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderRadius: "var(--rounded-lg)",
                  maxHeight: "90vh",
                }}
              >
                {/* Header */}
                <div
                  className="px-6 py-4 border-b flex justify-between items-center"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <div>
                    <h2
                      className="text-xl font-semibold flex items-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FiUser className="mr-2" />
                      Delivery Partner Details
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Complete information for {partnerDetails.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                    style={{ borderRadius: "var(--rounded-md)" }}
                  >
                    <FiX size={20} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>

                {/* Content */}
                <div
                  className="p-6 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 140px)" }}
                >
                  {/* Status Badge */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3">
                      <span
                        className="text-lg font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Status:
                      </span>
                      {partnerDetails.is_verified ? (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center">
                          <FiCheck className="mr-1" size={16} />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center">
                          <FiClock className="mr-1" size={16} />
                          Pending Verification
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Basic Information Section */}
                  <div className="mb-6">
                    <h3
                      className="text-lg font-medium mb-4 flex items-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FiUser className="mr-2" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span
                          className="text-sm font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Full Name:
                        </span>
                        <p
                          className="text-base font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {partnerDetails.name}
                        </p>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Partner ID:
                        </span>
                        <p
                          className="text-base font-mono"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {partnerDetails.partner_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="mb-6">
                    <h3
                      className="text-lg font-medium mb-4 flex items-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FiPhone className="mr-2" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span
                          className="text-sm font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <FiMail className="inline mr-1" />
                          Email Address:
                        </span>
                        <p
                          className="text-base"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {partnerDetails.email}
                        </p>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <FiPhone className="inline mr-1" />
                          Phone Number:
                        </span>
                        <p
                          className="text-base"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {partnerDetails.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information Section */}
                  {(partnerDetails.address ||
                    partnerDetails.city ||
                    partnerDetails.state ||
                    partnerDetails.pincode) && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-medium mb-4 flex items-center"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FiMapPin className="mr-2" />
                        Address Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {partnerDetails.address && (
                          <div className="md:col-span-2">
                            <span
                              className="text-sm font-medium block mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Address:
                            </span>
                            <p
                              className="text-base"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {partnerDetails.address}
                            </p>
                          </div>
                        )}
                        {partnerDetails.city && (
                          <div>
                            <span
                              className="text-sm font-medium block mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              City:
                            </span>
                            <p
                              className="text-base"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {partnerDetails.city}
                            </p>
                          </div>
                        )}
                        {partnerDetails.state && (
                          <div>
                            <span
                              className="text-sm font-medium block mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              State:
                            </span>
                            <p
                              className="text-base"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {partnerDetails.state}
                            </p>
                          </div>
                        )}
                        {partnerDetails.pincode && (
                          <div>
                            <span
                              className="text-sm font-medium block mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Pincode:
                            </span>
                            <p
                              className="text-base"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {partnerDetails.pincode}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Information Section */}
                  {(partnerDetails.vehicle_type ||
                    partnerDetails.vehicle_number ||
                    partnerDetails.license_number) && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-medium mb-4 flex items-center"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FiTruck className="mr-2" />
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {partnerDetails.vehicle_type && (
                          <div>
                            <span
                              className="text-sm font-medium block mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Vehicle Type:
                            </span>
                            <p
                              className="text-base"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {partnerDetails.vehicle_type}
                            </p>
                          </div>
                        )}
                        {partnerDetails.vehicle_number && (
                          <div>
                            <span
                              className="text-sm font-medium block mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Vehicle Number:
                            </span>
                            <p
                              className="text-base font-mono"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {partnerDetails.vehicle_number}
                            </p>
                          </div>
                        )}
                        {partnerDetails.license_number && (
                          <div>
                            <span
                              className="text-sm font-medium block mb-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              License Number:
                            </span>
                            <p
                              className="text-base font-mono"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {partnerDetails.license_number}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps Section */}
                  <div className="mb-4">
                    <h3
                      className="text-lg font-medium mb-4 flex items-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FiCalendar className="mr-2" />
                      Registration Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span
                          className="text-sm font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Registration Date:
                        </span>
                        <p
                          className="text-base"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {new Date(
                            partnerDetails.created_at
                          ).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <span
                          className="text-sm font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Registration Time:
                        </span>
                        <p
                          className="text-base"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {new Date(
                            partnerDetails.created_at
                          ).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {partnerDetails.updated_at &&
                        partnerDetails.updated_at !==
                          partnerDetails.created_at && (
                          <>
                            <div>
                              <span
                                className="text-sm font-medium block mb-1"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                Last Updated:
                              </span>
                              <p
                                className="text-base"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {new Date(
                                  partnerDetails.updated_at
                                ).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <div>
                              <span
                                className="text-sm font-medium block mb-1"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                Update Time:
                              </span>
                              <p
                                className="text-base"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {new Date(
                                  partnerDetails.updated_at
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="px-6 py-4 border-t flex justify-end space-x-3"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  {!partnerDetails.is_verified && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        openVerifyModal(partnerDetails);
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-md"
                      style={{
                        backgroundColor: "var(--success-color)",
                        color: "white",
                        borderRadius: "var(--rounded-md)",
                      }}
                    >
                      <FiCheck className="inline mr-1" size={16} />
                      Verify Partner
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      borderRadius: "var(--rounded-md)",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDeliveryPartners;
