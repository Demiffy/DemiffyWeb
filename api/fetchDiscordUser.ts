// api/fetchDiscordUser.mts

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

function calculateCreatedAt(userId: string): string {
  const discordEpoch = 1420070400000;
  const timestamp = BigInt(userId) >> 22n;
  const createdAt = new Date(Number(timestamp) + discordEpoch);
  return createdAt.toUTCString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing userId parameter.' });
  }

  try {
    const response = await axios.get(`https://discord.com/api/users/${userId}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    const { id, username, discriminator, avatar } = response.data;

    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=1024`
      : null;

    const createdAt = calculateCreatedAt(id);

    res.status(200).json({
      user_id: id,
      user_name: `${username}#${discriminator}`,
      avatar_url: avatarUrl,
      created_at: createdAt,
    });
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'User not found.' });
    } else {
      return res.status(500).json({ error: 'Failed to fetch user data.' });
    }
  }
}