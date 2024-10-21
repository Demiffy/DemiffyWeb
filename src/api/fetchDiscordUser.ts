import { NextApiRequest, NextApiResponse } from 'next';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let isClientLoggedIn = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Discord bot token is missing' });
  }

  if (!isClientLoggedIn) {
    try {
      await client.login(token);
      isClientLoggedIn = true;
    } catch (loginError) {
      console.error('Failed to login to Discord bot:', loginError);
      return res.status(500).json({ error: 'Failed to login to Discord' });
    }
  }

  try {
    const user = await client.users.fetch(userId as string);

    res.status(200).json({
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
    });
  } catch (error) {
    const err = error as Error;

    console.error('Error fetching Discord user:', err);

    if (err.message && err.message.includes('Unknown User')) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(500).json({ error: err.message || 'Failed to fetch Discord user' });
  }
}
