import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = 'https://gfaqfmumewwzdcicrvfp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFmbXVtZXd3emRjaWNydmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTE5OTgsImV4cCI6MjA0ODY2Nzk5OH0.xPnneLolQrIGxH9r3fHSrbTPPzwNoyksfqoqxybm8V4';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const data = req.body;

    try {
      const { data: result, error } = await supabase
        .from('data')
        .insert(data);

      if (error) {
        throw error;
      }

      res.status(200).json({ message: 'Data saved successfully', result });
    } catch (error: any) {
      console.error('Supabase POST error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('data')
        .select('*');

      if (error) {
        throw error;
      }

      res.status(200).json(data);
    } catch (error: any) {
      console.error('Supabase GET error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}