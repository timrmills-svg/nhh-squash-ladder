// src/components/auth.js - Fixed version to prevent render loop

import React, { useState, useRef } from 'react';
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
  
  // Use ref to store the callback and avoid stale closures
  const onAuthStateChangeRef = useRef();
  onAuthStateChangeRef.current = onAuthStateChange;

  // FIXED: Remove onAuthStateChange from dependencies to prevent render loop
  React.useEffect(() => {
    if (onAuthStateChangeRef.current) {
      onAuthStateChangeRef.current(currentUser);
    }
  }, [currentUser]); // Only depend on currentUser, not the callback

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

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (authMode === 'register') {
        await register(formData.email, formData.password, formData.displayName);
      } else {
        await login(formData.email, formData.password);
      }
      setShowAuthModal(false);
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
      });
    } catch (error) {
      setErrors({ general: error.message });
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

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">
            {currentUser.displayName || currentUser.email}
          </span>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center space-x-2"
      >
        <Lock className="w-4 h-4" />
        <span>Login</span>
      </Button>

      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <Input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Your display name"
                  icon={User}
                  error={errors.displayName}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                icon={Mail}
                error={errors.email}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Your password"
                icon={Lock}
                error={errors.password}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  icon={Lock}
                  error={errors.confirmPassword}
                />
              </div>
            )}

            <div className="flex flex-col space-y-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{authMode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  authMode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>

              <button
                type="button"
                onClick={switchMode}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AuthComponent;