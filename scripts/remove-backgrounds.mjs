import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { removeBackground } from '@imgly/background-removal-node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const SKIP = [
  'anritsu.svg',
  'silicom-logo-mark.png',
  'silicom-logo-full.png',
];

function getMimeType(filePath) {
  const ext = filePath.toLowerCase();
  if (ext.endsWith('.webp')) return 'image/webp';
  if (ext.endsWith('.jpg') || ext.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/png';
}

async function removeBg(inputPath, outputPath) {
  console.log(`  Processing: ${inputPath}`);
  const inputBuffer = readFileSync(inputPath);
  const mimeType = getMimeType(inputPath);
  const blob = new Blob([inputBuffer], { type: mimeType });
  const result = await removeBackground(blob);
  const outputBuffer = Buffer.from(await result.arrayBuffer());
  writeFileSync(outputPath, outputBuffer);
  console.log(`  -> Saved: ${outputPath} (${(outputBuffer.length / 1024).toFixed(1)} KB)`);
}

async function processDirectory(dir) {
  if (!existsSync(dir)) {
    console.log(`Directory not found, skipping: ${dir}`);
    return;
  }
  
  const files = readdirSync(dir).filter(f => {
    const ext = f.toLowerCase();
    return (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.webp')) 
      && !SKIP.includes(f);
  });

  console.log(`\nDirectory: ${dir} (${files.length} files)`);
  
  for (const file of files) {
    const inputPath = join(dir, file);
    const isJpg = file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg');
    
    try {
      if (isJpg) {
        // For JPG: remove background and save as PNG, then delete the JPG
        const pngName = file.replace(/\.(jpg|jpeg)$/i, '.png');
        const pngPath = join(dir, pngName);
        await removeBg(inputPath, pngPath);
        unlinkSync(inputPath);
        console.log(`  -> Deleted original: ${inputPath}`);
      } else {
        await removeBg(inputPath, inputPath);
      }
    } catch (err) {
      console.error(`  ERROR on ${file}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('=== Silicom Logo Background Removal ===\n');
  
  const brandLogosDir = join(rootDir, 'assets', 'brand-logos');
  const customersDir = join(rootDir, 'assets', 'customers');
  
  await processDirectory(brandLogosDir);
  await processDirectory(customersDir);
  
  console.log('\n=== Done! ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
