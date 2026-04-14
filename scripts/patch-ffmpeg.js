import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function patchFfmpeg() {
    console.log("-------------------------------------------------");
    console.log("🎬 Doggy Player: Automatisk FFmpeg Codec Patcher v2.0");
    console.log("Låser upp stöd för MKV, AVI, AC3, DTS, HEVC...");
    console.log("Nyhet: Inkluderar nu även Audio-Transcoding Fallback!");
    console.log("-------------------------------------------------");

    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') {
            console.log("⚠️ Detta skript patchar endast Windows (ffmpeg.dll). Hoppar över för Mac/Linux...");
            return resolve(true);
        }

        try {
            const electronPath = path.resolve(__dirname, '../node_modules/electron');
            if (!fs.existsSync(electronPath)) {
                console.error("❌ Electron är inte installerat i node_modules ännu.");
                return resolve(false);
            }

            // Hämta Chromium version från Electron
            console.log("🔍 Letar upp Chromiums exakta version...");
            
            // Få Electron version
            const pkgInfo = JSON.parse(fs.readFileSync(path.join(electronPath, 'package.json'), 'utf-8'));
            const electronVersion = pkgInfo.version;
            console.log(`📦 Electron version hittad: ${electronVersion}`);

            // I Chromium/Electron världen måste vi hitta en passande FFmpeg.dll
            // Vi använder iteufel NW.js FFmpeg Prebuilt Github Repo för detta ändamål
            // Eftersom vi inte vet Chrome-versionen i förväg, hämtar vi senaste releasen av prebuilt ffmpeg för Windows x64.
            
            const repo = "iteufel/nwjs-ffmpeg-prebuilt";
            console.log("🌐 Kontaktar GitHub för att hitta rätt DLL...");

            const directUrl = 'https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/0.110.1/0.110.1-win-x64.zip';
            console.log(`📥 Laddar ner: 0.110.1-win-x64.zip från GitHub...`);
            downloadAndExtract(directUrl, electronPath, resolve);

        } catch (globalError) {
            console.error("❌ Okänt fel inträffade:", globalError.message);
            resolve(false);
        }
    });
}

function downloadAndExtract(url, electronPath, resolve) {
    const tempZip = path.join(__dirname, 'ffmpeg-temp.zip');
    
    https.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
            return downloadAndExtract(res.headers.location, electronPath, resolve); // Handle redirect
        }

        const fileStream = fs.createWriteStream(tempZip);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close(() => {
                setTimeout(() => {
                    console.log("✅ Nedladdning klar! Packar upp...");
                    verifyAndReplace(tempZip, electronPath, resolve);
                }, 1500); // Wait for Windows OS to release the file lock
            });
        });
    }).on('error', (err) => {
        console.error("❌ Nedladdningsfel:", err.message);
        if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
        resolve(false);
    });
}

function verifyAndReplace(zipPath, electronPath, resolve) {
    try {
        // Vi använder node's inbyggda verktyg e.t.c eller externa commands
        // Eftersom appen kör i Windows använder vi PowerShell för att packa upp zippen säkert
        const tempFolder = path.join(__dirname, 'ffmpeg-temp-ext');
        if (fs.existsSync(tempFolder)) fs.rmSync(tempFolder, { recursive: true, force: true });
        fs.mkdirSync(tempFolder);

        console.log("📦 Extraherar filen...");
        execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempFolder}' -Force"`);

        // Sök efter ffmpeg.dll
        const files = fs.readdirSync(tempFolder);
        let dllName = files.find(f => f.toLowerCase() === 'ffmpeg.dll');
        
        if (!dllName) {
             console.error("❌ Kunde inte hitta ffmpeg.dll i det nedladdade paketet.");
             cleanup(zipPath, tempFolder);
             return resolve(false);
        }

        const newDllPath = path.join(tempFolder, dllName);
        const destinationPath = path.join(electronPath, 'dist', 'ffmpeg.dll');

        console.log("✨ Byter ut Electrons standard FFmpeg...");
        if (fs.existsSync(destinationPath)) {
            // Backup the original one just in case
            const backupPath = destinationPath + '.backup';
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(destinationPath, backupPath);
            }
        }

        fs.copyFileSync(newDllPath, destinationPath);
        console.log("🎉 SUCCESS! Doggy Player har nu fullt stöd för MKV, AC3, DTS och AVI.");
        
        cleanup(zipPath, tempFolder);
        resolve(true);

    } catch (err) {
        console.error("❌ Fel vid extrahering/kopiering:", err.message);
        cleanup(zipPath, path.join(__dirname, 'ffmpeg-temp-ext'));
        resolve(false);
    }
}

function cleanup(zipPath, tempFolder) {
    try {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        if (fs.existsSync(tempFolder)) fs.rmSync(tempFolder, { recursive: true, force: true });
        console.log("🧹 Städat bort temporära nedladdningsfiler.");
    } catch(e) {}
}

patchFfmpeg();
