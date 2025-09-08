import React from 'react';
import { Bell, Target, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const NotificationBanner = ({ challenges, players, currentUser }) => {
  if (!currentUser) return null;

  const currentPlayerRecord = players.find(p => 
    p.name.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim()
  );

  if (!currentPlayerRecord) return null;

  // Find challenges relevant to current user
  const pendingChallengesReceived = challenges.filter(c => 
    c.challengedId === currentPlayerRecord.id && c.status === 'pending'
  );
  
  const acceptedChallenges = challenges.filter(c => 
    (c.challengerId === currentPlayerRecord.id || c.challengedId === currentPlayerRecord.id) && 
    c.status === 'accepted'
  );
  
  const pendingChallengesSent = challenges.filter(c => 
    c.challengerId === currentPlayerRecord.id && c.status === 'pending'
  );

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (pendingChallengesReceived.length === 0 && acceptedChallenges.length === 0 && pendingChallengesSent.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      {/* Urgent: Challenges received requiring response */}
      {pendingChallengesReceived.map(challenge => {
        const daysLeft = getDaysRemaining(challenge.expiryDate);
        const isUrgent = daysLeft <= 3;
        
        return (
          <div key={challenge.id} className={`rounded-lg p-4 border-l-4 ${
            isUrgent ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex items-start gap-3">
              <Target className={`w-5 h-5 mt-0.5 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${isUrgent ? 'text-red-800' : 'text-blue-800'}`}>
                  Challenge Received {isUrgent && '- URGENT'}
                </h3>
                <p className={`text-sm mt-1 ${isUrgent ? 'text-red-700' : 'text-blue-700'}`}>
                  <strong>{getPlayerName(challenge.challengerId)}</strong> has challenged you! 
                  You have <strong>{Math.max(0, daysLeft)} days</strong> to respond.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.location.hash = 'challenges'}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    isUrgent ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Respond Now
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Matches ready to be played */}
      {acceptedChallenges.map(challenge => {
        const opponent = challenge.challengerId === currentPlayerRecord.id 
          ? getPlayerName(challenge.challengedId)
          : getPlayerName(challenge.challengerId);
        const daysLeft = getDaysRemaining(challenge.expiryDate);
        
        return (
          <div key={challenge.id} className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Match Ready to Play</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your match against <strong>{opponent}</strong> is scheduled. 
                  Record the result within <strong>{Math.max(0, daysLeft)} days</strong>.
                </p>
              </div>
              <button 
                onClick={() => window.location.hash = 'challenges'}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
              >
                Record Match
              </button>
            </div>
          </div>
        );
      })}

      {/* Challenges sent awaiting response */}
      {pendingChallengesSent.map(challenge => (
        <div key={challenge.id} className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Challenge Sent</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Waiting for <strong>{getPlayerName(challenge.challengedId)}</strong> to respond to your challenge.
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Header notification bell with count
const NotificationBell = ({ challenges, players, currentUser }) => {
  if (!currentUser) return null;

  const currentPlayerRecord = players.find(p => 
    p.name.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim()
  );

  if (!currentPlayerRecord) return null;

  const pendingNotifications = challenges.filter(c => 
    (c.challengedId === currentPlayerRecord.id && c.status === 'pending') ||
    ((c.challengerId === currentPlayerRecord.id || c.challengedId === currentPlayerRecord.id) && c.status === 'accepted')
  ).length;

  if (pendingNotifications === 0) return null;

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-blue-200" />
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
        {pendingNotifications}
      </div>
    </div>
  );
};

export { NotificationBanner, NotificationBell };
