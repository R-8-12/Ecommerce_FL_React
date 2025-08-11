import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormWrapper from "../../components/ui/FormWrapper";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAdminAuthStore } from "../../store/Admin/useAdminAuth"; // Updated to use admin-specific auth store
import { clearAdminAuth, checkAdminAuthStatus, devClearAuthAndReload } from "../../utils/clearAdminAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  // Using admin-specific auth logic
  const { adminLogin, devModeLogin, testServerConnection, error, clearError, isLoading } = useAdminAuthStore();
  const [formData, setFormData] = useState({
    username: import.meta.env.DEV ? "admin" : "", // Pre-fill in development
    password: import.meta.env.DEV ? "admin123" : "", // Pre-fill in development
  });

  const [formErrors, setFormErrors] = useState({});
  const [showDevMode, setShowDevMode] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      // Try development mode first if enabled
      if (showDevMode && devModeLogin(formData)) {
        navigate("/admin/dashboard");
        return;
      }

      // Using admin-specific login logic
      await adminLogin(formData);
      navigate("/admin/dashboard"); // Redirect to admin dashboard
    } catch (err) {
      // Error is handled by the store or displayed
      console.error("Admin login failed:", err);
    }
  };

  const handleTestConnection = async () => {
    const result = await testServerConnection();
    setServerStatus(result);
  };

  const toggleDevMode = () => {
    setShowDevMode(!showDevMode);
    clearError();
  };

  return (
    <FormWrapper title="Admin Portal Login">
      <div className="mt-4 text-center text-sm text-gray-500">
        Sign in to manage the application.
      </div>
      
      {/* Development Mode Toggle */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800 dark:text-yellow-200">Development Mode</span>
            <button
              type="button"
              onClick={toggleDevMode}
              className="px-3 py-1 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-md hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
            >
              {showDevMode ? 'Disable' : 'Enable'}
            </button>
          </div>
          {showDevMode && (
            <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
              Use credentials: <strong>admin / admin123</strong>
            </div>
          )}
          
          {/* Development auth clearing */}
          <div className="mt-3 pt-2 border-t border-yellow-200 dark:border-yellow-800">
            <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              Troubleshooting: If admin login redirects immediately to dashboard:
            </div>
            <button
              type="button"
              onClick={() => {
                checkAdminAuthStatus();
                devClearAuthAndReload();
              }}
              className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
            >
              Clear Stored Auth & Reload
            </button>
          </div>
        </div>
      )}

      {/* Server Status Test */}
      <div className="mt-4">
        <div className="text-center mb-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Backend Server Test
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Check if production server is accessible (optional)
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Server Connection"}
          </button>
        </div>
      </div>

      {serverStatus && (
        <div className={`mt-3 p-4 rounded-lg text-sm border ${
          serverStatus.success 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="font-medium text-center mb-2">
            {serverStatus.success ? '✅ Backend Server Online' : '🔍 Backend Server Test Results'}
          </div>
          <div className="text-center mb-2">{serverStatus.message}</div>
          {serverStatus.status && (
            <div className="text-center text-xs mb-2">HTTP Status: {serverStatus.status}</div>
          )}
          {serverStatus.troubleshooting && serverStatus.troubleshooting.length > 0 && (
            <div className="mt-3 text-xs">
              <div className="space-y-1">
                {serverStatus.troubleshooting.map((tip, index) => (
                  <div key={index} className={`${tip.startsWith('🎯') || tip.startsWith('🚀') ? 'font-medium' : ''} ${tip === '' ? 'h-1' : ''}`}>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md space-y-5">
          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            error={formErrors.username}
            placeholder="admin"
            icon="user"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            error={formErrors.password}
            placeholder="••••••••"
            icon="lock"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
            <div className="font-medium mb-1">Login Failed</div>
            <div>{error}</div>
            {error.includes('502') && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                <strong>Troubleshooting:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check if the backend server is running</li>
                  <li>Verify the API URL in constants.js</li>
                  <li>Contact your system administrator</li>
                  {import.meta.env.DEV && (
                    <li>Try enabling Development Mode above</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            size="lg"
            fullWidth={true}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
        <div className="text-sm text-center mt-4">
          <Link
            to="/admin/register"
            className="font-medium text-teal-600 hover:text-teal-500 transition-colors duration-200"
          >
            Create an admin account
          </Link>
        </div>
      </form>
    </FormWrapper>
  );
};

export default AdminLogin;
