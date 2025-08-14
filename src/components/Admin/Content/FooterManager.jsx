import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSave,
  FiX,
  FiToggleLeft,
  FiToggleRight,
  FiExternalLink,
  FiLink,
  FiGlobe,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
  FiRefreshCw,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { useFooterStore } from "../../../store/Admin/useFooterStore";
import useFrontendCacheStore from "../../../store/useFrontendCacheStore";
import Button from "../../ui/Button";

const FooterManager = () => {
  const [editMode, setEditMode] = useState({});
  const [newLinkForm, setNewLinkForm] = useState({
    section: "",
    name: "",
    path: "",
    url: "",
    enabled: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [footerData, setFooterData] = useState({});

  const {
    footerConfig,
    loading,
    error,
    fetchFooterConfig,
    updateFooterConfig,
    addFooterLink,
    deleteFooterLink,
    toggleFooterSection,
    clearError,
  } = useFooterStore();

  const { updateFooter } = useFrontendCacheStore();

  // Icon mapping for social media
  const iconMapping = {
    FaFacebookF: <FiFacebook />,
    FaTwitter: <FiTwitter />,
    FaInstagram: <FiInstagram />,
    FaYoutube: <FiYoutube />,
    FaLinkedinIn: <FiLinkedin />,
    FaWhatsapp: <FaWhatsapp />,
  };

  // Section titles mapping
  const sectionTitles = {
    quick_links: "Quick Links",
    customer_service_links: "Customer Service",
    policy_links: "Policies",
    know_more_links: "Know More",
    footer_policy_links: "Footer Policies",
    social_links: "Social Media",
  };
  useEffect(() => {
    fetchFooterConfig()
      .then((config) => {
        if (config) {
          setFooterData(config);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch footer configuration");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize footerData when footerConfig changes
  useEffect(() => {
    if (footerConfig) {
      setFooterData(footerConfig);
    }
  }, [footerConfig]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);
  const handleSectionToggle = async (section) => {
    const currentEnabled = footerConfig?.[section]?.enabled || false;
    try {
      await toggleFooterSection(section, !currentEnabled);
      toast.success("Section updated successfully");
    } catch {
      toast.error("Failed to update section");
    }
  };

  const handleLinkToggle = async (section, linkIndex) => {
    const updatedConfig = { ...footerConfig };
    updatedConfig[section][linkIndex].enabled =
      !updatedConfig[section][linkIndex].enabled;

    try {
      await updateFooterConfig(updatedConfig);
      // Update frontend cache immediately
      updateFooter(updatedConfig);
      toast.success("Link updated successfully");
    } catch {
      toast.error("Failed to update link");
    }
  };

  const handleEditLink = (section, linkIndex) => {
    setEditMode({ section, linkIndex });
  };
  const handleSaveLink = async (section, linkIndex, updatedLink) => {
    const updatedConfig = { ...footerConfig };
    updatedConfig[section][linkIndex] = updatedLink;

    try {
      await updateFooterConfig(updatedConfig);
      // Update frontend cache immediately
      updateFooter(updatedConfig);
      setEditMode({});
      toast.success("Link updated successfully");
    } catch {
      toast.error("Failed to update link");
    }
  };

  const handleDeleteLink = async (section, linkIndex) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        await deleteFooterLink(section, linkIndex);
        toast.success("Link deleted successfully");
      } catch {
        toast.error("Failed to delete link");
      }
    }
  };
  const handleAddLink = async () => {
    if (!newLinkForm.section || !newLinkForm.name) {
      toast.error("Section and name are required");
      return;
    }

    try {
      await addFooterLink(newLinkForm.section, {
        name: newLinkForm.name,
        path: newLinkForm.path,
        url: newLinkForm.url,
        enabled: newLinkForm.enabled,
      });

      setNewLinkForm({
        section: "",
        name: "",
        path: "",
        url: "",
        enabled: true,
      });
      setShowAddForm(false);
      toast.success("Link added successfully");
    } catch {
      toast.error("Failed to add link");
    }
  };
  const handleCompanyInfoUpdate = (field, value) => {
    setFooterData({
      ...footerData,
      company_info: {
        ...footerData.company_info,
        [field]: value,
      },
    });
  };

  const handleSaveCompanyInfo = async () => {
    try {
      const updatedConfig = {
        ...footerConfig,
        company_info: footerData.company_info,
      };
      await updateFooterConfig(updatedConfig);
      toast.success("Company information updated successfully");
    } catch {
      toast.error("Failed to update company info");
    }
  };
  const handleContactInfoUpdate = (field, value) => {
    setFooterData({
      ...footerData,
      contact_info: {
        ...footerData.contact_info,
        [field]: value,
      },
    });
  };

  const handleSaveContactInfo = async () => {
    try {
      const updatedConfig = {
        ...footerConfig,
        contact_info: footerData.contact_info,
      };
      await updateFooterConfig(updatedConfig);
      toast.success("Contact information updated successfully");
    } catch {
      toast.error("Failed to update contact info");
    }
  };
  const handleWhatsAppUpdate = (field, value) => {
    setFooterData({
      ...footerData,
      whatsapp: {
        ...footerData.whatsapp,
        [field]: value,
      },
    });
  };

  const handleSaveWhatsAppInfo = async () => {
    try {
      const updatedConfig = {
        ...footerConfig,
        whatsapp: footerData.whatsapp,
      };
      await updateFooterConfig(updatedConfig);
      toast.success("WhatsApp settings updated successfully");
    } catch {
      toast.error("Failed to update WhatsApp settings");
    }
  };
  const handleCopyrightUpdate = (field, value) => {
    setFooterData({
      ...footerData,
      copyright: {
        ...footerData.copyright,
        [field]: value,
      },
    });
  };

  const handleSaveCopyrightInfo = async () => {
    try {
      const updatedConfig = {
        ...footerConfig,
        copyright: footerData.copyright,
      };
      await updateFooterConfig(updatedConfig);
      toast.success("Copyright settings updated successfully");
    } catch {
      toast.error("Failed to update copyright settings");
    }
  };

  const renderLinkEditor = (section, linkIndex, link) => {
    const isEditing =
      editMode.section === section && editMode.linkIndex === linkIndex;

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center space-x-3">
            {section === "social_links" && iconMapping[link.icon] && (
              <span className="text-lg">{iconMapping[link.icon]}</span>
            )}
            <div>
              <span className="font-medium">{link.name}</span>
              <p className="text-xs text-gray-500">
                {link.path || link.url || "No URL"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLinkToggle(section, linkIndex)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 theme-hover-fix"
              style={{
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s ease'
              }}
            >
              {link.enabled ? (
                <FiToggleRight className="text-green-500" size={20} />
              ) : (
                <FiToggleLeft className="text-gray-400" size={20} />
              )}
            </button>
            <button
              onClick={() => handleEditLink(section, linkIndex)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 theme-hover-fix text-blue-600"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => handleDeleteLink(section, linkIndex)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 theme-hover-fix text-red-600"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <EditLinkForm
        link={link}
        section={section}
        linkIndex={linkIndex}
        onSave={handleSaveLink}
        onCancel={() => setEditMode({})}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => {
            clearError();
            fetchFooterConfig();
          }}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {" "}
        <h2 className="text-lg font-semibold text-gray-800">
          Footer Management
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchFooterConfig()}
            className="flex items-center gap-1"
          >
            <FiRefreshCw size={16} /> Refresh
          </Button>
          <Button variant="primary" onClick={() => setShowAddForm(true)}>
            Add Link
          </Button>
        </div>
      </div>
      {/* Company Information */}{" "}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Company Information</h3>
          <button
            onClick={() => handleSectionToggle("company_info")}
            className="flex items-center space-x-2"
          >
            {footerConfig?.company_info?.enabled ? (
              <FiToggleRight className="text-green-500" size={24} />
            ) : (
              <FiToggleLeft className="text-gray-400" size={24} />
            )}
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>{" "}
            <textarea
              value={footerData?.company_info?.description || ""}
              onChange={(e) =>
                handleCompanyInfoUpdate("description", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Company description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>{" "}
            <input
              type="url"
              value={footerData?.company_info?.logo_url || ""}
              onChange={(e) =>
                handleCompanyInfoUpdate("logo_url", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/logo.png"
            />
          </div>{" "}
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSaveCompanyInfo}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      {/* Contact Information */}{" "}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Contact Information</h3>
          <button
            onClick={() => handleSectionToggle("contact_info")}
            className="flex items-center space-x-2"
          >
            {footerConfig?.contact_info?.enabled ? (
              <FiToggleRight className="text-green-500" size={24} />
            ) : (
              <FiToggleLeft className="text-gray-400" size={24} />
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>{" "}
            <input
              type="tel"
              value={footerData?.contact_info?.phone || ""}
              onChange={(e) => handleContactInfoUpdate("phone", e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="1800-123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>{" "}
            <input
              type="email"
              value={footerData?.contact_info?.email || ""}
              onChange={(e) => handleContactInfoUpdate("email", e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="info@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>{" "}
            <textarea
              value={footerData?.contact_info?.address || ""}
              onChange={(e) =>
                handleContactInfoUpdate("address", e.target.value)
              }
              className="w-full p-3 border rounded-md"
              rows="2"
              placeholder="Business address..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Hours
            </label>{" "}
            <input
              type="text"
              value={footerData?.contact_info?.hours || ""}
              onChange={(e) => handleContactInfoUpdate("hours", e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="Mon-Sat: 10:00 AM - 8:00 PM"
            />
          </div>{" "}
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSaveContactInfo}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      {/* WhatsApp Settings */}{" "}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">WhatsApp Settings</h3>
          <button
            onClick={() => handleSectionToggle("whatsapp")}
            className="flex items-center space-x-2"
          >
            {footerConfig?.whatsapp?.enabled ? (
              <FiToggleRight className="text-green-500" size={24} />
            ) : (
              <FiToggleLeft className="text-gray-400" size={24} />
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>{" "}
            <input
              type="tel"
              value={footerData?.whatsapp?.number || ""}
              onChange={(e) => handleWhatsAppUpdate("number", e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Channel URL
            </label>{" "}
            <input
              type="url"
              value={footerData?.whatsapp?.channel_url || ""}
              onChange={(e) =>
                handleWhatsAppUpdate("channel_url", e.target.value)
              }
              className="w-full p-3 border rounded-md"
              placeholder="https://whatsapp.com/channel/..."
            />
          </div>{" "}
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSaveWhatsAppInfo}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      {/* Copyright Settings */}{" "}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Copyright Settings</h3>
          <button
            onClick={() => handleSectionToggle("copyright")}
            className="flex items-center space-x-2"
          >
            {footerConfig?.copyright?.enabled ? (
              <FiToggleRight className="text-green-500" size={24} />
            ) : (
              <FiToggleLeft className="text-gray-400" size={24} />
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright Text
            </label>{" "}
            <input
              type="text"
              value={footerData?.copyright?.text || ""}
              onChange={(e) => handleCopyrightUpdate("text", e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="Copyright © Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Developer Name
            </label>{" "}
            <input
              type="text"
              value={footerData?.copyright?.developer_name || ""}
              onChange={(e) =>
                handleCopyrightUpdate("developer_name", e.target.value)
              }
              className="w-full p-3 border rounded-md"
              placeholder="Developer Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Developer URL
            </label>{" "}
            <input
              type="url"
              value={footerData?.copyright?.developer_url || ""}
              onChange={(e) =>
                handleCopyrightUpdate("developer_url", e.target.value)
              }
              className="w-full p-3 border rounded-md"
              placeholder="https://developer-website.com"
            />
          </div>{" "}
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSaveCopyrightInfo}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      {/* Link Sections */}
      {Object.entries(sectionTitles).map(([sectionKey, title]) => {
        // Safely get links with better error handling
        const rawLinks = footerConfig?.[sectionKey];
        let links = [];
        
        if (Array.isArray(rawLinks)) {
          links = rawLinks;
        } else if (rawLinks && typeof rawLinks === 'object') {
          // If it's an object with links property
          links = Array.isArray(rawLinks.links) ? rawLinks.links : [];
        }
        
        return (
          <div
            key={sectionKey}
            className="bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{title}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {links.length} links
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={`${sectionKey}-${index}`}>
                  {renderLinkEditor(sectionKey, index, link)}
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No links in this section. Add some links to get started.
                </p>
              )}
            </div>
          </div>
        );
      })}
      {/* Add Link Modal */}
      {showAddForm && (
        <AddLinkModal
          newLinkForm={newLinkForm}
          setNewLinkForm={setNewLinkForm}
          onSubmit={handleAddLink}
          onClose={() => setShowAddForm(false)}
          sectionTitles={sectionTitles}
        />
      )}
    </div>
  );
};

// Edit Link Form Component
const EditLinkForm = ({ link, section, linkIndex, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: link.name || "",
    path: link.path || "",
    url: link.url || "",
    icon: link.icon || "",
    enabled: link.enabled !== undefined ? link.enabled : true,
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(section, linkIndex, formData);
    } catch (error) {
      console.error("Error saving link:", error);
      toast.error("Failed to save link");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        {section === "social_links" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <select
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Icon</option>
              <option value="FaFacebookF">Facebook</option>
              <option value="FaTwitter">Twitter</option>
              <option value="FaInstagram">Instagram</option>
              <option value="FaYoutube">YouTube</option>
              <option value="FaLinkedinIn">LinkedIn</option>
              <option value="FaWhatsapp">WhatsApp</option>
            </select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Internal Path
          </label>
          <input
            type="text"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            className="w-full p-2 border rounded-md"
            placeholder="/page-path"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            External URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full p-2 border rounded-md"
            placeholder="https://example.com"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={(e) =>
              setFormData({ ...formData, enabled: e.target.checked })
            }
          />
          <span className="text-sm">Enabled</span>
        </label>{" "}
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <FiX size={16} />
          </Button>
          <Button type="submit" variant="primary">
            <FiSave size={16} />
          </Button>
        </div>
      </div>
    </form>
  );
};

// Add Link Modal Component
const AddLinkModal = ({
  newLinkForm,
  setNewLinkForm,
  onSubmit,
  onClose,
  sectionTitles,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Add New Link</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 theme-hover-fix"
          >
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={newLinkForm.section}
              onChange={(e) =>
                setNewLinkForm({ ...newLinkForm, section: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Section</option>
              {Object.entries(sectionTitles).map(([key, title]) => (
                <option key={key} value={key}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newLinkForm.name}
              onChange={(e) =>
                setNewLinkForm({ ...newLinkForm, name: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Path
            </label>
            <input
              type="text"
              value={newLinkForm.path}
              onChange={(e) =>
                setNewLinkForm({ ...newLinkForm, path: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              placeholder="/page-path"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              External URL
            </label>
            <input
              type="url"
              value={newLinkForm.url}
              onChange={(e) =>
                setNewLinkForm({ ...newLinkForm, url: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              placeholder="https://example.com"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newLinkForm.enabled}
              onChange={(e) =>
                setNewLinkForm({ ...newLinkForm, enabled: e.target.checked })
              }
            />
            <label className="text-sm">Enabled</label>
          </div>{" "}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FooterManager;
