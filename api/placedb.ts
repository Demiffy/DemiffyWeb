import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
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

const canvasRef = ref(db, 'canvas');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { x, y, color } = req.body;

    // Validate the pixel data
    if (
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      typeof color !== 'number' ||
      color < 0 || 
      color > 31
    ) {
      return res.status(400).json({ error: 'Invalid input data. Color must be an integer between 0 and 31.' });
    }

    try {
      const pixelRef = ref(db, `canvas/${x}_${y}`);
      await set(pixelRef, { x, y, color, timestamp: new Date().toISOString() });

      res.status(200).json({ message: 'Pixel placed successfully.' });
    } catch (error: any) {
      console.error('Error placing pixel:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const snapshot = await get(canvasRef);
      const data = snapshot.exists() ? snapshot.val() : {};

      const canvas = Object.values(data);
      res.status(200).json(canvas);
    } catch (error: any) {
      console.error('Error fetching canvas data:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}