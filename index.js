require('dotenv').config();

const { Client } = require('discord.js');
const fs = require('fs');
const { createCanvas } = require('canvas');
const cron = require('node-cron');

const client = new Client({ intents: [] });

const TARGET_DATE = process.env.TARGET_DATE;

// 🧠 tính số ngày
function getRemainingDays(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);

  const diffTime = target - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// 🎨 generate avatar bằng canvas
function generateImage(days) {
  const size = 256;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6e8efb');
  gradient.addColorStop(1, '#a777e3');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // text number
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 100px Sans';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(days, size / 2, size / 2 - 20);

  // label
  ctx.font = '20px Sans';
  ctx.fillText('NGÀY', size / 2, size / 2 + 50);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./avatar.png', buffer);
}

// 🔁 update avatar
async function updateServerIcon() {
  try {
    const days = getRemainingDays(TARGET_DATE);

    generateImage(days);

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