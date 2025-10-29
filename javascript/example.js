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

// New utility function to generate a random string
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Enhanced performance tracking with error handling and resource monitoring
const withPerformanceTracking = (fn, options = {}) => {
  return async (...args) => {
    const start = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const metrics = {
      startTime: new Date().toISOString(),
      memoryUsage: {},
      success: false,
      error: null
    };
    
    try {
      const result = await Promise.resolve(fn(...args));
      const endMemory = process.memoryUsage().heapUsed;
      
      metrics.executionTime = performance.now() - start;
      metrics.memoryUsage = {
        start: startMemory,
        end: endMemory,
        delta: endMemory - startMemory
      };
      metrics.success = true;
      
      return {
        result,
        metrics
      };
    } catch (error) {
      metrics.executionTime = performance.now() - start;
      metrics.error = {
        name: error.name,
        message: error.message,
        stack: options.includeStackTrace ? error.stack : undefined
      };
      
      return {
        error: metrics.error,
        metrics
      };
    }
  };
};

// Simulate API call with retry logic
const simulateApiCall = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    data = null,
    retries = 2,
    delay = 1000
  } = options;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
      
      // Simulate occasional failures
      if (Math.random() < 0.2) {
        throw new Error('Simulated API failure');
      }
      
      // Return mock response
      return {
        status: 200,
        data: {
          id: Math.random().toString(36).substring(2, 10),
          endpoint,
          method,
          timestamp: new Date().toISOString(),
          attempt
        }
      };
    } catch (error) {
      if (attempt > retries) {
        throw new Error(`API call failed after ${retries + 1} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
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

// Enhanced webhook test with API simulation and comprehensive reporting
const runWebhookTest = withPerformanceTracking(async () => {
  const testId = `test_${generateRandomString(8)}`;
  const testStart = new Date().toISOString();
  
  console.log(`\n` + '='.repeat(60));
  console.log(`🚀 WEBHOOK TEST #4 - ${testId}`.padEnd(58) + '🚀');
  console.log('='.repeat(60));
  
  // Test configuration
  const config = {
    testRuns: 3,
    apiEndpoints: [
      '/api/users',
      '/api/products',
      '/api/orders'
    ],
    concurrency: 2
  };
  
  // Run tests
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    totalDuration: 0,
    apiCalls: []
  };
  
  // Run multiple test cases
  for (let i = 0; i < config.testRuns; i++) {
    const runStart = performance.now();
    const runId = i + 1;
    
    console.log(`\n🔹 Test Run #${runId} - Starting...`);
    
    // Test each API endpoint
    const apiPromises = config.apiEndpoints.map(async (endpoint) => {
      try {
        const response = await simulateApiCall(endpoint, {
          method: 'GET',
          retries: 1
        });
        
        results.apiCalls.push({
          endpoint,
          status: 'success',
          attempt: response.data.attempt,
          timestamp: response.data.timestamp
        });
        
        return { success: true, endpoint };
      } catch (error) {
        results.apiCalls.push({
          endpoint,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        return { success: false, endpoint, error };
      }
    });
    
    // Process results
    const runResults = await Promise.all(apiPromises);
    const runDuration = (performance.now() - runStart) / 1000;
    
    // Update statistics
    results.totalTests += config.apiEndpoints.length;
    results.passed += runResults.filter(r => r.success).length;
    results.failed += runResults.filter(r => !r.success).length;
    results.totalDuration += runDuration;
    
    console.log(`   ✅ ${runResults.filter(r => r.success).length} passed`);
    if (results.failed > 0) {
      console.log(`   ❌ ${runResults.filter(r => !r.success).length} failed`);
    }
    console.log(`   ⏱️  Duration: ${runDuration.toFixed(2)}s`);
  }
  
  // Calculate success rate
  const successRate = (results.passed / results.totalTests) * 100;
  const avgDuration = results.totalDuration / config.testRuns;
  
  // Generate report
  const report = {
    testId,
    version: '4.0.0',
    timestamp: testStart,
    duration: results.totalDuration,
    stats: {
      totalTests: results.totalTests,
      passed: results.passed,
      failed: results.failed,
      successRate: parseFloat(successRate.toFixed(2)),
      avgDuration: parseFloat(avgDuration.toFixed(2)),
      apiCalls: results.apiCalls
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  };
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY'.padEnd(58) + '📊');
  console.log('='.repeat(60));
  console.log(`Total Tests:  ${report.stats.totalTests}`);
  console.log(`✅ Passed:     ${report.stats.passed}`);
  console.log(`❌ Failed:     ${report.stats.failed}`);
  console.log(`📈 Success:    ${report.stats.successRate}%`);
  console.log(`⏱️  Avg. Time:  ${report.stats.avgDuration.toFixed(2)}s`);
  console.log('='.repeat(60));
  
  return report;
}, { includeStackTrace: true });

// Execute the test
const testResult = runWebhookTest();

// Export for testing
module.exports = {
  User,
  formatDate,
  calculateTotal
};
