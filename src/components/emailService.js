// Email notification service with scheduling logic
export const EmailService = {
  // Send immediate challenge notification
  sendChallengeCreatedEmail: (challengerName, challengedEmail, challengedName, appUrl = window.location.origin) => {
    console.log(`📧 CHALLENGE NOTIFICATION EMAIL`);
    console.log(`TO: ${challengedEmail}`);
    console.log(`SUBJECT: New Squash Challenge from ${challengerName}`);
    console.log(`
Dear ${challengedName},

You have been challenged to a squash match by ${challengerName} on the Nordea HH Squash Ladder.

IMPORTANT: You have 21 days to respond to this challenge or it will automatically expire.

Click here to respond: ${appUrl}

Challenge Details:
- Challenger: ${challengerName}
- Response Deadline: 21 days from today
- If accepted, match must be played within 21 days

Please log in to accept or decline this challenge.

Best regards,
Nordea HH Squash Ladder System
    `);
    return { sent: true, timestamp: new Date().toISOString() };
  },

  // Send 1-week reminder for unaccepted challenges
  sendChallengeReminderEmail: (challengerName, challengedEmail, challengedName, daysRemaining) => {
    console.log(`📧 CHALLENGE REMINDER EMAIL (1 Week)`);
    console.log(`TO: ${challengedEmail}`);
    console.log(`SUBJECT: Reminder: Squash Challenge from ${challengerName} - ${daysRemaining} days left`);
    console.log(`
Dear ${challengedName},

This is a reminder that you have an outstanding squash challenge from ${challengerName}.

⏰ Time Remaining: ${daysRemaining} days to respond
⚠️  Action Required: Please accept or decline this challenge

If you don't respond within ${daysRemaining} days, the challenge will automatically expire.

Click here to respond: ${window.location.origin}

Nordea HH Squash Ladder System
    `);
    return { sent: true, timestamp: new Date().toISOString() };
  },

  // Send 2-week reminder for unplayed matches (1 week left)
  sendMatchReminderEmail: (player1Email, player2Email, player1Name, player2Name, daysRemaining) => {
    const emails = [player1Email, player2Email];
    const names = [player1Name, player2Name];
    
    emails.forEach((email, index) => {
      const playerName = names[index];
      const opponentName = names[1 - index];
      
      console.log(`📧 MATCH REMINDER EMAIL (2 Weeks - Final Week)`);
      console.log(`TO: ${email}`);
      console.log(`SUBJECT: URGENT: Squash Match vs ${opponentName} - Only ${daysRemaining} days left!`);
      console.log(`
Dear ${playerName},

🚨 URGENT REMINDER 🚨

Your accepted squash match against ${opponentName} must be played within the next ${daysRemaining} days.

⏰ DEADLINE: ${daysRemaining} days remaining
📝 IMPORTANT: Match results must be recorded within 24 hours after the 3-week deadline

If the match is not played and recorded by the deadline, both players may face penalties according to ladder rules.

Click here to record your match: ${window.location.origin}

Please coordinate with ${opponentName} immediately to schedule your match.

Nordea HH Squash Ladder System
      `);
    });
    
    return { sent: true, timestamp: new Date().toISOString(), recipients: emails };
  },

  // Send final deadline warning
  sendFinalDeadlineEmail: (player1Email, player2Email, player1Name, player2Name) => {
    console.log(`📧 FINAL DEADLINE EMAIL - 24 HOUR GRACE PERIOD`);
    console.log(`TO: ${player1Email}, ${player2Email}`);
    console.log(`
🚨 FINAL NOTICE 🚨

Your squash match deadline has passed. You have 24 HOURS to record the match result or face penalties.

Match: ${player1Name} vs ${player2Name}
Deadline: EXPIRED
Grace Period: 24 hours remaining

Record your match immediately: ${window.location.origin}

Nordea HH Squash Ladder System
    `);
    return { sent: true, timestamp: new Date().toISOString() };
  }
};
