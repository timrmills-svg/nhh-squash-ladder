import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Trophy, LogOut } from 'lucide-react';
import { 
  Modal, 
  Button, 
  Input,
  validatePlayerName
} from './shared.js';

const AuthComponent = ({ onAuthStateChange, currentUser }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Simulated user database (in real app, this would be Firebase/backend)
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('squash_ladder_users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  // Simulated current session (in real app, this would be Firebase Auth)
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem('squash_ladder_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Update parent component when auth state changes
  useEffect(() => {
    if (onAuthStateChange) {
      onAuthStateChange(session);
    }
  }, [session, onAuthStateChange]);

  // Save users to localStorage whenever users array changes
  useEffect(() => {
    localStorage.setItem('squash_ladder_users', JSON.stringify(users));
  }, [users]);

  // Save session to localStorage whenever session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('squash_ladder_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('squash_ladder_session');
    }
  }, [session]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    // Registration-specific validation
    if (authMode === 'register') {
      // Display name validation
      if (!formData.displayName) {
        newErrors.displayName = 'Display name is required';
      } else {
        const nameError = validatePlayerName(formData.displayName);
        if (nameError) {
          newErrors.displayName = nameError;
        }
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Check if email already exists
      if (users.some(user => user.email.toLowerCase() === formData.email.toLowerCase())) {
        newErrors.email = 'An account with this email already exists';
      }

      // Check if display name already exists
      if (users.some(user => user.displayName.toLowerCase() === formData.displayName.toLowerCase())) {
        newErrors.displayName = 'This display name is already taken';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user
    const user = users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && 
      u.password === formData.password
    );
    
    if (user) {
      const userSession = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role || 'player',
        loginTime: new Date().toISOString()
      };
      
      setSession(userSession);
      setShowAuthModal(false);
      resetForm();
    } else {
      setErrors({ general: 'Invalid email or password' });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      id: Date.now(),
      email: formData.email.toLowerCase(),
      password: formData.password, // In real app, this would be hashed
      displayName: formData.displayName,
      role: 'player',
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
    
    // Auto-login after registration
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      loginTime: new Date().toISOString()
    };
    
    setSession(userSession);
    setShowAuthModal(false);
    resetForm();
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (authMode === 'login') {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const handleLogout = () => {
    setSession(null);
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
    setShowConfirmPassword(false);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    resetForm();
  };

  // If user is logged in, show user info and logout
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {session.displayName}
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

  // If not logged in, show login button
  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="primary"
        icon={User}
      >
        Login
      </Button>

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          resetForm();
        }}
        title={
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            {authMode === 'login' ? 'Login to Squash Ladder' : 'Join Squash Ladder'}
          </div>
        }
      >
        <div className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Registration: Display Name */}
          {authMode === 'register' && (
            <Input
              label="Display Name"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              placeholder="Your name as it will appear on the ladder"
              required
            />
          )}
          {errors.displayName && (
            <div className="text-red-600 text-sm -mt-2">{errors.displayName}</div>
          )}

          {/* Email */}
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

          {/* Password */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
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

          {/* Registration: Confirm Password */}
          {authMode === 'register' && (
            <>
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="text-red-600 text-sm -mt-2">{errors.confirmPassword}</div>
              )}
            </>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading}
            className="w-full"
            icon={authMode === 'login' ? Lock : User}
          >
            {isLoading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Create Account')}
          </Button>

          {/* Switch Auth Mode */}
          <div className="text-center">
            <button
              onClick={switchAuthMode}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {authMode === 'login' 
                ? "Don't have an account? Register here" 
                : "Already have an account? Login here"
              }
            </button>
          </div>

          {/* Demo Account Info */}
          {authMode === 'login' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600 text-sm">
                <strong>Demo:</strong> You can register a new account or create one to test the app.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

// Hook for using auth context in other components
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = localStorage.getItem('squash_ladder_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  const updateAuthState = (user) => {
    setCurrentUser(user);
  };

  return { currentUser, updateAuthState };
};

export default AuthComponent;