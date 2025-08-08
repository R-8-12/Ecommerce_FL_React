import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiMove, 
  FiSettings,
  FiRefreshCw,
  FiLayout,
  FiGrid,
  FiImage,
  FiType,
  FiTag,
  FiStar,
  FiPlay,
  FiPenTool,
  FiShoppingBag,
  FiTv,
  FiSmartphone,
  FiDatabase,
  FiFileText
} from 'react-icons/fi';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import useHomepageSectionStore from '../../../store/Admin/useHomepageSectionStore';
import toast from 'react-hot-toast';

// Enhanced section types with icons and descriptions
const ENHANCED_SECTION_TYPES = [
  { 
    type: 'hero_section', 
    label: 'Hero Section', 
    icon: <FiLayout />, 
    description: 'Main banner with CTA',
    category: 'promotional'
  },
  { 
    type: 'banners', 
    label: 'Banner Carousel', 
    icon: <FiImage />, 
    description: 'Slideshow banners',
    category: 'promotional'
  },
  { 
    type: 'flash_deal', 
    label: 'Flash Deal', 
    icon: <FiStar />, 
    description: 'Time-limited offers',
    category: 'deals'
  },
  { 
    type: 'featured_products', 
    label: 'Featured Products', 
    icon: <FiShoppingBag />, 
    description: 'Highlighted products',
    category: 'products'
  },
  { 
    type: 'categories', 
    label: 'Product Categories', 
    icon: <FiGrid />, 
    description: 'Category navigation',
    category: 'navigation'
  },
  { 
    type: 'featured_deal', 
    label: 'Featured Deal', 
    icon: <FiTag />, 
    description: 'Single featured offer',
    category: 'deals'
  },
  { 
    type: 'clearance_sales', 
    label: 'Clearance Sales', 
    icon: <FiDatabase />, 
    description: 'Discounted items',
    category: 'deals'
  },
  { 
    type: 'channel', 
    label: 'Video Channel', 
    icon: <FiTv />, 
    description: 'Video content section',
    category: 'media'
  },
  { 
    type: 'deal_of_the_day', 
    label: 'Deal of the Day', 
    icon: <FiStar />, 
    description: 'Daily special offer',
    category: 'deals'
  },
  { 
    type: 'new_arrivals', 
    label: 'New Arrivals', 
    icon: <FiPlus />, 
    description: 'Latest products',
    category: 'products'
  },
  { 
    type: 'section_banners', 
    label: 'Section Banners', 
    icon: <FiImage />, 
    description: 'Promotional banners',
    category: 'promotional'
  },
  { 
    type: 'brands', 
    label: 'Brand Showcase', 
    icon: <FiType />, 
    description: 'Featured brands',
    category: 'brands'
  },
  { 
    type: 'phones_and_gadgets', 
    label: 'Phones & Gadgets', 
    icon: <FiSmartphone />, 
    description: 'Tech products',
    category: 'products'
  },
  { 
    type: 'electronic_gadgets', 
    label: 'Electronic Gadgets', 
    icon: <FiPlay />, 
    description: 'Electronic items',
    category: 'products'
  },
  { 
    type: 'blog_section', 
    label: 'Blog Section', 
    icon: <FiFileText />, 
    description: 'Latest blog posts',
    category: 'content'
  },
  { 
    type: 'custom_content', 
    label: 'Custom Content', 
    icon: <FiPenTool />, 
    description: 'User-defined content',
    category: 'custom'
  }
];

