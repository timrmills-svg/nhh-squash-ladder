import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Email notification service with Firebase Cloud Function integration
export const EmailService = {
  // Create notification document in Firestore to trigger Cloud Function
  createNotification: async (notificationData) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        emailSent: false,
        createdAt: new Date().toISOString()
      });
      console.log('✅ Email notification queued:', docRef.id);
      return { success: true, notificationId: docRef.id };
    } catch (error) {
      console.error('❌ Failed to queue email notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send immediate challenge notification
  sendChallengeCreatedEmail: async (challengerName, challengedEmail, challengedName, appUrl = window.location.origin + "/#challenges") => {
    console.log(`📧 Queueing CHALLENGE NOTIFICATION EMAIL for ${challengedEmail}`);
    
    const notificationData = {
      type: 'challenge',
      to: challengedEmail,
      challengerName: challengerName,
      challengedName: challengedName,
      challengerPosition: 'TBD', // You'll need to pass this from the calling code
      challengedPosition: 'TBD', // You'll need to pass this from the calling code
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      appUrl: appUrl
    };

    return await EmailService.createNotification(notificationData);
  },

  // Send 1-week reminder for unaccepted challenges
  sendChallengeReminderEmail: async (challengerName, challengedEmail, challengedName, daysRemaining) => {
    console.log(`📧 Queueing CHALLENGE REMINDER EMAIL for ${challengedEmail}`);
    
    const notificationData = {
      type: 'challenge_reminder',
      to: challengedEmail,
      subject: `Reminder: Squash Challenge from ${challengerName} - ${daysRemaining} days left`,
      html: `
        <h2>Challenge Reminder</h2>
        <p>Dear ${challengedName},</p>
        <p>This is a reminder that you have an outstanding squash challenge from <strong>${challengerName}</strong>.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>⏰ Time Remaining: ${daysRemaining} days to respond</strong><br>
          <strong>⚠️ Action Required: Please accept or decline this challenge</strong>
        </div>
        <p>If you don't respond within ${daysRemaining} days, the challenge will automatically expire.</p>
        <p><a href="${window.location.origin + "/#challenges"}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Respond to Challenge</a></p>
        <p>Best regards,<br>Nordea HH Squash Ladder System</p>
      `
    };

    return await EmailService.createNotification(notificationData);
  },

  // Send 2-week reminder for unplayed matches (1 week left)
  sendMatchReminderEmail: async (player1Email, player2Email, player1Name, player2Name, daysRemaining) => {
    console.log(`📧 Queueing MATCH REMINDER EMAILS for ${player1Name} vs ${player2Name}`);
    
    const results = [];
    const emails = [player1Email, player2Email];
    const names = [player1Name, player2Name];
    
    for (let i = 0; i < emails.length; i++) {
      const playerName = names[i];
      const opponentName = names[1 - i];
      const email = emails[i];
      
      const notificationData = {
        type: 'match_reminder',
        to: email,
        subject: `URGENT: Squash Match vs ${opponentName} - Only ${daysRemaining} days left!`,
        html: `
          <h2 style="color: #dc2626;">🚨 URGENT REMINDER 🚨</h2>
          <p>Dear ${playerName},</p>
          <p>Your accepted squash match against <strong>${opponentName}</strong> must be played within the next <strong>${daysRemaining} days</strong>.</p>
          <div style="background: #fee2e2; border: 1px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>⏰ DEADLINE: ${daysRemaining} days remaining</strong><br>
            <strong>📝 IMPORTANT: Match results must be recorded within 24 hours after the 3-week deadline</strong>
          </div>
          <p>If the match is not played and recorded by the deadline, both players may face penalties according to ladder rules.</p>
          <p><a href="${window.location.origin + "/#challenges"}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Record Your Match</a></p>
          <p>Please coordinate with ${opponentName} immediately to schedule your match.</p>
          <p>Best regards,<br>Nordea HH Squash Ladder System</p>
        `
      };
      
      const result = await EmailService.createNotification(notificationData);
      results.push(result);
    }
    
    return { 
      success: results.every(r => r.success), 
      results: results,
      recipients: emails 
    };
  },

  // Send final deadline warning
  sendFinalDeadlineEmail: async (player1Email, player2Email, player1Name, player2Name) => {
    console.log(`📧 Queueing FINAL DEADLINE EMAILS for ${player1Name} vs ${player2Name}`);
    
    const results = [];
    const emails = [player1Email, player2Email];
    const names = [player1Name, player2Name];
    
    for (let i = 0; i < emails.length; i++) {
      const playerName = names[i];
      const opponentName = names[1 - i];
      const email = emails[i];
      
      const notificationData = {
        type: 'final_deadline',
        to: email,
        subject: `🚨 FINAL NOTICE: Squash Match Deadline EXPIRED - 24 Hour Grace Period`,
        html: `
          <h2 style="color: #dc2626;">🚨 FINAL NOTICE 🚨</h2>
          <p>Dear ${playerName},</p>
          <p>Your squash match deadline has passed. You have <strong>24 HOURS</strong> to record the match result or face penalties.</p>
          <div style="background: #fee2e2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Match: ${player1Name} vs ${player2Name}</strong><br>
            <strong>Deadline: EXPIRED</strong><br>
            <strong>Grace Period: 24 hours remaining</strong>
          </div>
          <p><a href="${window.location.origin + "/#challenges"}" style="background: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">RECORD MATCH IMMEDIATELY</a></p>
          <p>Best regards,<br>Nordea HH Squash Ladder System</p>
        `
      };
      
      const result = await EmailService.createNotification(notificationData);
      results.push(result);
    }
    
    return { 
      success: results.every(r => r.success), 
      results: results 
    };
  },

  // Send match result notification
  sendMatchResultEmail: async (winnerName, loserName, score, gameScores, newWinnerPosition, newLoserPosition, allPlayersEmails) => {
    console.log(`📧 Queueing MATCH RESULT EMAIL for all players`);
    
    const notificationData = {
      type: 'match_result',
      to: 'tim.r.mills@gmail.com', // Broadcast to admin for now - you can modify this
      winnerName: winnerName,
      loserName: loserName,
      score: score,
      gameScores: gameScores,
      newWinnerPosition: newWinnerPosition,
      newLoserPosition: newLoserPosition
    };

    return await EmailService.createNotification(notificationData);
  },

  // Send weekly summary
  sendWeeklySummaryEmail: async (topPlayers, recentMatches, weeklyStats) => {
    console.log(`📧 Queueing WEEKLY SUMMARY EMAIL`);
    
    const notificationData = {
      type: 'weekly_summary',
      to: 'tim.r.mills@gmail.com', // Send to admin for now
      topPlayers: topPlayers,
      recentMatches: recentMatches,
      weeklyStats: weeklyStats
    };

    return await EmailService.createNotification(notificationData);
  }
};