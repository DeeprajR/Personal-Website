import sharp from 'sharp';
import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = 'public';
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'gif'];
const CACHE_FILE = '.exif-cache.json';

async function stripExif() {
  console.log('🚀 Starting site-wide EXIF stripping...');
  
  const patterns = IMAGE_EXTENSIONS.map(ext => `${PUBLIC_DIR}/**/*.${ext}`);
  const files = await globby(patterns);

  console.log(`📸 Found ${files.length} images to process.`);

  let cache = {};
  try {
    const cacheData = await fs.readFile(CACHE_FILE, 'utf-8');
    cache = JSON.parse(cacheData);
  } catch (err) {
    // No cache exists yet
  }

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      
      if (cache[file] && cache[file] === stats.mtimeMs) {
        skippedCount++;
        continue;
      }

      const buffer = await fs.readFile(file);
      const image = sharp(buffer);
      
      await image
        .rotate()
        .toFile(file + '.tmp');
      
      await fs.rename(file + '.tmp', file);
      
      const newStats = await fs.stat(file);
      cache[file] = newStats.mtimeMs;
      
      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`- Processed ${processedCount}...`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
      errorCount++;
    }
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));

  console.log('\n✅ EXIF Stripping Complete:');
  console.log(`- Total: ${files.length}`);
  console.log(`- Processed: ${processedCount}`);
  console.log(`- Skipped (Cached): ${skippedCount}`);
  console.log(`- Errors: ${errorCount}`);
}

stripExif().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
