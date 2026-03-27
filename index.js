require('dotenv').config();

const { Client } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const { generateAvatar } = require('./generateAvatar');

const client = new Client({ intents: [] });

const TARGET_DATE = process.env.TARGET_DATE;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

// 🧠 tính số ngày
function getRemainingDays(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);

  const diffTime = target - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// 🔁 update avatar
async function updateServerIcon() {
  try {
    const days = getRemainingDays(TARGET_DATE);

    generateAvatar(days);

    const icon = fs.readFileSync('./avatar.png');

    // 👉 lấy guild (server)
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) {
      console.log('Guild not found');
      return;
    }

    await guild.setIcon(icon);

    console.log(`Updated SERVER ICON: ${days} days remaining`);
    await sendStatusLog(`✅ còn ${days} ngày thôi bạn vợ ạ`);
  } catch (err) {
    console.error(err);
    await sendStatusLog(`❌ Update server icon failed: ${err.message || err} - bạn vợ ạ`);
  }
}

// 📝 gửi log vào kênh text để theo dõi bot còn chạy
async function sendStatusLog(message) {
  try {
    if (!LOG_CHANNEL_ID) {
      console.log('[LOG_CHANNEL_ID missing]', message);
      return;
    }

    const channel = await client.channels.fetch(LOG_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      console.log('[Invalid log channel]', message);
      return;
    }

    await channel.send(`[avatar-bot] ${message}`);
  } catch (err) {
    console.error('Failed to send status log:', err);
  }
}

// 🤖 khi bot ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await sendStatusLog(`🟢 Bot online: ${client.user.tag}`);

  await updateServerIcon();

  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily job...');
    await sendStatusLog('⏰ Daily job started');
    await updateServerIcon();
  });
});

client.login(process.env.DISCORD_TOKEN);