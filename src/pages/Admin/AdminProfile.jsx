import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiEdit, FiSave, FiKey, FiLogOut, FiAlertCircle } from 'react-icons/fi';
import { useAdminAuthStore } from '../../store/Admin/useAdminAuth';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  // Get admin data and necessary functions from the store
  const { admin, logout, updateAdminProfile, isLoading } = useAdminAuthStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: ''
  });
  
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        position: admin.position || 'Administrator'
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
      console.log('Updating admin profile with data:', formData);
      await updateAdminProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
                        opacity: 0.7
                      }}
                      placeholder="Enter your email"
                      disabled={true} // Email can't be changed
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
                
                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: "var(--brand-primary)",
                        color: "var(--text-on-brand)",
                        borderRadius: "var(--rounded-lg)"
                      }}
                    >
                      <FiSave /> Save Changes
                    </button>
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
