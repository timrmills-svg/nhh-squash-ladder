import React, { useState, useMemo } from 'react';
import { Target, Clock, User, CheckCircle, XCircle, Trophy, AlertTriangle, Calendar } from 'lucide-react';
import { 
  Modal, 
  Button, 
  Input, 
  Select, 
  PlayerAvatar, 
  EmptyState,
  StatusBadge,
  getDaysRemaining,
  validateScore,
  createNewChallenge
} from './shared.js';

const ChallengesView = ({ 
  challenges, 
  players, 
  currentUser, 
  onCreateChallenge, 
  onChallengeResponse, 
  onRecordMatch 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Create challenge form state
  const [challengeForm, setChallengeForm] = useState({
    challengedId: '',
    errors: {}
  });

  // Record match form state
  const [matchForm, setMatchForm] = useState({
    player1Score: '',
    player2Score: '',
    isWalkover: false,
    errors: {}
  });

  // Get current user's player record
  const currentPlayerRecord = useMemo(() => {
    if (!currentUser) return null;
    return players.find(p => 
      p.name.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim()
    );
  }, [currentUser, players]);

  // Filter challenges by status and user involvement
  const filteredChallenges = useMemo(() => {
    let filtered = challenges;

    // Filter by tab
    switch (activeTab) {
      case 'pending':
        filtered = challenges.filter(c => c.status === 'pending');
        break;
      case 'my-challenges':
        if (currentPlayerRecord) {
          filtered = challenges.filter(c => 
            c.challengerId === currentPlayerRecord.id || 
            c.challengedId === currentPlayerRecord.id
          );
        } else {
          filtered = [];
        }
        break;
      case 'expired':
        filtered = challenges.filter(c => c.status === 'expired');
        break;
      case 'all':
      default:
        // Show all challenges
        break;
    }

    return filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  }, [challenges, activeTab, currentPlayerRecord]);

  // Get eligible players for challenging
  const eligiblePlayers = useMemo(() => {
    if (!currentPlayerRecord) return [];

    return players
      .filter(p => 
        p.id !== currentPlayerRecord.id && // Can't challenge yourself
        p.position < currentPlayerRecord.position && // Can only challenge players above
        p.isActive !== false // Only active players
      )
      .sort((a, b) => a.position - b.position);
  }, [players, currentPlayerRecord]);

  // Tab configuration
  const tabs = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'my-challenges', label: 'My Challenges', icon: User, requiresAuth: true },
    { key: 'expired', label: 'Expired', icon: AlertTriangle },
    { key: 'all', label: 'All', icon: Target }
  ];

  const handleCreateChallenge = () => {
    const errors = {};

    if (!challengeForm.challengedId) {
      errors.challengedId = 'Please select a player to challenge';
    }

    if (Object.keys(errors).length > 0) {
      setChallengeForm(prev => ({ ...prev, errors }));
      return;
    }

    onCreateChallenge(currentPlayerRecord.id, parseInt(challengeForm.challengedId));
    
    // Reset form
    setChallengeForm({ challengedId: '', errors: {} });
    setShowCreateModal(false);
  };

  const handleRecordMatch = () => {
    const challenge = challenges.find(c => c.id === showRecordModal);
    if (!challenge) return;

    const errors = {};

    if (!matchForm.isWalkover) {
      const score1Error = validateScore(matchForm.player1Score);
      const score2Error = validateScore(matchForm.player2Score);

      if (score1Error) errors.player1Score = score1Error;
      if (score2Error) errors.player2Score = score2Error;

      if (!errors.player1Score && !errors.player2Score) {
        const score1 = parseInt(matchForm.player1Score);
        const score2 = parseInt(matchForm.player2Score);
        
        if (score1 === score2) {
          errors.general = 'Match cannot end in a tie';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setMatchForm(prev => ({ ...prev, errors }));
      return;
    }

    onRecordMatch(
      challenge.id,
      matchForm.player1Score,
      matchForm.player2Score,
      matchForm.isWalkover
    );

    // Reset form
    setMatchForm({
      player1Score: '',
      player2Score: '',
      isWalkover: false,
      errors: {}
    });
    setShowRecordModal(null);
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const getPlayerPosition = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.position : '?';
  };

  const canUserRespond = (challenge) => {
    return currentPlayerRecord && challenge.challengedId === currentPlayerRecord.id && challenge.status === 'pending';
  };

  const canUserRecord = (challenge) => {
    return currentPlayerRecord && 
           (challenge.challengerId === currentPlayerRecord.id || challenge.challengedId === currentPlayerRecord.id) &&
           challenge.status === 'accepted';
  };

  const ChallengeCard = ({ challenge }) => {
    const challenger = players.find(p => p.id === challenge.challengerId);
    const challenged = players.find(p => p.id === challenge.challengedId);
    const daysRemaining = getDaysRemaining(challenge.expiryDate);
    const isExpiringSoon = daysRemaining <= 3 && challenge.status === 'pending';
    const isExpired = daysRemaining < 0 || challenge.status === 'expired';

    return (
      <div className={`bg-white rounded-lg shadow border p-6 ${
        isExpiringSoon ? 'border-orange-300 bg-orange-50' : 
        isExpired ? 'border-red-300 bg-red-50' : 
        'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-6">
            {/* Challenger */}
            <div className="text-center">
              <PlayerAvatar name={challenger?.name} size="lg" />
              <div className="mt-2">
                <div className="text-sm font-medium">{challenger?.name}</div>
                <div className="text-xs text-gray-500">#{challenger?.position}</div>
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-gray-400 mb-1">VS</div>
              <StatusBadge status={challenge.status} />
            </div>

            {/* Challenged */}
            <div className="text-center">
              <PlayerAvatar name={challenged?.name} size="lg" />
              <div className="mt-2">
                <div className="text-sm font-medium">{challenged?.name}</div>
                <div className="text-xs text-gray-500">#{challenged?.position}</div>
              </div>
            </div>
          </div>

          {/* Challenge Info */}
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm mb-2 ${
              isExpired ? 'text-red-600' :
              isExpiringSoon ? 'text-orange-600' : 
              'text-gray-600'
            }`}>
              <Clock className="w-4 h-4" />
              {isExpired ? 'Expired' : `${Math.max(0, daysRemaining)} days remaining`}
            </div>
            
            <div className="text-xs text-gray-500 mb-3">
              Created: {new Date(challenge.createdDate).toLocaleDateString()}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {canUserRespond(challenge) && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onChallengeResponse(challenge.id, 'accepted')}
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => onChallengeResponse(challenge.id, 'declined')}
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                  >
                    Decline
                  </Button>
                </div>
              )}

              {canUserRecord(challenge) && (
                <Button
                  onClick={() => setShowRecordModal(challenge.id)}
                  variant="primary"
                  size="sm"
                  icon={Trophy}
                  className="w-full"
                >
                  Record Match
                </Button>
              )}

              {challenge.status === 'pending' && !canUserRespond(challenge) && !canUserRecord(challenge) && (
                <div className="text-xs text-gray-500">
                  Waiting for {challenged?.name} to respond
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Challenge Rules Reminder for Pending */}
        {challenge.status === 'pending' && canUserRespond(challenge) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Reminder:</strong> You have {Math.max(0, daysRemaining)} days to respond to this challenge. 
              If not responded to within 3 weeks, it will automatically expire.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenges</h2>
          <p className="text-gray-600 mt-1">
            Manage and track squash ladder challenges
          </p>
        </div>
        {currentUser && eligiblePlayers.length > 0 && (
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="warning"
            icon={Target}
          >
            Create Challenge
          </Button>
        )}
      </div>

      {/* User Status Alert */}
      {currentUser && !currentPlayerRecord && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Join the Ladder First</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You need to join the ladder before you can create or respond to challenges.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Eligible Players Alert */}
      {currentUser && currentPlayerRecord && eligiblePlayers.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">You're at the Top!</h3>
              <p className="text-sm text-blue-700 mt-1">
                There are no players above you to challenge. Great job reaching position #{currentPlayerRecord.position}!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map(({ key, label, icon: Icon, requiresAuth }) => {
            const isActive = activeTab === key;
            const isDisabled = requiresAuth && !currentUser;
            const count = key === 'pending' ? challenges.filter(c => c.status === 'pending').length :
                         key === 'expired' ? challenges.filter(c => c.status === 'expired').length :
                         key === 'my-challenges' && currentPlayerRecord ? 
                           challenges.filter(c => c.challengerId === currentPlayerRecord.id || c.challengedId === currentPlayerRecord.id).length :
                         challenges.length;

            return (
              <button
                key={key}
                onClick={() => !isDisabled && setActiveTab(key)}
                disabled={isDisabled}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : isDisabled
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenges List */}
      {filteredChallenges.length > 0 ? (
        <div className="space-y-4">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          message={
            activeTab === 'pending' ? 'No pending challenges' :
            activeTab === 'my-challenges' ? 'You have no challenges yet' :
            activeTab === 'expired' ? 'No expired challenges' :
            'No challenges found'
          }
          actionButton={
            currentUser && eligiblePlayers.length > 0 && (
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                icon={Target}
              >
                Create Your First Challenge
              </Button>
            )
          }
        />
      )}

      {/* Create Challenge Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setChallengeForm({ challengedId: '', errors: {} });
        }}
        title="Create New Challenge"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Challenge a player ranked above you on the ladder. You have 3 weeks to complete the match.
          </p>

          {currentPlayerRecord && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Your Position:</strong> #{currentPlayerRecord.position}
              </p>
            </div>
          )}

          <Select
            label="Player to Challenge"
            value={challengeForm.challengedId}
            onChange={(e) => setChallengeForm(prev => ({ 
              ...prev, 
              challengedId: e.target.value,
              errors: { ...prev.errors, challengedId: '' }
            }))}
            options={eligiblePlayers.map(player => ({
              value: player.id,
              label: `${player.name} (#${player.position})`
            }))}
            placeholder="Select a player"
            required
          />
          {challengeForm.errors.challengedId && (
            <div className="text-red-600 text-sm -mt-2">{challengeForm.errors.challengedId}</div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Challenge Rules:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Challenges expire after 3 weeks if not accepted</li>
              <li>• Winner moves to loser's position (if higher)</li>
              <li>• Both players earn participation points</li>
              <li>• Walkover victories are allowed</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateChallenge}
              variant="warning"
              disabled={!challengeForm.challengedId}
              className="flex-1"
            >
              Create Challenge
            </Button>
            <Button
              onClick={() => {
                setShowCreateModal(false);
                setChallengeForm({ challengedId: '', errors: {} });
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Match Modal */}
      {showRecordModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowRecordModal(null);
            setMatchForm({
              player1Score: '',
              player2Score: '',
              isWalkover: false,
              errors: {}
            });
          }}
          title="Record Match Result"
        >
          {(() => {
            const challenge = challenges.find(c => c.id === showRecordModal);
            const challenger = players.find(p => p.id === challenge?.challengerId);
            const challenged = players.find(p => p.id === challenge?.challengedId);

            return (
              <div className="space-y-4">
                <div className="text-center py-4 border-b">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <PlayerAvatar name={challenger?.name} />
                      <div className="mt-1 text-sm font-medium">{challenger?.name}</div>
                      <div className="text-xs text-gray-500">#{challenger?.position}</div>
                    </div>
                    <div className="text-lg font-bold text-gray-400">VS</div>
                    <div className="text-center">
                      <PlayerAvatar name={challenged?.name} />
                      <div className="mt-1 text-sm font-medium">{challenged?.name}</div>
                      <div className="text-xs text-gray-500">#{challenged?.position}</div>
                    </div>
                  </div>
                </div>

                {matchForm.errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-600 text-sm">{matchForm.errors.general}</p>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="walkover"
                    checked={matchForm.isWalkover}
                    onChange={(e) => setMatchForm(prev => ({ 
                      ...prev, 
                      isWalkover: e.target.checked,
                      player1Score: '',
                      player2Score: '',
                      errors: {}
                    }))}
                    className="mr-2"
                  />
                  <label htmlFor="walkover" className="text-sm font-medium">
                    Walkover (challenger wins without playing)
                  </label>
                </div>

                {!matchForm.isWalkover && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={`${challenger?.name} Score`}
                      type="number"
                      value={matchForm.player1Score}
                      onChange={(e) => setMatchForm(prev => ({
                        ...prev,
                        player1Score: e.target.value,
                        errors: { ...prev.errors, player1Score: '' }
                      }))}
                      placeholder="0"
                      min="0"
                      required
                    />
                    <Input
                      label={`${challenged?.name} Score`}
                      type="number"
                      value={matchForm.player2Score}
                      onChange={(e) => setMatchForm(prev => ({
                        ...prev,
                        player2Score: e.target.value,
                        errors: { ...prev.errors, player2Score: '' }
                      }))}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                )}

                {matchForm.errors.player1Score && (
                  <div className="text-red-600 text-sm">{matchForm.errors.player1Score}</div>
                )}
                {matchForm.errors.player2Score && (
                  <div className="text-red-600 text-sm">{matchForm.errors.player2Score}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleRecordMatch}
                    variant="success"
                    className="flex-1"
                    icon={Trophy}
                  >
                    Record Match
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRecordModal(null);
                      setMatchForm({
                        player1Score: '',
                        player2Score: '',
                        isWalkover: false,
                        errors: {}
                      });
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default ChallengesView;