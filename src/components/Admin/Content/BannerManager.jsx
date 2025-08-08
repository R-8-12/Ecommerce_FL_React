import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import ImageCropper from "../../ui/ImageCropper";
import  {useBannerStore}  from "../../../store/Admin/useBannerStore";
import ConfirmModal from "../../ui/ConfirmModal";
import toast from "react-hot-toast";
import { navigationCategories } from "../../../constants/bannerOptions";

const BannerManager = ({ positionOptions }) => {
  const {
    banners,
    loading,
    error,
    fetchBanners,
    addBanner,
    editBanner,
    deleteBanner,
    toggleBannerActive,
  } = useBannerStore();
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    link: "",
    position: "hero",
    category: "", // For dropdown banners
    tag: "",
    cta: "",
    backgroundColor: "#ffffff",
    active: true,
  });
  const [newBannerImageFile, setNewBannerImageFile] = useState(null);
  const [newBannerImagePreview, setNewBannerImagePreview] = useState(null);
  const [editBannerImageFile, setEditBannerImageFile] = useState(null);
  const [editBannerImagePreview, setEditBannerImagePreview] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [cropperMode, setCropperMode] = useState('new'); // 'new' or 'edit'
  useEffect(() => {
    fetchBanners();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // File handling functions
  // const handleNewBannerImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setNewBannerImageFile(file);
  //     const reader = new FileReader();
  //     reader.onload = (e) => setNewBannerImagePreview(e.target.result);
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleEditBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditBannerImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setEditBannerImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetNewBannerForm = () => {
    setNewBanner({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      link: "",
      position: "hero",
      category: "", // For dropdown banners
      tag: "",
      cta: "",
      backgroundColor: "#ffffff",
      active: true,
    });
    setNewBannerImageFile(null);
    setNewBannerImagePreview(null);
  };

  const resetEditBannerForm = () => {
    setEditingBanner(null);
    setEditBannerImageFile(null);
    setEditBannerImagePreview(null);
  };
  const handleToggleActive = async (id) => {
    await toggleBannerActive(id);
  };
  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setEditBannerImagePreview(banner.image); // Show current image
    setShowAddForm(false);
  };

  const handleSaveEdit = async () => {
    const formData = new FormData();

    // Add all banner fields to FormData
    Object.keys(editingBanner).forEach((key) => {
      if (
        key !== "id" &&
        editingBanner[key] !== null &&
        editingBanner[key] !== undefined
      ) {
        formData.append(key, editingBanner[key]);
      }
    });

    // Add image file if new one is selected
    if (editBannerImageFile) {
      formData.append("image_file", editBannerImageFile);
    }

    await editBanner(editingBanner.id, formData);
    resetEditBannerForm();
  };

  const handleAddBanner = async () => {
    if (!newBannerImageFile) {
      toast.info("Please select an image file");
      return;
    }

    const formData = new FormData();

    // Add all banner fields to FormData
    Object.keys(newBanner).forEach((key) => {
      if (
        key !== "image" &&
        newBanner[key] !== null &&
        newBanner[key] !== undefined
      ) {
        formData.append(key, newBanner[key]);
      }
    });

    // Add image file
    formData.append("image_file", newBannerImageFile);

    await addBanner(formData);
    resetNewBannerForm();
    setShowAddForm(false);
  };
  const handleDeleteBanner = (banner) => {
    setBannerToDelete(banner);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteBanner(bannerToDelete.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting banner:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Image cropper functions
  const openImageCropper = (mode) => {
    setCropperMode(mode);
    setShowImageCropper(true);
  };

  const handleCroppedImageSelect = (croppedImageData) => {
    if (cropperMode === 'new') {
      setNewBannerImageFile(croppedImageData.file);
      setNewBannerImagePreview(croppedImageData.dataUrl);
    } else {
      setEditBannerImageFile(croppedImageData.file);
      setEditBannerImagePreview(croppedImageData.dataUrl);
    }
    setShowImageCropper(false);
  };

  // Helper functions for banner dimensions and cropping guidance
  const getTargetDimensions = (position) => {
    switch (position) {
      case 'hero':
        return { width: 1200, height: 400, description: 'Hero banners (wide format)' };
      case 'dropdown':
        return { width: 300, height: 200, description: 'Navigation dropdown banners (vertical format)' };
      case 'sidebar':
        return { width: 350, height: 500, description: 'Sidebar promotional banners' };
      case 'footer':
        return { width: 600, height: 200, description: 'Footer promotional banners' };
      default:
        return { width: 800, height: 400, description: 'General promotional banners' };
    }
  };

  const getCropPresets = (position) => {
    const dimensions = getTargetDimensions(position);
    return {
      aspectRatio: dimensions.width / dimensions.height,
      recommendedSize: `${dimensions.width}x${dimensions.height}px`,
      description: dimensions.description
    };
  };

  // Get aspect ratio based on banner position
  const getAspectRatio = (position) => {
    switch (position) {
      case 'hero':
        return 3; // Wide 3:1 ratio for hero banners
      case 'dropdown':
        return 1.5; // 3:2 ratio for dropdown banners (more vertical)
      case 'sidebar':
        return 0.7; // Tall 7:10 ratio for sidebar
      case 'footer':
        return 3; // Wide for footer
      default:
        return 2; // Default 2:1 ratio
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading banners...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Manage Banners</h2>
        <Button
          variant="primary"
          onClick={() => {
            if (showAddForm) {
              resetNewBannerForm();
              setShowAddForm(false);
            } else {
              setShowAddForm(true);
              resetEditBannerForm();
            }
          }}
        >
          {showAddForm ? "Cancel" : "Add New Banner"}
        </Button>
      </div>
      {showAddForm && (
        <div 
          className="p-4 rounded-lg border space-y-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)"
          }}
        >
          <h3 className="font-medium">Add New Banner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newBanner.title}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newBanner.subtitle}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, subtitle: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image
              </label>
              
              {/* Dimension guidance */}
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-blue-700">
                    Recommended dimensions: {getCropPresets(newBanner.position).recommendedSize}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {getCropPresets(newBanner.position).description} • 
                  Aspect ratio: {getCropPresets(newBanner.position).aspectRatio.toFixed(2)}:1
                </p>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => openImageCropper('new')}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors text-center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {newBannerImagePreview ? 'Change Image (with cropping)' : 'Upload & Crop Image'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Click to upload and automatically crop to {getCropPresets(newBanner.position).recommendedSize}
                    </span>
                  </div>
                </button>
                {newBannerImagePreview && (
                  <div className="relative">
                    <img
                      src={newBannerImagePreview}
                      alt="Banner Preview"
                      className={`w-full object-cover rounded border ${
                        newBanner.position === 'dropdown' ? 'h-32' : 'h-24'
                      }`}
                      style={{
                        aspectRatio: getAspectRatio(newBanner.position)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewBannerImageFile(null);
                        setNewBannerImagePreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newBanner.link}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, link: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newBanner.position}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, position: e.target.value })
                }
              >
                {positionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category field - only show for dropdown position */}
            {newBanner.position === "dropdown" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newBanner.category}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {navigationCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newBanner.tag}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, tag: e.target.value })
                }
                placeholder="e.g., SALE, NEW, LIMITED"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call to Action
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newBanner.cta}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, cta: e.target.value })
                }
                placeholder="e.g., Shop Now, Learn More"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                className="w-full p-1 border border-gray-300 rounded-md h-10"
                value={newBanner.backgroundColor}
                onChange={(e) =>
                  setNewBanner({
                    ...newBanner,
                    backgroundColor: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newBanner.description}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, description: e.target.value })
                }
                rows={3}
              ></textarea>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newBanner.active}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, active: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleAddBanner}>
              Add Banner
            </Button>
          </div>
        </div>
      )}
      {editingBanner && (
        <div 
          className="p-4 rounded-lg border space-y-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)"
          }}
        >
          <h3 className="font-medium">Edit Banner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingBanner.title || ""}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingBanner.subtitle || ""}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Upload
              </label>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => openImageCropper('edit')}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors text-center"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {editBannerImagePreview ? 'Change Image (with cropping)' : 'Upload & Crop Image'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Click to upload and automatically crop to {getCropPresets(editingBanner.position).recommendedSize}
                    </span>
                  </div>
                </button>
                {editBannerImagePreview && (
                  <div className="mt-2">
                    <img
                      src={editBannerImagePreview}
                      alt="Current/Preview"
                      className="h-24 w-48 object-cover rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editBannerImageFile
                        ? "New image preview"
                        : "Current image"}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Fallback file input */}
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  onChange={handleEditBannerImageChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alternative: Upload directly without cropping
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingBanner.link || ""}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, link: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingBanner.position || "hero"}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    position: e.target.value,
                  })
                }
              >
                {positionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category field - only show for dropdown position */}
            {editingBanner.position === "dropdown" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editingBanner.category || ""}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {navigationCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingBanner.tag || ""}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, tag: e.target.value })
                }
                placeholder="e.g., SALE, NEW, LIMITED"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call to Action
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingBanner.cta || ""}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, cta: e.target.value })
                }
                placeholder="e.g., Shop Now, Learn More"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                className="w-full p-1 border border-gray-300 rounded-md h-10"
                value={editingBanner.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    backgroundColor: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingBanner.description || ""}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    description: e.target.value,
                  })
                }
                rows={3}
              ></textarea>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingBanner.active}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      active: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={resetEditBannerForm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full min-w-full">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-3 px-4 text-left w-24">Banner</th>
              <th className="py-3 px-4 text-left min-w-0 w-2/5">Details</th>
              <th className="py-3 px-4 text-left w-24">Position</th>
              <th className="py-3 px-4 text-left w-20">Category</th>
              <th className="py-3 px-4 text-center w-20">Status</th>
              <th className="py-3 px-4 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 w-24">
                  <div className="flex-shrink-0">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="h-16 w-20 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = '/public/logo.jpg'; // Fallback image
                        e.target.alt = 'Image not found';
                      }}
                    />
                  </div>
                </td>
                <td className="py-3 px-4 min-w-0 max-w-0 w-2/5">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm truncate" title={banner.title}>
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-xs text-gray-600 truncate" title={banner.subtitle}>
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.description && (
                      <p className="text-xs text-gray-500 truncate" title={banner.description}>
                        {banner.description}
                      </p>
                    )}
                    {banner.link && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">Link:</span>
                        <a
                          href={banner.link}
                          className="text-xs text-blue-500 hover:underline truncate max-w-32"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={banner.link}
                        >
                          {banner.link.length > 25 ? `${banner.link.substring(0, 25)}...` : banner.link}
                        </a>
                      </div>
                    )}
                    {banner.tag && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded truncate max-w-24">
                        {banner.tag.length > 12 ? `${banner.tag.substring(0, 12)}...` : banner.tag}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 w-24">
                  <span className="text-sm whitespace-nowrap">
                    {positionOptions.find((p) => p.value === banner.position)
                      ?.label || banner.position}
                  </span>
                </td>
                <td className="py-3 px-4 w-20">
                  {banner.position === "dropdown" ? (
                    <span className="text-xs text-gray-600 truncate" title={banner.category}>
                      {banner.category || "No category"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center w-20">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${
                      banner.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right w-32">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditBanner(banner)}
                      title="Edit banner"
                      className="text-xs px-2 py-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant={banner.active ? "danger" : "primary"}
                      size="sm"
                      onClick={() => handleToggleActive(banner.id)}
                      title={banner.active ? "Deactivate banner" : "Activate banner"}
                      className="text-xs px-2 py-1"
                    >
                      {banner.active ? "Off" : "On"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteBanner(banner)}
                      title="Delete banner"
                      className="text-xs px-2 py-1"
                    >
                      Del
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {banners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No banners found. Add your first banner!</p>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Banner"
        message={
          bannerToDelete
            ? `Are you sure you want to delete the banner "${bannerToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this banner?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteLoading}
      />
      {/* Image Cropper Modal */}
      {showImageCropper && (
        <ImageCropper
          onImageSelect={handleCroppedImageSelect}
          onCancel={() => setShowImageCropper(false)}
          targetDimensions={getTargetDimensions(cropperMode === 'new' ? newBanner.position : editingBanner.position)}
          cropPresets={getCropPresets(cropperMode === 'new' ? newBanner.position : editingBanner.position)}
          showDimensionGuide={true}
        />
      )}
    </div>
  );
};

export default BannerManager;
