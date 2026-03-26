// ===== RED COUNTDOWN AVATAR (PRO VERSION) =====

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// ===== LOAD FONT (Inter Bold) =====
// 👉 tải font Inter-Bold.ttf bỏ vào cùng folder
try {
  registerFont(path.join(__dirname, 'Inter-Bold.ttf'), {
    family: 'Inter',
    weight: 'bold',
  });
} catch (e) {
  console.log('Font not found, fallback to system font');
}

// ===== COLOR LOGIC (theo deadline) =====
function getTheme(days) {
  if (days <= 3) {
    return {
      bg1: '#140000',
      bg2: '#2a0000',
      text1: '#ff1a1a',
      text2: '#ff4d4d',
      glow: 'rgba(255,0,0,0.8)',
    };
  }

  if (days <= 10) {
    return {
      bg1: '#140a00',
      bg2: '#2a1400',
      text1: '#ff5a00',
      text2: '#ff2a00',
      glow: 'rgba(255,80,0,0.6)',
    };
  }

  return {
    bg1: '#0b0b0f',
    bg2: '#1a0f12',
    text1: '#ff4d4d',
    text2: '#b30000',
    glow: 'rgba(255,0,0,0.5)',
  };
}

// ===== MAIN GENERATE =====
function generateAvatar(days) {
  const size = 256;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const theme = getTheme(days);

  // ===== BACKGROUND =====
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, theme.bg1);
  bg.addColorStop(1, theme.bg2);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // ===== RADIAL GLOW =====
  const glow = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size * 0.7
  );

  glow.addColorStop(0, theme.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // ===== MAIN NUMBER =====
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const display = days > 999 ? '999+' : days.toString();

  const textGradient = ctx.createLinearGradient(0, 0, 0, size);
  textGradient.addColorStop(0, theme.text1);
  textGradient.addColorStop(1, theme.text2);

  ctx.fillStyle = textGradient;

  // 👉 font đẹp (fallback nếu chưa có Inter)
  ctx.font = 'bold 120px Inter, Arial';

  // ===== TEXT GLOW =====
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 30;

  ctx.fillText(display, size / 2, size / 2);

  ctx.shadowBlur = 0;

  // ===== SUBTLE BORDER =====
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);

  // ===== SAVE =====
  fs.writeFileSync('./avatar.png', canvas.toBuffer());
}

// ===== EXPORT =====
module.exports = { generateAvatar };


// ===== TEST LOCAL =====
// 👉 chạy: node generateAvatar.js
if (require.main === module) {
  generateAvatar(54); // test số ngày
  console.log('Avatar generated!');
}