// Design templates for each section type
const DESIGN_TEMPLATES = {
  hero_section: ['modern', 'classic', 'minimal', 'fullscreen'],
  banners: ['slideshow', 'carousel', 'grid', 'stacked'],
  flash_deal: ['countdown', 'badge', 'card', 'banner'],
  featured_products: ['grid', 'carousel', 'list', 'cards'],
  categories: ['grid', 'circular', 'square', 'tiles'],
  featured_deal: ['banner', 'card', 'popup', 'strip'],
  clearance_sales: ['grid', 'carousel', 'list', 'masonry'],
  channel: ['video', 'playlist', 'grid', 'featured'],
  deal_of_the_day: ['card', 'banner', 'countdown', 'spotlight'],
  new_arrivals: ['carousel', 'grid', 'slider', 'showcase'],
  section_banners: ['horizontal', 'vertical', 'grid', 'mosaic'],
  brands: ['carousel', 'grid', 'slider', 'showcase'],
  phones_and_gadgets: ['grid', 'categories', 'featured', 'comparison'],
  electronic_gadgets: ['categories', 'grid', 'showcase', 'deals'],
  blog_section: ['grid', 'list', 'carousel', 'featured'],
  custom_content: ['freeform', 'structured', 'template', 'builder']
};

// Sortable item component
const SortableItem = ({ section, onEdit, onDelete, onToggle, onViewContent }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section?.section_id || section?.id || 'unknown' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Null check for section
  if (!section) {
    return null;
  }

  const getSectionTypeInfo = (sectionType) => {
    return ENHANCED_SECTION_TYPES.find(type => type.type === sectionType) || 
           { label: sectionType || 'Unknown Section', icon: <FiGrid />, description: 'Homepage section', category: 'other' };
  };

  const sectionInfo = getSectionTypeInfo(section.section_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <FiMove size={18} />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              section.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {sectionInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {section.title || 'Untitled Section'}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sectionInfo.category === 'promotional' ? 'bg-blue-100 text-blue-600' :
                  sectionInfo.category === 'products' ? 'bg-green-100 text-green-600' :
                  sectionInfo.category === 'deals' ? 'bg-red-100 text-red-600' :
                  sectionInfo.category === 'custom' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {sectionInfo.category}
                </span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {section.design_template || 'default'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {sectionInfo.description} • Order: {section.order || section.display_order || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewContent && onViewContent(section)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Manage Content"
          >
            <FiFileText size={16} />
          </button>
          
          <button
            onClick={() => onToggle && onToggle(section.section_id || section.id)}
            className={`p-2 rounded-md transition-colors ${
              section.enabled
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={section.enabled ? 'Disable section' : 'Enable section'}
          >
            {section.enabled ? <FiEye size={16} /> : <FiEyeOff size={16} />}
          </button>

          <button
            onClick={() => onEdit && onEdit(section)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit section"
          >
            <FiEdit size={16} />
          </button>

          <button
            onClick={() => onDelete && onDelete(section.section_id || section.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete section"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {section.config && Object.keys(section.config).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 flex items-center space-x-2">
            <FiSettings size={12} />
            <span>Configuration:</span>
            <span className="text-gray-400">
              {Object.keys(section.config).join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const UserFriendlyHomepageManager = () => {
  // Enhanced state and store setup
  const {
    sections,
    loading,
    error,
    fetchSections,
    addSection,
    updateSection,
    deleteSection,
    toggleSection,
    reorderSections,
    clearError,
    initializeSections: initializeDefaultSections,
  } = useHomepageSectionStore();

  // Component state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, section: null });
  const [filterCategory, setFilterCategory] = useState('all');
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced form state
  const [newSection, setNewSection] = useState({
    section_type: '',
    title: '',
    description: '',
    enabled: true,
    order: 0,
    design_template: 'default',
    config: {},
    category: 'other'
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load sections on mount
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Check initialization status
  useEffect(() => {
    if (sections && sections.length >= 14) {
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [sections]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Enhanced drag end handler with better error handling
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    // Ensure sections is an array and has valid data
    if (!Array.isArray(sections) || sections.length === 0) {
      toast.error('No sections available to reorder');
      return;
    }

    try {
      const oldIndex = sections.findIndex((item) => (item?.section_id || item?.id) === active.id);
      const newIndex = sections.findIndex((item) => (item?.section_id || item?.id) === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error('Invalid section selection for reordering');
        return;
      }

      const newSections = arrayMove(sections, oldIndex, newIndex);
      
      // Update order values with proper validation
      const sectionOrders = newSections
        .filter(section => section && (section.section_id || section.id))
        .map((section, index) => ({
          section_id: section.section_id || section.id,
          order: index + 1
        }));

      if (sectionOrders.length === 0) {
        toast.error('No valid sections to reorder');
        return;
      }

      await reorderSections(sectionOrders);
      toast.success('Sections reordered successfully');
    } catch (error) {
      console.error('Error in drag end:', error);
      toast.error('Failed to reorder sections');
    }
  };

  // Initialize sections (enhanced)
  const initializeSections = async () => {
    try {
      setSaving(true);
      await initializeDefaultSections();
      toast.success('Default sections created successfully');
      await fetchSections();
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing sections:', error);
      toast.error('Failed to initialize sections');
    } finally {
      setSaving(false);
    }
  };

  // Add section with enhanced validation
  const handleAddSection = async () => {
    try {
      if (!newSection.section_type || !newSection.title.trim()) {
        toast.error('Section type and title are required');
        return;
      }

      const sectionData = {
        ...newSection,
        order: sections.length + 1,
        title: newSection.title.trim()
      };

      await addSection(sectionData);
      setShowAddForm(false);
      resetNewSectionForm();
      toast.success('Section added successfully');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  };

  // Reset form
  const resetNewSectionForm = () => {
    setNewSection({
      section_type: '',
      title: '',
      description: '',
      enabled: true,
      order: 0,
      design_template: 'default',
      config: {},
      category: 'other'
    });
  };

  // Handle edit section
  const handleEditSection = async () => {
    try {
      if (!editingSection?.title?.trim()) {
        toast.error('Title is required');
        return;
      }

      const sectionId = editingSection.section_id || editingSection.id;
      if (!sectionId) {
        toast.error('Section ID is missing');
        console.error('EditingSection object:', editingSection);
        return;
      }

      await updateSection(sectionId, { 
        ...editingSection, 
        title: editingSection.title.trim() 
      });
      setEditingSection(null);
      toast.success('Section updated successfully');
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    }
  };

  // Handle content management
  const handleViewContent = (section) => {
    console.log('Content management for section:', section);
    
    // Check if section has specific content management functionality
    const sectionId = section.section_id || section.id;
    if (!sectionId) {
      toast.error('Invalid section ID');
      return;
    }

    // For now, redirect to section-specific content management
    if (section.section_type === 'best_selling') {
      // For best selling, we could manage which products are featured
      toast.success('Opening product management for Best Selling section...');
      // Could redirect to a specific product management page
      window.open('/admin/products?section=best_selling', '_blank');
    } else if (section.section_type === 'featured_products') {
      toast.success('Opening product management for Featured Products...');
      window.open('/admin/products?section=featured', '_blank');
    } else if (section.section_type === 'banner_carousel') {
      toast.success('Opening banner management...');
      window.open('/admin/content/banners', '_blank');
    } else if (section.section_type === 'blog_section') {
      toast.success('Opening blog management...');
      // Will implement blog management
      window.open('/admin/content/blogs', '_blank');
    } else {
      // Generic content management
      toast.info(`Content management for ${section.section_type} - Feature coming soon!`, {
        duration: 3000,
      });
    }
  };

  // Delete section with validation
  const handleDeleteSection = async (sectionId) => {
    try {
      if (!sectionId) {
        toast.error('Invalid section ID');
        return;
      }

      await deleteSection(sectionId);
      setConfirmModal({ show: false, section: null });
      toast.success('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  // Enhanced toggle handler
  const handleToggleSection = async (sectionId) => {
    try {
      if (!sectionId) {
        toast.error('Invalid section ID');
        return;
      }

      await toggleSection(sectionId);
      toast.success('Section status updated');
    } catch (error) {
      console.error('Error toggling section:', error);
      toast.error('Failed to update section status');
    }
  };

  // Filter sections by category with null checking
  const filteredSections = Array.isArray(sections) ? sections.filter(section => {
    if (!section) return false;
    if (filterCategory === 'all') return true;
    const sectionInfo = ENHANCED_SECTION_TYPES.find(type => type.type === section.section_type);
    return sectionInfo?.category === filterCategory;
  }) : [];

  // Get available categories
  const categories = ['all', ...new Set(ENHANCED_SECTION_TYPES.map(type => type.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading sections...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Homepage Section Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and customize your homepage sections
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isInitialized && (
              <Button
                onClick={initializeSections}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <FiRefreshCw className="mr-2" />
                Setup Default Sections
              </Button>
            )}
            
            <Button
              onClick={() => setShowAddForm(true)}
              variant="primary"
            >
              <FiPlus className="mr-2" />
              Add Section
            </Button>
          </div>
        </div>

        {/* Stats and filters */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-500">
              Total Sections: <span className="font-medium text-gray-900">{sections?.length || 0}</span>
            </div>
            <div className="text-sm text-gray-500">
              Active: <span className="font-medium text-green-600">
                {sections?.filter(s => s?.enabled).length || 0}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Inactive: <span className="font-medium text-red-600">
                {sections?.filter(s => s && !s.enabled).length || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-600">Filter by category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sections list */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <FiGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
            <p className="text-gray-500 mb-4">
              {filterCategory === 'all' 
                ? "Get started by setting up your default homepage sections"
                : `No sections found in the ${filterCategory} category`
              }
            </p>
            {!isInitialized ? (
              <Button onClick={initializeSections}>
                <FiRefreshCw className="mr-2" />
                Setup Default Sections
              </Button>
            ) : (
              <Button onClick={() => setShowAddForm(true)}>
                <FiPlus className="mr-2" />
                Add Section
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredSections.map(section => section?.section_id || section?.id || 'unknown')}
              strategy={verticalListSortingStrategy}
            >
              {filteredSections.map((section) => (
                <SortableItem
                  key={section?.section_id || section?.id || Math.random()}
                  section={section}
                  onEdit={setEditingSection}
                  onDelete={(id) => setConfirmModal({ show: true, section: { id } })}
                  onToggle={handleToggleSection}
                  onViewContent={handleViewContent}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add New Section</h2>
              <p className="text-sm text-gray-500 mt-1">
                Create a new homepage section with custom content
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* Section Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Section Type
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {ENHANCED_SECTION_TYPES.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => setNewSection(prev => ({ 
                        ...prev, 
                        section_type: type.type,
                        category: type.category
                      }))}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        newSection.section_type === type.type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-lg">{type.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={newSection.title}
                    onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter section title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Template
                  </label>
                  <select
                    value={newSection.design_template}
                    onChange={(e) => setNewSection(prev => ({ ...prev, design_template: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="default">Default</option>
                    {DESIGN_TEMPLATES[newSection.section_type]?.map(template => (
                      <option key={template} value={template}>
                        {template.charAt(0).toUpperCase() + template.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter section description..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newEnabled"
                  checked={newSection.enabled}
                  onChange={(e) => setNewSection(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="newEnabled" className="text-sm text-gray-700">
                  Enable section immediately
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  resetNewSectionForm();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddSection}
                disabled={!newSection.section_type || !newSection.title.trim()}
              >
                Create Section
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  value={editingSection?.title || ''}
                  onChange={(e) => setEditingSection(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Template
                </label>
                <select
                  value={editingSection?.design_template || 'default'}
                  onChange={(e) => setEditingSection(prev => ({ ...prev, design_template: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="default">Default</option>
                  {DESIGN_TEMPLATES[editingSection?.section_type]?.map(template => (
                    <option key={template} value={template}>
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editingSection?.order?.toString() || '0'}
                  onChange={(e) => setEditingSection(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editEnabled"
                  checked={editingSection?.enabled || false}
                  onChange={(e) => setEditingSection(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="editEnabled" className="text-sm text-gray-700">
                  Enable section
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setEditingSection(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEditSection}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, section: null })}
        onConfirm={() => handleDeleteSection(confirmModal.section?.id)}
        title="Delete Section"
        message="Are you sure you want to delete this section? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default UserFriendlyHomepageManager;
