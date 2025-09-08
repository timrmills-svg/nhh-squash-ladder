import React, { useState, useEffect } from 'react';
import { Trophy, Target, Activity, TrendingUp, User, Users } from 'lucide-react';

// Import your modular components
import AuthComponent, { useAuth } from './auth.js';
import LadderView from './ladder.js';
import ChallengesView from './challenges.js';
import { 
  NavigationIcons, 
  StatCard, 
  updatePositionsAfterMatch,
  createNewChallenge,
  createNewMatch,
  getDaysRemaining
} from './shared.js';

const SquashLadderApp = () => {
  // Authentication state
  const { currentUser, updateAuthState } = useAuth();
  
  // Navigation state
  const [currentView, setCurrentView] = useState('ladder');
  
  // App data state
  const [players, setPlayers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [matches, setMatches] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);

  // Navigation items
  const navigationItems = [
    { key: 'ladder', label: 'Ladder', icon: Trophy, requiresAuth: false },
    { key: 'challenges', label: 'Challenges', icon: Target, requiresAuth: true },
    { key: 'matches', label: 'Matches', icon: Activity, requiresAuth: true },
    { key: 'stats', label: 'Statistics', icon: TrendingUp, requiresAuth: false },
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    loadAppData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      saveAppData();
    }
  }, [players, challenges, matches, isLoading]);

  // Auto-expire challenges
  useEffect(() => {
    const interval = setInterval(() => {
      checkExpiredChallenges();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [challenges]);

  // Redirect to ladder if user logs out and on a protected page
  useEffect(() => {
    if (!currentUser) {
      const currentNavItem = navigationItems.find(item => item.key === currentView);
      if (currentNavItem?.requiresAuth) {
        setCurrentView('ladder');
      }
    }
  }, [currentUser, currentView]);

  const loadAppData = () => {
    try {
      const savedPlayers = localStorage.getItem('squash_ladder_players');
      const savedChallenges = localStorage.getItem('squash_ladder_challenges');
      const savedMatches = localStorage.getItem('squash_ladder_matches');

      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      } else {
        // Initialize with sample data for demo
        const samplePlayers = [
          { 
            id: 1, 
            name: 'John Smith', 
            position: 1, 
            participationPoints: 2, 
            wins: 8, 
            losses: 2, 
            joinDate: '2024-01-15',
            isActive: true 
          },
          { 
            id: 2, 
            name: 'Sarah Wilson', 
            position: 2, 
            participationPoints: 1, 
            wins: 6, 
            losses: 3, 
            joinDate: '2024-01-20',
            isActive: true 
          },
          { 
            id: 3, 
            name: 'Mike Johnson', 
            position: 3, 
            participationPoints: 3, 
            wins: 5, 
            losses: 4, 
            joinDate: '2024-02-01',
            isActive: true 
          },
        ];
        setPlayers(samplePlayers);
      }

      if (savedChallenges) {
        setChallenges(JSON.parse(savedChallenges));
      }

      if (savedMatches) {
        setMatches(JSON.parse(savedMatches));
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppData = () => {
    try {
      localStorage.setItem('squash_ladder_players', JSON.stringify(players));
      localStorage.setItem('squash_ladder_challenges', JSON.stringify(challenges));
      localStorage.setItem('squash_ladder_matches', JSON.stringify(matches));
    } catch (error) {
      console.error('Error saving app data:', error);
    }
  };

  const checkExpiredChallenges = () => {
    const now = new Date();
    const expiredChallenges = challenges.filter(challenge => {
      const expiryDate = new Date(challenge.expiryDate);
      return challenge.status === 'pending' && expiryDate < now;
    });

    if (expiredChallenges.length > 0) {
      setChallenges(prev => 
        prev.map(challenge => {
          const expiryDate = new Date(challenge.expiryDate);
          if (challenge.status === 'pending' && expiryDate < now) {
            return { ...challenge, status: 'expired' };
          }
          return challenge;
        })
      );
    }
  };

  // Challenge handling functions
  const handleCreateChallenge = (challengerId, challengedId) => {
    if (!currentUser) {
      alert('Please login to create challenges');
      return;
    }

    // Validate challenge rules
    const challenger = players.find(p => p.id === challengerId);
    const challenged = players.find(p => p.id === challengedId);

    if (!challenger || !challenged) {
      alert('Invalid player selection');
      return;
    }

    if (challenger.position >= challenged.position) {
      alert('You can only challenge players above you on the ladder');
      return;
    }

    // Check if challenge already exists
    const existingChallenge = challenges.find(c => 
      c.challengerId === challengerId && 
      c.challengedId === challengedId && 
      c.status === 'pending'
    );

    if (existingChallenge) {
      alert('A challenge already exists between these players');
      return;
    }

    const newChallenge = createNewChallenge(challengerId, challengedId);
    setChallenges(prev => [...prev, newChallenge]);
  };

  const handleChallengeResponse = (challengeId, response) => {
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, status: response }
          : challenge
      )
    );
  };

  const handleRecordMatch = (challengeId, player1Score, player2Score, isWalkover = false) => {
    if (!currentUser) {
      alert('Please login to record matches');
      return;
    }

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) {
      alert('Challenge not found');
      return;
    }

    const player1 = players.find(p => p.id === challenge.challengerId);
    const player2 = players.find(p => p.id === challenge.challengedId);

    if (!player1 || !player2) {
      alert('Players not found');
      return;
    }

    // Determine winner
    let winnerId, loserId;
    if (isWalkover) {
      winnerId = challenge.challengerId; // Challenger wins by walkover
      loserId = challenge.challengedId;
    } else {
      const score1 = parseInt(player1Score);
      const score2 = parseInt(player2Score);
      
      if (score1 === score2) {
        alert('Match cannot end in a tie');
        return;
      }
      
      winnerId = score1 > score2 ? challenge.challengerId : challenge.challengedId;
      loserId = winnerId === challenge.challengerId ? challenge.challengedId : challenge.challengerId;
    }

    // Create match record
    const newMatch = createNewMatch(
      challenge.challengerId,
      challenge.challengedId,
      player1Score,
      player2Score,
      isWalkover
    );

    // Update player positions and stats
    const updatedPlayers = updatePositionsAfterMatch(players, winnerId, loserId);

    setMatches(prev => [...prev, newMatch]);
    setPlayers(updatedPlayers);
    
    // Remove the challenge
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
  };

  // Navigation handling
  const handleNavigation = (view) => {
    const navItem = navigationItems.find(item => item.key === view);
    
    if (navItem?.requiresAuth && !currentUser) {
      alert('Please login to access this feature');
      return;
    }
    
    setCurrentView(view);
  };

  // Challenge initiation from ladder
  const handleChallengePlayer = (playerId) => {
    if (!currentUser) {
      alert('Please login to create challenges');
      return;
    }

    // Find current user's player record
    const currentPlayerRecord = players.find(p => 
      p.name.toLowerCase() === currentUser.displayName.toLowerCase()
    );

    if (!currentPlayerRecord) {
      alert('You need to join the ladder first before creating challenges');
      return;
    }

    handleCreateChallenge(currentPlayerRecord.id, playerId);
    setCurrentView('challenges');
  };

  // Statistics calculations
  const getStatistics = () => {
    const activePlayers = players.filter(p => p.isActive);
    const activeChallenges = challenges.filter(c => c.status === 'pending');
    const currentLeader = activePlayers.find(p => p.position === 1);
    
    return {
      totalPlayers: activePlayers.length,
      activeChallenges: activeChallenges.length,
      matchesPlayed: matches.length,
      currentLeader: currentLeader?.name || 'N/A'
    };
  };

  // Render different views
  const renderCurrentView = () => {
    switch (currentView) {
      case 'ladder':
        return (
          <LadderView
            players={players}
            setPlayers={setPlayers}
            onChallenge={handleChallengePlayer}
            currentUser={currentUser}
          />
        );
        
      case 'challenges':
        return (
          <ChallengesView
            challenges={challenges}
            players={players}
            currentUser={currentUser}
            onCreateChallenge={handleCreateChallenge}
            onChallengeResponse={handleChallengeResponse}
            onRecordMatch={handleRecordMatch}
          />
        );
        
      case 'matches':
        return <MatchesView matches={matches} players={players} />;
        
      case 'stats':
        return <StatisticsView players={players} matches={matches} challenges={challenges} />;
        
      default:
        return <LadderView players={players} setPlayers={setPlayers} onChallenge={handleChallengePlayer} />;
    }
  };

  const stats = getStatistics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Squash Ladder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">LSRC Squash Ladder</h1>
                <p className="text-blue-200 text-xs">
                  {stats.totalPlayers} players • {stats.activeChallenges} active challenges
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navigationItems.map(({ key, label, icon: Icon, requiresAuth }) => {
                const isActive = currentView === key;
                const isDisabled = requiresAuth && !currentUser;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleNavigation(key)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-800 text-white' 
                        : isDisabled
                        ? 'text-blue-300 cursor-not-allowed'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                    title={isDisabled ? 'Login required' : ''}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Auth Component */}
            <AuthComponent
              onAuthStateChange={updateAuthState}
              currentUser={currentUser}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Players" 
            value={stats.totalPlayers} 
            icon={Users} 
            color="blue" 
          />
          <StatCard 
            title="Active Challenges" 
            value={stats.activeChallenges} 
            icon={Target} 
            color="orange" 
          />
          <StatCard 
            title="Matches Played" 
            value={stats.matchesPlayed} 
            icon={Activity} 
            color="purple" 
          />
          <StatCard 
            title="Current Leader" 
            value={stats.currentLeader} 
            icon={Trophy} 
            color="yellow" 
          />
        </div>

        {/* Current View */}
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            LSRC Squash Ladder • Following official LSRC rules • 
            {currentUser ? ` Logged in as ${currentUser.displayName}` : ' Login to participate'}
          </p>
        </div>
      </footer>
    </div>
  );
};

