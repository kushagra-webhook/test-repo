/**
 * Example JavaScript file with various patterns for testing code quality.
 */

// Constants
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;

// Utility functions
const formatName = (firstName, lastName) => `${firstName} ${lastName}`.trim();

// New utility function to format a date string
const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
};

const calculateTotal = (items) => {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  return items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + (price * quantity);
  }, 0);
};

// Class example
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isActive = false;
    this._privateData = {}; // Intentionally using underscore to indicate "private"
  }

  activate() {
    this.isActive = true;
    this._updateLastActive();
    return this;
  }

  _updateLastActive() {
    this.lastActive = new Date().toISOString();
  }

  // Getters and setters
  get profile() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      lastActive: this.lastActive
    };
  }

  set profile({ name, email }) {
    if (name) this.name = name;
    if (email) this.validateAndSetEmail(email);
  }

  // Method with potential side effects
  async fetchUserData() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${this.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: DEFAULT_TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      Object.assign(this, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  // Input validation
  validateAndSetEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    this.email = email;
    return true;
  }

  // Method with callback
  processWithRetry(operation, retries = MAX_RETRIES, delay = 1000) {
    return new Promise((resolve, reject) => {
      const attempt = (attemptsLeft) => {
        operation()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft <= 0) {
              reject(new Error(`Max retries (${MAX_RETRIES}) exceeded: ${error.message}`));
              return;
            }
            console.log(`Retry ${MAX_RETRIES - attemptsLeft + 1}/${MAX_RETRIES}...`);
            setTimeout(() => attempt(attemptsLeft - 1), delay);
          });
      };
      
      attempt(retries);
    });
  }
}

// New utility function for array operations
class ArrayUtils {
  /**
   * Chunks an array into smaller arrays of a specified size
   * @param {Array} array - The array to be chunked
   * @param {number} size - The size of each chunk
   * @returns {Array<Array>} - Array of chunks
   */
  static chunk(array, size) {
    if (!Array.isArray(array)) {
      throw new TypeError('First argument must be an array');
    }
    
    const chunkSize = Math.max(Number(size) || 1, 1);
    const result = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    
    return result;
  }

  /**
   * Removes duplicate values from an array
   * @param {Array} array - The array to process
   * @returns {Array} - A new array with duplicates removed
   */
  static uniq(array) {
    if (!Array.isArray(array)) {
      throw new TypeError('Argument must be an array');
    }
    return [...new Set(array)];
  }
}

// Example usage
const user = new User(1, 'John Doe', 'john@example.com');
user.activate();

// Example of using the class
const processUser = async () => {
  try {
    await user.fetchUserData();
    console.log('User profile:', user.profile);
    
    // Simulate an async operation with retry
    await user.processWithRetry(() => {
      return new Promise((resolve, reject) => {
        // Simulate random failure
        if (Math.random() > 0.3) {
          reject(new Error('Temporary failure'));
        } else {
          resolve('Operation succeeded');
        }
      });
    });
    
    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Error processing user:', error);
  }
};

// Run the example
processUser();

// Test the new ArrayUtils
const testArrayUtils = () => {
  console.log('\n--- Testing ArrayUtils ---');
  
  // Test chunk
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
  console.log('Chunk [1-8] into 3s:', ArrayUtils.chunk(numbers, 3));
  
  // Test uniq
  const withDuplicates = [1, 2, 2, 3, 4, 4, 4, 5];
  console.log('Remove duplicates:', ArrayUtils.uniq(withDuplicates));
};

testArrayUtils();

// Export for testing
module.exports = {
  User,
  formatName,
  calculateTotal
};
