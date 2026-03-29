import { Jimp } from 'jimp';

async function analyze() {
  const image = await Jimp.read('https://lh3.googleusercontent.com/d/1PEKm1sRID-iwDHrCGll7tqyAiNkI_XKY?v=3');
  
  const bgR = image.bitmap.data[0];
  const bgG = image.bitmap.data[1];
  const bgB = image.bitmap.data[2];
  console.log(`Background color: r=${bgR}, g=${bgG}, b=${bgB}`);
  
  let cinelensMinX = image.bitmap.width;
  let cinelensMaxX = 0;
  
  let cinelensPixels = [];
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Use a higher threshold to ignore noise
    if (Math.abs(r - bgR) > 50 || Math.abs(g - bgG) > 50 || Math.abs(b - bgB) > 50) {
      if (y >= 400 && y < 600) { // CINELENS
        if (x < cinelensMinX) cinelensMinX = x;
        if (x > cinelensMaxX) cinelensMaxX = x;
        cinelensPixels.push({x, y, r, g, b});
      }
    }
  });
  
  console.log(`CINELENS bounding box: minX=${cinelensMinX}, maxX=${cinelensMaxX}, center=${(cinelensMinX + cinelensMaxX) / 2}`);
  
  // Let's find the leftmost and rightmost pixels
  const leftPixels = playerPixels.filter(p => p.x < playerMinX + 5);
  const rightPixels = playerPixels.filter(p => p.x > playerMaxX - 5);
  
  console.log(`Leftmost pixels:`, leftPixels.slice(0, 5));
  console.log(`Rightmost pixels:`, rightPixels.slice(0, 5));
}

analyze().catch(console.error);
