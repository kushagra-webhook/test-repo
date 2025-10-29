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

// Enhanced webhook test with advanced features including circuit breaker and distributed tracing
const runWebhookTest = withPerformanceTracking(async () => {
  // Feature flag for enabling/disabling circuit breaker
  const CIRCUIT_BREAKER_ENABLED = true;
  const CIRCUIT_BREAKER_THRESHOLD = 5; // Number of failures before opening circuit
  const CIRCUIT_BREAKER_RESET_TIMEOUT = 30000; // 30 seconds
  
  // Distributed tracing
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Circuit breaker state
  const circuitBreaker = {
    isOpen: false,
    failureCount: 0,
    lastFailure: null,
    
    async execute(requestFn) {
      if (this.isOpen) {
        const timeSinceLastFailure = Date.now() - this.lastFailure;
        if (timeSinceLastFailure > CIRCUIT_BREAKER_RESET_TIMEOUT) {
          this.isOpen = false;
          logger.info(`Circuit breaker reset after ${timeSinceLastFailure}ms`, { traceId });
        } else {
          throw new Error(`Circuit breaker is open. Too many failures. Auto-reset in ${Math.ceil((CIRCUIT_BREAKER_RESET_TIMEOUT - timeSinceLastFailure) / 1000)}s`);
        }
      }
      
      try {
        const result = await requestFn();
        this.recordSuccess();
        return result;
      } catch (error) {
        this.recordFailure();
        throw error;
      }
    },
    
    recordFailure() {
      if (!CIRCUIT_BREAKER_ENABLED) return;
      
      this.failureCount++;
      this.lastFailure = Date.now();
      
      if (this.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
        this.isOpen = true;
        logger.error('Circuit breaker tripped!', { 
          traceId,
          failureCount: this.failureCount,
          lastFailure: new Date(this.lastFailure).toISOString()
        });
        
        // Auto-reset after timeout
        setTimeout(() => {
          this.isOpen = false;
          this.failureCount = 0;
          logger.info('Circuit breaker reset after timeout', { traceId });
        }, CIRCUIT_BREAKER_RESET_TIMEOUT);
      }
    },
    
    recordSuccess() {
      if (this.failureCount > 0) {
        this.failureCount = 0;
        logger.info('Request succeeded, resetting failure count', { traceId });
      }
    }
  };
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
  
  // Initialize test results with enhanced metrics and distributed tracing
  const results = {
    testId: `test_${Date.now()}`,
    traceId,
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
    circuitBreakerTrips: 0,
    startTime: performance.now(),
    testRuns: [],
    metadata: {
      environment: process.env.NODE_ENV || 'development',
      hostname: require('os').hostname(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      cpuCount: require('os').cpus().length,
      memory: process.memoryUsage(),
      commandLineArgs: process.argv,
      environmentVariables: Object.keys(process.env).filter(k => 
        k.startsWith('NODE_') || 
        k.startsWith('WEBHOOK_') || 
        k === 'DEBUG' || 
        k === 'CI'
      ).reduce((acc, k) => ({ ...acc, [k]: process.env[k] }), {})
    },
    // Add correlation IDs for distributed tracing
    correlationIds: {
      sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
      requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
      parentSpanId: `span_${Math.random().toString(36).substr(2, 9)}`,
      traceFlags: '01' // Sampled flag
    },
    // Add performance budget tracking
    performanceBudget: {
      maxResponseTime: 1000, // ms
      errorRateThreshold: 0.05, // 5%
      maxConcurrentRequests: config.concurrency || 10,
      budgetConsumed: 0,
      isWithinBudget: true,
      checkBudget() {
        const errorRate = this.totalTests > 0 ? this.failed / this.totalTests : 0;
        const avgResponseTime = this.responseTimes.length > 0 
          ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
          : 0;
          
        const isErrorRateOk = errorRate <= this.errorRateThreshold;
        const isResponseTimeOk = avgResponseTime <= this.maxResponseTime;
        
        this.isWithinBudget = isErrorRateOk && isResponseTimeOk;
        this.budgetConsumed = Math.max(
          errorRate / this.errorRateThreshold,
          avgResponseTime / this.maxResponseTime
        ) * 100;
        
        return this.isWithinBudget;
      }
    }
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
            // Apply rate limiting with adaptive throttling
            const currentTime = Date.now();
            const lastMinuteCalls = results.apiCalls.filter(call => 
              currentTime - new Date(call.timestamp).getTime() < 60000
            ).length;
            
            const requestsPerMinute = config.rateLimit * 60;
            const adaptiveRateLimit = Math.max(
              config.rateLimit * 0.5, // Never go below 50% of target rate
              config.rateLimit - Math.floor(lastMinuteCalls / 60) // Reduce rate as we approach limit
            );
            
            if (results.apiCalls.length > 0 && 
                results.apiCalls.length % Math.ceil(1000 / adaptiveRateLimit) === 0) {
              results.rateLimited++;
              
              // Add jitter to prevent thundering herd
              const jitter = Math.random() * 200 - 100; // ±100ms
              await new Promise(resolve => setTimeout(resolve, (1000 / adaptiveRateLimit) + jitter));
            }
            
            // Generate a unique span ID for distributed tracing
            const spanId = `span_${Math.random().toString(36).substr(2, 9)}`;
            const startTime = process.hrtime.bigint();
            
            // Execute with circuit breaker
            const response = await circuitBreaker.execute(async () => {
              // Simulate API call with timeout
              const apiPromise = simulateApiCall(endpoint, {
                method: 'GET',
                retries: 0, // We handle retries manually
                timeout: config.timeout,
                headers: {
                  'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                  'X-Correlation-ID': results.correlationIds.sessionId,
                  'X-Trace-ID': traceId,
                  'X-Span-ID': spanId,
                  'X-Parent-Span-ID': results.correlationIds.parentSpanId
                }
              });
              
              // Add timeout handling
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), config.timeout)
              );
              
              return await Promise.race([apiPromise, timeoutPromise]);
            });
            
            // Record successful request
            const endTime = process.hrtime.bigint();
            const durationNs = endTime - startTime;
            const durationMs = Number(durationNs) / 1e6; // Convert to milliseconds
            
            // Update response time metrics
            results.responseTimes.push(durationMs);
            results.endpointStats[endpoint].totalResponseTime += durationMs;
            results.endpointStats[endpoint].minResponseTime = 
              Math.min(results.endpointStats[endpoint].minResponseTime, durationMs);
            results.endpointStats[endpoint].maxResponseTime = 
              Math.max(results.endpointStats[endpoint].maxResponseTime, durationMs);
            
            // Record successful call
            results.endpointStats[endpoint].successes++;
            results.passed++;
            
            results.apiCalls.push({
              endpoint,
              status: 'success',
              responseTime: durationMs,
              timestamp: new Date().toISOString(),
              attempt: attempts,
              runId,
              traceContext: {
                traceId,
                spanId,
                parentSpanId: results.correlationIds.parentSpanId,
                sampled: true,
                flags: 1
              }
            });
            
            return { 
              success: true, 
              endpoint, 
              responseTime: durationMs,
              attempts
            };
            
} catch (error) {
            lastError = error;
            const errorEntry = {
              endpoint,
              error: error.message,
              errorType: error.constructor.name,
              stack: error.stack,
              timestamp: new Date().toISOString(),
              attempt: attempts,
              runId,
              traceId,
              isCircuitBreakerOpen: circuitBreaker.isOpen,
              failureCount: circuitBreaker.failureCount,
              lastFailure: circuitBreaker.lastFailure ? new Date(circuitBreaker.lastFailure).toISOString() : null
            };
            
            results.errors.push(errorEntry);
            
            // Log detailed error information
            logger.error(`Request failed: ${error.message}`, errorEntry);
            
            if (error.message.includes('timeout')) {
              results.timeouts++;
            } else if (error.message.includes('Circuit breaker')) {
              results.circuitBreakerTrips++;
              logger.warn('Circuit breaker tripped during request', {
                endpoint,
                attempt: attempts,
                traceId,
                isOpen: circuitBreaker.isOpen,
                failureCount: circuitBreaker.failureCount
              });
            }
            
            // If we've reached max retries, record the failure
            if (attempts > config.retryPolicy.maxRetries) {
              results.endpointStats[endpoint].failures++;
              results.failed++;
              
              results.apiCalls.push({
                endpoint,
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString(),
                attempt: attempts,
                runId,
                traceContext: {
                  traceId,
                  spanId: `span_${Math.random().toString(36).substr(2, 9)}`,
                  parentSpanId: results.correlationIds.parentSpanId,
                  sampled: true,
                  flags: 1
                }
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
      successfulCalls: runResults.filter(r => r && r.success).length,
      failedCalls: runResults.filter(r => r && !r.success).length,
      successRate: runResults.length > 0 
        ? (runResults.filter(r => r.success).length / runResults.length * 100).toFixed(2) + '%'
        : '0%',
      avgResponseTime: runResults.length > 0 
        ? runResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / runResults.length
        : 0,
      endpointsTested: [...new Set(runResults.filter(r => r).map(r => r.endpoint))].length
    };
    
    results.testRuns.push(runStats);
    
    // Generate and print run summary with enhanced metrics
    const successRate = runStats.totalCalls > 0 
      ? (runStats.successfulCalls / runStats.totalCalls * 100).toFixed(2) 
      : 0;
      
    const errorRate = runStats.totalCalls > 0
      ? ((runStats.failedCalls || 0) / runStats.totalCalls * 100).toFixed(2)
      : 0;
      
    const throughput = runDuration > 0 
      ? (runStats.totalCalls / runDuration).toFixed(2) 
      : 0;
    
    // Calculate p90 and p99 response times
    const sortedResponseTimes = [...results.responseTimes].sort((a, b) => a - b);
    const p90Index = Math.floor(sortedResponseTimes.length * 0.9);
    const p99Index = Math.floor(sortedResponseTimes.length * 0.99);
    const p90 = sortedResponseTimes[p90Index]?.toFixed(2) || 'N/A';
    const p99 = sortedResponseTimes[p99Index]?.toFixed(2) || 'N/A';
    
    // Check performance budget
    const isWithinBudget = results.performanceBudget.checkBudget();
    const budgetStatus = isWithinBudget ? '✅ Within budget' : '⚠️  Over budget';
    
    // Print enhanced summary
    console.log(`\n📊 Run #${runId} Summary (${results.testId})`);
    console.log('='.repeat(80));
    console.log('🔹 Test Results:');
    console.log(`   ✅ Passed:     ${runStats.successfulCalls}`);
    console.log(`   ❌ Failed:     ${runStats.failedCalls || 0}`);
    console.log(`   🔄 Retries:    ${results.retries}`);
    console.log(`   ⚡ Timeouts:   ${results.timeouts}`);
    console.log(`   🔌 CB Trips:   ${results.circuitBreakerTrips}`);
    console.log('\n📈 Performance Metrics:');
    console.log(`   ⏱️  Duration:   ${runDuration.toFixed(2)}s`);
    console.log(`   📊 Success:    ${successRate}%`);
    console.log(`   📉 Error Rate: ${errorRate}%`);
    console.log(`   🚀 Throughput: ${throughput} req/s`);
    console.log(`   🐇 Avg. Time:  ${runStats.avgResponseTime?.toFixed(2) || 0}ms`);
    console.log(`   📊 p90:        ${p90}ms`);
    console.log(`   📈 p99:        ${p99}ms`);
    console.log(`   💰 Budget:     ${budgetStatus} (${results.performanceBudget.budgetConsumed.toFixed(1)}% used)`);
    
    // Print circuit breaker status
    if (circuitBreaker.isOpen) {
      const timeUntilReset = Math.ceil(
        (circuitBreaker.lastFailure + CIRCUIT_BREAKER_RESET_TIMEOUT - Date.now()) / 1000
      );
      console.log(`\n⚠️  Circuit Breaker: OPEN (auto-reset in ${timeUntilReset}s)`);
    } else {
      console.log(`\n✅ Circuit Breaker: CLOSED (${circuitBreaker.failureCount}/${CIRCUIT_BREAKER_THRESHOLD} failures)`);
    }
    
    // Print trace information
    console.log('\n🔍 Trace Information:');
    console.log(`   Trace ID:       ${traceId}`);
    console.log(`   Session ID:     ${results.correlationIds.sessionId}`);
    console.log(`   Environment:    ${results.metadata.environment}`);
    console.log(`   Host:           ${results.metadata.hostname}`);
    console.log('='.repeat(80));
    
    // Log detailed metrics
    logger.log(LogLevel.INFO, 'Test run completed', {
      runId,
      traceId,
      duration: runDuration,
      successRate,
      errorRate,
      throughput,
      avgResponseTime: runStats.avgResponseTime,
      p90,
      p99,
      isWithinBudget,
      budgetConsumed: results.performanceBudget.budgetConsumed,
      circuitBreaker: {
        isOpen: circuitBreaker.isOpen,
        failureCount: circuitBreaker.failureCount,
        lastFailure: circuitBreaker.lastFailure 
          ? new Date(circuitBreaker.lastFailure).toISOString() 
          : null
      },
      resourceUsage: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    });
    
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
    testId: results.testId,
    version: '5.0.0',
    timestamp: testStart,
    duration: results.totalDuration,
    stats: {
      totalTests: results.totalTests,
      passed: results.passed,
      failed: results.failed,
      successRate: parseFloat(successRate.toFixed(2)),
      avgDuration: parseFloat(avgDuration.toFixed(2)),
      apiCalls: results.apiCalls,
      circuitBreakerTrips: results.circuitBreakerTrips,
      timeouts: results.timeouts,
      retries: results.retries
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      traceId: traceId,
      correlationIds: results.correlationIds
    },
    metadata: results.metadata,
    performanceBudget: {
      isWithinBudget: results.performanceBudget.isWithinBudget,
      budgetConsumed: results.performanceBudget.budgetConsumed
    }
  };
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY'.padEnd(78) + '📊');
  console.log('='.repeat(80));
  console.log(`Test ID:       ${report.testId}`);
  console.log(`Total Tests:   ${report.stats.totalTests}`);
  console.log(`✅ Passed:     ${report.stats.passed}`);
  console.log(`❌ Failed:     ${report.stats.failed}`);
  console.log(`📈 Success:    ${report.stats.successRate}%`);
  console.log(`⏱️  Avg. Time:  ${report.stats.avgDuration.toFixed(2)}s`);
  console.log(`🔄 Retries:    ${report.stats.retries}`);
  console.log(`⚡ Timeouts:   ${report.stats.timeouts}`);
  console.log(`🔌 CB Trips:   ${report.stats.circuitBreakerTrips}`);
  console.log('='.repeat(80));
  
  return report;
}, { includeStackTrace: true });

// Execute the test
const testResult = runWebhookTest();

// Export for testing
module.exports = {
  User,
  formatDate,
  calculateTotal,
  runWebhookTest,
  withPerformanceTracking
};
