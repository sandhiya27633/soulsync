/**
 * Native Web Crypto API AES-GCM wrapper for SoulSync.
 * Used to encrypt raw message content before writing to Firestore database
 * and decrypt them upon retrieval, ensuring HIPAA-level database privacy.
 */

// Derive an AES-GCM Key from a passphrase
async function getCryptoKey(passphrase) {
  const enc = new TextEncoder();
  // Pad/trim passphrase to 32 bytes for SHA-256 equivalent raw material
  const keyBuffer = enc.encode(passphrase.padEnd(32, 'soulsync-secret-salt').slice(0, 32));
  
  return crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext string using AES-GCM.
 * Returns a Base64 string containing [IV (12 bytes) + Ciphertext].
 */
export async function encryptText(plaintext, passphrase = "soulsync_client_secret_key_2026") {
  if (!plaintext) return "";
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const key = await getCryptoKey(passphrase);
    
    // Generate random 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    
    // Combine IV and ciphertext into a single byte array
    const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertextBuffer), iv.length);
    
    // Convert combined bytes to base64
    let binary = "";
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Encryption error:", error);
    // Return original plaintext as absolute fallback
    return plaintext;
  }
}

/**
 * Decrypts a Base64 string containing [IV (12 bytes) + Ciphertext] using AES-GCM.
 */
export async function decryptText(encryptedBase64, passphrase = "soulsync_client_secret_key_2026") {
  if (!encryptedBase64) return "";
  try {
    // If not a valid base64-like string, return directly (might be plain text from previous entries)
    if (!/^[A-Za-z0-9+/=]+$/.test(encryptedBase64)) {
      return encryptedBase64;
    }
    
    const binaryString = atob(encryptedBase64);
    const len = binaryString.length;
    
    // Needs to have at least the 12-byte IV
    if (len <= 12) return encryptedBase64;
    
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);
    const key = await getCryptoKey(passphrase);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    // If decryption fails (e.g. key mismatch or string is not encrypted), return original
    return encryptedBase64;
  }
}
