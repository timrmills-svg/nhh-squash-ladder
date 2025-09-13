// src/services/emailService.js
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

const FROM_EMAIL = 'tim.r.mills+nhhsquash@gmail.com';
const FROM_NAME = 'NHH Squash Ladder';

export const emailService = {
  // Send challenge notification
  async sendChallengeNotification(challengedPlayerEmail, challengerName, challengeDetails) {
    const msg = {
      to: challengedPlayerEmail,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      replyTo: 'noreply@nowhere.com',
      subject: `Squash Challenge from ${challengerName} - Do Not Reply`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4285f4; color: white; padding: 20px; text-align: center;">
            <h1>🏆 NHH Squash Ladder Challenge</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p><strong>This is an automated notification - please do not reply to this email.</strong></p>
            
            <h2>You've been challenged!</h2>
            <p><strong>${challengerName}</strong> has challenged you to a squash match.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Challenge expires:</strong> ${challengeDetails.expiryDate}</p>
              <p><strong>Current positions:</strong> ${challengerName} vs You</p>
              <p><strong>Challenge created:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://nhh-squash-ladder.vercel.app" 
                 style="background: #4285f4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 View Challenge & Respond
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Use the NHH Squash Ladder app to accept or reject this challenge.
              Challenges expire after 14 days if not responded to.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            Nordea HH Squashladder • Following official LSRC rules • Please login to participate
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Challenge notification sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending challenge notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send game result notification to all players
  async sendGameResultNotification(allPlayersEmails, gameResult) {
    const msg = {
      to: allPlayersEmails, // SendGrid can handle array of emails
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      replyTo: 'noreply@nowhere.com',
      subject: `Match Result: ${gameResult.player1} vs ${gameResult.player2} - Do Not Reply`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4285f4; color: white; padding: 20px; text-align: center;">
            <h1>🏆 NHH Squash Ladder - Match Result</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p><strong>This is an automated notification - please do not reply to this email.</strong></p>
            
            <h2>Match Completed!</h2>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3>${gameResult.player1} vs ${gameResult.player2}</h3>
              <div style="font-size: 24px; font-weight: bold; color: #4285f4; margin: 15px 0;">
                ${gameResult.score}
              </div>
              <p style="font-size: 18px;">
                <strong>Winner: ${gameResult.winner}</strong>
              </p>
              <p style="color: #666;">
                Match played on ${new Date(gameResult.date).toLocaleDateString()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://nhh-squash-ladder.vercel.app" 
                 style="background: #4285f4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 View Updated Ladder
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            Nordea HH Squashladder • Following official LSRC rules
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Game result notification sent to all players');
      return { success: true };
    } catch (error) {
      console.error('Error sending game result notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send reminder notification
  async sendChallengeReminder(challengedPlayerEmail, challengerName, daysRemaining) {
    const msg = {
      to: challengedPlayerEmail,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      replyTo: 'noreply@nowhere.com',
      subject: `Reminder: Challenge from ${challengerName} expires in ${daysRemaining} days - Do Not Reply`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ff9800; color: white; padding: 20px; text-align: center;">
            <h1>⏰ Challenge Reminder</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p><strong>This is an automated notification - please do not reply to this email.</strong></p>
            
            <h2>Challenge Expiring Soon!</h2>
            <p>Your challenge from <strong>${challengerName}</strong> expires in <strong>${daysRemaining} days</strong>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://nhh-squash-ladder.vercel.app" 
                 style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 Respond to Challenge
              </a>
            </div>
            
            <p style="color: #666;">
              Please accept or reject this challenge before it expires.
            </p>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Challenge reminder sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending challenge reminder:', error);
      return { success: false, error: error.message };
    }
  }
}