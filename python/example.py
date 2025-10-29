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


def test_webhook():
    """Test function added to verify webhook functionality.
    
    Returns:
        dict: Dictionary containing test execution details
    """
    from datetime import datetime
    import uuid
    import platform
    
    test_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().isoformat()
    system_info = {
        'system': platform.system(),
        'python_version': platform.python_version()
    }
    
    result = {
        'test_id': test_id,
        'timestamp': timestamp,
        'status': 'success',
        'system': system_info,
        'message': 'Webhook test #2 executed successfully'
    }
    
    print(f"[TEST #{test_id}] Webhook test executed at: {timestamp}")
    print(f"[TEST #{test_id}] System: {system_info['system']}, Python {system_info['python_version']}")
    
    return result


def main():
    """Main function to demonstrate functionality."""
    # Example usage
    numbers = [1, 2, 3, 4, 5]
    
    # Call the test_webhook function when run directly
    test_result = test_webhook()
    
    # Process numbers
    processor = DataProcessor(numbers)
    stats = processor.get_statistics()
    
    print(f"\nData Statistics:")
    for key, value in stats.items():
        print(f"- {key.capitalize()}: {value}")
    
    return test_result

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
