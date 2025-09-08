import React, { useState, useMemo } from 'react';
import { Target, Clock, User, CheckCircle, XCircle, Trophy, AlertTriangle, Calendar, Plus, Minus } from 'lucide-react';
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
} from './shared';

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

  // Record match form state - updated for game-by-game scoring
  const [matchForm, setMatchForm] = useState({
    games: [
      { player1Score: '', player2Score: '' },
      { player1Score: '', player2Score: '' },
      { player1Score: '', player2Score: '' }
    ],
    isWalkover: false,
    errors: {},
    showConfirmation: false,
    calculatedResult: null
  });

  // Squash scoring validation
  const validateGameScore = (score1, score2) => {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    
    if (isNaN(s1) || isNaN(s2)) {
      return 'Both scores must be numbers';
    }
    
    if (s1 < 0 || s2 < 0) {
      return 'Scores cannot be negative';
    }
    
    const winner = s1 > s2 ? s1 : s2;
    const loser = s1 > s2 ? s2 : s1;
    
    // Must reach at least 11 to win
    if (winner < 11) {
      return 'Winner must score at least 11 points';
    }
    
    // Must win by 2 points, unless it's 11-9 or 11-8 or below
    if (winner >= 11 && loser >= 9 && (winner - loser) < 2) {
      return 'Must win by at least 2 points when opponent has 9+ points';
    }
    
    // Prevent unrealistic scores
    if (winner > 20) {
      return 'Scores above 20 are unusual - please verify';
    }
    
    return null;
  };

  const calculateMatchResult = (games) => {
    let player1Games = 0;
    let player2Games = 0;
    
    for (const game of games) {
      if (game.player1Score && game.player2Score) {
        const s1 = parseInt(game.player1Score);
        const s2 = parseInt(game.player2Score);
        
        if (!isNaN(s1) && !isNaN(s2)) {
          if (s1 > s2) player1Games++;
          else player2Games++;
        }
      }
    }
    
    return { player1Games, player2Games };
  };

  const getCompletedGamesCount = (games) => {
    return games.filter(game => 
      game.player1Score !== '' && 
      game.player2Score !== '' &&
      !isNaN(parseInt(game.player1Score)) &&
      !isNaN(parseInt(game.player2Score))
    ).length;
  };

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

  const handleGameScoreChange = (gameIndex, field, value) => {
    setMatchForm(prev => {
      const newGames = [...prev.games];
      newGames[gameIndex] = { ...newGames[gameIndex], [field]: value };
      
      return {
        ...prev,
        games: newGames,
        errors: { ...prev.errors, [`game${gameIndex}`]: '' }
      };
    });
  };

  const addGame = () => {
    if (matchForm.games.length < 5) {
      setMatchForm(prev => ({
        ...prev,
        games: [...prev.games, { player1Score: '', player2Score: '' }]
      }));
    }
  };

  const removeGame = () => {
    if (matchForm.games.length > 3) {
      setMatchForm(prev => ({
        ...prev,
        games: prev.games.slice(0, -1)
      }));
    }
  };

  const handleRecordMatch = () => {
    const errors = {};
    
    if (matchForm.showConfirmation) {
      // User confirmed, proceed with recording
      const result = calculateMatchResult(matchForm.games);
      const gameScores = matchForm.games
        .filter(game => game.player1Score && game.player2Score)
        .map(game => `${game.player1Score}-${game.player2Score}`)
        .join(', ');
      
      onRecordMatch(
        showRecordModal,
        result.player1Games,
        result.player2Games,
        matchForm.isWalkover,
        gameScores // Pass the individual game scores
      );

      // Reset form
      setMatchForm({
        games: [
          { player1Score: '', player2Score: '' },
          { player1Score: '', player2Score: '' },
          { player1Score: '', player2Score: '' }
        ],
        isWalkover: false,
        errors: {},
        showConfirmation: false,
        calculatedResult: null
      });
      setShowRecordModal(null);
      return;
    }

    if (!matchForm.isWalkover) {
      // Validate all completed games
      matchForm.games.forEach((game, index) => {
        if (game.player1Score !== '' || game.player2Score !== '') {
          if (game.player1Score === '' || game.player2Score === '') {
            errors[`game${index}`] = 'Both scores must be entered for this game';
          } else {
            const validationError = validateGameScore(game.player1Score, game.player2Score);
            if (validationError) {
              errors[`game${index}`] = validationError;
            }
          }
        }
      });

      const completedGames = getCompletedGamesCount(matchForm.games);
      
      // Must have at least 3 completed games (minimum for 3-0)
      if (completedGames < 3) {
        errors.general = 'You must enter scores for at least 3 games';
      }
      
      // Check if it's a valid match result
      if (completedGames >= 3 && !errors.general) {
        const result = calculateMatchResult(matchForm.games);
        const maxGames = Math.max(result.player1Games, result.player2Games);
        
        // Check if one player has won (first to 3)
        if (maxGames < 3) {
          errors.general = 'Match is incomplete - first player to win 3 games wins the match';
        } else if (maxGames === 3) {
          // Valid result (3-0, 3-1, or 3-2)
          if (completedGames > maxGames + Math.min(result.player1Games, result.player2Games)) {
            errors.general = 'Too many games entered - match ends when one player reaches 3 games';
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setMatchForm(prev => ({ ...prev, errors }));
      return;
    }

    // Show confirmation dialog
    const result = calculateMatchResult(matchForm.games);
    setMatchForm(prev => ({
      ...prev,
      showConfirmation: true,
      calculatedResult: result,
      errors: {}
    }));
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
              games: [
                { player1Score: "", player2Score: "" },
                { player1Score: "", player2Score: "" },
                { player1Score: "", player2Score: "" }
              ],
              isWalkover: false,
              errors: {},
              showConfirmation: false,
              calculatedResult: null
            });
          }}
          title="Record Match Result"
        >
          {(() => {
            const challenge = challenges.find(c => c.id === showRecordModal);
            const challenger = players.find(p => p.id === challenge?.challengerId);
            const challenged = players.find(p => p.id === challenge?.challengedId);

            return (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="text-center py-4 border-b sticky top-0 bg-white z-10">
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

                {/* Confirmation Dialog */}
                {matchForm.showConfirmation && matchForm.calculatedResult && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">Confirm Match Result</h3>
                    <p className="text-yellow-700 mb-3">
                      You are submitting a match result of <strong>
                        {matchForm.calculatedResult.player1Games}-{matchForm.calculatedResult.player2Games}
                      </strong> in favor of <strong>
                        {matchForm.calculatedResult.player1Games > matchForm.calculatedResult.player2Games 
                          ? challenger?.name 
                          : challenged?.name}
                      </strong>.
                    </p>
                    <p className="text-sm text-yellow-600 mb-4">
                      Game scores: {matchForm.games
                        .filter(game => game.player1Score && game.player2Score)
                        .map(game => `${game.player1Score}-${game.player2Score}`)
                        .join(", ")}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleRecordMatch}
                        variant="success"
                        className="flex-1"
                      >
                        Confirm & Submit
                      </Button>
                      <Button
                        onClick={() => setMatchForm(prev => ({ 
                          ...prev, 
                          showConfirmation: false, 
                          calculatedResult: null 
                        }))}
                        variant="secondary"
                        className="flex-1"
                      >
                        Go Back
                      </Button>
                    </div>
                  </div>
                )}

                {/* Main Form */}
                {!matchForm.showConfirmation && (
                  <div className="space-y-4">
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
                          games: [
                            { player1Score: "", player2Score: "" },
                            { player1Score: "", player2Score: "" },
                            { player1Score: "", player2Score: "" }
                          ],
                          errors: {}
                        }))}
                        className="mr-2"
                      />
                      <label htmlFor="walkover" className="text-sm font-medium">
                        Walkover (challenger wins without playing)
                      </label>
                    </div>

                    {!matchForm.isWalkover && (
                      <div className="space-y-4">
                        {/* Squash Scoring Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Squash Scoring Rules:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Best of 5 games - first to win 3 games wins the match</li>
                            <li>• Each game is played to 11 points</li>
                            <li>• Must win by 2 points when opponent has 9+ points</li>
                            <li>• Enter the score for each completed game</li>
                          </ul>
                        </div>

                        {/* Game Scores */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-lg font-medium">Game Scores</h4>
                            <div className="flex gap-2">
                              {matchForm.games.length < 5 && (
                                <Button
                                  onClick={addGame}
                                  variant="secondary"
                                  size="sm"
                                  icon={Plus}
                                >
                                  Add Game
                                </Button>
                              )}
                              {matchForm.games.length > 3 && (
                                <Button
                                  onClick={removeGame}
                                  variant="secondary"
                                  size="sm"
                                  icon={Minus}
                                >
                                  Remove Game
                                </Button>
                              )}
                            </div>
                          </div>

                          {matchForm.games.map((game, index) => (
                            <div key={index}>
                              <div className="flex items-center gap-4 mb-2">
                                <div className="text-sm font-medium w-16">Game {index + 1}:</div>
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    type="number"
                                    value={game.player1Score}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 25)) {
                                        handleGameScoreChange(index, "player1Score", value);
                                      }
                                    }}
                                    placeholder="0"
                                    min="0"
                                    max="25"
                                    className="w-20"
                                  />
                                  <span className="text-gray-500">-</span>
                                  <Input
                                    type="number"
                                    value={game.player2Score}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 25)) {
                                        handleGameScoreChange(index, "player2Score", value);
                                      }
                                    }}
                                    placeholder="0"
                                    min="0"
                                    max="25"
                                    className="w-20"
                                  />
                                  <div className="text-sm text-gray-600 flex-1">
                                    {challenger?.name} - {challenged?.name}
                                  </div>
                                </div>
                              </div>
                              {matchForm.errors[`game${index}`] && (
                                <div className="text-red-600 text-sm ml-20 -mt-1 mb-2">
                                  {matchForm.errors[`game${index}`]}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Current Match Status */}
                          {getCompletedGamesCount(matchForm.games) > 0 && (
                            <div className="bg-gray-50 border rounded p-3">
                              <div className="text-sm font-medium text-gray-900 mb-1">Current Status:</div>
                              <div className="text-sm text-gray-700">
                                {(() => {
                                  const result = calculateMatchResult(matchForm.games);
                                  const completedGames = getCompletedGamesCount(matchForm.games);
                                  return `${completedGames} game${completedGames !== 1 ? "s" : ""} completed - ${challenger?.name}: ${result.player1Games}, ${challenged?.name}: ${result.player2Games}`;
                                })()}
                              </div>
                              {(() => {
                                const result = calculateMatchResult(matchForm.games);
                                const maxGames = Math.max(result.player1Games, result.player2Games);
                                if (maxGames >= 3) {
                                  return (
                                    <div className="text-sm font-medium text-green-700 mt-1">
                                      Match Complete! {result.player1Games > result.player2Games ? challenger?.name : challenged?.name} wins {Math.max(result.player1Games, result.player2Games)}-{Math.min(result.player1Games, result.player2Games)}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t">
                      <Button
                        onClick={handleRecordMatch}
                        variant="success"
                        className="flex-1"
                        icon={Trophy}
                        disabled={!matchForm.isWalkover && getCompletedGamesCount(matchForm.games) < 3}
                      >
                        {matchForm.isWalkover ? "Record Walkover" : "Submit Match Result"}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRecordModal(null);
                          setMatchForm({
                            games: [
                              { player1Score: "", player2Score: "" },
                              { player1Score: "", player2Score: "" },
                              { player1Score: "", player2Score: "" }
                            ],
                            isWalkover: false,
                            errors: {},
                            showConfirmation: false,
                            calculatedResult: null
                          });
                        }}
                        variant="secondary"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default ChallengesView;