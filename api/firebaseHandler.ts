import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, get } from 'firebase/database';
import type { NextApiRequest, NextApiResponse } from 'next';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: "demiffycom.firebaseapp.com",
  databaseURL: process.env.PUBLIC_FIREBASE_DATABASE_URL,
  projectId: "demiffycom",
  storageBucket: "demiffycom.firebasestorage.app",
  messagingSenderId: "423608998435",
  appId: "1:423608998435:web:1ee3cc6b9408777fbdaf96",
  measurementId: "G-9DVS3F5QST",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const messagesRef = ref(db, 'messages');

  if (req.method === 'POST') {
    const { name, message } = req.body;

    if (typeof name !== 'string' || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid input data.' });
    }

    try {
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        id: newMessageRef.key,
        name,
        message,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({ message: 'Data saved successfully.' });
    } catch (error: any) {
      console.error('Error saving data:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const snapshot = await get(messagesRef);
      const data = snapshot.exists() ? snapshot.val() : {};
      const messages = Object.values(data);

      res.status(200).json(messages);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}