import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, LogOut } from 'lucide-react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { Modal, Button, Input } from './shared';

const AuthComponent = ({ onAuthStateChange }) => {
  const { currentUser, loading, register, login, logout } = useFirebaseAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pass auth state changes to parent component
  React.useEffect(() => {
    if (onAuthStateChange) {
      onAuthStateChange(currentUser);
    }
  }, [currentUser, onAuthStateChange]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (authMode === 'register') {
      if (!formData.displayName) {
        newErrors.displayName = 'Display name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.displayName);
      }
      setShowAuthModal(false);
      resetForm();
    } catch (error) {
        // Convert Firebase errors to user-friendly messages
        let friendlyMessage = "Login failed. Please try again.";
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
          friendlyMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.code === "auth/invalid-email") {
          friendlyMessage = "Please enter a valid email address.";
        } else if (error.code === "auth/weak-password") {
          friendlyMessage = "Password should be at least 6 characters long.";
        } else if (error.code === "auth/email-already-in-use") {
          friendlyMessage = "An account with this email already exists. Try signing in instead.";
        } else if (error.code === "auth/network-request-failed") {
          friendlyMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("api-key-not-valid")) {
          friendlyMessage = "Service temporarily unavailable. Please try again later.";
        }
        setErrors({ general: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    setErrors({});
    setShowPassword(false);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    resetForm();
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {currentUser.displayName || currentUser.email}
          </span>
        </div>
        <Button
          onClick={handleLogout}
          variant="secondary"
          size="sm"
          icon={LogOut}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="primary"
        icon={User}
      >
        Login
      </Button>

      <Modal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          resetForm();
        }}
        title={authMode === 'login' ? 'Sign In' : 'Create Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {authMode === 'register' && (
            <>
              <Input
                label="Display Name"
                value={formData.displayName}
                onChange={handleInputChange('displayName')}
                placeholder="Your name as it will appear on the ladder"
                required
              />
              {errors.displayName && (
                <div className="text-red-600 text-sm -mt-2">{errors.displayName}</div>
              )}
            </>
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="your@email.com"
            required
          />
          {errors.email && (
            <div className="text-red-600 text-sm -mt-2">{errors.email}</div>
          )}

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <div className="text-red-600 text-sm -mt-2">{errors.password}</div>
          )}

          {authMode === 'register' && (
            <>
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && (
                <div className="text-red-600 text-sm -mt-2">{errors.confirmPassword}</div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              variant="primary"
            >
              {isLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>
            <Button
              type="button"
              onClick={switchAuthMode}
              className="flex-1"
              variant="secondary"
            >
              {authMode === 'login' ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AuthComponent;
