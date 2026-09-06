import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPng(width, height, drawPixel) {
  const rowLength = 1 + width * 4; // 1 filter byte (0) + RGBA per pixel
  const buffer = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowLength;
    buffer[rowStart] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pixelStart = rowStart + 1 + x * 4;
      buffer[pixelStart] = r;
      buffer[pixelStart + 1] = g;
      buffer[pixelStart + 2] = b;
      buffer[pixelStart + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(buffer);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])), 0);
  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(13, 0);
  const ihdrChunk = Buffer.concat([ihdrLen, ihdrType, ihdrData, ihdrCrc]);

  // IDAT chunk
  const idatType = Buffer.from('IDAT');
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, deflated])), 0);
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(deflated.length, 0);
  const idatChunk = Buffer.concat([idatLen, idatType, deflated, idatCrc]);

  // IEND chunk
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType), 0);
  const iendLen = Buffer.alloc(4);
  iendLen.writeUInt32BE(0, 0);
  const iendChunk = Buffer.concat([iendLen, iendType, iendCrc]);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Visual drawing for 吉吉办公 Icon:
// Elegant modern rounded blue gradient background (#1d4ed8 to #2563eb)
// Center stylized "JJ" / efficiency wing emblem in white and cyan (#38bdf8)
function renderIcon(x, y, w, h, isMaskable = false) {
  // Normalize coords: -1 to 1
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const distCenter = Math.sqrt(nx * nx + ny * ny);

  // Background corner rounding for standard icon (maskable has full bleed)
  let inBg = true;
  if (!isMaskable) {
    // Rounded rect: corner radius ~ 0.28
    const ax = Math.abs(nx);
    const ay = Math.abs(ny);
    const r = 0.28;
    if (ax > 1 - r && ay > 1 - r) {
      const dx = ax - (1 - r);
      const dy = ay - (1 - r);
      if (dx * dx + dy * dy > r * r) {
        inBg = false;
      }
    }
  }

  if (!inBg) {
    return [0, 0, 0, 0];
  }

  // Base gradient: deep indigo/blue #1e40af at top-left to #2563eb / #0284c7 at bottom-right
  const grad = (nx + ny + 2) / 4;
  let r = Math.round(30 + grad * 15);
  let g = Math.round(64 + grad * 55);
  let b = Math.round(175 + grad * 60);
  let a = 255;

  // Safe zone scaling factor: for maskable, scale inner design by 0.75
  const scale = isMaskable ? 0.75 : 0.85;
  const sx = nx / scale;
  const sy = ny / scale;

  // Draw modern office / shield / "J" emblem
  // Shield badge container:
  const inShield = Math.abs(sx) < 0.65 && sy > -0.65 && sy < 0.65 - Math.max(0, Math.abs(sx) - 0.2) * 0.8;
  if (inShield && (Math.abs(sx) > 0.58 || sy < -0.58 || (sy > 0.45 && Math.abs(sx) + sy > 0.65))) {
    // Outer glow border
    return [255, 255, 255, 240];
  }

  // Left 'J' bar & hook
  const inLeftJ = (sx >= -0.38 && sx <= -0.22 && sy >= -0.45 && sy <= 0.25) ||
                  (sx >= -0.50 && sx <= -0.22 && sy >= 0.15 && sy <= 0.35) ||
                  (sx >= -0.50 && sx <= -0.38 && sy >= 0.00 && sy <= 0.35);

  // Right 'J' bar & hook
  const inRightJ = (sx >= 0.10 && sx <= 0.26 && sy >= -0.45 && sy <= 0.25) ||
                   (sx >= -0.02 && sx <= 0.26 && sy >= 0.15 && sy <= 0.35) ||
                   (sx >= -0.02 && sx <= 0.10 && sy >= 0.00 && sy <= 0.35);

  // Center efficiency spark / star at top
  const dxSpark = sx - 0.35;
  const dySpark = sy - (-0.35);
  const sparkDist = Math.abs(dxSpark) + Math.abs(dySpark);
  const inSpark = sparkDist < 0.14;

  if (inLeftJ || inRightJ) {
    return [255, 255, 255, 255];
  }
  if (inSpark) {
    return [56, 189, 248, 255]; // Sky-cyan spark #38bdf8
  }

  // Subtle interior circle pattern for tech aesthetic
  if (distCenter < 0.7 && Math.sin(distCenter * 30) > 0.75) {
    r = Math.min(255, r + 15);
    g = Math.min(255, g + 20);
    b = Math.min(255, b + 25);
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate 192x192
console.log('Generating pwa-192x192.png...');
const pwa192 = createPng(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// 2. Generate 512x512
console.log('Generating pwa-512x512.png...');
const pwa512 = createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// 3. Generate maskable 512x512 (with safe zone margins)
console.log('Generating pwa-maskable-512x512.png...');
const pwaMaskable = createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

// 4. Generate apple-touch-icon 180x180
console.log('Generating apple-touch-icon.png...');
const appleTouch = createPng(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// 5. Generate favicon-32x32
console.log('Generating favicon.png...');
const favicon = createPng(32, 32, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);

console.log('All PWA PNG icons generated successfully!');
