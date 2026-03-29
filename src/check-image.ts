import { Jimp } from 'jimp';

async function analyze() {
  const image = await Jimp.read('https://lh3.googleusercontent.com/d/1PEKm1sRID-iwDHrCGll7tqyAiNkI_XKY?v=3');
  console.log(`Image size: ${image.bitmap.width}x${image.bitmap.height}`);
  
  let minX = image.bitmap.width;
  let minY = image.bitmap.height;
  let maxX = 0;
  let maxY = 0;
  
  // Let's assume the background is the color at (0,0)
  const bgR = image.bitmap.data[0];
  const bgG = image.bitmap.data[1];
  const bgB = image.bitmap.data[2];
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];
    
    // If it's different from background
    if (Math.abs(r - bgR) > 10 || Math.abs(g - bgG) > 10 || Math.abs(b - bgB) > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  });
  
  console.log(`Bounding box: minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}`);
  console.log(`Center of bounding box: ${(minX + maxX) / 2}`);
  console.log(`Center of image: ${image.bitmap.width / 2}`);
}

analyze().catch(console.error);
