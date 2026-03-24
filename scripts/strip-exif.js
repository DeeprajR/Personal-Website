import sharp from 'sharp';
import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = 'public';
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'gif'];

async function stripExif() {
  console.log('🚀 Starting site-wide EXIF stripping...');
  
  const patterns = IMAGE_EXTENSIONS.map(ext => `${PUBLIC_DIR}/**/*.${ext}`);
  const files = await globby(patterns);

  console.log(`📸 Found ${files.length} images to process.`);

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const buffer = await fs.readFile(file);
      
      // We use sharp to read the image and write it back without metadata.
      // .withMetadata() without arguments would keep it, but by default sharp strips it.
      // However, to be explicit, we just process and save.
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // If the image has no profile/exif, we might be able to skip it, 
      // but re-saving is the safest way to ensure clean output.
      
      await image
        .rotate() // Auto-rotate based on EXIF before stripping it
        .toFile(file + '.tmp');
      
      await fs.rename(file + '.tmp', file);
      
      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`- Processed ${processedCount}/${files.length}...`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n✅ EXIF Stripping Complete:');
  console.log(`- Total: ${files.length}`);
  console.log(`- Processed: ${processedCount}`);
  console.log(`- Errors: ${errorCount}`);
}

stripExif().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
