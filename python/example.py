"""
Example Python file with various code patterns for testing code quality.
"""
import os
import sys
from typing import List, Optional


def calculate_average(numbers: List[float]) -> float:
    """Calculate the average of a list of numbers.
    
    Args:
        numbers: List of numbers to calculate average for.
        
    Returns:
        float: The average of the numbers.
    """
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)


class DataProcessor:
    """A class to process data with various operations."""
    
    def __init__(self, data: List[float]):
        self.data = data
        self._processed = False
    
    def process_data(self) -> None:
        """Process the internal data."""
        if not self._processed:
            self.data = [x * 2 for x in self.data]
            self._processed = True
    
    def get_statistics(self) -> dict:
        """Calculate statistics for the data.
        
        Returns:
            dict: Dictionary containing min, max, and average.
        """
        if not self.data:
            return {}
            
        return {
            'min': min(self.data),
            'max': max(self.data),
            'average': calculate_average(self.data)
        }


def process_file(file_path: str) -> Optional[List[str]]:
    """Read and process a file.
    
    Args:
        file_path: Path to the file to process.
        
    Returns:
        List of lines from the file, or None if file not found.
    """
    try:
        with open(file_path, 'r') as file:
            return [line.strip() for line in file if line.strip()]
    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


import time
import asyncio
import random
import uuid
import platform
import psutil
from functools import wraps
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Dict, List, Any, Optional, Callable, Awaitable

class PerformanceTracker:
    """Enhanced performance tracking with context manager support."""
    
    def __init__(self, name: str = None):
        self.name = name or 'operation'
        self.start_time: float = 0
        self.end_time: float = 0
        self.start_memory: int = 0
        self.end_memory: int = 0
        self._start_cpu = None
        self._end_cpu = None
    
    def __enter__(self):
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()
    
    def start(self) -> None:
        """Start tracking performance metrics."""
        self.start_time = time.perf_counter()
        self._start_cpu = time.process_time()
        self.start_memory = psutil.Process().memory_info().rss
    
    def stop(self) -> Dict[str, Any]:
        """Stop tracking and return metrics."""
        self.end_time = time.perf_counter()
        self._end_cpu = time.process_time()
        self.end_memory = psutil.Process().memory_info().rss
        
        return self.metrics
    
    @property
    def metrics(self) -> Dict[str, Any]:
        """Get current metrics."""
        wall_time = self.end_time - self.start_time if self.end_time > 0 else 0
        cpu_time = (self._end_cpu - self._start_cpu) if self._end_cpu else 0
        memory_used = (self.end_memory - self.start_memory) / (1024 * 1024)  # in MB
        
        return {
            'name': self.name,
            'timestamp': datetime.utcnow().isoformat(),
            'wall_time': wall_time,
            'cpu_time': cpu_time,
            'memory_used_mb': memory_used,
            'memory_start': self.start_memory,
            'memory_end': self.end_memory,
            'cpu_percent': (cpu_time / wall_time * 100) if wall_time > 0 else 0
        }

def measure_performance(func=None, *, name: str = None):
    """Decorator to measure function execution time and resource usage."""
    def decorator(f):
        @wraps(f)
        async def async_wrapper(*args, **kwargs):
            tracker = PerformanceTracker(name or f.__name__)
            tracker.start()
            try:
                result = await f(*args, **kwargs)
                metrics = tracker.metrics
                return {
                    'result': result,
                    'metrics': metrics
                }
            except Exception as e:
                metrics = tracker.metrics
                metrics['error'] = str(e)
                return {
                    'error': str(e),
                    'metrics': metrics
                }
        
        @wraps(f)
        def sync_wrapper(*args, **kwargs):
            tracker = PerformanceTracker(name or f.__name__)
            tracker.start()
            try:
                result = f(*args, **kwargs)
                metrics = tracker.metrics
                return {
                    'result': result,
                    'metrics': metrics
                }
            except Exception as e:
                metrics = tracker.metrics
                metrics['error'] = str(e)
                return {
                    'error': str(e),
                    'metrics': metrics
                }
        
        return async_wrapper if asyncio.iscoroutinefunction(f) else sync_wrapper
    
    if func is None:
        return decorator
    return decorator(func)

