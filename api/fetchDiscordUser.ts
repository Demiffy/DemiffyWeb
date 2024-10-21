// api/fetchDiscordUser.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Ensure that your DISCORD_BOT_TOKEN environment variable is properly set
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;

  // Validate the userId
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing userId parameter.' });
  }

  try {
    // Make the request to Discord API to get the user details
    const response = await axios.get(`https://discord.com/api/users/${userId}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    const { id, username, discriminator, avatar } = response.data;

    // Return the user data to the client
    res.status(200).json({ id, username, discriminator, avatar });
  } catch (error: any) {
    // Handle error responses
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'User not found.' });
    } else {
      return res.status(500).json({ error: 'Failed to fetch user data.' });
    }
  }
}
