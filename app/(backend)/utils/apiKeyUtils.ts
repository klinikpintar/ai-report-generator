import crypto from 'crypto';
import config from "../config";

const ENCRYPTION_KEY = config.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set');
}

const SECRET_KEY = Buffer.from(ENCRYPTION_KEY, 'hex');
if (SECRET_KEY.length !== 32) {
  throw new Error('Encryption key must be exactly 32 bytes (64-character hex string)');
}

export function encryptApiKey(text: string): string {
  // Create a random initialization vector
  const iv = crypto.randomBytes(12);
  
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    SECRET_KEY, 
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decryptApiKey(encryptedText: string): string {
  // Split IV and encrypted data
  const parts = encryptedText.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');

  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    SECRET_KEY, 
    iv
  );

  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}