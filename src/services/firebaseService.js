import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// Collections
export const playersCollection = collection(db, 'players');
export const challengesCollection = collection(db, 'challenges');
export const matchesCollection = collection(db, 'matches');
export const notificationsCollection = collection(db, 'notifications');

// Player operations
export const addPlayer = async (playerData) => {
  return await addDoc(playersCollection, {
    ...playerData,
    createdAt: new Date().toISOString()
  });
};

export const getPlayers = async () => {
  const snapshot = await getDocs(query(playersCollection, orderBy('position')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updatePlayer = async (playerId, updates) => {
  const playerRef = doc(db, 'players', playerId);
  await updateDoc(playerRef, updates);
};

// Challenge operations
export const addChallenge = async (challengeData) => {
  return await addDoc(challengesCollection, {
    ...challengeData,
    createdAt: new Date().toISOString()
  });
};

export const getChallenges = async () => {
  const snapshot = await getDocs(challengesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateChallenge = async (challengeId, updates) => {
  const challengeRef = doc(db, 'challenges', challengeId);
  await updateDoc(challengeRef, updates);
};

// Match operations
export const addMatch = async (matchData) => {
  return await addDoc(matchesCollection, {
    ...matchData,
    createdAt: new Date().toISOString()
  });
};

export const getMatches = async () => {
  const snapshot = await getDocs(query(matchesCollection, orderBy('date', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Notification operations
export const addNotification = async (notificationData) => {
  return await addDoc(notificationsCollection, {
    ...notificationData,
    createdAt: new Date().toISOString(),
    emailSent: false
  });
};

export const getNotifications = async () => {
  const snapshot = await getDocs(query(notificationsCollection, orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time subscriptions
export const subscribeToPlayers = (callback) => {
  return onSnapshot(query(playersCollection, orderBy('position')), (snapshot) => {
    const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(players);
  });
};

export const subscribeToChallenges = (callback) => {
  return onSnapshot(challengesCollection, (snapshot) => {
    const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(challenges);
  });
};

export const subscribeToMatches = (callback) => {
  return onSnapshot(query(matchesCollection, orderBy('date', 'desc')), (snapshot) => {
    const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(matches);
  });
};

export const subscribeToNotifications = (callback) => {
  return onSnapshot(query(notificationsCollection, orderBy('createdAt', 'desc')), (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  });
};