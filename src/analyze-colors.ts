import { Jimp } from 'jimp';

async function analyze() {
  const image = await Jimp.read('https://lh3.googleusercontent.com/d/1PEKm1sRID-iwDHrCGll7tqyAiNkI_XKY?v=2');
  const colors: Record<string, number> = {};
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];
    
    if (a > 0) {
      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
      colors[hex] = (colors[hex] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
  
  console.log('Top brown colors:');
  let count = 0;
  for (let i = 0; i < sorted.length; i++) {
    const [hex, freq] = sorted[i];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Check if it's a brown color (R > G > B, not grayscale, not pure black/white)
    const isBrown = r > g && g > b && r > 50 && r < 200 && (r - g) > 10;
    
    if (isBrown) {
      console.log(`${hex}: ${freq}`);
      count++;
      if (count >= 10) break;
    }
  }
}

analyze().catch(console.error);
