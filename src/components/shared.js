import React from 'react';
import { User, Trophy, Calendar, TrendingUp, Clock, Target, Award, Users, Activity, X } from 'lucide-react';

// Common data structures and utilities
export const LADDER_RULES = {
  PARTICIPATION_POINTS_REQUIRED: 3,
  CHALLENGE_DEADLINE_DAYS: 21,
  MAX_POSITION_JUMP: 1 // Winner can only move up one position at a time
};

// Utility functions
export const calculateWinPercentage = (wins, losses) => {
  if (wins + losses === 0) return 0;
  return Math.round((wins / (wins + losses)) * 100);
};

export const getDaysRemaining = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const generateId = () => {
  return Date.now() + Math.random();
};

// Position update logic following LSRC rules
export const updatePositionsAfterMatch = (players, winnerId, loserId) => {
  const winner = players.find(p => p.id === winnerId);
  const loser = players.find(p => p.id === loserId);
  
  if (!winner || !loser) return players;
  
  const winnerOldPos = winner.position;
  const loserOldPos = loser.position;
  
  return players.map(player => {
    if (player.id === winnerId) {
      // Winner takes loser's position if it's higher
      return {
        ...player,
        position: Math.min(winnerOldPos, loserOldPos),
        wins: player.wins + 1,
        participationPoints: Math.min(player.participationPoints + 1, LADDER_RULES.PARTICIPATION_POINTS_REQUIRED)
      };
    } else if (player.id === loserId) {
      // Loser drops one position
      return {
        ...player,
        position: winnerOldPos < loserOldPos ? loserOldPos : loserOldPos + 1,
        losses: player.losses + 1,
        participationPoints: Math.min(player.participationPoints + 1, LADDER_RULES.PARTICIPATION_POINTS_REQUIRED)
      };
    } else if (player.position >= Math.min(winnerOldPos, loserOldPos) && 
               player.position < Math.max(winnerOldPos, loserOldPos)) {
      // Players between winner and loser shift down
      return { ...player, position: player.position + 1 };
    }
    return player;
  });
};

// Common UI Components
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  icon: Icon,
  className = ''
}) => {
  const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? disabledClasses : ''} ${className}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </div>
    </button>
  );
};

export const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
      />
    </div>
  );
};

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = 'Select an option',
  required = false,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const ParticipationDots = ({ points, maxPoints = 3 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxPoints }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < points ? 'bg-green-500' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">{points}/{maxPoints}</span>
    </div>
  );
};

export const PlayerAvatar = ({ name, size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`${sizes[size]} bg-blue-100 rounded-full flex items-center justify-center`}>
      <User className={`${iconSizes[size]} text-blue-600`} />
    </div>
  );
};

export const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    orange: 'text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
          <p className="text-gray-600">{title}</p>
        </div>
        {Icon && <Icon className={`w-8 h-8 ${colors[color]}`} />}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, message, actionButton }) => {
  return (
    <div className="text-center py-12 text-gray-500">
      {Icon && <Icon className="w-12 h-12 mx-auto mb-4 text-gray-300" />}
      <p className="mb-4">{message}</p>
      {actionButton}
    </div>
  );
};

// Navigation Icons mapping
export const NavigationIcons = {
  ladder: Trophy,
  challenges: Target,
  matches: Activity,
  stats: TrendingUp,
  auth: User
};

// Status badges
export const StatusBadge = ({ status, className = '' }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Form validation utilities
export const validatePlayerName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  return null;
};

export const validateScore = (score) => {
  const num = parseInt(score);
  if (isNaN(num) || num < 0) {
    return 'Score must be a valid number';
  }
  return null;
};

// Default player data structure
export const createNewPlayer = (name, position) => ({
  id: generateId(),
  name: name.trim(),
  position,
  participationPoints: 0,
  wins: 0,
  losses: 0,
  joinDate: new Date().toISOString().split('T')[0],
  isActive: true
});

// Default challenge data structure
export const createNewChallenge = (challengerId, challengedId) => ({
  id: generateId(),
  challengerId,
  challengedId,
  status: 'pending',
  createdDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + LADDER_RULES.CHALLENGE_DEADLINE_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

// Default match data structure
export const createNewMatch = (player1Id, player2Id, player1Score, player2Score, isWalkover = false) => ({
  id: generateId(),
  player1Id,
  player2Id,
  player1Score: isWalkover ? 'WO' : player1Score,
  player2Score: isWalkover ? 'WO' : player2Score,
  winnerId: isWalkover ? player1Id : (parseInt(player1Score) > parseInt(player2Score) ? player1Id : player2Id),
  date: new Date().toISOString().split('T')[0],
  isWalkover
});