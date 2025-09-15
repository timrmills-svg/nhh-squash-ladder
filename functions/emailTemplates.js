/**
 * Email template utilities for NHH Squash Ladder notifications
 * Provides HTML email templates for various squash ladder events
 */

/**
 * Generates HTML template for challenge notifications
 * @param {string} challengerName - Name of the player issuing challenge
 * @param {string} challengedName - Name of the player being challenged
 * @param {string} challengerPosition - Current ladder position of challenger
 * @param {string} challengedPosition - Current ladder position of challenged
 * @param {string} deadline - Challenge deadline date
 * @return {string} HTML email template
 */
function getChallengeTemplate(challengerName, challengedName,
    challengerPosition, challengedPosition, deadline) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NHH Squash Ladder Challenge</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                margin: 0; 
                padding: 20px; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 0 10px rgba(0,0,0,0.1); 
            }
            .header { 
                text-align: center; 
                padding: 20px 0; 
                border-bottom: 3px solid #2563eb; 
                margin-bottom: 30px; 
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #2563eb; 
                margin-bottom: 10px; 
            }
            .challenge-box { 
                background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                color: white; 
                padding: 25px; 
                border-radius: 8px; 
                text-align: center; 
                margin: 20px 0; 
            }
            .player-info { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin: 20px 0; 
                padding: 15px; 
                background: #f8fafc; 
                border-radius: 8px; 
            }
            .player { 
                text-align: center; 
                flex: 1; 
            }
            .vs { 
                font-size: 24px; 
                font-weight: bold; 
                color: #64748b; 
                margin: 0 20px; 
            }
            .position { 
                font-size: 18px; 
                font-weight: bold; 
                color: #2563eb; 
            }
            .deadline { 
                background: #fef3c7; 
                border: 1px solid #f59e0b; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 20px 0; 
                text-align: center; 
            }
            .action-buttons { 
                text-align: center; 
                margin: 30px 0; 
            }
            .btn { 
                display: inline-block; 
                padding: 12px 25px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: bold; 
                margin: 0 10px; 
                transition: all 0.3s ease; 
            }
            .btn-accept { 
                background: #10b981; 
                color: white; 
            }
            .btn-decline { 
                background: #ef4444; 
                color: white; 
            }
            .btn:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
            }
            .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid #e5e7eb; 
                color: #6b7280; 
                font-size: 14px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏆 NHH Squash Ladder</div>
                <div>Nordea House Hamburg</div>
            </div>
            
            <div class="challenge-box">
                <h2 style="margin: 0 0 10px 0;">Challenge Issued!</h2>
                <p style="margin: 0; font-size: 18px;">
                    You have been challenged to a squash match
                </p>
            </div>
            
            <div class="player-info">
                <div class="player">
                    <div style="font-size: 16px; color: #64748b;">
                        Challenger
                    </div>
                    <div style="font-size: 20px; font-weight: bold; 
                        margin: 5px 0;">
                        ${challengerName}
                    </div>
                    <div class="position">Position #${challengerPosition}</div>
                </div>
                <div class="vs">VS</div>
                <div class="player">
                    <div style="font-size: 16px; color: #64748b;">
                        Challenged
                    </div>
                    <div style="font-size: 20px; font-weight: bold; 
                        margin: 5px 0;">
                        ${challengedName}
                    </div>
                    <div class="position">Position #${challengedPosition}</div>
                </div>
            </div>
            
            <div class="deadline">
                <strong>⏰ Deadline:</strong> 
                You must respond by ${deadline}
            </div>
            
            <div class="action-buttons">
                <a href="https://nhh-squash-ladder.vercel.app" 
                   class="btn btn-accept">
                    ✅ Accept Challenge
                </a>
                <a href="https://nhh-squash-ladder.vercel.app" 
                   class="btn btn-decline">
                    ❌ Decline Challenge
                </a>
            </div>
            
            <div style="background: #f1f5f9; padding: 20px; 
                border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #334155;">
                    📋 What happens next?
                </h3>
                <ul style="color: #64748b; margin: 0;">
                    <li>Log into the app to accept or decline</li>
                    <li>If accepted, arrange a match time</li>
                    <li>Play your match within 3 weeks</li>
                    <li>Record the result in the app</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>This email was sent from the NHH Squash Ladder system</p>
                <p>Visit the app: 
                   <a href="https://nhh-squash-ladder.vercel.app">
                     nhh-squash-ladder.vercel.app
                   </a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generates HTML template for match result notifications
 * @param {string} winnerName - Name of the match winner
 * @param {string} loserName - Name of the match loser
 * @param {string} score - Match score (e.g., "3-1")
 * @param {Array} gameScores - Individual game scores
 * @param {string} newWinnerPosition - Winner's new ladder position
 * @param {string} newLoserPosition - Loser's new ladder position
 * @return {string} HTML email template
 */
