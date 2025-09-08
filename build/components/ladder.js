import React, { useState } from 'react';
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
} from './shared.js';

const LadderView = ({ players, setPlayers, onChallenge }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleJoinLadder = () => {
    // Validate name
    const error = validatePlayerName(newPlayerName);
    if (error) {
      setNameError(error);
      return;
    }

    // Check if name already exists
    const nameExists = players.some(p => 
      p.name.toLowerCase().trim() === newPlayerName.toLowerCase().trim()
    );
    
    if (nameExists) {
      setNameError('A player with this name already exists');
      return;
    }

    // Create new player at bottom of ladder
    const newPosition = players.length + 1;
    const newPlayer = createNewPlayer(newPlayerName, newPosition);
    
    setPlayers([...players, newPlayer]);
    
    // Reset form
    setNewPlayerName('');
    setNameError('');
    setShowJoinModal(false);
  };

  const handleNameChange = (e) => {
    setNewPlayerName(e.target.value);
    if (nameError) {
      setNameError('');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Current Ladder</h2>
          <p className="text-gray-600 mt-1">
            {players.length} player{players.length !== 1 ? 's' : ''} currently on the ladder
          </p>
        </div>
        <Button
          onClick={() => setShowJoinModal(true)}
          variant="success"
          icon={User}
        >
          Join Ladder
        </Button>
      </div>

      {/* Ladder Table */}
      {players.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Win %
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPlayers.map((player) => {
                  const winPercentage = calculateWinPercentage(player.wins, player.losses);
                  const hasPlayedMatches = player.wins + player.losses > 0;
                  
                  return (
                    <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                      {/* Position */}
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
                          {player.position === 1 && (
                            <Trophy className="w-5 h-5 text-yellow-500 ml-2" />
                          )}
                        </div>
                      </td>

                      {/* Player */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PlayerAvatar name={player.name} />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined: {new Date(player.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Record */}
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

                      {/* Win Percentage */}
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

                      {/* Participation Points */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ParticipationDots points={player.participationPoints} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => onChallenge && onChallenge(player.id)}
                          variant="warning"
                          size="sm"
                        >
                          Challenge
                        </Button>
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
            <Button
              onClick={() => setShowJoinModal(true)}
              variant="primary"
              icon={User}
            >
              Be the first to join!
            </Button>
          }
        />
      )}

      {/* Additional Ladder Info */}
      {players.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Ladder Rules Reminder</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Players can challenge anyone above them on the ladder</li>
            <li>• Challenges must be completed within 3 weeks</li>
            <li>• Winners move to the loser's position (if higher)</li>
            <li>• Both players earn participation points for playing</li>
            <li>• 3 participation points allows automatic position advancement</li>
          </ul>
        </div>
      )}

      {/* Join Ladder Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setNewPlayerName('');
          setNameError('');
        }}
        title="Join the Ladder"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Enter your name to join the ladder. You'll start at position #{players.length + 1}.
          </p>
          
          <Input
            label="Player Name"
            value={newPlayerName}
            onChange={handleNameChange}
            placeholder="Enter your full name"
            required
          />
          
          {nameError && (
            <div className="text-red-600 text-sm">{nameError}</div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleJoinLadder}
              variant="success"
              disabled={!newPlayerName.trim()}
              className="flex-1"
            >
              Join Ladder
            </Button>
            <Button
              onClick={() => {
                setShowJoinModal(false);
                setNewPlayerName('');
                setNameError('');
              }}
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