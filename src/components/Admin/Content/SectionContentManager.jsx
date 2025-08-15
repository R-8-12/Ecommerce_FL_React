import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiEdit, FiTrash2, FiImage, FiExternalLink } from 'react-icons/fi';
import Button from '../../ui/Button';
import ImageCropper from '../../ui/ImageCropper';
import ConfirmModal from '../../ui/ConfirmModal';
import toast from 'react-hot-toast';
import { adminApi } from '../../../services/api';
import useFrontendCacheStore from '../../../store/useFrontendCacheStore';

const SectionContentManager = ({ 
  section, 
  isOpen, 
  onClose,
  onSave 
}) => {
  // Cache store for invalidating cache after updates (select only the method we need)
  const forceRefresh = useFrontendCacheStore(state => state.forceRefresh);
  
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [elementToDelete, setElementToDelete] = useState(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  
  // Form state for adding/editing elements
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link: '',
    tag: '',
    cta: '',
    backgroundColor: '#ffffff',
    active: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchSectionElements = async () => {
    if (!section?.section_id && !section?.id) return;
    
    setLoading(true);
    try {
      const sectionId = section.section_id || section.id;
      const response = await adminApi.get(`/admin/homepage/sections/${sectionId}/content/`);
      
      if (response.status === 200) {
        const content = response.data.content || {};
        
        // Convert backend content structure to frontend format
        let items = [];
        
        // If content has items array (legacy), use it
        if (content.items && Array.isArray(content.items)) {
          items = content.items;
        } else {
          // If content is an object with content IDs as keys, convert to array
          items = Object.values(content).filter(item => item && typeof item === 'object');
        }
        
        setElements(items);
      }
    } catch (error) {
      console.error('Error fetching section elements:', error);
      // Initialize with empty elements for demo
      if (section.section_type === 'section_banners') {
        setElements(section.config?.banners || []);
      } else {
        setElements([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch section elements when modal opens
  useEffect(() => {
    if (isOpen && section) {
      fetchSectionElements();
    }
  }, [isOpen, section]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      link: '',
      tag: '',
      cta: '',
      backgroundColor: '#ffffff',
      active: true
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddElement = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!imageFile && !formData.image_url) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      const sectionId = section.section_id || section.id;
      
      // Upload image if provided
      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadImageToBackend(imageFile);
      }
      
      // Create new element
      const newElement = {
        id: Date.now().toString(),
        ...formData,
        image_url: uploadedImageUrl || imagePreview || formData.image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Get current content
      const response = await adminApi.get(`/admin/homepage/sections/${sectionId}/content/`);
      const currentContent = response.data.content || {};
      
      // Convert items array to content object structure if needed
      let contentToUpdate = { ...currentContent };
      
      // If content has an items array, convert it to individual content entries
      if (currentContent.items && Array.isArray(currentContent.items)) {
        contentToUpdate = {};
        currentContent.items.forEach((item, index) => {
          contentToUpdate[item.id || `item_${index}`] = item;
        });
      }
      
      // Add new element with its ID as key
      contentToUpdate[newElement.id] = newElement;

      // Update section content
      const updateResponse = await adminApi.put(
        `/admin/homepage/sections/${sectionId}/content/`, 
        { content: contentToUpdate }
      );

      if (updateResponse.status === 200) {
        await fetchSectionElements(); // Refresh the list
        
        // Invalidate frontend cache to ensure homepage updates
        console.log('🔄 Invalidating frontend cache after content update...');
        forceRefresh();
        
        setShowAddForm(false);
        resetForm();
        toast.success('Element added successfully');
      }
    } catch (error) {
      console.error('Error adding element:', error);
      // Fallback: add to local state
      const newElement = {
        id: Date.now(),
        ...formData,
        image_url: imagePreview || formData.image_url
      };
      setElements(prev => [...prev, newElement]);
      setShowAddForm(false);
      resetForm();
      toast.success('Element added (demo mode)');
    } finally {
      setLoading(false);
    }
  };

  const handleEditElement = (element) => {
    setEditingElement(element);
    setFormData({
      title: element.title || '',
      subtitle: element.subtitle || '',
      description: element.description || '',
      image_url: element.image_url || '',
      link: element.link || '',
      tag: element.tag || '',
      cta: element.cta || '',
      backgroundColor: element.backgroundColor || '#ffffff',
      active: element.active !== undefined ? element.active : true
    });
    setImagePreview(element.image_url);
    setShowAddForm(true);
  };

  const handleSaveEdit = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const sectionId = section.section_id || section.id;
      
      // Upload image if provided
      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadImageToBackend(imageFile);
      }
      
      // Get current content
      const response = await adminApi.get(`/admin/homepage/sections/${sectionId}/content/`);
      const currentContent = response.data.content || {};
      
      // Convert items array to content object structure if needed
      let contentToUpdate = { ...currentContent };
      
      // If content has an items array, convert it to individual content entries
      if (currentContent.items && Array.isArray(currentContent.items)) {
        contentToUpdate = {};
        currentContent.items.forEach((item, index) => {
          contentToUpdate[item.id || `item_${index}`] = item;
        });
      }

      // Update the specific element
      if (contentToUpdate[editingElement.id]) {
        contentToUpdate[editingElement.id] = { 
          ...contentToUpdate[editingElement.id], 
          ...formData, 
          image_url: uploadedImageUrl || imagePreview || formData.image_url,
          updated_at: new Date().toISOString()
        };
      }

      // Update section content
      const updateResponse = await adminApi.put(
        `/admin/homepage/sections/${sectionId}/content/`, 
        { content: contentToUpdate }
      );

      if (updateResponse.status === 200) {
        await fetchSectionElements(); // Refresh the list
        
        // Invalidate frontend cache to ensure homepage updates
        console.log('🔄 Invalidating frontend cache after content update...');
        forceRefresh();
        
        setShowAddForm(false);
        setEditingElement(null);
        resetForm();
        toast.success('Element updated successfully');
      }
    } catch (error) {
      console.error('Error updating element:', error);
      // Fallback: update local state
      setElements(prev => prev.map(el => 
        el.id === editingElement.id 
          ? { ...el, ...formData, image_url: imagePreview || formData.image_url }
          : el
      ));
      setShowAddForm(false);
      setEditingElement(null);
      resetForm();
      toast.success('Element updated (demo mode)');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElement = async () => {
    if (!elementToDelete) return;

    setLoading(true);
    try {
      const sectionId = section.section_id || section.id;
      
      // Get current content
      const response = await adminApi.get(`/admin/homepage/sections/${sectionId}/content/`);
      const currentContent = response.data.content || {};
      
      // Convert items array to content object structure if needed
      let contentToUpdate = { ...currentContent };
      
      // If content has an items array, convert it to individual content entries
      if (currentContent.items && Array.isArray(currentContent.items)) {
        contentToUpdate = {};
        currentContent.items.forEach((item, index) => {
          contentToUpdate[item.id || `item_${index}`] = item;
        });
      }

      // Remove the specific element
      delete contentToUpdate[elementToDelete.id];

      // Update section content
      const updateResponse = await adminApi.put(
        `/admin/homepage/sections/${sectionId}/content/`, 
        { content: contentToUpdate }
      );

      if (updateResponse.status === 200) {
        await fetchSectionElements(); // Refresh the list
        
        // Invalidate frontend cache to ensure homepage updates
        console.log('🔄 Invalidating frontend cache after content deletion...');
        forceRefresh();
        
        toast.success('Element deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting element:', error);
      // Fallback: remove from local state
      setElements(prev => prev.filter(el => el.id !== elementToDelete.id));
      toast.success('Element deleted (demo mode)');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setElementToDelete(null);
    }
  };

  const handleImageSelect = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleCroppedImageSelect = (croppedImageData) => {
    setImageFile(croppedImageData.file);
    setImagePreview(croppedImageData.dataUrl);
    setShowImageCropper(false);
  };

  const uploadImageToBackend = async (imageFile) => {
    if (!imageFile) return null;

    try {
      const sectionId = section.section_id || section.id;
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await adminApi.post(
        `/admin/homepage/sections/${sectionId}/upload-media/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.files && response.data.files.length > 0) {
        return response.data.files[0].url;
      }
      
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const getElementType = () => {
    switch (section.section_type) {
      case 'section_banners':
        return 'banner';
      case 'brands':
        return 'brand';
      case 'phones_and_gadgets':
      case 'electronic_gadgets':
        return 'product_highlight';
      default:
        return 'content_item';
    }
  };

  const getElementLabel = () => {
    switch (section.section_type) {
      case 'section_banners':
        return 'Banner';
      case 'brands':
        return 'Brand';
      case 'phones_and_gadgets':
      case 'electronic_gadgets':
        return 'Product Highlight';
      default:
        return 'Content Item';
    }
  };

  const getFormFields = () => {
    const elementType = getElementType();
    
    switch (elementType) {
      case 'banner':
        return ['title', 'subtitle', 'description', 'image', 'link', 'tag', 'cta', 'backgroundColor'];
      case 'brand':
        return ['title', 'description', 'image', 'link'];
      case 'product_highlight':
        return ['title', 'subtitle', 'description', 'image', 'link', 'tag'];
      default:
        return ['title', 'description', 'image', 'link'];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {section.title} - Content Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage {getElementLabel().toLowerCase()}s for this {section.section_type} section
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {getElementLabel()}s ({elements.length})
              </h3>
              <p className="text-sm text-gray-500">
                Click on any {getElementLabel().toLowerCase()} to edit its details
              </p>
            </div>
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showAddForm) {
                  setEditingElement(null);
                  resetForm();
                }
              }}
              variant="primary"
            >
              <FiPlus className="mr-2" />
              Add {getElementLabel()}
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-4">
                {editingElement ? 'Edit' : 'Add'} {getElementLabel()}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFormFields().includes('title') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter title..."
                    />
                  </div>
                )}

                {getFormFields().includes('subtitle') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Enter subtitle..."
                    />
                  </div>
                )}

                {getFormFields().includes('link') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link URL
                    </label>
                    <input
                      type="url"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {getFormFields().includes('tag') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.tag}
                      onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                      placeholder="e.g., NEW, SALE, FEATURED"
                    />
                  </div>
                )}

                {getFormFields().includes('cta') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Call to Action
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.cta}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                      placeholder="e.g., Shop Now, Learn More"
                    />
                  </div>
                )}

                {getFormFields().includes('backgroundColor') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      className="w-full p-1 border border-gray-300 rounded-md h-10"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    />
                  </div>
                )}

                {getFormFields().includes('description') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Enter description..."
                    />
                  </div>
                )}

                {getFormFields().includes('image') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    
                    <div className="space-y-3">
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowImageCropper(true)}
                        >
                          <FiImage className="mr-2" />
                          {imagePreview ? 'Change Image' : 'Select Image'}
                        </Button>
                        
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleImageSelect(file);
                            }
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>

                      {imagePreview && (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-48 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingElement(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={editingElement ? handleSaveEdit : handleAddElement}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingElement ? 'Update' : 'Add')} {getElementLabel()}
                </Button>
              </div>
            </div>
          )}

          {/* Elements List */}
          {loading && !showAddForm ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Loading {getElementLabel().toLowerCase()}s...</p>
            </div>
          ) : elements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiImage size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No {getElementLabel().toLowerCase()}s found. Add your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {element.image_url && (
                    <img
                      src={element.image_url}
                      alt={element.title}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {element.title}
                    </h4>
                    
                    {element.subtitle && (
                      <p className="text-sm text-gray-600 truncate">
                        {element.subtitle}
                      </p>
                    )}
                    
                    {element.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {element.description}
                      </p>
                    )}
                    
                    {element.tag && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {element.tag}
                      </span>
                    )}
                    
                    {element.link && (
                      <div className="flex items-center space-x-1">
                        <FiExternalLink size={12} className="text-gray-400" />
                        <a
                          href={element.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline truncate"
                        >
                          {element.link.length > 30 ? `${element.link.substring(0, 30)}...` : element.link}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        element.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {element.active ? 'Active' : 'Inactive'}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditElement(element)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setElementToDelete(element);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Changes will be visible on the homepage after saving
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (onSave) {
                  onSave(elements);
                }
                onClose();
              }}
            >
              Save & Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteElement}
        title={`Delete ${getElementLabel()}`}
        message={`Are you sure you want to delete "${elementToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={loading}
      />

      {/* Image Cropper Modal */}
      {showImageCropper && (
        <ImageCropper
          onImageSelect={handleCroppedImageSelect}
          onCancel={() => setShowImageCropper(false)}
          targetDimensions={{ width: 400, height: 250 }}
          showDimensionGuide={true}
        />
      )}
    </div>
  );
};

export default SectionContentManager;