function getMatchResultTemplate(winnerName, loserName, score, gameScores,
    newWinnerPosition, newLoserPosition) {
  const gameScoresList = gameScores.map((game) =>
    `<li>${game}</li>`).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NHH Squash Ladder Match Result</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                margin: 0; 
                padding: 20px; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 0 10px rgba(0,0,0,0.1); 
            }
            .header { 
                text-align: center; 
                padding: 20px 0; 
                border-bottom: 3px solid #10b981; 
                margin-bottom: 30px; 
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #10b981; 
                margin-bottom: 10px; 
            }
            .result-box { 
                background: linear-gradient(135deg, #10b981, #047857); 
                color: white; 
                padding: 25px; 
                border-radius: 8px; 
                text-align: center; 
                margin: 20px 0; 
            }
            .match-details { 
                background: #f8fafc; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
            }
            .score-display { 
                font-size: 36px; 
                font-weight: bold; 
                color: #10b981; 
                text-align: center; 
                margin: 20px 0; 
            }
            .positions { 
                display: flex; 
                justify-content: space-between; 
                margin: 20px 0; 
            }
            .position-change { 
                background: #ecfdf5; 
                border: 1px solid #10b981; 
                padding: 15px; 
                border-radius: 8px; 
                text-align: center; 
                flex: 1; 
                margin: 0 10px; 
            }
            .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid #e5e7eb; 
                color: #6b7280; 
                font-size: 14px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏆 NHH Squash Ladder</div>
                <div>Nordea House Hamburg</div>
            </div>
            
            <div class="result-box">
                <h2 style="margin: 0 0 10px 0;">Match Complete!</h2>
                <p style="margin: 0; font-size: 18px;">
                    A match result has been recorded
                </p>
            </div>
            
            <div class="score-display">
                ${winnerName} defeats ${loserName}<br>
                ${score}
            </div>
            
            <div class="match-details">
                <h3 style="margin-top: 0; color: #334155;">
                    📊 Game-by-Game Scores:
                </h3>
                <ul style="color: #64748b;">
                    ${gameScoresList}
                </ul>
            </div>
            
            <div class="positions">
                <div class="position-change">
                    <h4 style="margin-top: 0; color: #10b981;">Winner</h4>
                    <div style="font-size: 18px; font-weight: bold;">
                        ${winnerName}
                    </div>
                    <div style="color: #64748b; margin: 5px 0;">
                        New Position: #${newWinnerPosition}
                    </div>
                </div>
                <div class="position-change">
                    <h4 style="margin-top: 0; color: #ef4444;">Loser</h4>
                    <div style="font-size: 18px; font-weight: bold;">
                        ${loserName}
                    </div>
                    <div style="color: #64748b; margin: 5px 0;">
                        New Position: #${newLoserPosition}
                    </div>
                </div>
            </div>
            
            <div style="background: #f1f5f9; padding: 20px; 
                border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #334155;">
                    📈 Ladder Update
                </h3>
                <p style="color: #64748b; margin: 0;">
                    The ladder positions have been automatically updated. 
                    Visit the app to see the current standings and stats.
                </p>
            </div>
            
            <div class="footer">
                <p>This email was sent from the NHH Squash Ladder system</p>
                <p>Visit the app: 
                   <a href="https://nhh-squash-ladder.vercel.app">
                     nhh-squash-ladder.vercel.app
                   </a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generates HTML template for weekly ladder summary
 * @param {Array} topPlayers - Array of top 5 players with stats
 * @param {Array} recentMatches - Array of recent matches played
 * @param {Object} weeklyStats - Weekly statistics summary
 * @return {string} HTML email template
 */
function getWeeklySummaryTemplate(topPlayers, recentMatches, weeklyStats) {
  const topPlayersList = topPlayers.map((player, index) =>
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        #${index + 1}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        ${player.name}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        ${player.wins}-${player.losses}
      </td>
    </tr>`).join("");

  const recentMatchesList = recentMatches.map((match) =>
    `<li style="margin: 5px 0; color: #64748b;">
      ${match.winner} defeated ${match.loser} (${match.score})
    </li>`).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NHH Squash Ladder Weekly Summary</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                margin: 0; 
                padding: 20px; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 0 10px rgba(0,0,0,0.1); 
            }
            .header { 
                text-align: center; 
                padding: 20px 0; 
                border-bottom: 3px solid #8b5cf6; 
                margin-bottom: 30px; 
            }
            .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #8b5cf6; 
                margin-bottom: 10px; 
            }
            .summary-box { 
                background: linear-gradient(135deg, #8b5cf6, #7c3aed); 
                color: white; 
                padding: 25px; 
                border-radius: 8px; 
                text-align: center; 
                margin: 20px 0; 
            }
            .stats-grid { 
                display: grid; 
                grid-template-columns: repeat(3, 1fr); 
                gap: 15px; 
                margin: 20px 0; 
            }
            .stat-box { 
                background: #f8fafc; 
                padding: 15px; 
                border-radius: 8px; 
                text-align: center; 
                border: 1px solid #e5e7eb; 
            }
            .stat-number { 
                font-size: 24px; 
                font-weight: bold; 
                color: #8b5cf6; 
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
            }
            th { 
                background: #8b5cf6; 
                color: white; 
                padding: 12px 8px; 
                text-align: left; 
            }
            .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid #e5e7eb; 
                color: #6b7280; 
                font-size: 14px; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📊 NHH Squash Ladder</div>
                <div>Weekly Summary Report</div>
            </div>
            
            <div class="summary-box">
                <h2 style="margin: 0 0 10px 0;">This Week's Activity</h2>
                <p style="margin: 0; font-size: 18px;">
                    Here's what happened on the ladder this week
                </p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number">${weeklyStats.totalMatches}</div>
                    <div style="color: #64748b;">Matches Played</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${weeklyStats.activePlayers}</div>
                    <div style="color: #64748b;">Active Players</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${weeklyStats.posChanges}</div>
                    <div style="color: #64748b;">Position Changes</div>
                </div>
            </div>
            
            <h3 style="color: #334155; margin: 30px 0 15px 0;">
                🏆 Current Top 5
            </h3>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Record</th>
                    </tr>
                </thead>
                <tbody>
                    ${topPlayersList}
                </tbody>
            </table>
            
            <h3 style="color: #334155; margin: 30px 0 15px 0;">
                🎾 Recent Matches
            </h3>
            <ul style="list-style: none; padding: 0;">
                ${recentMatchesList}
            </ul>
            
            <div style="background: #f1f5f9; padding: 20px; 
                border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="margin-top: 0; color: #334155;">
                    Keep Playing!
                </h3>
                <p style="color: #64748b; margin-bottom: 15px;">
                    Ready for your next match? Log in to issue a challenge.
                </p>
                <a href="https://nhh-squash-ladder.vercel.app" 
                   style="display: inline-block; background: #8b5cf6; 
                   color: white; padding: 12px 25px; text-decoration: none; 
                   border-radius: 6px; font-weight: bold;">
                    Visit Ladder
                </a>
            </div>
            
            <div class="footer">
                <p>This email was sent from the NHH Squash Ladder system</p>
                <p>Visit the app: 
                   <a href="https://nhh-squash-ladder.vercel.app">
                     nhh-squash-ladder.vercel.app
                   </a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = {
  getChallengeTemplate,
  getMatchResultTemplate,
  getWeeklySummaryTemplate,
};

/**
 * Gets email content based on data type
 * @param {Object} data - The notification data
 * @return {Object} Email content with subject and html
 */
function getEmailContent(data) {
  if (data.type === "challenge") {
    return {
      subject: "NHH Squash Ladder Challenge",
      html: getChallengeTemplate(
          data.challengerName || "Unknown Player",
          data.challengedName || "You",
          data.challengerPosition || "?",
          data.challengedPosition || "?",
          data.deadline || "Soon",
      ),
    };
  }

  // Default test email
  return {
    subject: data.subject || "NHH Squash Ladder Notification",
    html: data.html || `<p>Test: ${data.testData}</p>`,
  };
}

module.exports = {
  getChallengeTemplate,
  getMatchResultTemplate,
  getWeeklySummaryTemplate,
  getEmailContent,
};