async def simulate_api_call(endpoint: str, method: str = 'GET', timeout: float = 5.0, 
                         max_retries: int = 2) -> Dict[str, Any]:
    """Simulate an API call with retry logic and error handling."""
    test_id = str(uuid.uuid4())[:8]
    attempts = 0
    last_error = None
    
    while attempts <= max_retries:
        attempts += 1
        start_time = time.perf_counter()
        
        try:
            # Simulate network delay (100-500ms)
            await asyncio.sleep(random.uniform(0.1, 0.5))
            
            # Simulate occasional failures (20% chance)
            if random.random() < 0.2:
                raise Exception(f"Simulated API error for {endpoint}")
            
            # Simulate response
            response_time = (time.perf_counter() - start_time) * 1000  # in ms
            
            return {
                'status': 'success',
                'endpoint': endpoint,
                'method': method,
                'status_code': 200,
                'response_time_ms': response_time,
                'attempts': attempts,
                'data': {
                    'id': test_id,
                    'timestamp': datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            last_error = str(e)
            if attempts > max_retries:
                return {
                    'status': 'error',
                    'endpoint': endpoint,
                    'method': method,
                    'error': last_error,
                    'attempts': attempts,
                    'status_code': 500
                }
            
            # Exponential backoff
            await asyncio.sleep(min(0.1 * (2 ** attempts), 1.0))
    
    return {
        'status': 'error',
        'endpoint': endpoint,
        'error': 'Max retries exceeded',
        'attempts': attempts,
        'status_code': 500
    }

@measure_performance(name="webhook_test_suite")
async def test_webhook() -> Dict[str, Any]:
    """Enhanced test function to verify webhook functionality with performance metrics.
    
    This function simulates multiple API calls, processes the results, and generates
    a comprehensive test report with performance metrics.
    
    Returns:
        dict: Dictionary containing test execution details and performance metrics
    """
    test_id = f"test_{uuid.uuid4().hex[:8]}"
    test_start = datetime.utcnow()
    
    # Test configuration
    config = {
        'test_id': test_id,
        'version': '4.0.0',
        'test_runs': 3,
        'api_endpoints': [
            '/api/users',
            '/api/products',
            '/api/orders'
        ],
        'timeout': 10.0,
        'max_retries': 2
    }
    
    # Collect system information
    system_info = {
        'system': platform.system(),
        'release': platform.release(),
        'python_version': platform.python_version(),
        'processor': platform.processor(),
        'cpu_count': psutil.cpu_count(),
        'memory': {
            'total': psutil.virtual_memory().total / (1024 ** 3),  # in GB
            'available': psutil.virtual_memory().available / (1024 ** 3),  # in GB
            'used': psutil.virtual_memory().used / (1024 ** 3)  # in GB
        },
        'test_run': 4  # Current test run number
    }
    
    # Initialize test results
    test_results = {
        'total_tests': 0,
        'passed': 0,
        'failed': 0,
        'total_duration': 0.0,
        'api_calls': [],
        'start_time': test_start.isoformat(),
        'end_time': None,
        'metrics': {}
    }
    
    # Print test header
    print("\n" + "=" * 70)
    print(f"🚀 WEBHOOK TEST #4 - {test_id}".center(70))
    print("=" * 70)
    print(f"Start Time:    {test_start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"System:        {system_info['system']} {system_info['release']}")
    print(f"Python:        {system_info['python_version']}")
    print(f"CPU Cores:     {system_info['cpu_count']}")
    print(f"Memory:        {system_info['memory']['used']:.2f}GB / {system_info['memory']['total']:.2f}GB")
    print("-" * 70)
    
    # Run test cases
    for run in range(1, config['test_runs'] + 1):
        run_start = time.perf_counter()
        print(f"\n🔹 Test Run #{run} - Starting...")
        
        # Run API calls in parallel
        tasks = [
            simulate_api_call(endpoint, max_retries=config['max_retries'])
            for endpoint in config['api_endpoints']
        ]
        
        # Execute all API calls concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        run_duration = time.perf_counter() - run_start
        successful = 0
        failed = 0
        
        for i, result in enumerate(results):
            test_results['total_tests'] += 1
            
            if isinstance(result, Exception):
                result = {'status': 'error', 'error': str(result)}
                failed += 1
            elif result.get('status') == 'success':
                successful += 1
            else:
                failed += 1
            
            test_results['api_calls'].append({
                'run': run,
                'endpoint': config['api_endpoints'][i],
                **result
            })
        
        # Update statistics
        test_results['passed'] += successful
        test_results['failed'] += failed
        test_results['total_duration'] += run_duration
        
        # Print run summary
        print(f"   ✅ {successful} passed")
        if failed > 0:
            print(f"   ❌ {failed} failed")
        print(f"   ⏱️  Duration: {run_duration:.2f}s")
    
    # Calculate final metrics
    test_end = datetime.utcnow()
    total_duration = (test_end - test_start).total_seconds()
    success_rate = (test_results['passed'] / test_results['total_tests'] * 100) if test_results['total_tests'] > 0 else 0
    
    # Prepare final report
    report = {
        'test_id': test_id,
        'version': config['version'],
        'status': 'completed',
        'timing': {
            'start_time': test_start.isoformat(),
            'end_time': test_end.isoformat(),
            'duration_seconds': total_duration
        },
        'stats': {
            'total_tests': test_results['total_tests'],
            'passed': test_results['passed'],
            'failed': test_results['failed'],
            'success_rate': round(success_rate, 2),
            'avg_duration_per_run': round(test_results['total_duration'] / config['test_runs'], 4) if config['test_runs'] > 0 else 0,
            'api_calls': test_results['api_calls']
        },
        'system': system_info,
        'config': {
            'test_runs': config['test_runs'],
            'api_endpoints': config['api_endpoints'],
            'max_retries': config['max_retries']
        }
    }
    
    # Print final summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY".center(70))
    print("=" * 70)
    print(f"Total Tests:  {report['stats']['total_tests']}")
    print(f"✅ Passed:     {report['stats']['passed']}")
    print(f"❌ Failed:     {report['stats']['failed']}")
    print(f"📈 Success:    {report['stats']['success_rate']}%")
    print(f"⏱️  Duration:   {total_duration:.2f} seconds")
    print("=" * 70)
    
    return report


async def main():
    """Main function to run the webhook test suite with enhanced testing."""
    try:
        print("🚀 Starting Webhook Test Suite v4.0.0...")
        print("-" * 70)
        
        # Run the webhook test
        test_result = await test_webhook()
        
        # Process test results
        if 'error' in test_result:
            raise Exception(f"Test failed: {test_result.get('error')}")
        
        # Generate a data processing report
        numbers = [random.randint(1, 1000) for _ in range(1000)]
        with PerformanceTracker('data_processing') as tracker:
            processor = DataProcessor(numbers)
            stats = processor.get_statistics()
            data_metrics = tracker.metrics
        
        # Print data processing results
        print("\n" + "📊 DATA PROCESSING RESULTS".center(70, '-'))
        print("-" * 70)
        print(f"Items Processed: {len(numbers):,}")
        print(f"Processing Time: {data_metrics['wall_time']:.4f}s")
        print(f"Memory Used:     {data_metrics['memory_used_mb']:.2f} MB")
        
        # Print statistics
        print("\nStatistics:" + " " * 63 + "📈")
        for key, value in stats.items():
            print(f"  {key.upper()}: {value:.4f}" if isinstance(value, float) else f"  {key.upper()}: {value}")
        
        # Prepare final result
        result = {
            'status': 'success',
            'test_id': test_result['test_id'],
            'version': test_result['version'],
            'timing': {
                'start_time': test_result['timing']['start_time'],
                'end_time': test_result['timing']['end_time'],
                'total_duration': test_result['timing']['duration_seconds']
            },
            'stats': {
                'total_tests': test_result['stats']['total_tests'],
                'passed': test_result['stats']['passed'],
                'failed': test_result['stats']['failed'],
                'success_rate': test_result['stats']['success_rate']
            },
            'data_processing': {
                'items_processed': len(numbers),
                'processing_time': data_metrics['wall_time'],
                'memory_used_mb': data_metrics['memory_used_mb']
            },
            'system': {
                'platform': platform.platform(),
                'python': platform.python_version(),
                'cpu_count': psutil.cpu_count(),
                'memory_gb': psutil.virtual_memory().total / (1024 ** 3)
            }
        }
        
        # Print final summary
        print("\n" + "✅ TEST COMPLETED SUCCESSFULLY".center(70, '='))
        print(f"Test ID:       {result['test_id']}")
        print(f"Duration:      {result['timing']['total_duration']:.2f} seconds")
        print(f"Success Rate:  {result['stats']['success_rate']}%")
        print(f"API Calls:     {result['stats']['total_tests']} total, {result['stats']['passed']} passed, {result['stats']['failed']} failed")
        print("=" * 70 + "\n")
        
        return result
        
    except Exception as e:
        error_msg = f"❌ Test execution failed: {str(e)}"
        print(f"\n{error_msg}")
        print(f"Error type: {type(e).__name__}")
        
        if hasattr(e, '__traceback__'):
            import traceback
            print("\nStack trace:")
            traceback.print_exc()
        
        return {
            'status': 'error',
            'error': str(e),
            'error_type': type(e).__name__,
            'timestamp': datetime.utcnow().isoformat(),
            'system': {
                'platform': platform.platform(),
                'python': platform.python_version()
            }
        }

if __name__ == "__main__":
    # Configure asyncio event loop policy for Windows if needed
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    # Run the async main function
    try:
        result = asyncio.run(main())
        
        # Additional processing can be added here if needed
        if result and result.get('status') == 'success':
            print(" All tests completed successfully!")
        else:
            print(" Some tests failed. Check the logs for details.")
            
    except KeyboardInterrupt:
        print("\n Test execution interrupted by user")
    except Exception as e:
        print(f"\n Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Keep the console open for a moment
    try:
        input("\nPress Enter to exit...")
    except:
        pass
