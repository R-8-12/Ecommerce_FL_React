import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useAdminSellPhoneStore from '../../../store/Admin/useAdminSellPhone';
import ModelFormModal from './ModelFormModal';

const ModelList = ({ brandId, seriesId, models }) => {
  const { deleteModel, fetchSellPhoneCatalog } = useAdminSellPhoneStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  const handleAddModel = () => {
    setEditingModel(null);
    setIsModalOpen(true);
  };

  const handleEditModel = (model) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  const handleDeleteModel = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await deleteModel(brandId, seriesId, modelId);
        await fetchSellPhoneCatalog(); // Refetch catalog to update UI
      } catch (error) {
        // Error is typically handled by a toast notification in the store
        console.error("Failed to delete model:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
  };

  if (!models || models.length === 0) {
    return (
      <div>
        <p className="text-gray-600 mb-4">No models found for this series. Start by adding a new model.</p>        <button 
          onClick={handleAddModel} 
          className="px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 hover:opacity-90 flex items-center space-x-2"
          style={{
            backgroundColor: "var(--success-color)",
            color: "var(--text-on-brand)",
            borderRadius: "var(--rounded-md)",
            boxShadow: "var(--shadow-small)"
          }}
        >
          <span>Add New Model</span>
        </button>
        {isModalOpen && (
          <ModelFormModal 
            open={isModalOpen} 
            onClose={handleCloseModal} 
            brandId={brandId} 
            seriesId={seriesId} 
            modelToEdit={editingModel} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-4">
      <div className="flex justify-end mb-4">        <button 
          onClick={handleAddModel} 
          className="px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 hover:opacity-90 flex items-center space-x-2"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--text-on-brand)",
            borderRadius: "var(--rounded-md)",
            boxShadow: "var(--shadow-small)"
          }}
        >
          <span>Add New Model</span>
        </button>
      </div>
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            {/* Assuming 'id' is a direct property, adjust if it's nested e.g., model.id */}
            <th className="py-3 px-4 text-left">ID</th> 
            <th className="py-3 px-4 text-left">Name</th>
            {/* <th className="py-3 px-4 text-left">Launch Year</th> Commenting out as it's not in the new structure */}
            <th className="py-3 px-4 text-left">Image</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {models.map((model) => (
            <tr key={model.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{model.id}</td>
              {/* Assuming 'name' is a direct property, adjust if it's nested e.g., model.name */}
              <td className="py-3 px-4">{model.name}</td> 
              {/* <td className="py-3 px-4">{model.launch_year}</td> Commenting out */}
              <td className="py-3 px-4">
                {model.image && <img src={model.image} alt={model.name} className="h-10 w-10 object-cover" />}
              </td>              <td className="py-3 px-4">
                <button 
                  onClick={() => handleEditModel(model)} 
                  className="mr-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: "var(--warning-color)",
                    color: "var(--text-on-brand)",
                    borderRadius: "var(--rounded-md)"
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteModel(model.id)} 
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: "var(--error-color)",
                    color: "var(--text-on-brand)",
                    borderRadius: "var(--rounded-md)"
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <ModelFormModal 
          open={isModalOpen} 
          onClose={handleCloseModal} 
          brandId={brandId} 
          seriesId={seriesId} 
          modelToEdit={editingModel} 
        />
      )}
    </div>
  );
};

ModelList.propTypes = {
  brandId: PropTypes.string.isRequired, // Added brandId
  seriesId: PropTypes.string.isRequired,
  models: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired, // Changed from display_name
    image: PropTypes.string,
    // launch_year: PropTypes.string, // Commented out
    variantOptions: PropTypes.array, // Add more specific shape if needed
    questionGroups: PropTypes.array, // Add more specific shape if needed
  })).isRequired,
};

export default ModelList;
