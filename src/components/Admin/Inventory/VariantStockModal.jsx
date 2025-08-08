import React, { useState, useEffect } from "react";
import { FiX, FiSave, FiEdit2, FiCheck } from "react-icons/fi";
import useAdminProducts from "../../../store/Admin/useAdminProducts";
import { toast } from "react-hot-toast";

const VariantStockModal = ({ isOpen, onClose, product }) => {
  const [variants, setVariants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { updateVariantStock } = useAdminProducts();

  useEffect(() => {
    if (product && product.valid_options) {
      setVariants([...product.valid_options]);
      setHasChanges(false);
    }
  }, [product]);

  const handleStockEdit = (variantId, newStock) => {
    const updatedVariants = variants.map((variant) =>
      variant.id === variantId
        ? { ...variant, stock: parseInt(newStock, 10) || 0 }
        : variant
    );
    setVariants(updatedVariants);
    setHasChanges(true);
  };

  const startEditing = (variantId, currentStock) => {
    setEditingId(variantId);
    setEditValue(currentStock.toString());
  };
  const saveEdit = (variantId) => {
    const newStock = parseInt(editValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock value (0 or greater)");
      return;
    }

    handleStockEdit(variantId, newStock);
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };
  const saveChanges = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      // Create array of variant updates with only changed stock values
      const variantUpdates = variants.map((variant) => ({
        variant_id: variant.id,
        new_stock: variant.stock || 0,
      }));

      const result = await updateVariantStock(product.id, variantUpdates);
      if (result.success) {
        setHasChanges(false);
        toast.success(
          `Variant stock updated successfully! ${
            result.updatedVariants || variantUpdates.length
          } variants updated.`
        );
        onClose();
      } else {
        console.error("Failed to update variant stocks:", result.message);
        toast.error(result.message || "Failed to update variant stock");
      }
    } catch (error) {
      console.error("Error updating variant stocks:", error);
      toast.error("Error updating variant stocks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalStock = () => {
    return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  const _getVariantDisplayName = (variant) => {
    const attributes = [];

    // Common variant attributes to display
    const commonKeys = ["storage", "color", "ram", "size", "capacity"];

    commonKeys.forEach((key) => {
      if (variant[key]) {
        attributes.push(`${key}: ${variant[key]}`);
      }
    });

    // Add any other custom attributes
    Object.keys(variant).forEach((key) => {
      if (
        !["id", "price", "discounted_price", "stock"].includes(key) &&
        !commonKeys.includes(key) &&
        variant[key] &&
        typeof variant[key] === "string"
      ) {
        attributes.push(`${key}: ${variant[key]}`);
      }
    });

    return attributes.length > 0 ? attributes.join(", ") : "Default Variant";
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-90vh overflow-hidden"
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
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Manage Variant Stock
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {product.name} - Total Stock: {getTotalStock()}
            </p>
          </div>
          <button
            onClick={onClose}
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
          {variants.length === 0 ? (
            <div
              className="text-center py-8"
              style={{ color: "var(--text-secondary)" }}
            >
              <p>This product has no variants configured.</p>
              <p className="text-sm mt-2">
                Current stock: {product.stock || 0}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-primary)",
                  }}
                >
                  {/* Variant Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className="text-lg font-medium mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Variant #{index + 1}
                      </h3>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ID: {variant.id}
                      </span>
                    </div>

                    {/* Stock Edit Section */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span
                          className="text-xs font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Stock Level:
                        </span>
                        {editingId === variant.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 text-center p-2 border rounded-md text-sm"
                              style={{
                                borderColor: "var(--border-primary)",
                                borderRadius: "var(--rounded-md)",
                              }}
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  saveEdit(variant.id);
                                } else if (e.key === "Escape") {
                                  cancelEdit();
                                }
                              }}
                            />
                            <button
                              onClick={() => saveEdit(variant.id)}
                              className="p-2 rounded-md"
                              style={{
                                backgroundColor: "var(--success-color)",
                                color: "white",
                              }}
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded-md"
                              style={{
                                backgroundColor: "var(--error-color)",
                                color: "white",
                              }}
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span
                              className="text-lg font-bold px-3 py-1 rounded"
                              style={{
                                color:
                                  variant.stock === 0
                                    ? "var(--error-color)"
                                    : variant.stock <= 5
                                    ? "var(--warning-color)"
                                    : "var(--success-color)",
                                backgroundColor:
                                  variant.stock === 0
                                    ? "rgba(239, 68, 68, 0.1)"
                                    : variant.stock <= 5
                                    ? "rgba(245, 158, 11, 0.1)"
                                    : "rgba(16, 185, 129, 0.1)",
                              }}
                            >
                              {variant.stock || 0} units
                            </span>
                            <button
                              onClick={() =>
                                startEditing(variant.id, variant.stock || 0)
                              }
                              className="p-2 rounded-md hover:bg-gray-100"
                              title="Edit stock level"
                              style={{
                                backgroundColor: "var(--brand-primary)",
                                color: "var(--text-on-brand)",
                              }}
                            >
                              <FiEdit2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variant Attributes Grid - Similar to ViewProductModal */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                    {variant.colors && (
                      <div>
                        <span
                          className="text-xs font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Color:
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {variant.colors}
                        </p>
                      </div>
                    )}
                    {variant.storage && (
                      <div>
                        <span
                          className="text-xs font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Storage:
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {variant.storage}
                        </p>
                      </div>
                    )}
                    {variant.ram && (
                      <div>
                        <span
                          className="text-xs font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          RAM:
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {variant.ram}
                        </p>
                      </div>
                    )}
                    {variant.size && (
                      <div>
                        <span
                          className="text-xs font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Size:
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {variant.size}
                        </p>
                      </div>
                    )}
                    {variant.resolution && (
                      <div>
                        <span
                          className="text-xs font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Resolution:
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {variant.resolution}
                        </p>
                      </div>
                    )}
                    {variant.capacity && (
                      <div>
                        <span
                          className="text-xs font-medium block mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Capacity:
                        </span>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {variant.capacity}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Custom key-value pairs */}
                  {variant.custom_keys &&
                    variant.custom_values &&
                    variant.custom_keys.length > 0 && (
                      <div
                        className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 pt-3 border-t"
                        style={{ borderColor: "var(--border-primary)" }}
                      >
                        {variant.custom_keys.map(
                          (key, keyIndex) =>
                            key && (
                              <div key={keyIndex}>
                                <span
                                  className="text-xs font-medium block mb-1"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {key}:
                                </span>
                                <p
                                  className="text-sm font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {variant.custom_values[keyIndex]}
                                </p>
                              </div>
                            )
                        )}
                      </div>
                    )}

                  {/* Pricing Information */}
                  <div
                    className="grid grid-cols-2 gap-4 pt-3 border-t"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <div>
                      <span
                        className="text-xs font-medium block mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Original Price:
                      </span>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ₹{variant.price?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <span
                        className="text-xs font-medium block mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Discounted Price:
                      </span>
                      <p className="text-lg font-bold text-green-600">
                        ₹
                        {variant.discounted_price?.toLocaleString() ||
                          variant.price?.toLocaleString() ||
                          0}
                      </p>
                      {variant.discounted_price &&
                        variant.discounted_price !== variant.price && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
                            style={{
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                              color: "var(--success-color)",
                            }}
                          >
                            {Math.round(
                              ((variant.price - variant.discounted_price) /
                                variant.price) *
                                100
                            )}
                            % OFF
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {variants.length > 0 && (
          <div
            className="px-6 py-4 border-t flex justify-end space-x-3"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                borderRadius: "var(--rounded-md)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={!hasChanges || isLoading}
              className="px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 flex items-center space-x-2"
              style={{
                backgroundColor: hasChanges
                  ? "var(--brand-primary)"
                  : "var(--bg-secondary)",
                color: hasChanges
                  ? "var(--text-on-brand)"
                  : "var(--text-secondary)",
                borderRadius: "var(--rounded-md)",
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantStockModal;
