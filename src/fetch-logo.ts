import https from 'https';
import fs from 'fs';

https.get('https://lh3.googleusercontent.com/d/1PEKm1sRID-iwDHrCGll7tqyAiNkI_XKY?v=2', (res) => {
  const data: Buffer[] = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    fs.writeFileSync('logo.png', buffer);
    console.log('Downloaded logo.png');
  });
});
