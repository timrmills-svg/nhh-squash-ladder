import React, { useState, useEffect } from 'react';
import { Trophy, Target, Activity, TrendingUp, User, Users, Lock, FileText } from 'lucide-react';

import AuthComponent from './auth';
import LadderView from './ladder';
import ChallengesView from './challenges';
import { 
  StatCard, 
  updatePositionsAfterMatch,
  createNewChallenge,
  createNewMatch,
  getDaysRemaining
} from './shared';

const SquashLadderApp = () => {
  
  const [currentView, setCurrentView] = useState('ladder');
  const [currentUser, setCurrentUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [matches, setMatches] = useState([
    {
      id: 1,
      challengeId: 1001,
      winnerId: 1,
      loserId: 2,
      winnerName: "John",
      loserName: "Alex",
      matchScore: "3-1",
      gameScores: "11-9, 11-7, 9-11, 11-6",
      isWalkover: false,
      date: "2025-09-06",
      winnerPositionBefore: 2,
      loserPositionBefore: 1
    },
    {
      id: 2,
      challengeId: 1002,
      winnerId: 3,
      loserId: 1,
      winnerName: "Maria",
      loserName: "John",
      matchScore: "3-2",
      gameScores: "11-8, 9-11, 11-9, 10-12, 11-7",
      isWalkover: false,
      date: "2025-09-05",
      winnerPositionBefore: 4,
      loserPositionBefore: 1
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const navigationItems = [
    { key: 'ladder', label: 'Ladder', icon: Trophy, requiresAuth: true },
    { key: 'challenges', label: 'Challenges', icon: Target, requiresAuth: true },
    { key: 'matches', label: 'Matches', icon: Activity, requiresAuth: true },
    { key: 'stats', label: 'Statistics', icon: TrendingUp, requiresAuth: true },
    { key: 'rules', label: 'Rules', icon: FileText, requiresAuth: true },
  ];

  useEffect(() => {
    loadAppData();
  }, []);

  useEffect(() => {
    if (!isLoading && currentUser) {
      saveAppData();
    }
  }, [players, challenges, matches, isLoading, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        checkExpiredChallenges();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [challenges, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setCurrentView('login');
    } else {
      setCurrentView('ladder');
    }
  }, [currentUser]);

  const loadAppData = () => {
    try {
      if (currentUser) {
        const savedPlayers = localStorage.getItem('nordea_hh_squash_players');
        const savedChallenges = localStorage.getItem('nordea_hh_squash_challenges');
        const savedMatches = localStorage.getItem('nordea_hh_squash_matches');

        if (savedPlayers) {
          setPlayers(JSON.parse(savedPlayers));
        }

        if (savedChallenges) {
          setChallenges(JSON.parse(savedChallenges));
        }

        if (savedMatches) {
          setMatches(JSON.parse(savedMatches));
        }
      } else {
        setPlayers([]);
        setChallenges([]);
        setMatches([]);
      }
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppData = () => {
    try {
      if (currentUser) {
        localStorage.setItem('nordea_hh_squash_players', JSON.stringify(players));
        localStorage.setItem('nordea_hh_squash_challenges', JSON.stringify(challenges));
        localStorage.setItem('nordea_hh_squash_matches', JSON.stringify(matches));
      }
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

  const getStatistics = () => {
    if (!currentUser) {
      return {
        totalPlayers: 0,
        activeChallenges: 0,
        matchesPlayed: 0,
        currentLeader: 'N/A'
      };
    }

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

  const handleCreateChallenge = (challengerId, challengedId) => {
    if (!currentUser) {
      alert('Please login to create challenges');
    }

    // Check if challenger has any active challenges
    const challengerActiveChallenge = challenges.find(c => 
      (c.challengerId === challengerId || c.challengedId === challengerId) && 
      (c.status === "pending" || c.status === "accepted")
    );
    
    if (challengerActiveChallenge) {
      alert("You already have an active challenge. Complete your current challenge before creating a new one.");
      return;
    }
    
    // Check if challenged player has any active challenges
    const challengedActiveChallenge = challenges.find(c => 
      (c.challengerId === challengedId || c.challengedId === challengedId) && 
      (c.status === "pending" || c.status === "accepted")
    );
    
    if (challengedActiveChallenge) {
      const challenged = players.find(p => p.id === challengedId);
      alert(`${challenged?.name} already has an active challenge and cannot be challenged.`);
      return;
      return;
    }

    const challenger = players.find(p => p.id === challengerId);
    const challenged = players.find(p => p.id === challengedId);

    if (!challenger || !challenged) {
      alert('Invalid player selection');
      return;
    }

    if (challenger.position <= challenged.position) {
      alert('You can only challenge players above you on the ladder');
      return;
    }

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
    console.log("Challenge response:", challengeId, response); setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, status: response }
          : challenge
      )
    );
  };

  const handleRecordMatch = (challengeId, player1Games, player2Games, isWalkover, gameScores = '') => {
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

    let winnerId, loserId;
    if (isWalkover) {
      winnerId = challenge.challengerId;
      loserId = challenge.challengedId;
    } else {
      // Determine winner based on games won (first to 3 games wins)
      if (player1Games > player2Games) {
        winnerId = challenge.challengerId;
        loserId = challenge.challengedId;
      } else {
        winnerId = challenge.challengedId;
        loserId = challenge.challengerId;
      }
    }

    // Create match with new format - use games won as the score
    const matchScore1 = isWalkover ? 3 : (winnerId === challenge.challengerId ? player1Games : player2Games);
    const matchScore2 = isWalkover ? 0 : (winnerId === challenge.challengerId ? player2Games : player1Games);

    const newMatch = createNewMatch(
      challenge.challengerId,
      challenge.challengedId,
      matchScore1.toString(),
      matchScore2.toString(),
      isWalkover,
      gameScores // Pass the detailed game scores
    );

    const updatedPlayers = updatePositionsAfterMatch(players, winnerId, loserId);

    setMatches(prev => [...prev, newMatch]);
    setPlayers(updatedPlayers);
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
  };

  const handleNavigation = (view) => {
    const navItem = navigationItems.find(item => item.key === view);
    
    if (navItem?.requiresAuth && !currentUser) {
      alert('Please login to access this feature');
      return;
    }
    
    setCurrentView(view);
  };

  const handleChallengePlayer = (playerId) => {
    if (!currentUser) {
      alert('Please login to create challenges');
      return;
    }

    const currentPlayerRecord = players.find(p => 
      p.name.toLowerCase() === currentUser.displayName.toLowerCase()
    );

    if (!currentPlayerRecord) {
      alert('You need to join the ladder first before creating challenges');
      return;
    }

    // Check if challenger (current user) has any active challenges
    const challengerActiveChallenge = challenges.find(c => 
      (c.challengerId === currentPlayerRecord.id || c.challengedId === currentPlayerRecord.id) && 
      (c.status === "pending" || c.status === "accepted")
    );
    
    if (challengerActiveChallenge) {
      alert("You already have an active challenge. Complete your current challenge before creating a new one.");
      return;
    }
    
    // Check if challenged player has any active challenges
    const challengedActiveChallenge = challenges.find(c => 
      (c.challengerId === playerId || c.challengedId === playerId) && 
      (c.status === "pending" || c.status === "accepted")
    );
    
    if (challengedActiveChallenge) {
      const challenged = players.find(p => p.id === playerId);
      alert(`${challenged?.name} already has an active challenge and cannot be challenged.`);
      return;
    }

    handleCreateChallenge(currentPlayerRecord.id, playerId);
    setCurrentView('challenges');
  };

  const LoginRequiredView = () => (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">
          Please log in to access the Nordea HH Squashladder.
        </p>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    if (!currentUser) {
      return <LoginRequiredView />;
    }

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
        
      case 'rules':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Nordea HH Squash Ladder Rules</h2>
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div><h3 className="font-semibold mb-2">Challenge System</h3><ul className="text-sm space-y-1"><li>• Players can only challenge others ranked above them</li><li>• Challenges must be accepted within 3 weeks</li><li>• Players may only have one active challenge at a time</li><li>• Challenges automatically expire if not responded to</li></ul></div>
              <div><h3 className="font-semibold mb-2">Match Results</h3><ul className="text-sm space-y-1"><li>• Winner moves to loser's position (if higher)</li><li>• All players between move down one position</li><li>• Both players receive one participation point</li><li>• Walkover victories are permitted</li></ul></div>
              <div><h3 className="font-semibold mb-2">Squash Scoring</h3><ul className="text-sm space-y-1"><li>• Best of 5 games - first to win 3 games wins</li><li>• Each game played to 11 points</li><li>• Must win by 2 points when opponent has 9+ points</li><li>• Games can go beyond 11 if tied at 10-10</li></ul></div>
              <div><h3 className="font-semibold mb-2">Participation Points</h3><ul className="text-sm space-y-1"><li>• Earn 1 point for each match played</li><li>• After 3 points, may move up one position</li><li>• Points reset after advancement</li></ul></div>
            </div>
          </div>
        );
        return <LoginRequiredView />;
    }
  };

  const stats = getStatistics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Nordea HH Squashladder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Nordea HH Squashladder</h1>
                <p className="text-blue-200 text-xs">
                  {currentUser ? 
                    `${stats.totalPlayers} players • ${stats.activeChallenges} active challenges` :
                    'Please login to view ladder data'
                  }
                </p>
              </div>
            </div>

            {currentUser && (
              <div className="flex items-center gap-1">
                {navigationItems.map(({ key, label, icon: Icon }) => {
                  const isActive = currentView === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleNavigation(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-800 text-white' 
                          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <AuthComponent onAuthStateChange={setCurrentUser}
              onAuthStateChange={updateAuthState}
              currentUser={currentUser}
            />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {currentUser && (
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
        )}

        {renderCurrentView()}
      </main>

      <footer className="bg-gray-800 text-gray-300 py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Nordea HH Squashladder • Following official LSRC rules • 
            {currentUser ? ` Logged in as ${currentUser.displayName}` : ' Please login to participate'}
          </p>
        </div>
      </footer>
    </div>
  );
};

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

const StatisticsView = ({ players, matches, challenges }) => {
  const calculatePlayerStats = (playerId) => {
    const playerMatches = matches.filter(m => m.winnerId === playerId || m.loserId === playerId);
    const wins = matches.filter(m => m.winnerId === playerId).length;
    const losses = matches.filter(m => m.loserId === playerId).length;
    
    let gamesWon = 0;
    let gamesLost = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    
    playerMatches.forEach(match => {
      if (!match.gameScores || match.isWalkover) return;
      
      const games = match.gameScores.split(', ');
      games.forEach(game => {
        const [score1, score2] = game.split('-').map(s => parseInt(s.trim()));
        if (isNaN(score1) || isNaN(score2)) return;
        
        if (match.winnerId === playerId) {
          // Player won this match - need to figure out which score is theirs
          const matchScore = match.matchScore.split('-');
          const playerGamesWon = parseInt(matchScore[0]);
          const opponentGamesWon = parseInt(matchScore[1]);
          
          // For now, assume player scores are represented consistently
          pointsFor += score1;
          pointsAgainst += score2;
          if (score1 > score2) gamesWon++; else gamesLost++;
        } else {
          pointsFor += score2;
          pointsAgainst += score1;
          if (score2 > score1) gamesWon++; else gamesLost++;
        }
      });
    });
    
    return {
      matches: playerMatches.length,
      wins,
      losses,
      winRate: wins + losses > 0 ? (wins / (wins + losses) * 100).toFixed(1) : '0.0',
      gamesWon,
      gamesLost,
      gameWinRate: gamesWon + gamesLost > 0 ? (gamesWon / (gamesWon + gamesLost) * 100).toFixed(1) : '0.0',
      pointsFor,
      pointsAgainst,
      pointsDiff: pointsFor - pointsAgainst
    };
  };

  const playerStats = players.map(player => ({
    ...player,
    stats: calculatePlayerStats(player.id)
  }));

  const activePlayers = playerStats.filter(p => p.isActive !== false);
  const recentMatches = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ladder Statistics</h2>
        <div className="text-sm text-gray-500">
          {matches.length} total matches played
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{players.length}</div>
          <div className="text-sm text-gray-600">Total Players</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">{matches.length}</div>
          <div className="text-sm text-gray-600">Matches Played</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-orange-600">{challenges.filter(c => c.status === 'accepted').length}</div>
          <div className="text-sm text-gray-600">Active Matches</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">
            {matches.reduce((total, match) => {
              if (!match.gameScores || match.isWalkover) return total;
              return total + match.gameScores.split(', ').length;
            }, 0)}
          </div>
          <div className="text-sm text-gray-600">Games Played</div>
        </div>
      </div>

      {/* Player Statistics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Player Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W-L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Games W-L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points +/-</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activePlayers.sort((a, b) => a.position - b.position).map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{player.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{player.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.stats.matches}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.stats.wins}-{player.stats.losses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`${parseFloat(player.stats.winRate) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {player.stats.winRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.stats.gamesWon}-{player.stats.gamesLost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`${parseFloat(player.stats.gameWinRate) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {player.stats.gameWinRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`${player.stats.pointsDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {player.stats.pointsDiff >= 0 ? '+' : ''}{player.stats.pointsDiff}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Matches</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentMatches.map((match) => (
              <div key={match.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{match.winnerName}</span>
                    <span className="text-gray-500"> defeats </span>
                    <span className="font-medium text-gray-900">{match.loserName}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {match.isWalkover ? 'Walkover' : match.matchScore}
                  </div>
                  {match.gameScores && !match.isWalkover && (
                    <div className="text-xs text-gray-400">({match.gameScores})</div>
                  )}
                </div>
                <div className="text-sm text-gray-500">{match.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-300">📊</div>
          <p>No match statistics available yet</p>
          <p className="text-sm">Statistics will appear once matches are recorded</p>
        </div>
      )}
    </div>
  );
};

export default SquashLadderApp;
