import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

const BG_R = 245, BG_G = 247, BG_B = 248;
const ACCENT_R = 232, ACCENT_G = 114, ACCENT_B = 0;

function createPNG(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = chunk('IHDR', ihdrData);

  const raw = Buffer.alloc(size * size * 3 + size);
  const center = size / 2;
  const radius = size * 0.38;

  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      if (dist <= radius) {
        raw[offset] = ACCENT_R;
        raw[offset + 1] = ACCENT_G;
        raw[offset + 2] = ACCENT_B;
      } else {
        raw[offset] = BG_R;
        raw[offset + 1] = BG_G;
        raw[offset + 2] = BG_B;
      }
    }
  }

  const compressed = deflateSync(raw);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crc = crc32(crcData);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const sizes = [
  { file: 'public/icons/pwa-192x192.png', size: 192 },
  { file: 'public/icons/pwa-512x512.png', size: 512 },
  { file: 'public/icons/apple-touch-icon.png', size: 180 },
];

for (const { file, size } of sizes) {
  const png = createPNG(size);
  writeFileSync(file, png);
  console.log(`Generated ${file} (${size}x${size})`);
}
