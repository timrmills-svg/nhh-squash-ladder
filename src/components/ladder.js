import React, { useState, useEffect } from 'react';
import { User, Trophy } from 'lucide-react';
import { 
  Modal, 
  Button, 
  Input, 
  ParticipationDots, 
  PlayerAvatar, 
  EmptyState,
  calculateWinPercentage,
  validatePlayerName,
  createNewPlayer
} from './shared';

const LadderView = ({ players, setPlayers, onChallenge, currentUser, challenges = [] }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentPlayerRecord, setCurrentPlayerRecord] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setCurrentPlayerRecord(null);
      return;
    }
    
    const playerRecord = players.find(p => 
      p.name.toLowerCase().trim() === currentUser.displayName.toLowerCase().trim()
    );
    setCurrentPlayerRecord(playerRecord || null);
  }, [currentUser, players]);

  const handleJoinLadder = () => {
    if (!currentUser) {
      alert('Please login to join the ladder');
      return;
    }

    const playerName = currentUser.displayName;
    const error = validatePlayerName(playerName);
    if (error) {
      return;
    }

    const nameExists = players.some(p => 
      p.name.toLowerCase().trim() === playerName.toLowerCase().trim()
    );
    
    if (nameExists) {
      alert('You are already on the ladder');
      return;
    }

    const newPosition = players.length + 1;
    const newPlayer = createNewPlayer(playerName, newPosition);
    
    setPlayers([...players, newPlayer]);
    setShowJoinModal(false);
  };

  const sortedPlayers = [...players].sort((a, b) => a.position - b.position);
  const canJoinLadder = currentUser && !currentPlayerRecord;

  // Helper function to check if a player has active challenges
  const hasActiveChallenge = (playerId) => {
    return challenges.some(c => 
      (c.challengerId === playerId || c.challengedId === playerId) && 
      (c.status === 'pending' || c.status === 'accepted')
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Current Ladder</h2>
          <p className="text-gray-600 mt-1">
            {players.length} players currently on the ladder
          </p>
        </div>
        {canJoinLadder && (
          <Button
            onClick={() => setShowJoinModal(true)}
            variant="success"
            icon={User}
          >
            Join Ladder
          </Button>
        )}
      </div>

      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please login to view the ladder and participate in challenges.
              </p>
            </div>
          </div>
        </div>
      )}

      {currentUser && currentPlayerRecord && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">You're on the Ladder!</h3>
              <p className="text-sm text-green-700 mt-1">
                You are currently at position #{currentPlayerRecord.position}. You can challenge any player above you.
              </p>
            </div>
          </div>
        </div>
      )}

      {players.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win %</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPlayers.map((player) => {
                  const winPercentage = calculateWinPercentage(player.wins, player.losses);
                  const hasPlayedMatches = player.wins + player.losses > 0;
                  const isCurrentUser = currentUser && player.name.toLowerCase() === currentUser.displayName.toLowerCase();
                  
                  // Check if current user or this player has active challenges
                  const userHasActiveChallenge = currentPlayerRecord ? hasActiveChallenge(currentPlayerRecord.id) : false;
                  const playerHasActiveChallenge = hasActiveChallenge(player.id);
                  
                  return (
                    <tr key={player.id} className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-2xl font-bold ${
                            player.position === 1 ? 'text-yellow-600' :
                            player.position === 2 ? 'text-gray-600' :
                            player.position === 3 ? 'text-orange-600' :
                            'text-blue-600'
                          }`}>
                            #{player.position}
                          </span>
                          {player.position === 1 && <Trophy className="w-5 h-5 text-yellow-500 ml-2" />}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PlayerAvatar name={player.name} />
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                              {player.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined: {new Date(player.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {hasPlayedMatches ? (
                            <>
                              <span className="font-medium text-green-600">{player.wins}W</span>
                              {' - '}
                              <span className="font-medium text-red-600">{player.losses}L</span>
                            </>
                          ) : (
                            <span className="text-gray-400">No matches</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {hasPlayedMatches ? (
                            <span className={`font-medium ${
                              winPercentage >= 75 ? 'text-green-600' :
                              winPercentage >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {winPercentage}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <ParticipationDots points={player.participationPoints} />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Challenge button logic with blocking */}
                        {(() => {
                          if (isCurrentUser) {
                            return <span className="text-xs text-gray-500">Your position</span>;
                          }
                          
                          if (!currentUser || !currentPlayerRecord) {
                            return <span className="text-xs text-gray-400">Login to challenge</span>;
                          }
                          
                          if (player.position >= currentPlayerRecord.position) {
                            return <span className="text-xs text-gray-400">Cannot challenge</span>;
                          }
                          
                          if (userHasActiveChallenge) {
                            return <span className="text-xs text-orange-600">You have active challenge</span>;
                          }
                          
                          if (playerHasActiveChallenge) {
                            return <span className="text-xs text-orange-600">Player unavailable</span>;
                          }
                          
                          return (
                            <button
                              onClick={() => onChallenge && onChallenge(player.id)}
                              style={{ 
                                backgroundColor: "#f59e0b", 
                                color: "white", 
                                padding: "4px 8px", 
                                borderRadius: "4px", 
                                border: "none", 
                                cursor: "pointer" 
                              }}
                            >
                              Challenge
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Trophy}
          message="No players on the ladder yet"
          actionButton={
            canJoinLadder ? (
              <Button
                onClick={() => setShowJoinModal(true)}
                variant="primary"
                icon={User}
              >
                Be the first to join!
              </Button>
            ) : null
          }
        />
      )}

      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join the Nordea HH Squash Ladder"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You will join the ladder as <strong>{currentUser?.displayName}</strong> at position #{players.length + 1}.
          </p>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleJoinLadder}
              variant="success"
              className="flex-1"
            >
              Join Ladder
            </Button>
            <Button
              onClick={() => setShowJoinModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LadderView;
