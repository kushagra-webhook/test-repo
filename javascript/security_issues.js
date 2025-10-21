/**
 * This file contains intentional security issues for testing security analysis tools.
 * DO NOT use this code in production!
 */

// Hardcoded credentials (Security issue: Hardcoded secret)
const DB_PASSWORD = 'mySuperSecretPassword123!';
const API_KEYS = {
  production: 'prod_1234567890abcdef',
  staging: 'staging_0987654321',
  test: 'test_key_abcdef123456'
};

// SQL Injection vulnerability
function getUserDetails(username) {
  // WARNING: This is vulnerable to SQL injection!
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  return executeQuery(query);
}

// Command Injection vulnerability
function pingHost(host) {
  // WARNING: This is vulnerable to command injection!
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout);
    });
  });
}

// XSS Vulnerability
function displayUserComment(comment) {
  // WARNING: This is vulnerable to XSS!
  document.getElementById('comment-section').innerHTML = comment;
}

// Insecure random number generation
function generateSessionToken() {
  // WARNING: Math.random() is not cryptographically secure!
  return Math.random().toString(36).substring(2);
}

// Sensitive data in logs
function logUserActivity(userId, action) {
  // WARNING: Logging sensitive information!
  console.log(`User ${userId} performed action: ${action} with token: ${API_KEYS.production}`);
}

// Insecure file operations
const fs = require('fs');
const path = require('path');

function readUserFile(username, filename) {
  // WARNING: Path traversal vulnerability!
  const filePath = path.join('/data/users', username, filename);
  return fs.readFileSync(filePath, 'utf8');
}

// Insecure deserialization
function deserializeUserData(serializedData) {
  // WARNING: eval() can execute arbitrary code!
  return eval('(' + serializedData + ')');
}

// Insecure cookie settings
function setAuthCookie(res, userId) {
  // WARNING: Insecure cookie settings!
  res.cookie('auth', userId, {
    httpOnly: false, // Should be true
    secure: false,   // Should be true in production
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
}

// Hardcoded encryption key (Security issue: Insecure key management)
const CRYPTO_KEY = 'insecureStaticKey123!';

// Insecure encryption
function encryptData(data) {
  const crypto = require('crypto');
  const cipher = crypto.createCipher('aes-256-cbc', CRYPTO_KEY);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Example of prototype pollution vulnerability
function merge(target, source) {
  // WARNING: This is vulnerable to prototype pollution!
  for (const key in source) {
    target[key] = source[key];
  }
  return target;
}

// Example usage of vulnerable functions
const userInput = req.query.username || 'guest';
const user = getUserDetails(userInput);

// Log sensitive information
logUserActivity(user.id, 'login');

// Set insecure cookie
setAuthCookie(res, user.id);

// Export for testing
module.exports = {
  getUserDetails,
  pingHost,
  displayUserComment,
  generateSessionToken,
  readUserFile,
  deserializeUserData,
  encryptData,
  merge
};
