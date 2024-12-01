import { db } from '../firebaseConfig'; // Import the Firebase Realtime Database
import { ref, set, get, child } from "firebase/database";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle POST requests to save data
    const data = req.body;

    try {
      // Generate a unique key for each data entry
      const dataRef = ref(db, 'data/' + Date.now());
      await set(dataRef, data);

      res.status(200).json({ message: 'Data saved successfully', data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    // Handle GET requests to fetch data
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, 'data'));
      if (snapshot.exists()) {
        res.status(200).json(snapshot.val());
      } else {
        res.status(404).json({ message: 'No data found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
