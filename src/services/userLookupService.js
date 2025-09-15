import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

// Service to manage user profiles and email lookups
export const UserLookupService = {
  // Collection to store user profiles (displayName -> email mapping)
  usersCollection: collection(db, 'users'),

  // Store/update user profile when they login/register
  upsertUserProfile: async (email, displayName, uid) => {
    try {
      // Check if user profile already exists
      const q = query(
        collection(db, 'users'), 
        where('email', '==', email)
      );
      const snapshot = await getDocs(q);
      
      const profileData = {
        email: email,
        displayName: displayName,
        uid: uid,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (snapshot.empty) {
        // Create new profile
        await addDoc(collection(db, 'users'), {
          ...profileData,
          createdAt: new Date().toISOString()
        });
        console.log('✅ User profile created:', displayName);
      } else {
        // Update existing profile
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), profileData);
        console.log('✅ User profile updated:', displayName);
      }
    } catch (error) {
      console.error('❌ Error managing user profile:', error);
    }
  },

  // Get email from displayName
  getEmailFromDisplayName: async (displayName) => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('displayName', '==', displayName)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        return userData.email;
      }
      
      console.warn(`⚠️ No email found for displayName: ${displayName}`);
      return null;
    } catch (error) {
      console.error('❌ Error looking up email:', error);
      return null;
    }
  },

  // Get multiple emails from displayNames
  getEmailsFromDisplayNames: async (displayNames) => {
    try {
      const results = await Promise.all(
        displayNames.map(async (name) => {
          const email = await UserLookupService.getEmailFromDisplayName(name);
          return { displayName: name, email };
        })
      );
      return results;
    } catch (error) {
      console.error('❌ Error looking up multiple emails:', error);
      return [];
    }
  },

  // Get all user profiles (for admin purposes)
  getAllUsers: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  }
};