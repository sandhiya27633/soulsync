import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db, isDemo } from '../firebaseConfig';
import { encryptText, decryptText } from '../utils/crypto';

const AppDataContext = createContext(null);

export const useAppData = () => useContext(AppDataContext);

// Pre-defined daily tasks list
const DAILY_TASKS_POOL = [
  "Write down three things you are deeply grateful for today.",
  "Take 5 slow, deep breaths — inhale for 4 seconds, hold for 4, exhale for 6.",
  "Drink a full glass of refreshing water right now.",
  "Step outside or look out a window for 2 minutes and focus on the furthest object you can see.",
  "Gently stretch your neck, shoulders, and back for 60 seconds.",
  "Reach out to an old friend and send a simple 'thinking of you' text.",
  "Clench your hands into fists for 5 seconds, then completely release and feel the relaxation.",
  "Listen to one of your favorite feel-good songs with undivided attention.",
  "Declutter one small space around you (e.g., your desk or a single drawer)."
];

export const AppDataProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [moods, setMoods] = useState([]);
  const [chats, setChats] = useState([]);
  const [dailyTask, setDailyTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to format date as YYYY-MM-DD using local time
  const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  // Helper to check if a date was yesterday
  const isYesterday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date(getTodayDateString());
    const checkDate = new Date(dateStr);
    const diffTime = Math.abs(today - checkDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  // Load user data on login
  useEffect(() => {
    if (!user) {
      setMoods([]);
      setChats([]);
      setDailyTask(null);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const todayStr = getTodayDateString();

      if (isDemo) {
        // --- DEMO MODE LOADING ---
        // 1. Moods
        const localMoods = JSON.parse(localStorage.getItem(`soulsync_moods_${user.uid}`) || '[]');
        setMoods(localMoods);

        // 2. Chats (decrypt text fields on load)
        const localChats = JSON.parse(localStorage.getItem(`soulsync_chats_${user.uid}`) || '[]');
        const decryptedChats = await Promise.all(
          localChats.map(async (msg) => ({
            ...msg,
            text: msg.isEncrypted ? await decryptText(msg.text) : msg.text
          }))
        );
        setChats(decryptedChats);

        // 3. Daily Task
        const localTask = JSON.parse(localStorage.getItem(`soulsync_task_${user.uid}`) || 'null');
        if (localTask && localTask.date === todayStr) {
          setDailyTask(localTask);
        } else {
          // Select random task for today
          const randomTask = DAILY_TASKS_POOL[Math.floor(Math.random() * DAILY_TASKS_POOL.length)];
          const newTask = {
            date: todayStr,
            taskText: randomTask,
            completed: false
          };
          localStorage.setItem(`soulsync_task_${user.uid}`, JSON.stringify(newTask));
          setDailyTask(newTask);
        }
      } else {
        // --- PRODUCTION MODE LOADING ---
        try {
          // 1. Moods
          const moodsRef = collection(db, 'moods', user.uid, 'entries');
          const moodsQuery = query(moodsRef, orderBy('date', 'desc'));
          const moodsSnap = await getDocs(moodsQuery);
          const moodsList = moodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMoods(moodsList);

          // 2. Chats
          const chatsRef = collection(db, 'chats', user.uid, 'messages');
          const chatsQuery = query(chatsRef, orderBy('timestamp', 'asc'));
          const chatsSnap = await getDocs(chatsQuery);
          
          const decryptedChats = await Promise.all(
            chatsSnap.docs.map(async (docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                ...data,
                text: data.isEncrypted ? await decryptText(data.text) : data.text
              };
            })
          );
          setChats(decryptedChats);

          // 3. Daily Task
          const taskRef = doc(db, 'tasks', user.uid);
          const taskSnap = await getDocs(collection(db, 'tasks')); // Check exist
          const userTaskDoc = await getDocs(query(collection(db, 'tasks', user.uid, 'history')));
          
          // Get today's task document
          const todayTaskSnap = userTaskDoc.docs.find(d => d.data().date === todayStr);
          if (todayTaskSnap) {
            setDailyTask({ id: todayTaskSnap.id, ...todayTaskSnap.data() });
          } else {
            const randomTask = DAILY_TASKS_POOL[Math.floor(Math.random() * DAILY_TASKS_POOL.length)];
            const newTask = {
              date: todayStr,
              taskText: randomTask,
              completed: false,
              xpEarned: 50
            };
            const addedDoc = await addDoc(collection(db, 'tasks', user.uid, 'history'), newTask);
            setDailyTask({ id: addedDoc.id, ...newTask });
          }
        } catch (error) {
          console.error("Firestore Loading Error:", error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Log new mood entry
  const logMood = async (moodEmoji, moodScore, notes = "") => {
    if (!user) return;
    const todayStr = getTodayDateString();
    
    // Core entry data
    const newEntry = {
      date: todayStr,
      moodEmoji,
      moodScore,
      notes
    };

    // Calculate streak adjustments
    const lastCheckIn = user.lastCheckInDate;
    let newStreak = user.streakDays || 0;
    
    if (!lastCheckIn) {
      newStreak = 1;
    } else if (lastCheckIn !== todayStr) {
      if (isYesterday(lastCheckIn)) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    // Award XP (+20 for mood check-in)
    let newXp = (user.xp || 0) + 20;
    const newBadges = [...(user.badges || [])];

    // Check for badges
    if (!newBadges.includes("First Journal")) {
      newBadges.push("First Journal");
    }
    if (newStreak >= 3 && !newBadges.includes("3-day streak")) {
      newBadges.push("3-day streak");
    }
    if (newXp >= 500 && !newBadges.includes("XP Master")) {
      newBadges.push("XP Master");
    }

    // Save mood
    if (isDemo) {
      const localMoods = [newEntry, ...moods.filter(m => m.date !== todayStr)];
      localStorage.setItem(`soulsync_moods_${user.uid}`, JSON.stringify(localMoods));
      setMoods(localMoods);
    } else {
      try {
        const moodsColRef = collection(db, 'moods', user.uid, 'entries');
        // Delete existing check-in for today if re-entering
        const existingDoc = moods.find(m => m.date === todayStr);
        if (existingDoc && existingDoc.id) {
          // We can overwrite or update
          await setDoc(doc(db, 'moods', user.uid, 'entries', existingDoc.id), newEntry);
        } else {
          await addDoc(moodsColRef, newEntry);
        }
        
        // Refresh local view
        const moodsQuery = query(moodsColRef, orderBy('date', 'desc'));
        const moodsSnap = await getDocs(moodsQuery);
        setMoods(moodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error saving mood entry:", error);
      }
    }

    // Update user profile with new streak, XP, badges, and check-in date
    await updateProfile({
      streakDays: newStreak,
      xp: newXp,
      badges: newBadges,
      lastCheckInDate: todayStr
    });
  };

  // Log a chat message
  const logChatMessage = async (sender, text, riskLevel = "NORMAL") => {
    if (!user) return;

    // Encrypt the message text before storing it
    const encryptedText = await encryptText(text);

    const messageData = {
      timestamp: Date.now(),
      sender,
      text: encryptedText,
      riskLevel,
      isEncrypted: true
    };

    // For local UI display, keep the plaintext version in memory
    const displayMsg = {
      timestamp: messageData.timestamp,
      sender,
      text,
      riskLevel,
      isEncrypted: false
    };

    setChats(prev => [...prev, displayMsg]);

    if (isDemo) {
      const localChats = JSON.parse(localStorage.getItem(`soulsync_chats_${user.uid}`) || '[]');
      localChats.push(messageData);
      localStorage.setItem(`soulsync_chats_${user.uid}`, JSON.stringify(localChats));
    } else {
      try {
        const chatsColRef = collection(db, 'chats', user.uid, 'messages');
        await addDoc(chatsColRef, messageData);
      } catch (error) {
        console.error("Error saving chat message:", error);
      }
    }
  };

  // Complete Today's Task
  const completeDailyTask = async () => {
    if (!user || !dailyTask || dailyTask.completed) return;

    const updatedTask = { ...dailyTask, completed: true };
    setDailyTask(updatedTask);

    // Award +50 XP
    let newXp = (user.xp || 0) + 50;
    const newBadges = [...(user.badges || [])];

    if (newXp >= 500 && !newBadges.includes("XP Master")) {
      newBadges.push("XP Master");
    }

    if (isDemo) {
      localStorage.setItem(`soulsync_task_${user.uid}`, JSON.stringify(updatedTask));
    } else {
      try {
        const taskDocRef = doc(db, 'tasks', user.uid, 'history', dailyTask.id);
        await updateDoc(taskDocRef, { completed: true });
      } catch (error) {
        console.error("Error completing daily task in DB:", error);
      }
    }

    await updateProfile({
      xp: newXp,
      badges: newBadges
    });
  };

  // Award a manual badge (e.g. for safety connection or crisis actions)
  const awardBadge = async (badgeName) => {
    if (!user) return;
    const newBadges = [...(user.badges || [])];
    if (newBadges.includes(badgeName)) return;

    newBadges.push(badgeName);
    await updateProfile({ badges: newBadges });
  };

  const value = {
    moods,
    chats,
    dailyTask,
    loading,
    logMood,
    logChatMessage,
    completeDailyTask,
    awardBadge,
    todayDateStr: getTodayDateString()
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
