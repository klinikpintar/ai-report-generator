import crypto from 'crypto';
import config from "../config";

const SECRET_KEY = config.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

export function encryptApiKey(text: string): string {
  // Create a random initialization vector
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    Buffer.from(SECRET_KEY), 
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptApiKey(encryptedText: string): string {
  // Split IV and encrypted data
  const parts = encryptedText.split(':');
  
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    Buffer.from(SECRET_KEY), 
    iv
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}