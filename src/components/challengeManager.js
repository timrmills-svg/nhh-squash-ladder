import { EmailService } from './emailService';

export const ChallengeManager = {
  // Check if player can create/receive new challenges
  canPlayerChallenge: (playerId, challenges) => {
    // Block if player has any accepted challenges (matches pending)
    const hasAcceptedChallenge = challenges.some(c => 
      (c.challengerId === playerId || c.challengedId === playerId) && 
      c.status === 'accepted'
    );
    
    if (hasAcceptedChallenge) {
      return {
        canChallenge: false,
        reason: 'You have an accepted challenge that must be played first. Complete your current match before creating new challenges.'
      };
    }
    
    return { canChallenge: true };
  },

  // Create challenge with email notification
  createChallenge: (challengerId, challengedId, players, challenges) => {
    const challenger = players.find(p => p.id === challengerId);
    const challenged = players.find(p => p.id === challengedId);
    
    if (!challenger || !challenged) {
      return { success: false, error: 'Invalid player selection' };
    }
    
    // Check if challenger can create challenges
    const challengerCheck = ChallengeManager.canPlayerChallenge(challengerId, challenges);
    if (!challengerCheck.canChallenge) {
      return { success: false, error: challengerCheck.reason };
    }
    
    // Check if challenged player can receive challenges
    const challengedCheck = ChallengeManager.canPlayerChallenge(challengedId, challenges);
    if (!challengedCheck.canChallenge) {
      return { 
        success: false, 
        error: `${challenged.name} is currently in an active match and cannot be challenged until it's completed.` 
      };
    }
    
    // Check position rules
    if (challenger.position <= challenged.position) {
      return { success: false, error: 'You can only challenge players above you on the ladder' };
    }
    
    // Check for existing pending challenges
    const existingChallenge = challenges.find(c => 
      c.challengerId === challengerId && 
      c.challengedId === challengedId && 
      c.status === 'pending'
    );
    
    if (existingChallenge) {
      return { success: false, error: 'A challenge already exists between these players' };
    }
    
    // Create the challenge
    const newChallenge = {
      id: Date.now(),
      challengerId,
      challengedId,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      emailNotifications: {
        challengeCreated: null,
        weekReminder: null,
        finalWeekReminder: null
      }
    };
    
    // Send immediate email notification
    const emailResult = EmailService.sendChallengeCreatedEmail(
      challenger.name,
      `${challenged.name.toLowerCase().replace(' ', '.')}@nordea.com`, // Simulate email
      challenged.name
    );
    
    newChallenge.emailNotifications.challengeCreated = emailResult;
    
    return { success: true, challenge: newChallenge };
  },

  // Check and send reminder emails
  checkAndSendReminders: (challenges, players) => {
    const today = new Date();
    const updatedChallenges = [...challenges];
    
    challenges.forEach((challenge, index) => {
      const createdDate = new Date(challenge.createdDate);
      const expiryDate = new Date(challenge.expiryDate);
      const daysFromCreation = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
      const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      const challenger = players.find(p => p.id === challenge.challengerId);
      const challenged = players.find(p => p.id === challenge.challengedId);
      
      if (!challenger || !challenged) return;
      
      // 1. Send 1-week reminder for pending challenges (day 7)
      if (challenge.status === 'pending' && 
          daysFromCreation >= 7 && 
          !challenge.emailNotifications?.weekReminder) {
        
        const emailResult = EmailService.sendChallengeReminderEmail(
          challenger.name,
          `${challenged.name.toLowerCase().replace(' ', '.')}@nordea.com`,
          challenged.name,
          Math.max(0, daysToExpiry)
        );
        
        updatedChallenges[index] = {
          ...challenge,
          emailNotifications: {
            ...challenge.emailNotifications,
            weekReminder: emailResult
          }
        };
      }
      
      // 2. Send 2-week reminder for accepted challenges (day 14 - final week)
      if (challenge.status === 'accepted' && 
          daysFromCreation >= 14 && 
          !challenge.emailNotifications?.finalWeekReminder) {
        
        const emailResult = EmailService.sendMatchReminderEmail(
          `${challenger.name.toLowerCase().replace(' ', '.')}@nordea.com`,
          `${challenged.name.toLowerCase().replace(' ', '.')}@nordea.com`,
          challenger.name,
          challenged.name,
          Math.max(0, daysToExpiry)
        );
        
        updatedChallenges[index] = {
          ...challenge,
          emailNotifications: {
            ...challenge.emailNotifications,
            finalWeekReminder: emailResult
          }
        };
      }
      
      // 3. Handle expired matches (24-hour grace period)
      if (challenge.status === 'accepted' && daysToExpiry < 0) {
        const hoursOverdue = Math.abs(daysToExpiry) * 24;
        
        if (hoursOverdue <= 24 && !challenge.emailNotifications?.finalDeadline) {
          EmailService.sendFinalDeadlineEmail(
            `${challenger.name.toLowerCase().replace(' ', '.')}@nordea.com`,
            `${challenged.name.toLowerCase().replace(' ', '.')}@nordea.com`,
            challenger.name,
            challenged.name
          );
          
          updatedChallenges[index] = {
            ...challenge,
            emailNotifications: {
              ...challenge.emailNotifications,
              finalDeadline: { sent: true, timestamp: new Date().toISOString() }
            }
          };
        } else if (hoursOverdue > 24) {
          // Auto-expire after 24-hour grace period
          updatedChallenges[index] = {
            ...challenge,
            status: 'expired_unplayed'
          };
        }
      }
    });
    
    return updatedChallenges;
  },

  // Get player status for UI
  getPlayerStatus: (playerId, challenges) => {
    const activeChallenge = challenges.find(c => 
      (c.challengerId === playerId || c.challengedId === playerId) && 
      c.status === 'accepted'
    );
    
    if (activeChallenge) {
      const isChallenger = activeChallenge.challengerId === playerId;
      const daysRemaining = Math.ceil((new Date(activeChallenge.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        status: 'in_active_match',
        message: `Currently in an active match (${Math.max(0, daysRemaining)} days remaining to play)`,
        canChallenge: false,
        canBehallenged: false
      };
    }
    
    return {
      status: 'available',
      message: 'Available for challenges',
      canChallenge: true,
      canBeChallenged: true
    };
  }
};
