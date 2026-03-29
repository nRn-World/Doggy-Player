import { Jimp } from 'jimp';

async function analyze() {
  const image = await Jimp.read('https://lh3.googleusercontent.com/d/1PEKm1sRID-iwDHrCGll7tqyAiNkI_XKY?v=3');
  
  const bgR = image.bitmap.data[0];
  const bgG = image.bitmap.data[1];
  const bgB = image.bitmap.data[2];
  
  let dogMinX = image.bitmap.width;
  let dogMaxX = 0;
  let textMinX = image.bitmap.width;
  let textMaxX = 0;
  
  let dogMinY = image.bitmap.height;
  let dogMaxY = 0;
  let textMinY = image.bitmap.height;
  let textMaxY = 0;
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    if (Math.abs(r - bgR) > 10 || Math.abs(g - bgG) > 10 || Math.abs(b - bgB) > 10) {
      if (y < 400) { // Assume 400 is the split point
        if (y < dogMinY) dogMinY = y;
        if (y > dogMaxY) dogMaxY = y;
      } else {
        if (y < textMinY) textMinY = y;
        if (y > textMaxY) textMaxY = y;
      }
    }
  });
  
  console.log(`Dog Y: min=${dogMinY}, max=${dogMaxY}`);
  console.log(`Text Y: min=${textMinY}, max=${textMaxY}`);
}

analyze().catch(console.error);