// Simple Matches View Component (since we haven't created matches.js yet)
const MatchesView = ({ matches, players }) => {
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Match History</h2>
      
      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.slice().reverse().map((match) => (
            <div key={match.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{getPlayerName(match.player1Id)}</span>
                  <span className="text-2xl font-bold">{match.player1Score}</span>
                  <span className="text-gray-500">-</span>
                  <span className="text-2xl font-bold">{match.player2Score}</span>
                  <span className="font-medium">{getPlayerName(match.player2Id)}</span>
                  {match.isWalkover && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      Walkover
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(match.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No matches recorded yet</p>
        </div>
      )}
    </div>
  );
};

// Simple Statistics View Component
const StatisticsView = ({ players, matches, challenges }) => {
  const activePlayers = players.filter(p => p.isActive);
  const sortedByWinRate = [...activePlayers].sort((a, b) => {
    const aRate = a.wins / (a.wins + a.losses) || 0;
    const bRate = b.wins / (b.wins + b.losses) || 0;
    return bRate - aRate;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ladder Statistics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate Rankings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Win Rate Rankings</h3>
          <div className="space-y-3">
            {sortedByWinRate.map((player, index) => {
              const winRate = player.wins + player.losses > 0 
                ? Math.round((player.wins / (player.wins + player.losses)) * 100)
                : 0;
              
              return (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8">#{index + 1}</span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{player.wins}W - {player.losses}L</span>
                    <span className={`font-medium ${
                      winRate >= 75 ? 'text-green-600' :
                      winRate >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {winRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {matches.slice(-5).reverse().map((match) => (
              <div key={match.id} className="text-sm">
                <div className="flex justify-between items-center">
                  <span>
                    Match: {players.find(p => p.id === match.player1Id)?.name} vs{' '}
                    {players.find(p => p.id === match.player2Id)?.name}
                  </span>
                  <span className="text-gray-500">
                    {new Date(match.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {matches.length === 0 && (
              <p className="text-gray-500 text-center">No recent matches</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquashLadderApp;