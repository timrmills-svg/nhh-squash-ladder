import React from 'react';
import { Trophy, Users, Target, Activity, BarChart3, Lock, BookOpen } from 'lucide-react';
import AuthComponent from './auth';

const LoginWithGuide = ({ currentUser, onAuthStateChange }) => {
  if (currentUser) {
    return null; // Don't show this component if user is logged in
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Nordea HH Squashladder</h1>
                <p className="text-blue-200 text-xs">Professional Squash Competition Platform</p>
              </div>
            </div>
            
            {<AuthComponent onAuthStateChange={onAuthStateChange} currentUser={currentUser} />}
          </div>
        </div>
      </nav>

      {/* Main Content - Split Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Side - Welcome & Key Features */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NHH Squash Ladder</h2>
              <p className="text-gray-600 text-lg mb-6">
                Join Nordea House Hamburg's competitive squash ladder. Challenge colleagues, 
                track your progress, and climb the rankings in our professional tournament system.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-bold text-2xl text-blue-600">Active</div>
                  <div className="text-gray-600 text-sm">Community</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="font-bold text-2xl text-green-600">Live</div>
                  <div className="text-gray-600 text-sm">Matches</div>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Automatic email notifications for challenges</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Real-time ladder rankings and statistics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Mobile-friendly responsive design</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Official LSRC tournament rules</span>
                </div>
              </div>
            </div>

            {/* Quick Start Steps */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Get Started in 3 Steps</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                  <span>Create your account with email & password</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                  <span>Join the ladder and see current rankings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                  <span>Challenge players above you and start playing!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Embedded User Guide */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">How It Works - Interactive Guide</h3>
            </div>
            
            {/* Scrollable Guide Container */}
            <div className="h-96 overflow-y-auto p-6">
              <div className="space-y-6">
                
                {/* Guide Step 1 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h4 className="font-semibold text-gray-900">Challenge System</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Challenge any player ranked above you on the ladder.</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-xs text-gray-600">Create<br/>Challenge</div>
                      </div>
                      <div className="text-blue-500 text-xl">→</div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
                          <span className="text-green-600">📧</span>
                        </div>
                        <div className="text-xs text-gray-600">Email<br/>Sent</div>
                      </div>
                      <div className="text-blue-500 text-xl">→</div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                          <span className="text-purple-600">✓</span>
                        </div>
                        <div className="text-xs text-gray-600">Response<br/>Required</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guide Step 2 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Automatic emails keep everyone informed of challenges and deadlines.</p>
                  <div className="bg-green-50 p-3 rounded-lg text-sm">
                    <div className="font-medium text-green-800 mb-1">📧 You'll receive emails for:</div>
                    <ul className="text-green-700 space-y-1">
                      <li>• New challenge notifications</li>
                      <li>• Weekly reminder alerts</li>
                      <li>• Match deadline warnings</li>
                      <li>• Result confirmations</li>
                    </ul>
                  </div>
                </div>

                {/* Guide Step 3 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <h4 className="font-semibold text-gray-900">Match Recording</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Record detailed match results with game-by-game scoring.</p>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-purple-600">3-1</div>
                        <div className="text-xs text-gray-600">Match Score</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">5</div>
                        <div className="text-xs text-gray-600">Games Max</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">11</div>
                        <div className="text-xs text-gray-600">Points/Game</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guide Step 4 */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <h4 className="font-semibold text-gray-900">Ladder Rankings</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Watch your position change as you win matches and climb the ladder.</p>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">#3 Sarah Johnson</span>
                        <span className="text-green-600">↑ +1</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">#4 Mike Chen</span>
                        <span className="text-red-600">↓ -1</span>
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-2">
                        Winner moves up, loser moves down
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guide Step 5 */}
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <h4 className="font-semibold text-gray-900">Statistics & Progress</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Track your performance with detailed statistics and match history.</p>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <BarChart3 className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Win/Loss Ratios</div>
                      </div>
                      <div className="text-center">
                        <Activity className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <div className="text-xs text-gray-600">Match History</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Rules */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Key Rules to Remember</h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Only challenge players above your current position</li>
                    <li>• 3-week deadline to respond to challenges</li>
                    <li>• 3-week deadline to play accepted matches</li>
                    <li>• Best of 5 games, first to 11 points each game</li>
                    <li>• Must win by 2 points if opponent has 9+ points</li>
                  </ul>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center">
                  <h4 className="font-bold mb-2">Ready to Start Playing?</h4>
                  <p className="text-sm opacity-90 mb-3">
                    Join the NHH Squash Ladder and begin your competitive journey today!
                  </p>
                  <div className="text-sm">
                    👆 Sign up using the login button above
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWithGuide;
