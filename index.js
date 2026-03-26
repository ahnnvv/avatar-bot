require('dotenv').config();

const { Client } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const { generateAvatar } = require('./generateAvatar');

const client = new Client({ intents: [] });

const TARGET_DATE = process.env.TARGET_DATE;

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
  } catch (err) {
    console.error(err);
  }
}

// 🤖 khi bot ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await updateServerIcon();

  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily job...');
    await updateServerIcon();
  });
});

client.login(process.env.DISCORD_TOKEN);