// lib/encryption.js
import crypto from 'crypto';

// Use environment variables for keys
// In production, use AWS KMS, Google Cloud KMS, or HashiCorp Vault
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_KEY is required in production');
}

// For development, generate a key if not provided
const getEncryptionKey = () => {
  if (ENCRYPTION_KEY) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  
  // Development fallback - DO NOT USE IN PRODUCTION
  console.warn('⚠️ Using development encryption key. This is not secure for production!');
  return crypto.scryptSync('dev-key-unsafe-change-in-prod', 'salt', 32);
};

export function encrypt(text) {
  if (!text) return null;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  // Combine iv + authTag + encrypted text
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }
  
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Hash function for non-reversible data (like security questions)
export function hash(data, salt = null) {
  const hash = crypto.createHash('sha256');
  if (salt) {
    hash.update(salt);
  }
  hash.update(data);
  return hash.digest('hex');
}

// Generate secure random strings
export function generateSecureRandom(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}