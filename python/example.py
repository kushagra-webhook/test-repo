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
from functools import wraps

def measure_performance(func):
    """Decorator to measure function execution time and performance."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        start_process_time = time.process_time()
        
        result = func(*args, **kwargs)
        
        end_time = time.perf_counter()
        end_process_time = time.process_time()
        
        return {
            'result': result,
            'performance': {
                'wall_time': end_time - start_time,
                'cpu_time': end_process_time - start_process_time,
                'timestamp': time.time()
            }
        }
    return wrapper

def test_webhook():
    """Enhanced test function to verify webhook functionality with performance metrics.
    
    Returns:
        dict: Dictionary containing test execution details and performance metrics
    """
    import uuid
    import platform
    import psutil
    import os
    
    test_id = f"test_{str(uuid.uuid4())[:8]}"
    start_time = time.time()
    
    # Collect system information
    system_info = {
        'system': platform.system(),
        'release': platform.release(),
        'python_version': platform.python_version(),
        'processor': platform.processor(),
        'cpu_count': os.cpu_count(),
        'memory': psutil.virtual_memory()._asdict(),
        'test_run': 3  # Incrementing test run number
    }
    
    # Simulate some processing
    test_data = [{
        'id': i,
        'value': i * 1.5,
        'timestamp': time.time()
    } for i in range(1000)]
    
    # Calculate some statistics
    values = [item['value'] for item in test_data]
    stats = {
        'items_processed': len(test_data),
        'sum': sum(values),
        'avg': sum(values) / len(values) if values else 0,
        'min': min(values) if values else 0,
        'max': max(values) if values else 0
    }
    
    end_time = time.time()
    
    # Prepare result
    result = {
        'test_id': test_id,
        'version': '3.0.0',
        'status': 'completed',
        'timing': {
            'start_time': start_time,
            'end_time': end_time,
            'duration': end_time - start_time
        },
        'system': system_info,
        'stats': stats,
        'message': f'Webhook test #3 completed successfully in {end_time - start_time:.4f} seconds'
    }
    
    # Print formatted output
    print("\n" + "="*50)
    print(f"WEBHOOK TEST #3 - {test_id}")
    print("="*50)
    print(f"Start Time:    {time.ctime(start_time)}")
    print(f"End Time:      {time.ctime(end_time)}")
    print(f"Duration:      {end_time - start_time:.4f} seconds")
    print(f"System:        {system_info['system']} {system_info['release']}")
    print(f"Python:        {system_info['python_version']}")
    print(f"CPU Cores:     {system_info['cpu_count']}")
    print(f"Memory Usage:  {psutil.Process().memory_info().rss / 1024 / 1024:.2f} MB")
    print("-"*50)
    print("Test Statistics:")
    for key, value in stats.items():
        print(f"  {key.replace('_', ' ').title()}: {value}")
    print("="*50 + "\n")
    
    return result


def main():
    """Main function to demonstrate functionality with enhanced testing."""
    try:
        print("Starting webhook test suite...")
        
        # Run the webhook test
        test_result = test_webhook()
        
        # Process numbers with the DataProcessor
        numbers = [i for i in range(1, 101)]  # Generate numbers 1-100
        processor = DataProcessor(numbers)
        
        # Get and display statistics
        stats = processor.get_statistics()
        
        print("\n" + "-"*50)
        print("DATA PROCESSING RESULTS:")
        print("-"*50)
        for key, value in stats.items():
            print(f"{key.upper()}: {value}")
        
        # Add some additional metrics
        print("\n" + "-"*50)
        print("PERFORMANCE METRICS:")
        print("-"*50)
        print(f"Test completed in {test_result['timing']['duration']:.4f} seconds")
        print(f"Memory usage: {psutil.Process().memory_info().rss / 1024 / 1024:.2f} MB")
        print("-"*50 + "\n")
        
        return {
            'status': 'success',
            'test_id': test_result['test_id'],
            'execution_time': test_result['timing']['duration'],
            'data_stats': stats,
            'test_metrics': {
                'version': test_result['version'],
                'system': test_result['system']
            }
        }
        
    except Exception as e:
        error_msg = f"Error during test execution: {str(e)}"
        print(f"\nERROR: {error_msg}")
        return {
            'status': 'error',
            'error': error_msg,
            'timestamp': time.time()
        }

if __name__ == "__main__":
    main()
    processor = DataProcessor(numbers)
    print(f"Original data: {numbers}")
    
    processor.process_data()
    stats = processor.get_statistics()
    print(f"Statistics: {stats}")
    
    # This will trigger a potential bug if the file doesn't exist
    lines = process_file("nonexistent.txt")
    print(f"File lines: {lines}")
    
    # Test the new function
    test_webhook()
