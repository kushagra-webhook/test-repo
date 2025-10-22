/**
 * This file contains intentional security issues for testing security analysis tools.
 * DO NOT use this code in production!
 */

// Hardcoded credentials (Security issue: Hardcoded secret)
const DB_PASSWORD = 'mySuperSecretPassword123!';
const API_KEYS = {
  production: 'prod_1234567890abcdef',
  staging: 'staging_0987654321',
  test: 'test_key_abcdef123456',
  // More hardcoded credentials
  aws: {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-east-1'
  },
  // JWT secret (should be in environment variables)
  jwtSecret: 'my_jwt_super_secret_key_12345!@#',
  // Database connection string with credentials
  dbConnection: 'mongodb://admin:admin123@localhost:27017/production'
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
  try {
    return eval('(' + serializedData + ')');
  } catch (e) {
    console.error('Deserialization failed:', e);
    return null;
  }
}

// Insecure direct object reference (IDOR) vulnerability
function getUserProfile(userId) {
  // WARNING: No authorization check!
  return db.users.findOne({ id: userId });
}

// Insecure cookie settings (missing httpOnly and secure flags)
function setSessionCookie(res, userId) {
  res.cookie('session', userId, {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: false, // Should be true
    secure: false,   // Should be true in production
    sameSite: 'lax'
  });
}

// SQL Injection vulnerability (using string concatenation)
function searchUsers(searchTerm) {
  // WARNING: Vulnerable to SQL injection!
  return db.query(`SELECT * FROM users WHERE username LIKE '%${searchTerm}%'`);
}

// Hardcoded encryption key (Security issue)
const ENCRYPTION_KEY = 'insecure-static-key-12345';

// Insecure password hashing (using weak algorithm)
function hashPassword(password) {
  const crypto = require('crypto');
  // WARNING: Using weak MD5 hashing
  return crypto.createHash('md5').update(password).digest('hex');
}

// Insecure random number generation
function generateResetToken() {
  // WARNING: Math.random() is not cryptographically secure!
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
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

// Example of IDOR vulnerability
app.get('/api/user/profile/:id', (req, res) => {
  // No authorization check - any user can access any profile!
  const userProfile = getUserProfile(req.params.id);
  res.json(userProfile);
});

// Example of SQL injection vulnerability
app.get('/api/users/search', (req, res) => {
  const results = searchUsers(req.query.term);
  res.json(results);
});

// Example of insecure password reset
app.post('/api/reset-password', (req, res) => {
  const token = generateResetToken();
  // In a real app, this would be sent via email
  console.log(`Password reset token for ${req.body.email}: ${token}`);
  res.json({ success: true });
});

// Example of insecure file upload
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), (req, res) => {
  // WARNING: No file type validation!
  res.json({ success: true, file: req.file });
});

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
