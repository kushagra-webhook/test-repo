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

// Rate limiter for API calls
class RateLimiter {
  constructor(requestsPerSecond) {
    this.requestsPerSecond = requestsPerSecond;
    this.queue = [];
    this.processing = false;
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const { timestamp, resolve, endpoint } = this.queue[0];
      
      if (now - timestamp >= 1000 / this.requestsPerSecond) {
        this.queue.shift();
        resolve(await this.makeApiCall(endpoint));
      } else {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    this.processing = false;
  }

  async makeApiCall(endpoint) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    
    // Simulate occasional failures (15% chance)
    if (Math.random() < 0.15) {
      throw new Error(`API call to ${endpoint} failed`);
    }
    
    return {
      status: 200,
      data: {
        id: Math.random().toString(36).substring(2, 10),
        endpoint,
        timestamp: new Date().toISOString(),
        processedAt: Date.now()
      }
    };
  }

  async call(endpoint) {
    return new Promise((resolve) => {
      this.queue.push({
        timestamp: Date.now(),
        resolve: (result) => resolve({ success: true, ...result }),
        endpoint
      });
      this.processQueue();
    }).catch(error => ({
      success: false,
      error: error.message,
      endpoint
    }));
  }
}

// Initialize rate limiter (5 requests per second)
const apiRateLimiter = new RateLimiter(5);

// Batch processor for multiple API calls
class BatchProcessor {
  constructor(batchSize = 5) {
    this.batchSize = batchSize;
    this.queue = [];
    this.results = [];
    this.processing = false;
    this.done = null;
  }

  async processBatch(batch) {
    const promises = batch.map(({ endpoint, resolve, reject }) => 
      apiRateLimiter.call(endpoint)
        .then(result => resolve(result))
        .catch(error => reject(error))
    );
    
    return Promise.all(promises);
  }

  async add(endpoint) {
    return new Promise((resolve, reject) => {
      this.queue.push({ endpoint, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processBatch(batch);
    }
    
    this.processing = false;
    if (this.done) this.done();
  }

  async waitForCompletion() {
    if (this.queue.length === 0 && !this.processing) {
      return Promise.resolve();
    }
    
    return new Promise(resolve => {
      this.done = resolve;
    });
  }
}

// Simulate API call with retry logic and rate limiting
const simulateApiCall = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    data = null,
    retries = 2,
    delay = 1000
  } = options;
  
  const batchProcessor = new BatchProcessor(3); // Process 3 requests in parallel
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await batchProcessor.add(endpoint);
      if (result.success) {
        return result;
      }
      throw new Error(result.error || 'API call failed');
    } catch (error) {
      if (attempt > retries) {
        throw new Error(`API call failed after ${retries + 1} attempts: ${error.message}`);
      }
      
      // Exponential backoff with jitter
      const backoff = Math.min(delay * Math.pow(2, attempt - 1), 10000);
      const jitter = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff + jitter));
    }
  }
  
  await batchProcessor.waitForCompletion();
}

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

