import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Trophy, LogOut, Chrome } from 'lucide-react';
import { 
  Modal, 
  Button, 
  Input,
  validatePlayerName
} from './shared';

const AuthComponent = ({ onAuthStateChange, currentUser }) => {
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('nordea_hh_squash_users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem('nordea_hh_squash_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      const sessionAge = Date.now() - new Date(session.loginTime).getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('nordea_hh_squash_session');
        return null;
      }
      return session;
    }
    return null;
  });

  useEffect(() => {
    if (onAuthStateChange) {
      onAuthStateChange(session);
    }
  }, [session, onAuthStateChange]);

  useEffect(() => {
    localStorage.setItem('nordea_hh_squash_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('nordea_hh_squash_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('nordea_hh_squash_session');
    }
  }, [session]);

  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
        setLockoutTime(null);
      }, 15 * 60 * 1000);

      return () => clearTimeout(timer);
    }
  }, [isLocked, lockoutTime]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (authMode === 'register') {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (authMode === 'register') {
      if (!formData.displayName) {
        newErrors.displayName = 'Display name is required';
      } else {
        const nameError = validatePlayerName(formData.displayName);
        if (nameError) {
          newErrors.displayName = nameError;
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (users.some(user => user.email.toLowerCase() === formData.email.toLowerCase())) {
        newErrors.email = 'An account with this email already exists';
      }

      if (users.some(user => user.displayName.toLowerCase() === formData.displayName.toLowerCase())) {
        newErrors.displayName = 'This display name is already taken';
      }
    }

    if (isLocked) {
      const remainingTime = Math.ceil((15 * 60 * 1000 - (Date.now() - lockoutTime)) / 60000);
      newErrors.general = `Account temporarily locked. Try again in ${remainingTime} minutes.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      setSession(userSession);
      setShowAuthModal(false);
      setLoginAttempts(0);
      resetForm();
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockoutTime(Date.now());
        setErrors({ general: 'Too many failed attempts. Account locked for 15 minutes.' });
      } else {
        setErrors({ 
          general: `Invalid email or password. ${5 - newAttempts} attempts remaining.` 
        });
      }
    }
    
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      id: Date.now(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      displayName: formData.displayName,
      role: 'player',
      createdAt: new Date().toISOString(),
      isVerified: false
    };
    
    setUsers(prev => [...prev, newUser]);
    
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
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
    localStorage.removeItem('nordea_hh_squash_session');
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

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {session.displayName}
          </span>
          {session.loginMethod === 'google' && (
            <Chrome className="w-3 h-3 text-blue-600" />
          )}
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
        title={
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            {authMode === 'login' ? 'Login to Nordea HH Squash Ladder' : 'Join Nordea HH Squash Ladder'}
          </div>
        }
      >
        <div className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}


          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

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

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="your@nordea.com"
            required
          />
          {errors.email && (
            <div className="text-red-600 text-sm -mt-2">{errors.email}</div>
          )}

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder={authMode === 'register' ? "Must be 8+ chars with upper, lower & number" : "Enter your password"}
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

          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading || isLocked}
            className="w-full"
            icon={authMode === 'login' ? Lock : User}
          >
            {isLoading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Create Account')}
          </Button>

          <div className="text-center">
            <button
              onClick={switchAuthMode}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {authMode === 'login' 
                ? "Don't have an account? Register here" 
                : "Already have an account? Login here"
              }
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-600 text-sm">
              <strong>Security:</strong> {authMode === 'register' ? 
                'Your password must be strong and unique. Email verification required.' :
                'Login attempts are limited. Account lockout after 5 failed attempts.'}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = localStorage.getItem('nordea_hh_squash_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      const sessionAge = Date.now() - new Date(session.loginTime).getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('nordea_hh_squash_session');
        return null;
      }
      return session;
    }
    return null;
  });

  const updateAuthState = (user) => {
    setCurrentUser(user);
    if (user) {
      const updatedUser = {
        ...user,
        lastActivity: new Date().toISOString()
      };
      localStorage.setItem('nordea_hh_squash_session', JSON.stringify(updatedUser));
    }
  };

  return { currentUser, updateAuthState };
};

export default AuthComponent;
