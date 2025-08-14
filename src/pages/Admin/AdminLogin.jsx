import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormWrapper from "../../components/ui/FormWrapper";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAdminAuthStore } from "../../store/Admin/useAdminAuth"; // Updated to use admin-specific auth store

const AdminLogin = () => {
  const navigate = useNavigate();
  // Using admin-specific auth logic
  const { adminLogin, error, clearError, isLoading } = useAdminAuthStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

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
      // Using admin-specific login logic
      await adminLogin(formData);
      navigate("/admin/dashboard"); // Redirect to admin dashboard
    } catch (err) {
      // Error is handled by the store or displayed
      console.error("Admin login failed:", err);
    }
  };

  return (
    <FormWrapper title="Admin Portal Login">
      <div className="mt-4 text-center text-sm text-gray-500">
        Sign in to manage the application.
      </div>

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
            placeholder="Enter username"
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
            placeholder="Enter password"
            icon="lock"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
            <div className="font-medium mb-1">Login Failed</div>
            <div>{error}</div>
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
