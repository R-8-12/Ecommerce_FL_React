import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiEdit, FiSave, FiKey, FiLogOut, FiAlertCircle } from 'react-icons/fi';
import { useAdminAuthStore } from '../../store/Admin/useAdminAuth';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  // Get admin data and necessary functions from the store
  const { admin, adminLogout, updateAdminProfile, isLoading } = useAdminAuthStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });
  const [updateError, setUpdateError] = useState(null);
  
  useEffect(() => {
    if (admin) {
      // Reset any previous errors
      setUpdateError(null);
      
      // Create a properly structured address object
      const addressData = admin.address || {};
      
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        position: admin.position || 'Administrator',
        address: {
          street: addressData.street || '',
          city: addressData.city || '',
          state: addressData.state || '',
          zipCode: addressData.zipCode || '',
          country: addressData.country || 'India'
        }
      });
    }
  }, [admin]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdateError(null);
      console.log('Updating admin profile with data:', formData);
      await updateAdminProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      setUpdateError(errorMessage);
      toast.error(errorMessage);
      console.error('Profile update error:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Redirecting anyway...');
      // Force redirect even if logout fails
      setTimeout(() => navigate('/admin/login'), 1000);
    }
  };
  
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiAlertCircle className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p className="mb-4">Please log in to access your profile.</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="max-w-4xl mx-auto rounded-xl shadow-md overflow-hidden" style={{ 
        backgroundColor: "var(--bg-primary)",
        boxShadow: "var(--shadow-medium)",
        borderRadius: "var(--rounded-xl)"
      }}>
        <div className="md:flex">
          <div className="md:flex-shrink-0 text-white p-8 md:w-64" style={{
            background: "linear-gradient(to bottom, var(--brand-primary), var(--brand-secondary))"
          }}>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white">
                {admin.photoURL ? (
                  <img 
                    src={admin.photoURL} 
                    alt={admin.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="text-5xl" style={{ color: "var(--brand-primary)" }} />
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold">{admin.name}</h2>
              <p className="opacity-75 text-sm">{admin.position || 'Administrator'}</p>
              
              <div className="mt-8">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mb-2"
                  style={{ 
                    borderRadius: "var(--rounded-lg)",
                    ':hover': { backgroundColor: "var(--brand-secondary)" } 
                  }}
                >
                  <span className="w-6">📊</span> Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mb-2"
                  style={{ 
                    borderRadius: "var(--rounded-lg)",
                    ':hover': { backgroundColor: "var(--brand-secondary)" } 
                  }}
                >
                  <span className="w-6">📦</span> Orders
                </button>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mb-2"
                  style={{ 
                    borderRadius: "var(--rounded-lg)",
                    ':hover': { backgroundColor: "var(--brand-secondary)" } 
                  }}
                >
                  <span className="w-6">🛍️</span> Products
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mt-8"
                  style={{ 
                    borderRadius: "var(--rounded-lg)",
                    ':hover': { backgroundColor: "var(--error)" } 
                  }}
                >
                  <FiLogOut className="w-6" /> Logout
                </button>
              </div>
            </div>
          </div>
          <div className="p-8 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Admin Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isEditing 
                    ? "var(--bg-secondary)" 
                    : "var(--brand-primary)",
                  color: isEditing 
                    ? "var(--text-primary)" 
                    : "var(--text-on-brand)",
                  borderRadius: "var(--rounded-lg)"
                }}
              >
                {isEditing ? (
                  <>
                    <FiEdit /> Cancel Edit
                  </>
                ) : (
                  <>
                    <FiEdit /> Edit Profile
                  </>
                )}
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--rounded-lg)" 
                }}>
                  <div className="flex items-center mb-2" style={{ color: "var(--text-secondary)" }}>
                    <FiUser className="mr-2" />
                    <span className="font-medium">Full Name</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                      style={{
                        borderColor: "var(--border)",
                        borderRadius: "var(--rounded-lg)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-lg" style={{ color: "var(--text-primary)" }}>{formData.name}</p>
                  )}
                </div>
                
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--rounded-lg)" 
                }}>
                  <div className="flex items-center mb-2" style={{ color: "var(--text-secondary)" }}>
                    <FiMail className="mr-2" />
                    <span className="font-medium">Email Address</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                      style={{
                        borderColor: "var(--border)",
                        borderRadius: "var(--rounded-lg)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        cursor: "not-allowed" // Show not-allowed cursor
                      }}
                      placeholder="Enter your email"
                      readOnly={true} // Use readOnly instead of disabled to maintain visual consistency
                    />
                  ) : (
                    <p className="text-lg" style={{ color: "var(--text-primary)" }}>{formData.email}</p>
                  )}
                </div>
                
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--rounded-lg)" 
                }}>
                  <div className="flex items-center mb-2" style={{ color: "var(--text-secondary)" }}>
                    <FiPhone className="mr-2" />
                    <span className="font-medium">Phone Number</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                      style={{
                        borderColor: "var(--border)",
                        borderRadius: "var(--rounded-lg)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-lg" style={{ color: "var(--text-primary)" }}>{formData.phone || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--rounded-lg)" 
                }}>
                  <div className="flex items-center mb-2" style={{ color: "var(--text-secondary)" }}>
                    <FiKey className="mr-2" />
                    <span className="font-medium">Position</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                      style={{
                        borderColor: "var(--border)",
                        borderRadius: "var(--rounded-lg)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter your position"
                    />
                  ) : (
                    <p className="text-lg" style={{ color: "var(--text-primary)" }}>{formData.position || 'Administrator'}</p>
                  )}
                </div>
                
                <div className="p-4 rounded-lg" style={{ 
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--rounded-lg)" 
                }}>
                  <div className="flex items-center mb-3" style={{ color: "var(--text-secondary)" }}>
                    <FiUser className="mr-2" />
                    <span className="font-medium">Address Information</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={formData.address?.street || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              street: e.target.value
                            }
                          })}
                          className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                          style={{
                            borderColor: "var(--border)",
                            borderRadius: "var(--rounded-lg)",
                            backgroundColor: "var(--bg-primary)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="Enter your street address"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.address?.city || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                city: e.target.value
                              }
                            })}
                            className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                            style={{
                              borderColor: "var(--border)",
                              borderRadius: "var(--rounded-lg)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="Enter city"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.address?.state || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                state: e.target.value
                              }
                            })}
                            className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                            style={{
                              borderColor: "var(--border)",
                              borderRadius: "var(--rounded-lg)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="Enter state"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                            Postal/ZIP Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.address?.zipCode || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                zipCode: e.target.value
                              }
                            })}
                            className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                            style={{
                              borderColor: "var(--border)",
                              borderRadius: "var(--rounded-lg)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="Enter ZIP/postal code"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.address?.country || 'India'}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                country: e.target.value
                              }
                            })}
                            className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                            style={{
                              borderColor: "var(--border)",
                              borderRadius: "var(--rounded-lg)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="Enter country"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg" style={{ color: "var(--text-primary)" }}>
                      {formData.address?.street ? (
                        <>
                          <p>{formData.address.street}</p>
                          <p>{formData.address.city}, {formData.address.state} {formData.address.zipCode}</p>
                          <p>{formData.address.country}</p>
                        </>
                      ) : (
                        <p className="text-gray-500">No address information provided</p>
                      )}
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="flex flex-col">
                    {updateError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        <FiAlertCircle className="inline-block mr-2" />
                        {updateError}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: "var(--brand-primary)",
                          color: "var(--text-on-brand)",
                          borderRadius: "var(--rounded-lg)"
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : <><FiSave /> Save Changes</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
