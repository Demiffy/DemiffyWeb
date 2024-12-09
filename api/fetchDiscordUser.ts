// api/fetchDiscordUser.mts
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

function calculateCreatedAt(userId: string): string {
  const discordEpoch = 1420070400000; // Discord epoch start
  const timestamp = BigInt(userId) >> 22n; // Extract timestamp bits
  const createdAt = new Date(Number(timestamp) + discordEpoch);
  return createdAt.toUTCString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing userId parameter.' });
  }

  try {
    // Fetch user details from Discord API
    const response = await axios.get(`https://discord.com/api/users/${userId}`, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    const {
      id,
      username,
      discriminator,
      avatar,
      banner,
      banner_color,
      accent_color,
      bot,
      system,
      mfa_enabled,
      locale,
      verified,
      email,
      flags,
      premium_type,
    } = response.data;

    // Construct URLs for avatar and banner
    const avatarUrl = avatar
      ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=1024`
      : null;

    const bannerUrl = banner
      ? `https://cdn.discordapp.com/banners/${id}/${banner}.png?size=1024`
      : null;

    // Calculate account creation date
    const createdAt = calculateCreatedAt(id);

    // Respond with all available user fields
    res.status(200).json({
      user_id: id,
      user_name: username,
      discriminator,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
      banner_color,
      accent_color,
      bot,
      system,
      mfa_enabled,
      locale,
      verified, // Requires OAuth2 scope
      email, // Requires OAuth2 scope
      flags,
      premium_type,
      created_at: createdAt,
    });
  } catch (error: any) {
    // Handle errors
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'User not found.' });
    } else {
      return res.status(500).json({ error: 'Failed to fetch user data.' });
    }
  }
}