// Enhanced webhook test with advanced features
const runWebhookTest = withPerformanceTracking(async () => {
  const testId = `test_${generateRandomString(8)}`;
  const testStart = new Date().toISOString();
  
  console.log(`\n` + '='.repeat(70));
  console.log(`🚀 WEBHOOK TEST #5 - ${testId}`.padEnd(68) + '🚀');
  console.log('='.repeat(70));
  
  // Test configuration
  const config = {
    testRuns: 5,  // Increased test runs for better metrics
    apiEndpoints: [
      '/api/users',
      '/api/users/active',
      '/api/products',
      '/api/products/popular',
      '/api/orders',
      '/api/orders/recent',
      '/api/inventory',
      '/api/analytics'
    ],
    concurrency: 3,  // Process 3 requests in parallel
    rateLimit: 5,    // 5 requests per second
    timeout: 10000,  // 10 second timeout per request
    retryPolicy: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000
    }
  };
  
  // Initialize test environment
  console.log('\n🔧 Test Configuration:');
  console.log(`   Test Runs: ${config.testRuns}`);
  console.log(`   Endpoints: ${config.apiEndpoints.join(', ')}`);
  console.log(`   Concurrency: ${config.concurrency} parallel requests`);
  console.log(`   Rate Limit: ${config.rateLimit} requests/second`);
  console.log(`   Timeout: ${config.timeout}ms per request`);
  console.log(`   Retry Policy: ${config.retryPolicy.maxRetries} retries`);
  console.log('='.repeat(70));
  
  // Initialize test results with enhanced metrics
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    totalDuration: 0,
    apiCalls: [],
    endpointStats: {},
    responseTimes: [],
    errors: [],
    retries: 0,
    rateLimited: 0,
    timeouts: 0,
    startTime: performance.now(),
    testRuns: []
  };
  
  // Initialize endpoint statistics
  config.apiEndpoints.forEach(endpoint => {
    results.endpointStats[endpoint] = {
      calls: 0,
      successes: 0,
      failures: 0,
      totalResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      lastError: null
    };
  });
  
  // Run multiple test cases with enhanced error handling
  for (let i = 0; i < config.testRuns; i++) {
    const runStart = performance.now();
    const runId = i + 1;
    
    console.log(`\n🔹 Test Run #${runId} - Starting (${i + 1}/${config.testRuns})...`);
    
    // Process endpoints in batches for better control
    const batchSize = config.concurrency;
    const endpointBatches = [];
    
    for (let j = 0; j < config.apiEndpoints.length; j += batchSize) {
      endpointBatches.push(config.apiEndpoints.slice(j, j + batchSize));
    }
    
    const runResults = [];
    
    // Process each batch
    for (const [batchIndex, batch] of endpointBatches.entries()) {
      const batchStart = performance.now();
      console.log(`   Batch ${batchIndex + 1}/${endpointBatches.length}: Testing ${batch.join(', ')}`);
      
      const batchPromises = batch.map(async (endpoint) => {
        const callStart = performance.now();
        let attempts = 0;
        let lastError = null;
        
        // Initialize endpoint stats if not exists
        if (!results.endpointStats[endpoint]) {
          results.endpointStats[endpoint] = {
            calls: 0,
            successes: 0,
            failures: 0,
            totalResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0,
            lastError: null
          };
        }
        
        // Update endpoint call count
        results.endpointStats[endpoint].calls++;
        results.totalTests++;
        
        // Simulate API call with retries
        while (attempts <= config.retryPolicy.maxRetries) {
          attempts++;
          
          try {
            // Apply rate limiting
            if (results.apiCalls.length > 0 && 
                results.apiCalls.length % config.rateLimit === 0) {
              //console.log(`   ⏳ Rate limiting (${config.rateLimit} req/s)...`);
              results.rateLimited++;
              await new Promise(resolve => setTimeout(resolve, 1000 / config.rateLimit));
            }
            
            // Simulate API call with timeout
            const apiPromise = simulateApiCall(endpoint, {
              method: 'GET',
              retries: 0, // We handle retries manually
              timeout: config.timeout
            });
            
            // Add timeout handling
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), config.timeout)
            );
            
            const response = await Promise.race([apiPromise, timeoutPromise]);
            const responseTime = performance.now() - callStart;
            
            // Update response time metrics
            results.responseTimes.push(responseTime);
            results.endpointStats[endpoint].totalResponseTime += responseTime;
            results.endpointStats[endpoint].minResponseTime = 
              Math.min(results.endpointStats[endpoint].minResponseTime, responseTime);
            results.endpointStats[endpoint].maxResponseTime = 
              Math.max(results.endpointStats[endpoint].maxResponseTime, responseTime);
            
            // Record successful call
            results.endpointStats[endpoint].successes++;
            results.passed++;
            
            results.apiCalls.push({
              endpoint,
              status: 'success',
              responseTime,
              timestamp: new Date().toISOString(),
              attempt: attempts,
              runId
            });
            
            return { 
              success: true, 
              endpoint, 
              responseTime,
              attempts
            };
            
          } catch (error) {
            lastError = error;
            results.errors.push({
              endpoint,
              error: error.message,
              timestamp: new Date().toISOString(),
              attempt: attempts,
              runId
            });
            
            if (error.message.includes('timeout')) {
              results.timeouts++;
            }
            
            // If we've reached max retries, record the failure
            if (attempts > config.retryPolicy.maxRetries) {
              results.endpointStats[endpoint].failures++;
              results.failed++;
              results.endpointStats[endpoint].lastError = error.message;
              
              results.apiCalls.push({
                endpoint,
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString(),
                attempt: attempts,
                runId
              });
              
              return { 
                success: false, 
                endpoint, 
                error: error.message,
                attempts
              };
            }
            
            // Exponential backoff with jitter
            const backoff = Math.min(
              config.retryPolicy.initialDelay * Math.pow(2, attempts - 1),
              config.retryPolicy.maxDelay
            );
            const jitter = Math.random() * 500; // Add up to 500ms jitter
            await new Promise(resolve => setTimeout(resolve, backoff + jitter));
            results.retries++;
          }
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      runResults.push(...batchResults);
      
      const batchDuration = (performance.now() - batchStart) / 1000;
      console.log(`   Batch ${batchIndex + 1} completed in ${batchDuration.toFixed(2)}s`);
    }
    
    const runDuration = (performance.now() - runStart) / 1000;
    results.totalDuration += runDuration;
    
    // Calculate run statistics
    const runStats = {
      runId,
      startTime: new Date().toISOString(),
      duration: runDuration,
      totalCalls: runResults.length,
      successfulCalls: runResults.filter(r => r.success).length,
      failedCalls: runResults.filter(r => !r.success).length,
      successRate: (runResults.filter(r => r.success).length / runResults.length * 100).toFixed(2) + '%',
      avgResponseTime: runResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / runResults.length,
      endpointsTested: [...new Set(runResults.map(r => r.endpoint))].length
    };
    
    results.testRuns.push(runStats);
    
    // Print run summary
    console.log(`\n📊 Run #${runId} Summary:`);
    console.log(`   ✅ ${runStats.successfulCalls} passed`);
    if (runStats.failedCalls > 0) {
      console.log(`   ❌ ${runStats.failedCalls} failed`);
    }
    console.log(`   ⏱️  Duration: ${runDuration.toFixed(2)}s`);
    console.log(`   📈 Success Rate: ${runStats.successRate}`);
    console.log(`   🚀 Avg. Response: ${runStats.avgResponseTime.toFixed(2)}ms`);
    
    // If not the last run, add a small delay between runs
    if (i < config.testRuns - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
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
