import fs from 'fs';
import crypto from 'crypto';

async function generateAESKey(password) {
  const passwordBuffer = new TextEncoder().encode(password);
  const hashedPassword = await crypto.subtle.digest("SHA-256", passwordBuffer);
  return crypto.subtle.importKey(
    "raw",
    hashedPassword.slice(0, 32),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function decryptFile(path, password) {
  const encryptedData = fs.readFileSync(path);
  const iv = new Uint8Array(encryptedData.slice(0, 16));
  const data = encryptedData.slice(16);
  const key = await generateAESKey(password);
  const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data);
  return Buffer.from(decryptedBuffer);
}

decryptFile('public/models/character.enc', 'MyCharacter12').then(buffer => {
  const content = buffer.toString('utf8');
  // Look for "nodes" in the GLTF JSON
  const matches = content.match(/"name":"([^"]+)"/g);
  if (matches) {
      const names = new Set(matches.map(m => m.split(':')[1].replace(/"/g, '')));
      console.log(Array.from(names).join('\n'));
  }
}).catch(console.error);
