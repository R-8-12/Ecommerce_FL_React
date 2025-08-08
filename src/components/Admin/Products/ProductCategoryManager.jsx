import React, { useState } from "react";
import { FiX, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useConfirmModal } from "../../../hooks/useConfirmModal";
import ConfirmModal from "../../ui/ConfirmModal";
import { toast } from "../../../utils/toast";

const ProductCategoryManager = ({ onClose }) => {
  const {
    isOpen: confirmModalIsOpen,
    modalConfig,
    isLoading: confirmLoading,
    showConfirm,
    hideConfirm,
    handleConfirm,
  } = useConfirmModal();

  // Mock categories data
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Smartphones",
      slug: "smartphones",
      description: "Mobile phones and smartphones",
      productCount: 28,
    },
    {
      id: 2,
      name: "Laptops",
      slug: "laptops",
      description: "Laptops and notebooks",
      productCount: 15,
    },
    {
      id: 3,
      name: "Tablets",
      slug: "tablets",
      description: "Tablets and iPads",
      productCount: 9,
    },
    {
      id: 4,
      name: "Accessories",
      slug: "accessories",
      description: "Mobile and laptop accessories",
      productCount: 42,
    },
    {
      id: 5,
      name: "Audio",
      slug: "audio",
      description: "Headphones, earbuds, and speakers",
      productCount: 23,
    },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [newCategory, setNewCategory] = useState({
    id: null,
    name: "",
    slug: "",
    description: "",
  });

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewCategory({
      ...newCategory,
      name,
      slug: generateSlug(name),
    });
  };

  const handleDescriptionChange = (e) => {
    setNewCategory({
      ...newCategory,
      description: e.target.value,
    });
  };

  const addCategory = () => {
    // Basic validation
    if (!newCategory.name.trim()) return;

    if (editMode) {
      // Update existing category
      setCategories(
        categories.map((cat) =>
          cat.id === newCategory.id
            ? { ...newCategory, productCount: cat.productCount }
            : cat
        )
      );
    } else {
      // Add new category
      const newId = Math.max(...categories.map((c) => c.id)) + 1;
      setCategories([
        ...categories,
        { ...newCategory, id: newId, productCount: 0 },
      ]);
    }

    // Reset form
    setNewCategory({
      id: null,
      name: "",
      slug: "",
      description: "",
    });
    setEditMode(false);
  };

  const startEdit = (category) => {
    setNewCategory(category);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setNewCategory({
      id: null,
      name: "",
      slug: "",
      description: "",
    });
    setEditMode(false);
  };
  const deleteCategory = (id) => {
    const category = categories.find((cat) => cat.id === id);
    showConfirm({
      title: "Delete Category",
      message: `Are you sure you want to delete "${category?.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          setCategories(categories.filter((cat) => cat.id !== id));
          toast.success("Category deleted successfully");
        } catch (error) {
          console.error("Error deleting category:", error);
          toast.error("Failed to delete category");
        }
      },
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--rounded-lg)",
        }}
      >
        <div
          className="flex justify-between items-center p-6 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Category Management
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Add/Edit Category Form */}
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "var(--rounded-lg)",
            }}
          >
            <h3
              className="text-sm font-medium mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              {editMode ? "Edit Category" : "Add New Category"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="category-name"
                  className="block text-xs font-medium mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Category Name
                </label>
                <input
                  type="text"
                  id="category-name"
                  value={newCategory.name}
                  onChange={handleNameChange}
                  className="w-full p-2 border rounded-md"
                  style={{
                    borderColor: "var(--border-primary)",
                    borderRadius: "var(--rounded-md)",
                  }}
                  placeholder="e.g. Smartphones"
                />
              </div>

              <div>
                <label
                  htmlFor="category-slug"
                  className="block text-xs font-medium mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  id="category-slug"
                  value={newCategory.slug}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-50"
                  style={{
                    borderColor: "var(--border-primary)",
                    borderRadius: "var(--rounded-md)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                  placeholder="e.g. smartphones"
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="category-description"
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Description
              </label>
              <textarea
                id="category-description"
                value={newCategory.description}
                onChange={handleDescriptionChange}
                className="w-full p-2 border rounded-md"
                style={{
                  borderColor: "var(--border-primary)",
                  borderRadius: "var(--rounded-md)",
                }}
                placeholder="Brief description of the category"
                rows="2"
              />
            </div>

            <div className="flex justify-end space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1.5 border rounded-md text-xs font-medium"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                    borderRadius: "var(--rounded-md)",
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-1.5 rounded-md flex items-center text-xs font-medium"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--text-on-brand)",
                  borderRadius: "var(--rounded-md)",
                }}
              >
                <FiPlus size={14} className="mr-1" />
                {editMode ? "Update Category" : "Add Category"}
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div
            className="border rounded-lg overflow-hidden"
            style={{
              borderColor: "var(--border-primary)",
              borderRadius: "var(--rounded-lg)",
            }}
          >
            <table
              className="min-w-full divide-y"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Products
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--border-primary)" }}
              >
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {category.name}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {category.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {category.productCount} products
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                          style={{ color: "var(--brand-primary)" }}
                          title="Edit Category"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                          style={{ color: "var(--error-color)" }}
                          title="Delete Category"
                          disabled={category.productCount > 0}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="p-6 border-t flex justify-end"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm font-medium"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
              borderRadius: "var(--rounded-md)",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalIsOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        isLoading={confirmLoading}
      />
    </div>
  );
};

export default ProductCategoryManager;
