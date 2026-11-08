import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const files = {
  '/images/barber/master-02.webp': '/images/barber/master-02-w496.webp',
  '/images/barber/master-03.webp': '/images/barber/master-03-w640.webp',
  '/images/gallery/tools.webp': '/images/gallery/tools-w640.webp',
  '/images/gallery/finished-look.webp': '/images/gallery/finished-look-w640.webp',
  '/images/gallery/barber-work-poster.webp': '/images/gallery/barber-work-poster.webp',
  '/images/gallery/location-map.webp': '/images/gallery/location-map.webp',
};

const embedded = Object.fromEntries(Object.entries(files).map(([key, file]) => {
  const contents = readFileSync(resolve('public', file.slice(1))).toString('base64');
  return [key, `data:image/webp;base64,${contents}`];
}));

writeFileSync(
  resolve('src/data/embedded-images.generated.ts'),
  `export const embeddedImages: Record<string, string> = ${JSON.stringify(embedded)};\n`,
);
