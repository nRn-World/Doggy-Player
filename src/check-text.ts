import { Jimp } from 'jimp';

async function analyze() {
  const image = await Jimp.read('https://lh3.googleusercontent.com/d/1PEKm1sRID-iwDHrCGll7tqyAiNkI_XKY?v=3');
  
  const bgR = image.bitmap.data[0];
  const bgG = image.bitmap.data[1];
  const bgB = image.bitmap.data[2];
  
  let cinelensMinX = image.bitmap.width;
  let cinelensMaxX = 0;
  let playerMinX = image.bitmap.width;
  let playerMaxX = 0;
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    if (Math.abs(r - bgR) > 10 || Math.abs(g - bgG) > 10 || Math.abs(b - bgB) > 10) {
      if (y >= 400 && y < 600) { // CINELENS
        if (x < cinelensMinX) cinelensMinX = x;
        if (x > cinelensMaxX) cinelensMaxX = x;
      } else if (y >= 600) { // PLAYER
        if (x < playerMinX) playerMinX = x;
        if (x > playerMaxX) playerMaxX = x;
      }
    }
  });
  
  console.log(`CINELENS bounding box: minX=${cinelensMinX}, maxX=${cinelensMaxX}, center=${(cinelensMinX + cinelensMaxX) / 2}`);
  console.log(`PLAYER bounding box: minX=${playerMinX}, maxX=${playerMaxX}, center=${(playerMinX + playerMaxX) / 2}`);
}

analyze().catch(console.error);
